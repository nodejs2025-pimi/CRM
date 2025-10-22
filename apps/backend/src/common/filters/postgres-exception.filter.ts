import { ArgumentsHost, BadRequestException, ConflictException, ExceptionFilter, HttpException } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

const UNIQUE_ERR_CODE = '23505';

@Catch(QueryFailedError)
export class PostgresExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError<any>, host: ArgumentsHost): any {
    const res: Response = host.switchToHttp().getResponse();

    let httpException: HttpException;
    const code = exception.driverError?.code;

    switch (code) {
      case UNIQUE_ERR_CODE:
        httpException = new ConflictException('Duplicate error.');
        break;
      default:
        httpException = new BadRequestException('Database Error');
        break;
    }
    res.status(httpException.getStatus()).json(httpException.getResponse());
  }
}
