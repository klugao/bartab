import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Establishment } from '../auth/entities/establishment.entity';
import { User } from '../auth/entities/user.entity';
import { ApprovalStatus } from '../../common/enums';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Establishment)
    private establishmentRepository: Repository<Establishment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationService: NotificationService,
  ) {}

  /**
   * Lista todos os estabelecimentos pendentes de aprovação
   */
  async getPendingEstablishments() {
    const establishments = await this.establishmentRepository.find({
      where: { statusAprovacao: ApprovalStatus.PENDENTE },
      relations: ['users'],
      order: { created_at: 'DESC' },
    });

    return establishments.map((est) => ({
      id: est.id,
      name: est.name,
      email: est.email,
      address: est.address,
      phone: est.phone,
      statusAprovacao: est.statusAprovacao,
      created_at: est.created_at,
      proprietario: est.users?.[0] ? {
        name: est.users[0].name,
        email: est.users[0].email,
      } : null,
    }));
  }

  /**
   * Lista todos os estabelecimentos (para admin)
   */
  async getAllEstablishments(status?: ApprovalStatus) {
    const where = status ? { statusAprovacao: status } : {};
    
    const establishments = await this.establishmentRepository.find({
      where,
      relations: ['users'],
      order: { created_at: 'DESC' },
    });

    return establishments.map((est) => ({
      id: est.id,
      name: est.name,
      email: est.email,
      address: est.address,
      phone: est.phone,
      active: est.active,
      statusAprovacao: est.statusAprovacao,
      created_at: est.created_at,
      updated_at: est.updated_at,
      proprietarios: est.users?.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    }));
  }

  /**
   * Aprova um estabelecimento
   */
  async approveEstablishment(establishmentId: string) {
    console.log('🔍 [APPROVE] Buscando estabelecimento:', establishmentId);
    
    const establishment = await this.establishmentRepository.findOne({
      where: { id: establishmentId },
      relations: ['users'],
    });

    if (!establishment) {
      throw new NotFoundException('Estabelecimento não encontrado');
    }

    console.log('✅ [APPROVE] Estabelecimento encontrado:', establishment.name);
    console.log('👥 [APPROVE] Usuários vinculados:', establishment.users?.length || 0);

    if (establishment.statusAprovacao === ApprovalStatus.APROVADO) {
      throw new BadRequestException('Este estabelecimento já está aprovado');
    }

    // Atualiza o status para aprovado
    establishment.statusAprovacao = ApprovalStatus.APROVADO;
    await this.establishmentRepository.save(establishment);
    console.log('✅ [APPROVE] Status atualizado para Aprovado');

    // NOTIFICAÇÃO 2: Envia e-mail de aprovação para o proprietário
    const proprietario = establishment.users?.[0];
    console.log('📧 [APPROVE] Proprietário encontrado:', proprietario?.email || 'NENHUM');
    
    if (proprietario) {
      try {
        console.log('📤 [APPROVE] Enviando e-mail para:', proprietario.email);
        await this.notificationService.sendApprovalEmail(
          proprietario.email,
          establishment.name,
        );
        console.log('✅ [APPROVE] E-mail enviado com sucesso!');
      } catch (error) {
        console.error('❌ [APPROVE] Erro ao enviar e-mail de aprovação:', error);
        console.error('❌ [APPROVE] Detalhes do erro:', error.message);
        console.error('❌ [APPROVE] Stack:', error.stack);
        // Não lançamos erro para não reverter a aprovação
      }
    } else {
      console.warn('⚠️ [APPROVE] NENHUM proprietário encontrado! Não foi possível enviar e-mail.');
    }

    return {
      message: 'Estabelecimento aprovado com sucesso',
      establishment: {
        id: establishment.id,
        name: establishment.name,
        statusAprovacao: establishment.statusAprovacao,
      },
    };
  }

  /**
   * Rejeita um estabelecimento
   */
  async rejectEstablishment(establishmentId: string, motivo?: string) {
    const establishment = await this.establishmentRepository.findOne({
      where: { id: establishmentId },
      relations: ['users'],
    });

    if (!establishment) {
      throw new NotFoundException('Estabelecimento não encontrado');
    }

    if (establishment.statusAprovacao === ApprovalStatus.REJEITADO) {
      throw new BadRequestException('Este estabelecimento já está rejeitado');
    }

    // Atualiza o status para rejeitado
    establishment.statusAprovacao = ApprovalStatus.REJEITADO;
    await this.establishmentRepository.save(establishment);

    // Envia e-mail de rejeição para o proprietário
    const proprietario = establishment.users?.[0];
    if (proprietario) {
      try {
        await this.notificationService.sendRejectionEmail(
          proprietario.email,
          establishment.name,
          motivo,
        );
      } catch (error) {
        console.error('Erro ao enviar e-mail de rejeição:', error);
      }
    }

    return {
      message: 'Estabelecimento rejeitado',
      establishment: {
        id: establishment.id,
        name: establishment.name,
        statusAprovacao: establishment.statusAprovacao,
      },
    };
  }

  /**
   * Obtém estatísticas gerais para o dashboard do admin
   */
  async getStatistics() {
    const [total, pendentes, aprovados, rejeitados, ativos, inativos] = await Promise.all([
      this.establishmentRepository.count(),
      this.establishmentRepository.count({ where: { statusAprovacao: ApprovalStatus.PENDENTE } }),
      this.establishmentRepository.count({ where: { statusAprovacao: ApprovalStatus.APROVADO } }),
      this.establishmentRepository.count({ where: { statusAprovacao: ApprovalStatus.REJEITADO } }),
      this.establishmentRepository.count({ where: { active: true } }),
      this.establishmentRepository.count({ where: { active: false } }),
    ]);

    return {
      total,
      pendentes,
      aprovados,
      rejeitados,
      ativos,
      inativos,
    };
  }

  /**
   * Inativa um estabelecimento
   */
  async deactivateEstablishment(establishmentId: string) {
    const establishment = await this.establishmentRepository.findOne({
      where: { id: establishmentId },
    });

    if (!establishment) {
      throw new NotFoundException('Estabelecimento não encontrado');
    }

    establishment.active = false;
    await this.establishmentRepository.save(establishment);

    return {
      message: 'Estabelecimento inativado com sucesso',
      establishment: {
        id: establishment.id,
        name: establishment.name,
        active: establishment.active,
      },
    };
  }

  /**
   * Ativa um estabelecimento
   */
  async activateEstablishment(establishmentId: string) {
    const establishment = await this.establishmentRepository.findOne({
      where: { id: establishmentId },
    });

    if (!establishment) {
      throw new NotFoundException('Estabelecimento não encontrado');
    }

    establishment.active = true;
    await this.establishmentRepository.save(establishment);

    return {
      message: 'Estabelecimento ativado com sucesso',
      establishment: {
        id: establishment.id,
        name: establishment.name,
        active: establishment.active,
      },
    };
  }
}

