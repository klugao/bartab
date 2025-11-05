import { Controller, Get, Delete, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrivacyService } from './privacy.service';

@Controller('privacy')
@UseGuards(JwtAuthGuard)
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  /**
   * LGPD Art. 18, I e V - Direito de Acesso e Portabilidade
   * Exporta todos os dados do usuário em formato estruturado
   */
  @Get('export')
  async exportUserData(@Req() req: any) {
    const userId = req.user.sub;
    const establishmentId = req.user.establishmentId;
    
    return await this.privacyService.exportUserData(userId, establishmentId);
  }

  /**
   * LGPD Art. 18, VI - Direito de Exclusão
   * Exclui permanentemente a conta do usuário e dados associados
   * Mantém apenas dados necessários por obrigação legal (5 anos para dados fiscais)
   */
  @Delete('delete-account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Req() req: any) {
    const userId = req.user.sub;
    const establishmentId = req.user.establishmentId;
    
    await this.privacyService.deleteUserAccount(userId, establishmentId);
    
    return {
      message: 'Conta excluída com sucesso',
      timestamp: new Date().toISOString(),
      note: 'Dados fiscais foram anonimizados e serão mantidos pelo prazo legal de 5 anos'
    };
  }

  /**
   * LGPD Art. 18 - Informações sobre tratamento de dados
   */
  @Get('data-processing-info')
  async getDataProcessingInfo() {
    return {
      controller: 'BarTab Sistema de PDV',
      purpose: [
        'Autenticação e controle de acesso ao sistema',
        'Gestão de vendas e pagamentos',
        'Controle de contas fiadas',
        'Comunicações sobre o sistema',
        'Segurança e prevenção de fraudes'
      ],
      data_collected: {
        user: ['nome', 'email', 'foto (via Google)', 'Google ID'],
        establishment: ['nome', 'email', 'dados de contato'],
        customers: ['nome', 'telefone (opcional)', 'saldo devedor'],
        transactions: ['valor', 'método de pagamento', 'data/hora', 'itens']
      },
      retention_periods: {
        active_users: 'Enquanto a conta estiver ativa',
        deleted_users: '30 dias (backup)',
        customers: 'Enquanto houver relacionamento comercial',
        transactions: '5 anos (obrigação legal - legislação fiscal)',
        access_logs: '6 meses (segurança)'
      },
      data_sharing: {
        google_oauth: 'Autenticação (Google LLC)',
        hosting: 'Armazenamento de dados (Render/Railway)',
        database: 'Banco de dados (Supabase/PostgreSQL)',
        authorities: 'Quando exigido por lei ou ordem judicial'
      },
      your_rights: [
        'Acesso aos seus dados',
        'Correção de dados incorretos',
        'Exclusão de dados (quando não houver obrigação legal)',
        'Portabilidade em formato estruturado',
        'Revogação de consentimento'
      ],
      contact: {
        email: 'eduardo.klug7@gmail.com',
        response_time: 'Até 15 dias úteis'
      }
    };
  }
}

