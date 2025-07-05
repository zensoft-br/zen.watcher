export class HttpError extends Error {
  /**
   * @param {number} statusCode - Código HTTP (ex: 404, 500)
   * @param {string} message - Mensagem de erro
   * @param {object} [payload] - Dados adicionais (ex: { field: "email", reason: "invalid" })
   */
  constructor(statusCode, message, payload = {}) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.payload = payload;

    // Corrige o prototype (necessário para instanceof funcionar)
    Object.setPrototypeOf(this, new.target.prototype);

    // Captura stack trace corretamente
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      type: this.name,
      message: this.message,
      statusCode: this.statusCode,
      ...(Object.keys(this.payload).length > 0 && { payload: this.payload }),
    };
  }
}
