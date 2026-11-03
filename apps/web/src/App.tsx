import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, Order, User } from './api';

type HealthState = {
  gateway?: string;
  usersOk?: boolean;
  ordersOk?: boolean;
  detail?: string;
};

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [health, setHealth] = useState<HealthState>({});
  const [loading, setLoading] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [orderMsg, setOrderMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState('99');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [u, o, h] = await Promise.all([
        api.listUsers(),
        api.listOrders(),
        api.health().catch((e: Error) => {
          setHealth({ detail: e.message });
          throw e;
        }),
      ]);
      setUsers(u);
      setOrders(o);
      setHealth({
        gateway: h.gateway,
        usersOk: !!(h.users as { ok?: boolean })?.ok,
        ordersOk: !!(h.orders as { ok?: boolean })?.ok,
      });
      if (!userId && u[0]) setUserId(u[0].id);
    } catch (e) {
      setHealth((prev) => ({
        ...prev,
        detail: (e as Error).message,
      }));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, []);

  async function onCreateUser(e: FormEvent) {
    e.preventDefault();
    setUserMsg(null);
    try {
      const user = await api.createUser({ name, email });
      setUserMsg({ type: 'ok', text: `已创建用户 ${user.name}（${user.id}）` });
      setName('');
      setEmail('');
      await refresh();
      setUserId(user.id);
    } catch (err) {
      setUserMsg({ type: 'err', text: (err as Error).message });
    }
  }

  async function onCreateOrder(e: FormEvent) {
    e.preventDefault();
    setOrderMsg(null);
    try {
      const order = await api.createOrder({
        userId,
        productName,
        amount: Number(amount),
      });
      setOrderMsg({
        type: 'ok',
        text: `已创建订单 ${order.productName}（${order.id}）`,
      });
      setProductName('');
      await refresh();
    } catch (err) {
      setOrderMsg({ type: 'err', text: (err as Error).message });
    }
  }

  async function tryMissingUserOrder() {
    setOrderMsg(null);
    try {
      await api.createOrder({
        userId: 'user-does-not-exist',
        productName: '故意失败的商品',
        amount: 1,
      });
      setOrderMsg({ type: 'ok', text: '意外成功（不应发生）' });
    } catch (err) {
      setOrderMsg({
        type: 'err',
        text: `预期错误路径：${(err as Error).message}`,
      });
    }
  }

  const userNameById = (id: string) =>
    users.find((u) => u.id === id)?.name || id;

  return (
    <div className="app">
      <header>
        <h1>React + NestJS 微服务学习 Demo</h1>
        <p>
          前端只调用 API Gateway（
          <span className="mono">http://localhost:3000</span>
          ）；网关再通过 TCP 访问用户 / 订单微服务。
        </p>
        <div className="badge-row">
          <span className={`badge ${health.gateway === 'ok' ? 'ok' : 'err'}`}>
            Gateway: {health.gateway === 'ok' ? '正常' : '异常'}
          </span>
          <span className={`badge ${health.usersOk ? 'ok' : 'err'}`}>
            Users TCP: {health.usersOk ? '正常' : '异常'}
          </span>
          <span className={`badge ${health.ordersOk ? 'ok' : 'err'}`}>
            Orders TCP: {health.ordersOk ? '正常' : '异常'}
          </span>
          <button className="secondary" onClick={() => void refresh()} disabled={loading}>
            {loading ? '刷新中…' : '刷新数据'}
          </button>
        </div>
        {health.detail && !health.gateway && (
          <p className="msg error">无法连接网关：{health.detail}</p>
        )}
      </header>

      <div className="grid">
        <section className="card">
          <h2>用户服务</h2>
          <p className="hint">POST /users → gateway → users.service（TCP）</p>
          <form className="form" onSubmit={onCreateUser}>
            <div className="row">
              <input
                placeholder="姓名"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                placeholder="邮箱"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">创建用户</button>
            </div>
          </form>
          {userMsg && (
            <p className={`msg ${userMsg.type === 'ok' ? 'success' : 'error'}`}>
              {userMsg.text}
            </p>
          )}
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>邮箱</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="mono">{u.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2>订单服务</h2>
          <p className="hint">
            创建订单时网关会先查用户是否存在，再调用 orders-service。可用「不存在用户」按钮演示错误回传。
          </p>
          <form className="form" onSubmit={onCreateOrder}>
            <div className="row">
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              >
                <option value="" disabled>
                  选择用户
                </option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="row">
              <input
                placeholder="商品名称"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
              <input
                placeholder="金额"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <button type="submit">创建订单</button>
            </div>
            <div className="row">
              <button type="button" className="secondary" onClick={() => void tryMissingUserOrder()}>
                用「不存在用户」下单（演示错误）
              </button>
            </div>
          </form>
          {orderMsg && (
            <p className={`msg ${orderMsg.type === 'ok' ? 'success' : 'error'}`}>
              {orderMsg.text}
            </p>
          )}
          <table>
            <thead>
              <tr>
                <th>商品</th>
                <th>金额</th>
                <th>用户</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.productName}</td>
                  <td>¥{o.amount}</td>
                  <td>{userNameById(o.userId)}</td>
                  <td className="mono">{o.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
