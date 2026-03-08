abstract class ApiError extends Error {
  public readonly httpStatus: number;

  constructor(message: string, httpStatus: number) {
    super(message);
    this.name = this.constructor.name;
    this.httpStatus = httpStatus;
  }
}

export class UnauthenticatedException extends ApiError {
  constructor(message: string = 'Unauthenticated') {
    super(message, 401);
  }
}

export class UnauthorizedException extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 403);
  }
}

export class NotFoundException extends ApiError {
  constructor(message: string = 'Not found') {
    super(message, 404);
  }
}
