import yeast from "yeast";
import React from "react";
import { connect } from "@cerebral/react";
import { state } from "cerebral/tags";
import { head, lowerCase, sortBy } from "lodash";
import {
  Header,
  Image,
  Grid,
  List,
  Container,
  Label,
  Divider,
  Segment
} from "semantic-ui-react";

import Feature from "../Feature";

function PredictionResultPerImage({
  showImage = true,
  showModel = true,
  compact = false,
  output
}) {
  let model = output.model;
  let features = output.features || [];
  let len = features.length;
  features = sortBy(features, "probability")
    .slice(len - 10, len)
    .reverse();

  const makeFeatureTag = function(props) {
    const outputType =
      (model.output ? model.output.type : undefined) || "label";
    switch (lowerCase(outputType)) {
      case "coordinates":
        return <Feature.Location {...props} />;
      default:
        return <Feature.Label {...props} />;
    }
  };
  return (
    <Container>
      <Segment>
        {showImage ? (
          <Container>
            <Image centered size="medium" shape="rounded" src={output.data} />
            <Divider hidden />
          </Container>
        ) : null}
        {showModel
          ? [
              <Header textAlign="center" as="h1">
                {model.name} v{model.version}
                <Label
                  style={{
                    color: "white",
                    backgroundColor: "#0DB7C4",
                    borderColor: "#07717a"
                  }}
                >
                  {model.framework.name} {"  "} v{model.framework.version}
                </Label>
              </Header>,
              <Divider hidden />
            ]
          : null}
        <List divided>
          {features.map(features => (
            <List.Item key={yeast()}>
              <List.Content>
                {makeFeatureTag({
                  feature: features,
                  key: "feature-" + yeast(),
                  compact: compact
                })}
              </List.Content>
            </List.Item>
          ))}
        </List>
      </Segment>
    </Container>
  );
}

export default connect(
  {
    inputs: state`app.predictInputs`,
    models: state`models.selectedModels`,
    outputs: state`app.predictOutputs`
  },
  function PredictionResults({ inputs, models, outputs }) {
    if (outputs.length === 0) {
      return <div />;
    }
    const output = head(outputs);
    const model = head(models);
    return (
      <div>
        {inputs.length === 1
          ? [
              <Image
                key={yeast()}
                centered
                size="medium"
                shape="rounded"
                src={output[0].data}
              />,
              <Divider key={yeast()} hidden />
            ]
          : null}
        {models.length === 1
          ? [
              <Header key={yeast()} textAlign="center" as="h1">
                {model.name} v{model.version}
                <Label
                  style={{
                    color: "white",
                    backgroundColor: "#0DB7C4",
                    borderColor: "#07717a"
                  }}
                >
                  {model.framework.name} {"  "} v{model.framework.version}
                </Label>
              </Header>,
              <Divider key={yeast()} hidden />
            ]
          : null}
        <Grid columns={inputs.length} centered divided="vertically">
          {outputs.map(o => (
            <Grid.Row key={yeast()}>
              {o.map(oo => (
                <Grid.Column key={yeast()}>
                  <PredictionResultPerImage
                    showImage={inputs.length > 1}
                    showModel={models.length > 1}
                    compact={true}
                    output={oo}
                  />
                </Grid.Column>
              ))}
            </Grid.Row>
          ))}
        </Grid>
      </div>
    );
  }
);
