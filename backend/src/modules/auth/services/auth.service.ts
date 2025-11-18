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
    // Envia de forma assíncrona (não aguarda) para não bloquear o registro
    if (userRole === UserRole.PROPRIETARIO) {
      console.log('📧 [REGISTER] Agendando envio de email para admin...');
      // Usa setImmediate para enviar o email de forma não-bloqueante
      setImmediate(async () => {
        try {
          console.log('📧 [REGISTER] Enviando email para admin...');
          await this.notificationService.sendAdminNewSignupAlert(
            establishmentName,
            email,
          );
          console.log('✅ [REGISTER] Email enviado para admin com sucesso!');
        } catch (error) {
          // Log do erro mas não bloqueia o cadastro
          console.error('❌ [REGISTER] Erro ao enviar notificação para admin:', error.message);
        }
      });
      console.log('✅ [REGISTER] Email agendado para envio (não bloqueante)');
    }

    console.log('✅ [REGISTER] Retornando usuário criado...');
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

  async refreshToken(user: User) {
    // Mesma lógica do login, mas retorna apenas o token
    const payload = {
      sub: user.id,
      email: user.email,
      establishmentId: user.establishment_id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
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

  async getEstablishmentProfile(establishmentId: string): Promise<Establishment> {
    const establishment = await this.establishmentRepository.findOne({
      where: { id: establishmentId },
    });

    if (!establishment) {
      throw new BadRequestException('Estabelecimento não encontrado');
    }

    return establishment;
  }

  async updateEstablishmentProfile(
    establishmentId: string,
    updateData: Partial<Establishment>,
  ): Promise<Establishment> {
    const establishment = await this.getEstablishmentProfile(establishmentId);

    // Atualiza apenas os campos fornecidos
    Object.assign(establishment, updateData);

    return await this.establishmentRepository.save(establishment);
  }
}

