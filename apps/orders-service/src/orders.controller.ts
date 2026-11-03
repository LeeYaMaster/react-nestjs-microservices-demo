import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  CreateOrderDto,
  MessagePatterns,
  RpcErrorPayload,
} from '@demo/shared';
import { OrdersService } from './orders.service';

/**
 * 订单服务：本 Demo 中「用户是否存在」由网关在创建订单前校验。
 * 订单服务只负责持久化订单，并做基础字段校验。
 * 这样职责清晰：编排（orchestration）在网关，领域数据在各微服务。
 */
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern(MessagePatterns.ORDERS_PING)
  ping() {
    return { ok: true, service: 'orders-service', ts: new Date().toISOString() };
  }

  @MessagePattern(MessagePatterns.ORDERS_FIND_ALL)
  findAll() {
    return this.ordersService.findAll();
  }

  @MessagePattern(MessagePatterns.ORDERS_FIND_ONE)
  findOne(@Payload() data: { id: string }) {
    const order = this.ordersService.findOne(data.id);
    if (!order) {
      const err: RpcErrorPayload = {
        statusCode: 404,
        message: `订单不存在: ${data.id}`,
        code: 'ORDER_NOT_FOUND',
      };
      throw new RpcException(err);
    }
    return order;
  }

  @MessagePattern(MessagePatterns.ORDERS_CREATE)
  create(@Payload() dto: CreateOrderDto) {
    if (!dto?.userId?.trim() || !dto?.productName?.trim() || dto.amount == null) {
      const err: RpcErrorPayload = {
        statusCode: 400,
        message: 'userId、productName、amount 均为必填',
        code: 'VALIDATION_ERROR',
      };
      throw new RpcException(err);
    }
    if (typeof dto.amount !== 'number' || dto.amount <= 0) {
      const err: RpcErrorPayload = {
        statusCode: 400,
        message: 'amount 必须为正数',
        code: 'VALIDATION_ERROR',
      };
      throw new RpcException(err);
    }
    return this.ordersService.create(dto);
  }
}
