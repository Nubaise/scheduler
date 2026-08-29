import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { requestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { requestLoggingMiddleware } from './common/middleware/request-logging.middleware.js';

export function configureApp(app: INestApplication): INestApplication {
  app.use(requestIdMiddleware);
  app.use(requestLoggingMiddleware);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  return app;
}
