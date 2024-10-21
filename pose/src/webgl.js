export const WEBGL = {
  isWebGLAvailable: function () {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  },

  getWebGLErrorMessage: function () {
    const message = document.createElement("div");
    message.id = "webgl-error-message";
    message.style.fontFamily = "monospace";
    message.style.fontSize = "13px";
    message.style.textAlign = "center";
    message.style.background = "#fff";
    message.style.color = "#000";
    message.style.padding = "1em";
    message.style.width = "400px";
    message.style.margin = "5em auto 0";

    if (!this.isWebGLAvailable()) {
      message.innerHTML = window.WebGLRenderingContext
        ? "Your browser supports WebGL, but it is disabled or not working."
        : "Your browser does not support WebGL.";
    }

    return message;
  },
};
