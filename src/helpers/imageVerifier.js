export default class ImageVerifier {
  constructor(url) {
    this.url = url;
  }

  _timer;
  _timeout;

  async Verify(timeoutOverride) {
    this._timeout = timeoutOverride || 5000;

    return await this._testImage();
  }

  async _testImage() {
    return await new Promise((res) => {
      let img = new Image();

      const errorHandler = this._errorHandler.bind(this, res);
      const loadHandler = this._loadHandler.bind(this, res);

      img.onerror = errorHandler;
      img.onabort = errorHandler;
      img.onload = loadHandler;

      img.src = this.url;

      this._timer = this._timeoutHandler(img, res);
    })
  }

  _loadHandler(resolve) {
    clearTimeout(this._timer);
    resolve(true);
  }

  _errorHandler(resolve) {
    clearTimeout(this._timer);
    resolve(false);
  }

  _timeoutHandler(img, resolve) {
    return setTimeout(() => {
      img.src = "!!!!!!!!!!!!!!!/idontexist.png";
      resolve(false);
    }, this._timeout)
  }
}
