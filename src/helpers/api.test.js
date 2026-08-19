import GetApiHelper from "./api";
import expect from "expect";
import fetchMock from "fetch-mock";

const ApiRoot = process.env.REACT_APP_API_URL;

describe('The API helper', () => {

  beforeEach(() => {
    fetchMock.resetHistory();
  });

  let api = GetApiHelper();

  fetchMock.get(`begin:${ApiRoot}/models`, {
    models: [{}]
  });

  fetchMock.get(`begin:${ApiRoot}/frameworks`, {
    frameworks: [{}]
  });

  it('requests all models', async () => {
    let results;

    api.Models.subscribe({
      next: (models) => {
        results = models;
      }
    });
    await api.getModels();

    expect(fetchMock.called(`${ApiRoot}/models`)).toBe(true);
    expect(results.length).toBe(1);
  });

  it('requests all frameworks', async () => {
    let results;

    api.Frameworks.subscribe({
      next: (frameworks) => {
        results = frameworks;
      }
    });

    await api.getFrameworks();
    expect(fetchMock.called(`${ApiRoot}/frameworks`)).toBe(true);
    expect(results.length).toBe(1);
  });

  it('requests models of one framework', async () => {
    let results;

    api.Models.subscribe({
      next: (models) => {
        results = models;
      }
    });

    await api.getModels({ framework: 1 });
    expect(fetchMock.lastUrl()).toBe(`${ApiRoot}/models?framework=1`);
    expect(results.length).toBe(1);
  });

  it('requests models of one task', async () => {
    let results;

    api.Models.subscribe({
      next: (models) => {
        results = models;
      }
    });

    await api.getModels({ task: 1 });
    expect(fetchMock.lastUrl()).toBe(`${ApiRoot}/models?task=1`);
    expect(results.length).toBe(1);
  });

  it('requests model by ID', async () => {
    let results;

    api.ActiveModel.subscribe({
      next: (model) => {
        results = model;
      }
    });

    await api.getModel(1);
    expect(fetchMock.lastUrl()).toBe(`${ApiRoot}/models/1`);
    expect(results.length).toBe(1);
  });

  it('reports the anonymous user by default', async () => {
    let userId;

    api.ActiveUser.subscribe({
      next: (user) => {
        userId = user.id;
      }
    });

    expect(userId).toBe('anonymous');
  });

  describe('runTrial', () => {
    beforeEach(() => {
      fetchMock.resetHistory();
    });

    it('returns the trial id', async () => {
      fetchMock.post(`begin:${ApiRoot}/predict`, {trialId: 'test-trial'});
      const response = await api.runTrial({id: 12, output: { type: 'image_classification'}}, 'test input');

      expect(response.trialId).toBe('test-trial');
    });

    it('includes explanation settings only when enabled', async () => {
      fetchMock.post(`begin:${ApiRoot}/predict`, {trialId: 'test-trial'});
      await api.runTrial(
        {id: 12, output: { type: 'image_classification'}},
        'test input',
        null,
        null,
        {explanation: {enabled: true, method: 'grad_cam', topK: 2}}
      );

      const body = JSON.parse(fetchMock.lastOptions().body);
      expect(body.explanation).toEqual({
        enabled: true,
        method: 'grad_cam',
        topK: 2
      });
    });

    it('sends text prompt inputs for text-to-text trials', async () => {
      fetchMock.post(`begin:${ApiRoot}/predict`, {trialId: 'test-trial'});
      await api.runTrial(
        {id: 10000, output: { type: 'text_to_text'}},
        [{src: 'Once upon a time', inputType: 'TEXT'}]
      );

      const body = JSON.parse(fetchMock.lastOptions().body);
      expect(body.model).toBe(10000);
      expect(body.desiredResultModality).toBe('text_to_text');
      expect(body.inputs).toEqual([
        {src: 'Once upon a time', inputType: 'TEXT'}
      ]);
    });

    it('includes token probability explanation settings for text-to-text trials', async () => {
      fetchMock.post(`begin:${ApiRoot}/predict`, {trialId: 'test-trial'});
      await api.runTrial(
        {id: 10000, output: { type: 'text_to_text'}},
        [{src: 'Once upon a time', inputType: 'TEXT'}],
        null,
        null,
        {explanation: {enabled: true, method: 'token_probability', topK: 5}}
      );

      const body = JSON.parse(fetchMock.lastOptions().body);
      expect(body.explanation).toEqual({
        enabled: true,
        method: 'token_probability',
        topK: 5
      });
    });

    it('requests an interactive explanation without duplicating trial data', async () => {
      const previousExplanationApiUrl = process.env.REACT_APP_EXPLANATION_API_URL;
      process.env.REACT_APP_EXPLANATION_API_URL = 'http://explanation-api.test';
      fetchMock.post('http://explanation-api.test/v1/explain', {
        answer: 'The selected class had the highest probability.',
        limitations: []
      });

      const payload = {
        context: {
          artifact: {
            kind: 'classification',
            selection: {classIndex: 1, label: 'goldfinch'},
            structuredData: {
              predictions: [{index: 1, label: 'goldfinch', probability: 0.8}]
            }
          },
          model: {
            name: 'Example Model',
            task: 'image_classification',
            framework: 'PyTorch',
            frameworkVersion: '2.0'
          }
        },
        question: 'Why was this class ranked highest?',
        expertiseLevel: 'beginner'
      };
      const response = await api.requestInteractiveExplanation(payload);

      expect(response.answer).toBe('The selected class had the highest probability.');
      expect(JSON.parse(fetchMock.lastOptions().body)).toEqual(payload);
      process.env.REACT_APP_EXPLANATION_API_URL = previousExplanationApiUrl;
    });
  });

  describe('deleteTrial', () => {
    beforeEach(() => fetchMock.reset());

    it('calls the deletion endpoint', async () => {
      fetchMock.delete(`begin:${ApiRoot}/trial`, {});
      await api.deleteTrial('test-trial');

      expect(fetchMock.lastUrl()).toBe(`${ApiRoot}/trial/test-trial`);
      expect(fetchMock.lastOptions().method).toBe('DELETE');
    });

    it('throws an error on a 400 response', async () => {
      fetchMock.delete(`begin:${ApiRoot}/trial`, (url, opts) => {
        return {
          status: 400,
          body: '{ "error": "nope" }'
        }
      });

      try {
        await api.deleteTrial('test-trial');
        throw new Error('Expected deleteTrial to reject');
      } catch (error) {
        expect(error.message).toBe('nope');
      }
    });
  });

  describe('getTrial', () => {
    beforeEach(() => {
      fetchMock.reset();
    });

    it('returns an observable', done => {
      fetchMock.get(`${ApiRoot}/trial/test-trial`, {
        results: {},
        completed_at: true
      });
      const trial = api.getTrial('test-trial');

      trial.subscribe({
        next: t => {
          done();
        }
      });
    });

    it('that delivers new trial results until completion', async () => {
      fetchMock.get(`${ApiRoot}/trial/test-trial`, {
        results: {},
        completed_at: null
      }, {overwriteRoutes: false, repeat: 1});
      fetchMock.get(`${ApiRoot}/trial/test-trial/status`, {
        status: 'completed',
        completed_at: true
      });
      fetchMock.get(`${ApiRoot}/trial/test-trial`, {
        results: {},
        completed_at: true
      }, {overwriteRoutes: false});

      const completedTrial = await new Promise((resolve, reject) => {
        api.getTrial('test-trial', {
          initialDelayMs: 1,
          maxDelayMs: 1,
          backoffMultiplier: 1
        }).subscribe({
          next: trial => {
            if (trial.completed_at)
              resolve(trial);
          },
          error: reject
        });
      });

      expect(completedTrial.completed_at).toBe(true);
      expect(fetchMock.calls(`${ApiRoot}/trial/test-trial/status`).length).toBe(1);
      expect(fetchMock.calls(`${ApiRoot}/trial/test-trial`).length).toBe(2);
    });

    it('stops polling when the subscription is cancelled', async () => {
      fetchMock.get(`${ApiRoot}/trial/test-trial`, {
        results: {},
        completed_at: null
      });
      fetchMock.get(`${ApiRoot}/trial/test-trial/status`, {
        status: 'pending',
        completed_at: null
      });

      let subscription;
      await new Promise((resolve, reject) => {
        subscription = api.getTrial('test-trial', {
          initialDelayMs: 20,
          maxDelayMs: 20,
          backoffMultiplier: 1
        }).subscribe({
          next: resolve,
          error: reject
        });
      });

      subscription.unsubscribe();
      await new Promise(resolve => setTimeout(resolve, 30));

      expect(fetchMock.called(`${ApiRoot}/trial/test-trial/status`)).toBe(false);
    });
  });
});
