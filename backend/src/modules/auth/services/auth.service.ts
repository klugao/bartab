import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Establishment } from '../entities/establishment.entity';
import { UserRole, ApprovalStatus } from '../../../common/enums';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class AuthService {
  private readonly ADMIN_EMAIL = 'eduardo.klug7@gmail.com';

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Establishment)
    private establishmentRepository: Repository<Establishment>,
    private jwtService: JwtService,
    private notificationService: NotificationService,
  ) {}

  async validateGoogleUser(googleProfile: any): Promise<any> {
    const { googleId, email, name, picture } = googleProfile;

    let user = await this.userRepository.findOne({
      where: { googleId },
      relations: ['establishment'],
    });

    if (user) {
      // Atualiza informações do usuário
      user.email = email;
      user.name = name;
      user.picture = picture;
      await this.userRepository.save(user);
    }

    return user;
  }

  async registerUser(googleProfile: any, establishmentName: string): Promise<User> {
    const { googleId, email, name, picture } = googleProfile;

    // Verifica se o usuário já existe
    let user = await this.userRepository.findOne({
      where: { googleId },
    });

    if (user) {
      throw new BadRequestException('Usuário já cadastrado');
    }

    // Determina a role do usuário
    const userRole = email === this.ADMIN_EMAIL 
      ? UserRole.ADMINISTRADOR_SISTEMA 
      : UserRole.PROPRIETARIO;

    // Cria um novo estabelecimento
    // Admin não precisa de aprovação, já é aprovado automaticamente
    const approvalStatus = userRole === UserRole.ADMINISTRADOR_SISTEMA
      ? ApprovalStatus.APROVADO
      : ApprovalStatus.PENDENTE;

    const establishment = this.establishmentRepository.create({
      name: establishmentName,
      email: email,
      statusAprovacao: approvalStatus,
    });
    await this.establishmentRepository.save(establishment);

    // Cria o usuário com a role apropriada
    user = this.userRepository.create({
      googleId,
      email,
      name,
      picture,
      establishment_id: establishment.id,
      role: userRole,
    });
    await this.userRepository.save(user);

    // Carrega o usuário com o estabelecimento
    const savedUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['establishment'],
    });

    if (!savedUser) {
      throw new BadRequestException('Erro ao carregar usuário após registro');
    }

    // NOTIFICAÇÃO 1: Se for proprietário, envia alerta para o admin
    if (userRole === UserRole.PROPRIETARIO) {
      try {
        await this.notificationService.sendAdminNewSignupAlert(
          establishmentName,
          email,
        );
      } catch (error) {
        // Log do erro mas não bloqueia o cadastro
        console.error('Erro ao enviar notificação para admin:', error);
      }
    }

    return savedUser;
  }

  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      establishmentId: user.establishment_id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
        establishment: {
          id: user.establishment.id,
          name: user.establishment.name,
          statusAprovacao: user.establishment.statusAprovacao,
        },
      },
    };
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['establishment'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }
}

