import GetApiHelper from "../../../../../helpers/api";
import Uppy from '@uppy/core';
import AwsS3Multipart from "@uppy/aws-s3-multipart";
import XHRUpload from "@uppy/xhr-upload";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

import UppyFileTypeCheckerPlugin from "../../../../../helpers/UppyFileTypeCheckerPlugin";
import Task from "../../../../../helpers/Task";

export const useUploadInputControl = (props) => {
  const task = Task.getStaticTask(props.task);

  const [activeUser, setActiveUser] = useState("anonymous");
  const activeUserRef = useRef(activeUser);
  const propsRef = useRef(props);
  const taskRef = useRef(task);

  const onBeforeUpload = useCallback((files) => {
    Object.keys(files).forEach(key => {
        let file = files[key];
        files[key] = {
          ...file,
          name: `${activeUserRef.current}/${file.name}`,
        }
      });

    return files;
  }, []);

  const onComplete = useCallback((result) => {
    const currentProps = propsRef.current;
    const currentTask = taskRef.current;
    // COMMENT THIS OUT BEFORE COMMITTING
    // Note: Uncomment in order to test w/o server, adding a fake uploadURL:
    // result.successful.map(x => x.uploadURL = `test_${props.inputIndex}.com`)
    // Or if you need a working url:
    // result.successful.map(x => x.uploadURL = "https://s3.us-east-1.amazonaws.com/uploads.staging.mlmodelscope.org/anonymous%2FYellowLabradorLooking_new.jpg")

    const urls = result.successful
      .map(file => (
        file.uploadURL
        || file.response?.uploadURL
        || file.response?.body?.url
        || file.response?.body?.location
      ))
      .filter(Boolean);

    if (urls.length === 0) {
      return;
    }

    if (!currentTask.useMultiInput) {
      if (typeof (currentProps.inputSelected) === 'function') {
        let values = Array.from(currentProps.values);
        if (values.length === 0 || values[0] === "")
          values = urls;
        else
          values = [...values, ...urls];
        
        currentProps.inputSelected(values);
      }      
    } else {
      if (typeof (currentProps.inputSelected) === 'function') {
        currentProps.inputSelected(urls[0], currentProps.inputIndex);
      }
    }
  }, []);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser])

  useEffect(() => {
    propsRef.current = props;
    taskRef.current = task;
  }, [props, task])

  const allowedFileTypesKey = props.allowedFileTypes.fileTypes.join(",");
  const allowedMimeTypesKey = props.allowedFileTypes.mimeTypes.join(",");
  const api = GetApiHelper();
  const uppy = useMemo(() => {
    const allowedFileTypes = allowedFileTypesKey.split(",");
    const allowedMimeTypes = allowedMimeTypesKey.split(",");
    const uploadDriver = process.env.REACT_APP_UPLOAD_DRIVER || "local";
    const companionUrl = process.env.REACT_APP_COMPANION_URL;
    const uploadEndpoint = (
      process.env.REACT_APP_UPLOAD_URL
      || (process.env.NODE_ENV === "development"
        ? "/api/uploads"
        : (process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/uploads` : "/api/uploads"))
    );
    let u = new Uppy({
      autoProceed: true,
      restrictions: {
        // Note: Uppy file-type restrictions will default the upload pop-up to the 
        // allowed file types and reject any other types, but the user can intentionally
        // still force the selection of other/bad file types
        allowedFileTypes: allowedMimeTypes,
        maxNumberOfFiles: props.multiple ? 99 : 1,
      },
      onBeforeUpload: onBeforeUpload
    });

    if (uploadDriver === "s3" && companionUrl) {
      u.use(AwsS3Multipart, {
        limit: 5,
        companionUrl
      });
    } else {
      u.use(XHRUpload, {
        endpoint: uploadEndpoint,
        fieldName: "file",
        responseUrlFieldName: "url",
        limit: 5
      });
    }

    // Adding extra type-checking to prevent against files with renamed 
    // extentions from being maliciously uploaded
    u.use(UppyFileTypeCheckerPlugin, {allowedFileTypes});

    return u;
  }, [allowedFileTypesKey, allowedMimeTypesKey, onBeforeUpload, props.multiple])

  useEffect(() => {
    uppy.on("complete", onComplete);
    return () => {
      uppy.off("complete", onComplete);
    };
  }, [uppy, onComplete])

  useEffect(() => {
    uppy.setOptions({ onBeforeUpload });
  }, [uppy, onBeforeUpload])

  useEffect(() => {
    const subscription = api.ActiveUser.subscribe({
      next: (user) => {
        setActiveUser(user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [api.ActiveUser])

  return {
    uppy
  }
}
