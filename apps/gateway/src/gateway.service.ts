import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CreateOrderDto,
  CreateUserDto,
  MessagePatterns,
  OrderDto,
  ServiceTokens,
  UserDto,
} from '@demo/shared';
import { mapRpcToHttp } from './rpc.util';

/**
 * 网关编排层：
 * - 列表/创建用户 → 直接转发 users-service
 * - 创建订单 → 先查用户是否存在，再调用 orders-service（演示跨服务编排 + 错误路径）
 */
@Injectable()
export class GatewayService {
  constructor(
    @Inject(ServiceTokens.USERS_SERVICE)
    private readonly usersClient: ClientProxy,
    @Inject(ServiceTokens.ORDERS_SERVICE)
    private readonly ordersClient: ClientProxy,
  ) {}

  pingUsers() {
    return firstValueFrom(
      mapRpcToHttp(
        this.usersClient.send(MessagePatterns.USERS_PING, {}),
      ),
    );
  }

  pingOrders() {
    return firstValueFrom(
      mapRpcToHttp(
        this.ordersClient.send(MessagePatterns.ORDERS_PING, {}),
      ),
    );
  }

  findAllUsers(): Promise<UserDto[]> {
    return firstValueFrom(
      mapRpcToHttp(
        this.usersClient.send<UserDto[]>(MessagePatterns.USERS_FIND_ALL, {}),
      ),
    );
  }

  findUser(id: string): Promise<UserDto> {
    return firstValueFrom(
      mapRpcToHttp(
        this.usersClient.send<UserDto>(MessagePatterns.USERS_FIND_ONE, { id }),
      ),
    );
  }

  createUser(dto: CreateUserDto): Promise<UserDto> {
    return firstValueFrom(
      mapRpcToHttp(
        this.usersClient.send<UserDto>(MessagePatterns.USERS_CREATE, dto),
      ),
    );
  }

  findAllOrders(): Promise<OrderDto[]> {
    return firstValueFrom(
      mapRpcToHttp(
        this.ordersClient.send<OrderDto[]>(MessagePatterns.ORDERS_FIND_ALL, {}),
      ),
    );
  }

  /**
   * 编排：创建订单前先向 users-service 确认用户存在。
   * 若不存在，users.findOne 抛 RpcException(404) → 映射为 HTTP 404 返回前端。
   */
  async createOrder(dto: CreateOrderDto): Promise<OrderDto> {
    // 1) 校验用户（错误路径演示）
    await this.findUser(dto.userId);
    // 2) 创建订单
    return firstValueFrom(
      mapRpcToHttp(
        this.ordersClient.send<OrderDto>(MessagePatterns.ORDERS_CREATE, dto),
      ),
    );
  }
}
