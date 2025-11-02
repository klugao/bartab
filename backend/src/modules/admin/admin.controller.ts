import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, ApprovalStatus } from '../../common/enums';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMINISTRADOR_SISTEMA)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/establishments/pending
   * Lista estabelecimentos pendentes de aprovação
   */
  @Get('establishments/pending')
  async getPendingEstablishments() {
    return this.adminService.getPendingEstablishments();
  }

  /**
   * GET /admin/establishments
   * Lista todos os estabelecimentos (com filtro opcional por status)
   */
  @Get('establishments')
  async getAllEstablishments(@Query('status') status?: ApprovalStatus) {
    return this.adminService.getAllEstablishments(status);
  }

  /**
   * POST /admin/approve/:idEstabelecimento
   * Aprova um estabelecimento
   */
  @Post('approve/:idEstabelecimento')
  async approveEstablishment(@Param('idEstabelecimento') id: string) {
    return this.adminService.approveEstablishment(id);
  }

  /**
   * POST /admin/reject/:idEstabelecimento
   * Rejeita um estabelecimento
   */
  @Post('reject/:idEstabelecimento')
  async rejectEstablishment(
    @Param('idEstabelecimento') id: string,
    @Body('motivo') motivo?: string,
  ) {
    return this.adminService.rejectEstablishment(id, motivo);
  }

  /**
   * GET /admin/statistics
   * Obtém estatísticas gerais
   */
  @Get('statistics')
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  /**
   * POST /admin/deactivate/:idEstabelecimento
   * Inativa um estabelecimento
   */
  @Post('deactivate/:idEstabelecimento')
  async deactivateEstablishment(@Param('idEstabelecimento') id: string) {
    return this.adminService.deactivateEstablishment(id);
  }

  /**
   * POST /admin/activate/:idEstabelecimento
   * Ativa um estabelecimento
   */
  @Post('activate/:idEstabelecimento')
  async activateEstablishment(@Param('idEstabelecimento') id: string) {
    return this.adminService.activateEstablishment(id);
  }
}

