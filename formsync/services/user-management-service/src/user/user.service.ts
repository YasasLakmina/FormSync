import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async create(data: { email: string; name?: string; password: string }) {
        return this.prisma.user.create({ data });
    }

    async update(id: string, data: { name?: string; email?: string; password?: string }) {
        return this.prisma.user.update({ where: { id }, data });
    }
}
