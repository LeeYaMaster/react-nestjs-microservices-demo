# React + NestJS 微服务学习 Demo

面向中文开发者的本地可运行示例：用 **Vite + React** 作为前端，**NestJS API Gateway** 作为唯一 HTTP 入口，通过 **TCP 传输** 调用 **用户微服务** 与 **订单微服务**。

## 学习目标

- 理解「API 网关 + 多个微服务」的基本拆分方式
- 掌握 NestJS `@nestjs/microservices` 的 `Transport.TCP` 与 `@MessagePattern`
- 学会在网关中用 `ClientsModule` + `ClientProxy.send()` 调用下游
- 体验一次跨服务编排：创建订单前先校验用户是否存在，以及错误如何回传到前端
- 前端只依赖网关 URL，不直接访问微服务端口

## 架构说明

| 组件 | 职责 |
|------|------|
| **apps/web** | React 前端。只请求 `http://localhost:3000` |
| **apps/gateway** | HTTP API Gateway（3000）。CORS、路由、编排；用 TCP 客户端调用下游 |
| **apps/users-service** | 用户领域微服务（TCP 3001）。内存存储：列表 / 按 id 查询 / 创建 / ping |
| **apps/orders-service** | 订单领域微服务（TCP 3002）。内存存储：列表 / 创建 / ping |
| **packages/shared** | 共享消息模式常量、DTO、服务 token |

**编排约定（本 Demo 明确采用）：**

创建订单时由 **网关** 先调用 `users.findOne`；用户不存在则映射为 HTTP 404 返回前端；存在则再调用 `orders.create`。订单服务本身不反向调用用户服务，职责更清晰，也方便初学时理解「编排在网关」。

## 目录结构

```
react-nestjs-microservices-demo/
  package.json              # npm workspaces + 启动脚本
  README.md
  ARCHITECTURE.md
  .env.example
  apps/
    gateway/                # NestJS HTTP 网关
    users-service/          # NestJS TCP 用户服务
    orders-service/         # NestJS TCP 订单服务
    web/                    # Vite + React + TS 前端
  packages/
    shared/                 # 消息模式与 DTO
```

## 端口一览

| 服务 | 协议 | 默认端口 |
|------|------|----------|
| gateway | HTTP | 3000 |
| users-service | TCP | 3001 |
| orders-service | TCP | 3002 |
| web (Vite) | HTTP | 5173 |

## 环境要求

- Node.js **20+**（推荐 20 / 22 LTS）
- npm 9+（使用 npm workspaces）

## 本地启动

在项目根目录执行：

```bash
# 1. 安装依赖（会构建 @demo/shared）
npm install

# 2. （可选）复制环境变量
cp .env.example .env

# 3a. 一键启动全部（微服务 + 网关 + 前端）
npm run start:all

# 或分步：
# 3b. 先起后端（users → orders → gateway，concurrently 并行）
npm run start:services

# 3c. 另开终端起前端
npm run start:web
```

启动成功后：

- 前端：http://localhost:5173
- 网关：http://localhost:3000
- 健康检查：http://localhost:3000/health

> 建议先确认 `/health` 中 `users`、`orders` 的 `ok: true`，再操作前端。

## 如何验证

### curl

```bash
# 健康检查（ping 两个 TCP 微服务）
curl -s http://localhost:3000/health | jq

# 用户列表
curl -s http://localhost:3000/users | jq

# 创建用户
curl -s -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"王五","email":"wangwu@example.com"}' | jq

# 订单列表
curl -s http://localhost:3000/orders | jq

# 用已有用户下单（种子用户 id: u-demo-1）
curl -s -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -d '{"userId":"u-demo-1","productName":"微服务入门","amount":128}' | jq

# 错误路径：不存在的用户 → 期望 404
curl -s -i -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -d '{"userId":"user-does-not-exist","productName":"失败单","amount":1}'
```

### 前端操作

1. 打开 http://localhost:5173 ，顶部徽章应显示 Gateway / Users / Orders 均为「正常」
2. 在「用户服务」创建一名用户，表格应刷新
3. 在「订单服务」选择该用户并创建订单
4. 点击「用『不存在用户』下单」，应看到红色错误提示（网关编排校验失败）

## 建议的下一步学习

本地 TCP + 内存存储已经足够理解消息模式与网关编排。若继续深入生产向微服务，可依次尝试：

1. **服务发现与配置中心**：Consul / Nacos / etcd，避免硬编码 `host:port`；用环境与配置中心下发端口、超时等。
2. **消息队列与异步事件**：将「下单成功」改为发布 `order.created` 事件（RabbitMQ / Kafka / Redis Streams），用户服务或通知服务订阅，体会同步 RPC 与异步事件驱动的差异。
3. **可观测性**：为 TCP/HTTP 调用加上 OpenTelemetry 追踪、结构化日志与健康探针；网关统一超时、重试与熔断（例如 Resilience 模式）。
4. **数据与一致性**：每个服务独立数据库；跨服务用 Saga / 发件箱模式处理分布式事务，而不是共享一张表。

## 许可

仅供学习演示，无第三方密钥，可自由修改。
