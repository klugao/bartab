import { Controller, Post, Get, Body, UseGuards, Req, Res, HttpStatus, UnauthorizedException, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Establishment } from '../entities/establishment.entity';
import { UserRole, ApprovalStatus } from '../../../common/enums';
import { UpdateEstablishmentDto } from '../dto/update-establishment.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Establishment)
    private establishmentRepository: Repository<Establishment>,
  ) {}

  /**
   * Obtém a URL do frontend com fallback para produção
   * Prioridade:
   * 1. FRONTEND_URL (se configurada)
   * 2. URL de produção baseada em PROJECT_NUMBER ou metadados do Cloud Run
   * 3. localhost (apenas desenvolvimento)
   */
  private async getFrontendUrl(): Promise<string> {
    // Se FRONTEND_URL estiver configurada, usar ela (removendo espaços e quebras de linha)
    if (process.env.FRONTEND_URL) {
      const url = process.env.FRONTEND_URL.trim().replace(/\s+/g, '').replace(/\n/g, '').replace(/\r/g, '');
      console.log(`🔗 [AUTH] Usando FRONTEND_URL: "${url}"`);
      return url;
    }

    // Se estiver em produção, tentar construir a URL de produção
    if (process.env.NODE_ENV === 'production') {
      const region = process.env.REGION || 'us-central1';
      
      // Tentar obter project number de variável de ambiente (configurado no deploy)
      let projectNumber = process.env.PROJECT_NUMBER;
      
      // Se não tiver PROJECT_NUMBER, tentar obter dos metadados do Cloud Run
      if (!projectNumber) {
        try {
          // Cloud Run expõe metadados através de um servidor interno
          const metadataUrl = 'http://metadata.google.internal/computeMetadata/v1/project/numeric-project-id';
          
          // Usar AbortController para timeout de 1 segundo
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1000);
          
          const response = await fetch(metadataUrl, {
            headers: {
              'Metadata-Flavor': 'Google',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            projectNumber = await response.text();
            console.log(`🔗 [AUTH] Project number obtido dos metadados: ${projectNumber}`);
          }
        } catch (error) {
          // Falhou ao obter metadados (timeout ou erro de rede), continuar com outras opções
          if (error.name !== 'AbortError') {
            console.warn('⚠️ [AUTH] Não foi possível obter project number dos metadados:', error.message);
          }
        }
      }
      
      // Cloud Run pode ter múltiplos formatos de URL funcionando:
      // 1. Formato com hash: https://bartab-frontend-{HASH}-{REGION}.a.run.app (retornado pelo gcloud)
      // 2. Formato com project number: https://bartab-frontend-{PROJECT_NUMBER}.{REGION}.run.app
      // Se tivermos PROJECT_NUMBER, podemos tentar construir a URL com project number como fallback
      if (projectNumber) {
        // Limpar project number de espaços e quebras de linha
        const cleanProjectNumber = String(projectNumber).trim().replace(/\s+/g, '').replace(/\n/g, '').replace(/\r/g, '');
        const cleanRegion = String(region).trim().replace(/\s+/g, '').replace(/\n/g, '').replace(/\r/g, '');
        const frontendUrlWithProjectNumber = `https://bartab-frontend-${cleanProjectNumber}.${cleanRegion}.run.app`;
        console.log(`🔗 [AUTH] Usando URL de produção com project number: "${frontendUrlWithProjectNumber}"`);
        return frontendUrlWithProjectNumber;
      }
      
      // Se chegou aqui, não foi possível obter project number
      // Log de debug para ajudar a identificar o problema
      console.error('❌ [AUTH] ERRO: Não foi possível determinar URL de produção!');
      console.error('❌ [AUTH] Variáveis disponíveis:', {
        NODE_ENV: process.env.NODE_ENV,
        REGION: process.env.REGION,
        PROJECT_NUMBER: process.env.PROJECT_NUMBER,
        FRONTEND_URL: process.env.FRONTEND_URL,
        K_SERVICE: process.env.K_SERVICE,
      });
      console.warn('⚠️ [AUTH] Usando localhost como fallback (isso NÃO deve acontecer em produção!)');
    }

    // Fallback para desenvolvimento
    return 'http://localhost:5173';
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Redireciona para o Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.validateGoogleUser(req.user);
    let frontendUrl = await this.getFrontendUrl();
    
    // Garantir que a URL está limpa (sem espaços, quebras de linha, etc)
    frontendUrl = frontendUrl.trim().replace(/\s+/g, '').replace(/\n/g, '').replace(/\r/g, '');
    
    console.log(`🔗 [AUTH] Redirecionando para: "${frontendUrl}"`);
    
    if (!user) {
      // Usuário não existe, redireciona para página de registro
      const googleData = Buffer.from(JSON.stringify(req.user)).toString('base64');
      const redirectUrl = `${frontendUrl}/register?data=${googleData}`;
      console.log(`🔗 [AUTH] Redirecionando para registro: "${redirectUrl}"`);
      return res.redirect(redirectUrl);
    }

    // Usuário existe, gera token e redireciona
    const loginData = await this.authService.login(user);
    const token = loginData.access_token;
    const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
    console.log(`🔗 [AUTH] Redirecionando para callback: "${redirectUrl}"`);
    return res.redirect(redirectUrl);
  }

  @Post('register')
  async register(@Body() body: { googleData: string; establishmentName: string }) {
    console.log('🔵 [REGISTER] Iniciando registro...');
    console.log('🔵 [REGISTER] Nome do estabelecimento:', body.establishmentName);
    
    try {
      const googleProfile = JSON.parse(Buffer.from(body.googleData, 'base64').toString());
      console.log('🔵 [REGISTER] Google Profile:', {
        email: googleProfile.email,
        name: googleProfile.name,
      });
      
      console.log('🔵 [REGISTER] Chamando registerUser...');
      const user = await this.authService.registerUser(googleProfile, body.establishmentName);
      console.log('✅ [REGISTER] Usuário registrado com sucesso!');
      console.log('✅ [REGISTER] User ID:', user.id);
      console.log('✅ [REGISTER] Establishment ID:', user.establishment?.id);
      
      console.log('🔵 [REGISTER] Gerando token de login...');
      const loginData = await this.authService.login(user);
      console.log('✅ [REGISTER] Token gerado com sucesso!');
      
      return loginData;
    } catch (error) {
      console.error('❌ [REGISTER] ERRO NO REGISTRO!');
      console.error('❌ [REGISTER] Mensagem:', error.message);
      console.error('❌ [REGISTER] Stack:', error.stack);
      console.error('❌ [REGISTER] Detalhes completos:', error);
      throw new UnauthorizedException(error.message || 'Erro ao registrar usuário');
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const user = await this.authService.getUserById(req.user.userId);
    const response: any = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      establishment: {
        id: req.user.establishment.id,
        name: req.user.establishment.name,
        active: req.user.establishment.active,
        statusAprovacao: req.user.establishment.statusAprovacao,
      },
    };

    // Se estiver impersonando, adiciona flags de impersonation
    if (req.user.isImpersonating) {
      response.isImpersonating = true;
      response.originalEstablishmentId = req.user.originalEstablishmentId;
    }

    return response;
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  async checkAuth() {
    return { authenticated: true };
  }

  // Endpoint temporário para login direto (apenas desenvolvimento/testes)
  @Post('dev-login')
  async devLogin(@Body() body: { email: string }) {
    try {
      const user = await this.userRepository.findOne({ 
        where: { email: body.email },
        relations: ['establishment']
      });
      
      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }
      
      // Retorna token diretamente
      return this.authService.login(user);
    } catch (error) {
      throw new UnauthorizedException('Erro ao fazer login');
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getEstablishmentProfile(@Req() req: any) {
    const establishmentId = req.user.establishmentId;
    const establishment = await this.authService.getEstablishmentProfile(establishmentId);
    return establishment;
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateEstablishmentProfile(
    @Req() req: any,
    @Body() updateData: UpdateEstablishmentDto,
  ) {
    const establishmentId = req.user.establishmentId;
    const establishment = await this.authService.updateEstablishmentProfile(
      establishmentId,
      updateData,
    );
    return establishment;
  }

  // Endpoint temporário para corrigir o admin
  @Get('fix-admin')
  async fixAdmin() {
    const email = 'eduardo.klug7@gmail.com';
    
    try {
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
    } catch (error) {
      return { error: error.message };
    }
  }
}

