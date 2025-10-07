import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestCustom extends HttpException {
  constructor(message: string, isError = true) {
    super(
      {
        statusCode: isError ? 500 : 200,
        message,
        isOk: !isError,
        isError,
      },
      isError ? HttpStatus.BAD_REQUEST : HttpStatus.OK,
    );
  }
}
