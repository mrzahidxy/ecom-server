// message, status code, error codes, error

export class HTTPException extends Error {
  message: string;
  errorCode: ErrorCode;
  statusCode: number;
  errors: any;

  constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode: number,
    errors: any
  ) {
    super(message);
    this.message = message;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export enum ErrorCode {
  // User-related errors (100 series)
  UserNotFound = 101,
  UserAlreadyExists = 102,
  IncorrectPassword = 103,
  AddressNotFound = 104,

  // Product, Cart, Order and Promotion errors (200 series)
  ProductNotFound = 201,
  CartNotFound = 202,
  OrderNotFound = 203,
  PromotionNotFound = 204,

  // Internal errors (300 series)
  InternalServerError = 301,

  // Authorization and authentication errors (400 series)
  NoTokenProvided = 401,
  NotAuthorized = 402,

  //validation errors (500 series)
  UnprocessableEntity = 501
}

