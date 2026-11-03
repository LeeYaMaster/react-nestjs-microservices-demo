import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateOrderDto } from '@demo/shared';
import { GatewayService } from './gateway.service';

@Controller('orders')
export class OrdersHttpController {
  constructor(private readonly gateway: GatewayService) {}

  @Get()
  findAll() {
    return this.gateway.findAllOrders();
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.gateway.createOrder(dto);
  }
}
