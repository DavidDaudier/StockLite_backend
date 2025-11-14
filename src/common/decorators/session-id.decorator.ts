import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SessionId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-session-id'] || null;
  },
);
