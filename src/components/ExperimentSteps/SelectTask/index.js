import SelectableCard from "../SelectableCard/index";
import React, { Component } from "react";
import { Layout, Col, Row, Card } from "antd";
import yeast from "yeast";
import idx from "idx";
import { withRouter } from "react-router-dom";
import { ExperimentContext } from "../../../context/ExperimentContext";
import ExperimentContentTitle from "../ExperimentContentTitle";

const { Content } = Layout;
const { Meta } = Card;
const taskList = [
  {
    name: "Classification",
    input: "image",
    output: "classification",
    image: "classification.png",
    description: "TODO"
  },
  {
    name: "Object Detection",
    input: "image",
    output: "boundingbox",
    image: "objectDetection.png",
    description: "TODO"
  },
  {
    name: "Semantic Segmentation",
    input: "image",
    output: "semanticsegment",
    image: "semanticSegmentation.png",
    description: "TODO"
  },
  {
    name: "Instance Segmentation",
    input: "image",
    output: "instancesegment",
    image: "instanceSegmentation.png",
    description: "TODO"
  },
  {
    name: "Image Enhancement",
    input: "image",
    output: "image",
    image: "imageEnhancement.png",
    description: "TODO"
  }
]

var logos = require.context("../../../resources/taskSample", true);
function taskImage(task) {
  let image = logos("./" + task.image);
  return (
    <img
      src={image}
      alt={task.name}
      style={{ width: "99%", marginLeft: "auto", marginRight: "auto" }}
    />
  );
}

class SelectTask extends Component {
  constructor(props) {
    super(props)
    if (this.props.context.task === null) {
      this.props.context.setTask(taskList[0])
    }
  }

  isSelected(item) {
    return item.name === idx(this.props.context.task, _ => _.name);
  }

  render() {
    return (
      <Layout>
        <Content>
          <ExperimentContentTitle text={"Select the Task"} />

          <div style={{width: "90%", margin: "auto"}}>
            <Row gutter={16}>
              {taskList.map((item, index) => (
                <Col key={yeast()} md={8} sm={12} xs={24} style={{ padding: "10px" }}>
                  <SelectableCard
                    tooltip={true}
                    onClick={() =>
                      this.props.context.setTask(item)
                    }
                    cover={taskImage(item)}
                    selected={this.isSelected(item)}
                  >
                    <Meta
                      title={item.name}
                      description={item.description}
                    />
                  </SelectableCard>
                </Col>
              ))}
            </Row>
          </div>
        </Content>
      </Layout>
    );
  }
}

export default withRouter(props => (
  <ExperimentContext.Consumer>
    {context => <SelectTask {...props} context={context} />}
  </ExperimentContext.Consumer>
));
