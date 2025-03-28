export class HttpException extends Error {
  private _code: number;
  constructor(message: string, code: number) {
    super(message);
  }
  get code() {
    return this._code;
  }
}
