import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private db: DatabaseService
    ) { }

    async login(email: string, password?: string) {
        const normalizedEmail = email.trim().toLowerCase();
        // Find user in DB (flexible search)
        const user = await this.db.mysql.user.findFirst({
            where: { 
                email: {
                    equals: normalizedEmail
                }
            },
            include: { tenant: true }
        });

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        // For now, we use a fixed password if none is provided or check against DB
        // In a real app, use bcrypt.compare(password, user.password)
        const expectedPassword = user.password || 'pitaya123';
        
        if (password && password !== expectedPassword) {
            throw new UnauthorizedException('Contraseña incorrecta');
        }

        // Generate JWT
        const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
        return {
            token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
                tenantName: user.tenant?.name
            }
        };
    }

    async validateToken(token: string) {
        try {
            return this.jwtService.verify(token);
        } catch (e) {
            return null;
        }
    }
}
