import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateOrderDto, OrderDto } from '@demo/shared';

@Injectable()
export class OrdersService {
  private readonly orders: OrderDto[] = [
    {
      id: 'o-demo-1',
      userId: 'u-demo-1',
      productName: 'NestJS 实战课程',
      amount: 199,
      createdAt: new Date().toISOString(),
    },
  ];

  findAll(): OrderDto[] {
    return this.orders;
  }

  findOne(id: string): OrderDto | undefined {
    return this.orders.find((o) => o.id === id);
  }

  create(dto: CreateOrderDto): OrderDto {
    const order: OrderDto = {
      id: randomUUID(),
      userId: dto.userId,
      productName: dto.productName,
      amount: dto.amount,
      createdAt: new Date().toISOString(),
    };
    this.orders.push(order);
    return order;
  }
}
