import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  //- tạo một logger để ghi log, đặt tên là 'HTTP' để dễ phân biệt trong log
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    //- tạo một mã ID duy nhất cho request này, sau phân biệt hoặc tìm kiếm trong log tiện
    const traceId = uuidv4();

    //- gắn ID này vào Header để dùng nó ở controller hoặc các middleware khác nếu cần
    res.setHeader('x-trace-id', traceId); //- key - value

    //- ghi lại thời điểm bắt đầu request
    const start = Date.now();

    //- khi xử lý xong và chuẩn bị trả kết quả về (sự kiện 'finish')
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { method, originalUrl } = req;
      const { statusCode } = res;

      //- in ra dòng log tổng kết: ID | Method | URL | Status | Thời gian
      //- ví dụ: [550e84...] GET /api/users 200 - 15ms
      this.logger.log(
        `[${traceId}] ${method} ${originalUrl} ${statusCode} - ${duration}ms`,
      );
    });

    next(); //- cho phép request đi tiếp vào Controller
  }
}
