import React, { Component } from "react";
import idx from "idx";
import { Tabs } from "antd";
import { sortBy, isNil, toUpper } from "lodash";
import { Table } from "antd";
import TraceInfo from "./TraceInfo";
import ClassificationResult from "./ClassificationResult";
import SegmentationResult from "./SegmentationResult";

function processNameClassification({ classification: { label } }) {
  const lower = label
    .split(",")[0]
    .split(" ")
    .slice(1)
    .join(" ");
  const result = lower.charAt(0).toUpperCase() + lower.substr(1);
  return result;
}
function processName(item) {
  const { type } = item;
  switch (toUpper(type)) {
    case "CLASSIFICATION":
      return processNameClassification(item);
    default:
      return "unknown_type_" + type;
  }
}

function processResponseFeatures(response) {
  response = sortBy(response, ["probability"]).reverse();
  response.forEach(function(item, index) {
    item["name"] = processName(item);
  });
  return response.slice(0, 10);
}

function renderResult(d, target, imgIndex, imgUrl) {
  if (isNil(d)) {
    return null;
  }
  var features = idx(d, _ => _.response[imgIndex].features)
  return(
    <SegmentationResult features={features} traceId={d.traceId} displayTrace={true} imgUrl={imgUrl} />
  )
  try{
    if (features.type === "CLASSIFICATION") {
      return(
        <ClassificationResult features={features} traceId={d.traceId} displayTrace={true} />
      )
    } else if (features.type === "BOUNDINGBOX") {
      return(
        <SegmentationResult features={features} traceId={d.traceId} displayTrace={true} imgUrl={imgUrl} />
      )
    } else {
      return(
        <div>{"Type " + features.type + " is not supported yet!"}</div>
      )
    }
  }
  catch(err) {
    return(
      <div>{"Something Went Wrong"}</div>
    )
  }
}

export default class ResultTab extends Component {
  constructor(props) {
    super(props);
    this.target = this.props.target;
    this.data = this.props.data;
  }

  render() {
    var target = this.props.target;
    var imgIndex = this.props.imgIndex;
    var imgUrl = this.props.imgUrl;
    var features;

    return(
      <Tabs defaultActiveKey="0">
        {
          this.data.map(function(d, index) {
            return(
              <Tabs.TabPane tab={d[target].name + " V" + d[target].version} key={index}>
              {
                renderResult(d, target, imgIndex, imgUrl)
              }
              </Tabs.TabPane>
            )
          })
        }
      </Tabs>
    )
  }
}