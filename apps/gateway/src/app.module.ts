import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ServiceTokens } from '@demo/shared';
import { UsersHttpController } from './users.http.controller';
import { OrdersHttpController } from './orders.http.controller';
import { HealthController } from './health.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ServiceTokens.USERS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_HOST || '127.0.0.1',
          port: Number(process.env.USERS_PORT || 3001),
        },
      },
      {
        name: ServiceTokens.ORDERS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: process.env.ORDERS_HOST || '127.0.0.1',
          port: Number(process.env.ORDERS_PORT || 3002),
        },
      },
    ]),
  ],
  controllers: [HealthController, UsersHttpController, OrdersHttpController],
  providers: [GatewayService],
})
export class AppModule {}
