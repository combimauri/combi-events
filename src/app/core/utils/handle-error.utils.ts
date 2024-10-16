import { LoggerService } from '@core/services';
import { of } from 'rxjs';

export const handleError = (error: string, logger: LoggerService) => {
  logger.handleError(error);

  return of(undefined);
};
