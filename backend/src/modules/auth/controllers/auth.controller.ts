import { Controller, Post, Get, Body, UseGuards, Req, Res, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Establishment } from '../entities/establishment.entity';
import { UserRole, ApprovalStatus } from '../../../common/enums';
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Redireciona para o Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.validateGoogleUser(req.user);

    if (!user) {
      // Usuário não existe, redireciona para página de registro
      const googleData = Buffer.from(JSON.stringify(req.user)).toString('base64');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/register?data=${googleData}`);
    }

    // Usuário existe, gera token e redireciona
    const loginData = await this.authService.login(user);
    const token = loginData.access_token;
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }

  @Post('register')
  async register(@Body() body: { googleData: string; establishmentName: string }) {
    try {
      const googleProfile = JSON.parse(Buffer.from(body.googleData, 'base64').toString());
      const user = await this.authService.registerUser(googleProfile, body.establishmentName);
      return this.authService.login(user);
    } catch (error) {
      throw new UnauthorizedException('Erro ao registrar usuário');
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    const user = await this.authService.getUserById(req.user.userId);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      establishment: {
        id: user.establishment.id,
        name: user.establishment.name,
        active: user.establishment.active,
        statusAprovacao: user.establishment.statusAprovacao,
      },
    };
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

