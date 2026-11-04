export abstract class Failure {
  constructor(public readonly message: string) {}
}

export class ServerFailure extends Failure {}
export class CacheFailure extends Failure {}
export class NetworkFailure extends Failure {}
export class ValidationFailure extends Failure {}
export class UnknownFailure extends Failure {}

export type Result<T, E = Failure> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function fail<E = Failure>(error: E): Result<never, E> {
  return { success: false, error };
}
