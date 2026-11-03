import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  CreateUserDto,
  MessagePatterns,
  RpcErrorPayload,
} from '@demo/shared';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(MessagePatterns.USERS_PING)
  ping() {
    return { ok: true, service: 'users-service', ts: new Date().toISOString() };
  }

  @MessagePattern(MessagePatterns.USERS_FIND_ALL)
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern(MessagePatterns.USERS_FIND_ONE)
  findOne(@Payload() data: { id: string }) {
    const user = this.usersService.findOne(data.id);
    if (!user) {
      const err: RpcErrorPayload = {
        statusCode: 404,
        message: `用户不存在: ${data.id}`,
        code: 'USER_NOT_FOUND',
      };
      throw new RpcException(err);
    }
    return user;
  }

  @MessagePattern(MessagePatterns.USERS_CREATE)
  create(@Payload() dto: CreateUserDto) {
    if (!dto?.name?.trim() || !dto?.email?.trim()) {
      const err: RpcErrorPayload = {
        statusCode: 400,
        message: 'name 与 email 均为必填',
        code: 'VALIDATION_ERROR',
      };
      throw new RpcException(err);
    }
    return this.usersService.create(dto);
  }
}
