/** 微服务消息模式常量（Message Patterns） */
export const MessagePatterns = {
  // Users
  USERS_PING: 'users.ping',
  USERS_FIND_ALL: 'users.findAll',
  USERS_FIND_ONE: 'users.findOne',
  USERS_CREATE: 'users.create',

  // Orders
  ORDERS_PING: 'orders.ping',
  ORDERS_FIND_ALL: 'orders.findAll',
  ORDERS_FIND_ONE: 'orders.findOne',
  ORDERS_CREATE: 'orders.create',
} as const;

export type MessagePattern =
  (typeof MessagePatterns)[keyof typeof MessagePatterns];

/** 共享 DTO */
export interface UserDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
}

export interface OrderDto {
  id: string;
  userId: string;
  productName: string;
  amount: number;
  createdAt: string;
}

export interface CreateOrderDto {
  userId: string;
  productName: string;
  amount: number;
}

/** 微服务统一错误载荷（网关可映射为 HTTP 状态码） */
export interface RpcErrorPayload {
  statusCode: number;
  message: string;
  code?: string;
}

export const ServiceTokens = {
  USERS_SERVICE: 'USERS_SERVICE',
  ORDERS_SERVICE: 'ORDERS_SERVICE',
} as const;
