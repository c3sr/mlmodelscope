import "./InferenceResult.css";
import React, { Component } from "react";
import { ExperimentContext } from "../../context/ExperimentContext";
import ImageInferenceResult from "./ImageInferenceResult";
import DatasetInferenceResult from "./DatasetInferenceResult";
import SegmentationResult from "./SegmentationResult";


class InferenceResult extends Component {
  render() {
    var resultContent
    if (this.props.context.imageUrls.length !== 0) {
      resultContent = <ImageInferenceResult />;
    } else if (this.props.context.dataset.name === "ilsvrc2012") {
      resultContent = <DatasetInferenceResult />;
    } else if (this.props.context.dataset.name === "segmentation") {
      resultContent = <SegmentationResult />;
    }
    return (
      <div style={{ width: "100%", background: "#E8E9EB", margin: "0px 20px 120px 20px" }}>
          <div
            style={{
              background: "#1A263A",
              color: "white",
              paddingTop: "30px",
              paddingBottom: "60px",
            }}
          >
            <h2 style={{ marginTop: "60px", marginLeft: "40px", color: "white" }}>
              Inference Result
            </h2>
          </div>

          {resultContent}
          {/* <SegmentationResult /> */}
      </div>
    );
  }
}

export default props => (
  <ExperimentContext.Consumer>
    {context => <InferenceResult {...props} context={context} />}
  </ExperimentContext.Consumer>
);