import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/user';
import { Response } from 'express';
import mongoose from 'mongoose';
import ApiError, { APIError } from '@src/util/errors/api-error';

export abstract class BaseController {
  protected sendCreatedUpdatedErrorResponse(
    res: Response,
    error: unknown
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      res.status(clientErrors.code).send(
        ApiError.format({
          code: clientErrors.code,
          message: clientErrors.error,
        })
      );
    } else {
      logger.error(error);
      res
        .status(500)
        .send(ApiError.format({ code: 500, message: 'Something went wrong!' }));
    }
  }

  private handleClientErrors(error: mongoose.Error.ValidationError): {
    code: number;
    error: string;
  } {
    const duplicatedKindErrors = Object.values(error.errors).filter((err) => {
      if (
        err instanceof mongoose.Error.ValidatorError ||
        err instanceof mongoose.Error.CastError
      ) {
        return err.kind === CUSTOM_VALIDATION.DUPLICATED;
      } else {
        return null;
      }
    });
    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    }
    return { code: 422, error: error.message };
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
