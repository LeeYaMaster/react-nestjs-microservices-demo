import { Controller, Get } from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller()
export class HealthController {
  constructor(private readonly gateway: GatewayService) {}

  @Get()
  root() {
    return {
      name: 'react-nestjs-microservices-demo gateway',
      hint: 'GET /health 检查下游；/users /orders 为业务 API',
    };
  }

  @Get('health')
  async health() {
    const [users, orders] = await Promise.all([
      this.gateway.pingUsers().catch((e) => ({
        ok: false,
        error: e?.message || String(e),
      })),
      this.gateway.pingOrders().catch((e) => ({
        ok: false,
        error: e?.message || String(e),
      })),
    ]);
    return { gateway: 'ok', users, orders };
  }
}
