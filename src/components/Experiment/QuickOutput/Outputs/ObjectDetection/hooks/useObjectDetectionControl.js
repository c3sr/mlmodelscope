import {useHoverControl} from "../../_Common/hooks/useHoverControl";
import {useSectionFilters} from "./useSectionFilters";
import ObjectDetectionTrialParser from "../utils/ObjectDetectionTrialParser";
import InstanceSegmentationTrialParser from "../../InstanceSegmentation/utils/InstanceSegmentationTrialParser";
import useBoundingBoxControl from "./useBoundingBoxControl";

export default function useObjectDetectionControl(props) {
  const hover = useHoverControl();

  const boundingBoxControl = useBoundingBoxControl(props);

  let splitter;

  if (props.isInstanceSegmentation)
    splitter = new InstanceSegmentationTrialParser(props.trial);
  else
    splitter = new ObjectDetectionTrialParser(props.trial);


  const coloredSections = splitter.Parse();

  const {filteredSections, confidenceFilter, categoryFilter, labelIsInCategories} = useSectionFilters(coloredSections)

  return {
    hover,
    filter: {confidence: confidenceFilter, category: categoryFilter, labelIsInCategories},
    filteredSections,
    sections: coloredSections,
    boundingBox: boundingBoxControl
  }
}
