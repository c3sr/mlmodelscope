import { set } from "cerebral/operators";
import { state } from "cerebral/tags";

import getModelInformations from "../actions/getModelInformations";

export default [set(state`app.isLoaded`, true), getModelInformations];