import {BehaviorSubject, Observable} from 'rxjs';

const AnonymousUserId = 'anonymous';
const InitialPollDelayMs = 1000;
const MaxPollDelayMs = 5000;
const PollBackoffMultiplier = 1.5;

class Api {
  Models: BehaviorSubject;
  Frameworks: BehaviorSubject;
  ActiveModel: BehaviorSubject;

  constructor() {
    this.apiUrl =
      process.env.NODE_ENV === "development"
        ? "/api"
        : process.env.REACT_APP_API_URL;
    this.Models = new BehaviorSubject([]);
    this.Frameworks = new BehaviorSubject([]);
    this.ActiveModel = new BehaviorSubject([]);
    this.ActiveUser = new BehaviorSubject({id: AnonymousUserId})
  }

  async getModels(filters) {
    let queries = "";
    if (filters !== undefined) {
      queries = "?" + Object.keys(filters).map(key => `${key}=${filters[key]}`).join("&");
    }
    let result = await fetch(`${this.apiUrl}/models${queries}`);
    if (!result.ok)
      throw new Error(`Unable to fetch models (${result.status})`);

    let data = await result.json();

    if (!Array.isArray(data.models))
      throw new Error("Models response did not contain a models array");

    this.Models.next(data.models);
  }

  async getModel(id) {
    let result = await fetch(`${this.apiUrl}/models/${id}`);
    let data = await result.json();

    this.ActiveModel.next(data.models);
  }

  async getFrameworks() {
    let result = await fetch(`${this.apiUrl}/frameworks`);
    if (!result.ok)
      throw new Error(`Unable to fetch frameworks (${result.status})`);

    let data = await result.json();

    if (!Array.isArray(data.frameworks))
      throw new Error("Frameworks response did not contain a frameworks array");

    this.Frameworks.next(data.frameworks);
  }

  /*
   * Look up an experiment by ID. Returns an Observable of Experiment details. Polls the experiment data delivering
   * results to Observer(s) until either the experiment is completed or a timeout has been reached at which time it will
   * result in an error.
   *
   * @param {string} experimentId - The UUID of the experiment to look up
   */
  getExperiment(experimentId) {
    return this.poll({
      fn: this._getExperiment,
      params: experimentId,
      validate: experiment => experiment.trials !== undefined, // how do we really validate?
      maxAttempts: 10
    });
  }


  _getExperiment = async (experimentId) => {
    let result = await fetch(`${this.apiUrl}/experiments/${experimentId}`);
    return await result.json();
  }

  /*
   * Delete a trial by ID.
   *
   * @param {string} trialId - The UUID of the trial to delete
   *
   * @throws If the trial cannot be deleted. This occurs if the trial to be deleted is the last that exists in
   * it's experiment.
   */
  async deleteTrial(trialId) {
    const result = await fetch(`${this.apiUrl}/trial/${trialId}`, {method: 'DELETE'});

    if (result.status === 200 || result.status === 404)
      return;

    const response = await result.json();
    throw new Error(response.error);
  }

  /*
   * Look up a trial by ID. Returns an Observable of Trial details. Polls the trial data delivering results to
   * Observer(s) until either the trial is completed, a timeout has been reached at which time it will result
   * in an error, or all observers have unsubscribed from the Observable.
   *
   * @param {string} trialId - The UUID of the trial to look up
   */
  getTrial(trialId, pollingOptions = {}) {
    return new Observable(subscriber => {
      let cancelled = false;
      let pollTimer;
      let pollDelay = pollingOptions.initialDelayMs ?? InitialPollDelayMs;
      const maxPollDelay =
        pollingOptions.maxDelayMs ?? MaxPollDelayMs;
      const backoffMultiplier =
        pollingOptions.backoffMultiplier ?? PollBackoffMultiplier;

      const scheduleStatusCheck = () => {
        pollTimer = setTimeout(checkStatus, pollDelay);
        pollDelay = Math.min(
          pollDelay * backoffMultiplier,
          maxPollDelay
        );
      };

      const checkStatus = async () => {
        try {
          const status = await this._getTrialStatus(trialId);
          if (cancelled)
            return;

          if (status.completed_at) {
            const completedTrial = await this._getTrial(trialId);
            if (!cancelled) {
              subscriber.next(completedTrial);
              subscriber.complete();
            }
          } else {
            scheduleStatusCheck();
          }
        } catch (error) {
          if (!cancelled)
            subscriber.error(error);
        }
      };

      const loadInitialTrial = async () => {
        try {
          const trial = await this._getTrial(trialId);
          if (cancelled)
            return;

          subscriber.next(trial);
          if (trial?.completed_at) {
            subscriber.complete();
          } else {
            scheduleStatusCheck();
          }
        } catch (error) {
          if (!cancelled)
            subscriber.error(error);
        }
      };

      loadInitialTrial();

      return () => {
        cancelled = true;
        clearTimeout(pollTimer);
      };
    });
  }

  _getTrialStatus = async (trialId) => {
    const result = await fetch(`${this.apiUrl}/trial/${trialId}/status`);
    if (result.status !== 200)
      throw new Error(`Unable to fetch trial status (${result.status})`);

    return await result.json();
  }

  _getTrial = async (trialId) => {
    let result = await fetch(`${this.apiUrl}/trial/${trialId}`);
    if (result.status !== 200)
      return null;

    let trial = await result.json();
    if (trial.results === undefined)
      trial.results= {"responses": [{features: []}]};

    return trial;
  }

  async runTrial(model, input, experimentId = null, context = null, options = {}) {
    let inputs = typeof (input) === 'string' ? [input] : input;
    const requestBody = {
      architecture: "amd64",
      inputs: inputs,
      model: model.id,
      batchSize: 1,
      traceLevel: "NO_TRACE",
      gpu: false,
      desiredResultModality: model.output.type
    }

    if (experimentId) {
      requestBody['experiment'] = experimentId;
    }

    if (context) {
      requestBody['context'] = context;
    }

    if (options.explanation?.enabled) {
      requestBody['explanation'] = options.explanation;
    }

    // UNCOMMENT BEFORE COMMITTING
    // Comment this out to test fake api requests via storybook
    const response = await fetch(`${this.apiUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    return await response.json();
  }

  async requestInteractiveExplanation(payload) {
    const explanationApiUrl = process.env.REACT_APP_EXPLANATION_API_URL;
    if (!explanationApiUrl)
      throw new Error('REACT_APP_EXPLANATION_API_URL is not configured');

    const {attachments = [], ...requestPayload} = payload;
    let body;
    let headers = {};

    if (attachments.length > 0) {
      body = new FormData();
      body.append('context', JSON.stringify(requestPayload.context));
      body.append('question', requestPayload.question);
      body.append('expertiseLevel', requestPayload.expertiseLevel);
      body.append('attachmentMetadata', JSON.stringify(
        attachments.map(({role, mimeType, description}) => ({role, mimeType, description}))
      ));
      attachments.forEach((attachment, index) => {
        body.append(
          'attachments',
          base64ToBlob(attachment.data, attachment.mimeType),
          `${attachment.role}-${index}.${extensionForMimeType(attachment.mimeType)}`
        );
      });
    } else {
      body = JSON.stringify(requestPayload);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(
      `${explanationApiUrl.replace(/\/$/, '')}/v1/explain`,
      {
        method: 'POST',
        headers,
        body
      }
    );

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || 'Unable to generate interactive explanation');

    return data;
  }

  poll({fn, params, validate, maxAttempts}) {
    return new Observable(subscriber => {
      let attempts = 0;
      let cancelled = false;
      let pollTimer;
      let pollDelay = InitialPollDelayMs;

      const executePoll = async () => {
        try {
          const result = await fn(params);
          if (cancelled)
            return;

          attempts++;
          subscriber.next(result);

          if (result && validate(result)) {
            subscriber.complete();
          } else if (maxAttempts && attempts >= maxAttempts) {
            subscriber.error(new Error('max polling attempts exceeded'));
          } else {
            pollTimer = setTimeout(executePoll, pollDelay);
            pollDelay = Math.min(
              pollDelay * PollBackoffMultiplier,
              MaxPollDelayMs
            );
          }
        } catch (error) {
          if (!cancelled)
            subscriber.error(error);
        }
      };

      executePoll();

      return () => {
        cancelled = true;
        clearTimeout(pollTimer);
      };
    });
  }
}

function base64ToBlob(data, mimeType) {
  const normalizedData = data.replace(/^data:[^;]+;base64,/, '');
  const binary = atob(normalizedData);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new Blob([bytes], {type: mimeType});
}

function extensionForMimeType(mimeType) {
  return {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  }[mimeType] || 'img';
}

let api;

export default function GetApiHelper() {
  if (api === undefined)
    api = new Api();

  return api;
}
