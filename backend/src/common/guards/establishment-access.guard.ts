import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../enums';

/**
 * Guard que verifica se o usuário tem acesso ao estabelecimento
 * Administradores do sistema têm acesso a todos os estabelecimentos
 * Proprietários só têm acesso ao seu próprio estabelecimento
 */
@Injectable()
export class EstablishmentAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Administradores do sistema têm acesso a tudo
    if (user.role === UserRole.ADMINISTRADOR_SISTEMA) {
      return true;
    }

    // Para proprietários, verificar se o estabelecimento pertence a ele
    const establishmentId = this.extractEstablishmentId(request);

    if (!establishmentId) {
      // Se não há ID de estabelecimento na requisição, permitir
      // (a validação será feita em outro lugar se necessário)
      return true;
    }

    if (user.establishmentId !== establishmentId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar dados deste estabelecimento',
      );
    }

    return true;
  }

  /**
   * Extrai o ID do estabelecimento da requisição
   * Pode vir dos parâmetros da URL, query params ou body
   */
  private extractEstablishmentId(request: any): string | null {
    // Tentar extrair de diferentes lugares
    return (
      request.params?.establishmentId ||
      request.query?.establishmentId ||
      request.body?.establishmentId ||
      null
    );
  }
}

