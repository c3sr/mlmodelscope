import AudioVerifier from "./audioVerifier";
import ImageVerifier from "./imageVerifier";
import { TaskInputTypes } from "./TaskInputTypes";
import VideoVerifier from "./videoVerifier";

const UrlMatcher = /https?:\/\/.+/;
const UrlVerfiy = async (tempUrl, inputType) => {
    if (tempUrl.match(UrlMatcher) === null)
        return false;
    else {
        let verifier;
        switch (inputType) {
            case TaskInputTypes.Image:
            case TaskInputTypes.ImageCanvas:
                verifier = new ImageVerifier(tempUrl);
                break;
            case TaskInputTypes.Audio:
                verifier = new AudioVerifier(tempUrl);
                break;
            case TaskInputTypes.Video:
                verifier = new VideoVerifier(tempUrl);
                break;
            default:
                break;
        }
        if (verifier && !(await verifier.Verify()))
            return false;
    }
    return true;
};

export default UrlVerfiy;