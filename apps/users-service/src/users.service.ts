import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto, UserDto } from '@demo/shared';

@Injectable()
export class UsersService {
  private readonly users: UserDto[] = [
    {
      id: 'u-demo-1',
      name: '张三',
      email: 'zhangsan@example.com',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'u-demo-2',
      name: '李四',
      email: 'lisi@example.com',
      createdAt: new Date().toISOString(),
    },
  ];

  findAll(): UserDto[] {
    return this.users;
  }

  findOne(id: string): UserDto | undefined {
    return this.users.find((u) => u.id === id);
  }

  create(dto: CreateUserDto): UserDto {
    const user: UserDto = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }
}
