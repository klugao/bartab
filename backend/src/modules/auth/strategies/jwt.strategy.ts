import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Establishment } from '../entities/establishment.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  establishmentId: string;
  role?: string;
  impersonatedEstablishmentId?: string;
  impersonatedUserId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Establishment)
    private establishmentRepository: Repository<Establishment>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['establishment'],
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Usuário não autorizado');
    }

    // Se estiver impersonando, busca o estabelecimento impersonado
    if (payload.impersonatedEstablishmentId) {
      // Busca o estabelecimento diretamente
      const impersonatedEstablishment = await this.establishmentRepository.findOne({
        where: { id: payload.impersonatedEstablishmentId },
      });

      if (impersonatedEstablishment) {
        // Retorna dados do admin mas com establishment impersonado
        return {
          userId: user.id, // ID do admin
          email: user.email, // Email do admin
          role: payload.role || user.role, // Mantém role de admin
          establishmentId: payload.impersonatedEstablishmentId, // ID do establishment impersonado
          establishment: impersonatedEstablishment, // Dados do establishment impersonado
          isImpersonating: true, // Flag indicando que está impersonando
          originalEstablishmentId: user.establishment_id, // ID original do admin
        };
      }
    }

    // Comportamento normal (não está impersonando)
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      establishmentId: user.establishment_id,
      establishment: user.establishment,
      isImpersonating: false,
    };
  }
}

