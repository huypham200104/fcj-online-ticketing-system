export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resourceName) {
    super(`${resourceName} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}
