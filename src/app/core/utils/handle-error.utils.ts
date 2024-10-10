import { of } from 'rxjs';
import { LoggerService } from '../services/logger.service';

export const handleError = (error: string, logger: LoggerService) => {
  logger.handleError(error);

  return of(undefined);
};
