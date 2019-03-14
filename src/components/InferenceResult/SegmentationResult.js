import React, { Component } from "react";
import { Stage, Layer, Image, Line, Label, Text, Tag } from "react-konva";
import predict from "./predict.json";
import { filter } from "lodash";

const colors = [
  "#e84a27", // UI Orange
  "#1a263a", // UI Dark Blue
  "#e22f2f", // Red
  "#33a02c", // Green
  "#6a3d9a", // Purple
  "#1f78b4", // Light Blue
  "#b15928", // Brown
]

class Rectangle extends Component {
  render() {
    var x1 = this.props.x1;
    var x2 = this.props.x2;
    var y1 = this.props.y1;
    var y2 = this.props.y2;
    var color = this.props.color;

    return(
      <React.Fragment>
        <Line
          points={[x1, y1, x2, y1]}
          stroke={color} 
        />
        <Line
          points={[x1, y2, x2, y2]}
          stroke={color} 
        />
        <Line
          points={[x1, y1, x1, y2]}
          stroke={color} 
        />
        <Line
          points={[x2, y1, x2, y2]}
          stroke={color} 
        />
      </React.Fragment>
    )
  }
}

class BBoxLabel extends Component {
  render() {
    return(
      <React.Fragment>
        <Label x={this.props.x} y={this.props.y-14}>
          <Tag fill={this.props.color}></Tag>
          <Text text={this.props.text} fill="white" fontSize={14}/>
        </Label>
      </React.Fragment>
    )
  }
}

class URLImage extends React.Component {
  state = {
    image: null
  };
  componentDidMount() {
    this.loadImage();
  }
  componentDidUpdate(oldProps) {
    if (oldProps.src !== this.props.src) {
      this.loadImage();
    }
  }
  componentWillUnmount() {
    this.image.removeEventListener('load', this.handleLoad);
  }
  loadImage() {
    // save to "this" to remove "load" handler on unmount
    this.image = new window.Image();
    this.image.src = this.props.src;
    this.image.addEventListener('load', this.handleLoad);
  }
  handleLoad = () => {
    // after setState react-konva will update canvas and redraw the layer
    // because "image" property is changed
    this.setState({
      image: this.image,
      width: this.image.width,
      height: this.image.height
    });
    console.log(this.image.width)
    console.log(this.image.height)
    // if you keep same image object during source updates
    // you will have to update layer manually:
    // this.imageNode.getLayer().batchDraw();
  };
  probabilityToPercentage(probability){
    return((probability * 100).toFixed(0) + "%")
  }
  renderBBox() {
    if (this.state.image === null) {
      return null
    }
    // FOR Local Test
    var features = filter(predict[0]["response"][0]["features"], function(o) {return o.probability >= 0.4})
    // var features = filter(this.props.features, function(o) {return o.probability >= 0.4})
    console.log(features);
    var colorMap = {};
    var currentColorIndex = 0;
    return(
      features.map((data) => {
        var bbox = data["bounding_box"]
        var x1 = this.props.x + Math.round(bbox.xmin*this.state.width)
        var x2 = this.props.x + Math.round(bbox.xmax*this.state.width)
        var y1 = this.props.y + Math.round(bbox.ymin*this.state.height)
        var y2 = this.props.y + Math.round(bbox.ymax*this.state.height)
        var text = bbox.label + ": " + this.probabilityToPercentage(data.probability)
        if (!(bbox.index in colorMap)) {
          colorMap[bbox.index] = colors[currentColorIndex];
          currentColorIndex++;
        }
        var color = colorMap[bbox.index];
        return(
          <React.Fragment>
            <Rectangle x1={x1} x2={x2} y1={y1} y2={y2} color={color}/>
            <BBoxLabel x={x1} y={y1} text={text} color={color}/>
          </React.Fragment>
        )
      })
    )
  }

  render() {
    return (
      <React.Fragment>
        <Image
          x={this.props.x}
          y={this.props.y}
          image={this.state.image}
          ref={node => {
            this.imageNode = node;
          }}
        />
        {this.renderBBox()}
      </React.Fragment>
    );
  }
}

export default class SegmentationResult extends Component {
  render() {
    return(
      <Stage width={window.innerWidth-372} height={500}>
      {/* <Stage width={width} height={height}> */}
        <Layer>
          {/* For Local Test */}
          {/* <URLImage src="https://i.imgur.com/rZuyMXF.jpg" x={100} y={50} features={this.props.features}/> */}
          <URLImage src={this.props.imgUrl} x={0} y={0} features={this.props.features}/>
        </Layer>
      </Stage>
    )
  }
}