import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configuração do transporter de e-mail
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('SMTP_PORT') || 587,
      secure: false, // true para 465, false para outras portas
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  /**
   * Envia alerta de novo cadastro para o administrador do sistema
   * @param nomeEstabelecimento Nome do estabelecimento que se cadastrou
   * @param emailProprietario E-mail do proprietário
   */
  async sendAdminNewSignupAlert(
    nomeEstabelecimento: string,
    emailProprietario: string,
  ): Promise<void> {
    const adminEmail = 'eduardo.klug7@gmail.com';
    
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@bartab.com',
      to: adminEmail,
      subject: `🚨 Novo Estabelecimento Pendente de Aprovação: ${nomeEstabelecimento}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Novo Estabelecimento Aguardando Aprovação</h2>
          <p>Um novo estabelecimento se cadastrou no BarTab:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nome do Estabelecimento:</strong> ${nomeEstabelecimento}</p>
            <p><strong>E-mail do Proprietário:</strong> ${emailProprietario}</p>
          </div>
          <p>Acesse o painel administrativo para revisar e aprovar este estabelecimento.</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Este é um e-mail automático do sistema BarTab.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Alerta de novo cadastro enviado para ${adminEmail}: ${nomeEstabelecimento}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar alerta de novo cadastro: ${error.message}`, error.stack);
      // Não lançamos erro para não bloquear o fluxo de cadastro
    }
  }

  /**
   * Envia e-mail de aprovação para o proprietário do estabelecimento
   * @param emailProprietario E-mail do proprietário
   * @param nomeEstabelecimento Nome do estabelecimento aprovado
   */
  async sendApprovalEmail(
    emailProprietario: string,
    nomeEstabelecimento: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@bartab.com',
      to: emailProprietario,
      subject: '✅ Seu BarTab foi Aprovado!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Parabéns! Seu estabelecimento foi aprovado!</h2>
          <p>Olá,</p>
          <p>Temos o prazer de informar que seu estabelecimento <strong>${nomeEstabelecimento}</strong> foi aprovado no BarTab!</p>
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p style="margin: 0;"><strong>✓ Status:</strong> Aprovado</p>
            <p style="margin: 10px 0 0 0;"><strong>✓ Estabelecimento:</strong> ${nomeEstabelecimento}</p>
          </div>
          <p>Você já pode começar a usar todas as funcionalidades do sistema:</p>
          <ul>
            <li>Gerenciar comandas</li>
            <li>Cadastrar clientes</li>
            <li>Controlar itens e pagamentos</li>
            <li>Gerar relatórios</li>
          </ul>
          <p>Acesse o sistema e comece a usar agora mesmo!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173'}" 
               style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Acessar o Sistema
            </a>
          </div>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Este é um e-mail automático do sistema BarTab.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`E-mail de aprovação enviado para ${emailProprietario}: ${nomeEstabelecimento}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail de aprovação: ${error.message}`, error.stack);
      throw error; // Lançamos erro pois é importante o proprietário saber que foi aprovado
    }
  }

  /**
   * Envia e-mail de rejeição para o proprietário do estabelecimento
   * @param emailProprietario E-mail do proprietário
   * @param nomeEstabelecimento Nome do estabelecimento rejeitado
   * @param motivo Motivo da rejeição
   */
  async sendRejectionEmail(
    emailProprietario: string,
    nomeEstabelecimento: string,
    motivo?: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('SMTP_FROM') || 'noreply@bartab.com',
      to: emailProprietario,
      subject: '❌ Solicitação de Cadastro no BarTab',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Atualização sobre seu Cadastro</h2>
          <p>Olá,</p>
          <p>Infelizmente, não pudemos aprovar o cadastro do estabelecimento <strong>${nomeEstabelecimento}</strong> no momento.</p>
          ${motivo ? `
          <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <p style="margin: 0;"><strong>Motivo:</strong></p>
            <p style="margin: 10px 0 0 0;">${motivo}</p>
          </div>
          ` : ''}
          <p>Se você tiver alguma dúvida ou quiser mais informações, por favor entre em contato conosco.</p>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Este é um e-mail automático do sistema BarTab.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`E-mail de rejeição enviado para ${emailProprietario}: ${nomeEstabelecimento}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail de rejeição: ${error.message}`, error.stack);
      throw error;
    }
  }
}

