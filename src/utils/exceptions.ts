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

export type GuestLimitCode =
  | 'GUEST_RECORDING_LIMIT'
  | 'GUEST_CHAT_LIMIT'
  | 'GUEST_TOTAL_LIMIT';

export class GuestLimitExceededException extends ApiError {
  public readonly code: GuestLimitCode;

  constructor(message: string, code: GuestLimitCode) {
    super(message, 403);
    this.code = code;
  }
}
