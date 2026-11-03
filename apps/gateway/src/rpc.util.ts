import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RpcErrorPayload } from '@demo/shared';
import { Observable, catchError, throwError, timeout } from 'rxjs';

/** 将下游 RpcException / 超时映射为 HTTP 异常 */
export function mapRpcToHttp<T>(source$: Observable<T>): Observable<T> {
  return source$.pipe(
    timeout(5000),
    catchError((err) => {
      // Nest 微服务客户端收到的错误通常在 err.error 或直接是 payload
      const payload: RpcErrorPayload | undefined =
        err?.error ?? (err?.statusCode ? err : undefined);

      if (payload?.statusCode === 404) {
        return throwError(
          () => new NotFoundException(payload.message || '资源不存在'),
        );
      }
      if (payload?.statusCode === 400) {
        return throwError(
          () => new BadRequestException(payload.message || '请求无效'),
        );
      }

      // TCP 连接失败、超时等
      const message =
        err?.message ||
        payload?.message ||
        '下游微服务调用失败，请确认 users/orders 服务已启动';
      return throwError(() => new InternalServerErrorException(message));
    }),
  );
}

export function rethrowAsHttp(err: unknown): never {
  if (err instanceof HttpException) {
    throw err;
  }
  throw new InternalServerErrorException(
    (err as Error)?.message || '未知错误',
  );
}
