import GetApiHelper from "../../../../../helpers/api";
import Uppy from '@uppy/core';
import AwsS3Multipart from "@uppy/aws-s3-multipart";
import {useEffect, useMemo, useState} from "react";

import UppyFileTypeCheckerPlugin from "../../../../../helpers/UppyFileTypeCheckerPlugin";

export const useUploadInputControl = (props) => {
  const [activeUser, setActiveUser] = useState("anonymous");

  const onBeforeUpload = (files) => {
    Object.keys(files).forEach(key => {
        let file = files[key];
        files[key] = {
          ...file,
          name: `${activeUser}/${file.name}`,
        }
      });

    return files;
  }

  const onComplete = (result) => {
    const urls = result.successful.map(x => x.uploadURL);
    if (typeof (props.inputSelected) === 'function') {
      let values = Array.from(props.values);
      if (values.length === 0 || values[0] === "")
        values = urls;
      else
        values = [...values, ...urls];
      props.inputSelected(values);

    }
  }


  const api = GetApiHelper();
  const uppy = useMemo(() => {
    let u = Uppy({
      autoProceed: true,
      restrictions: {
        // Uppy file-type restrictions will default the upload pop-up to the 
        // allowed file types and reject any other types
        allowedFileTypes: props.allowedFileTypes.mimeTypes,
        maxNumberOfFiles: props.multiple ? 99 : 1,
      },
      onBeforeUpload: onBeforeUpload
    });

    u.use(AwsS3Multipart, {
      limit: 5,
      companionUrl: process.env.REACT_APP_COMPANION_URL
    });

    // Adding extra type-checking to prevent against files with renamed 
    // extentions from being maliciously uploaded
    u.use(UppyFileTypeCheckerPlugin, {allowedFileTypes: props.allowedFileTypes.fileTypes});

    u.on("complete", onComplete);
    
    return u;
  }, [])

  useEffect(() => {
    api.ActiveUser.subscribe({
      next: (user) => {
        setActiveUser(user.id);
      }
    });


  }, [])

  return {
    uppy
  }
}
