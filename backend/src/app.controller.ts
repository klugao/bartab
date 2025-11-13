import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health check endpoint para manter o backend do Render ativo
   * Este endpoint não requer autenticação e retorna status OK
   */
  @Get('health')
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }

  // Endpoints mockados removidos - agora usando os controllers específicos
}