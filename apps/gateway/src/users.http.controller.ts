import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from '@demo/shared';
import { GatewayService } from './gateway.service';

@Controller('users')
export class UsersHttpController {
  constructor(private readonly gateway: GatewayService) {}

  @Get()
  findAll() {
    return this.gateway.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gateway.findUser(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.gateway.createUser(dto);
  }
}
