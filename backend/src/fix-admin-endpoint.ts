// Endpoint temporário para corrigir o admin
// Cole este código no auth.controller.ts temporariamente

import { Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './modules/auth/entities/user.entity';
import { Establishment } from './modules/auth/entities/establishment.entity';
import { UserRole, ApprovalStatus } from './common/enums';

@Controller('fix-admin')
export class FixAdminController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Establishment)
    private establishmentRepository: Repository<Establishment>,
  ) {}

  @Post()
  async fixAdmin() {
    const email = 'eduardo.klug7@gmail.com';
    
    // Atualizar usuário
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['establishment']
    });
    
    if (!user) {
      return { error: 'Usuário não encontrado' };
    }
    
    user.role = UserRole.ADMINISTRADOR_SISTEMA;
    await this.userRepository.save(user);
    
    // Atualizar estabelecimento
    if (user.establishment) {
      user.establishment.statusAprovacao = ApprovalStatus.APROVADO;
      await this.establishmentRepository.save(user.establishment);
    }
    
    return { 
      success: true,
      message: 'Admin corrigido com sucesso!',
      user: {
        email: user.email,
        role: user.role,
        establishment: user.establishment?.name,
        status: user.establishment?.statusAprovacao
      }
    };
  }
}

