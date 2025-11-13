import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// Mock do nodemailer
jest.mock('nodemailer');

describe('NotificationService', () => {
  let service: NotificationService;
  let configService: ConfigService;
  let mockSendMail: jest.Mock;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        SMTP_HOST: 'smtp.test.com',
        SMTP_PORT: 587,
        SMTP_USER: 'test@test.com',
        SMTP_PASS: 'testpass',
        SMTP_FROM: 'noreply@bartab.com',
        FRONTEND_URL: 'http://localhost:5173',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendAdminNewSignupAlert', () => {
    it('should send alert email to admin', async () => {
      const nomeEstabelecimento = 'Bar do João';
      const emailProprietario = 'joao@test.com';

      await service.sendAdminNewSignupAlert(nomeEstabelecimento, emailProprietario);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@bartab.com',
          to: 'eduardo.klug7@gmail.com',
          subject: `🚨 Novo Estabelecimento Pendente de Aprovação: ${nomeEstabelecimento}`,
        }),
      );
    });

    it('should handle errors gracefully without throwing', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      // Não deve lançar erro
      await expect(
        service.sendAdminNewSignupAlert('Bar do João', 'joao@test.com'),
      ).resolves.not.toThrow();
    });
  });

  describe('sendApprovalEmail', () => {
    it('should send approval email to establishment owner', async () => {
      const emailProprietario = 'joao@test.com';
      const nomeEstabelecimento = 'Bar do João';

      await service.sendApprovalEmail(emailProprietario, nomeEstabelecimento);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@bartab.com',
          to: emailProprietario,
          subject: '✅ Seu BarTab foi Aprovado!',
        }),
      );

      const callArg = mockSendMail.mock.calls[0][0];
      expect(callArg.html).toContain(nomeEstabelecimento);
      expect(callArg.html).toContain('aprovado');
    });

    it('should throw error if email sending fails', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendApprovalEmail('joao@test.com', 'Bar do João'),
      ).rejects.toThrow('SMTP error');
    });
  });

  describe('sendRejectionEmail', () => {
    it('should send rejection email with reason', async () => {
      const emailProprietario = 'joao@test.com';
      const nomeEstabelecimento = 'Bar do João';
      const motivo = 'Dados incompletos';

      await service.sendRejectionEmail(
        emailProprietario,
        nomeEstabelecimento,
        motivo,
      );

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@bartab.com',
          to: emailProprietario,
          subject: '❌ Solicitação de Cadastro no BarTab',
        }),
      );

      const callArg = mockSendMail.mock.calls[0][0];
      expect(callArg.html).toContain(nomeEstabelecimento);
      expect(callArg.html).toContain(motivo);
    });

    it('should send rejection email without reason', async () => {
      const emailProprietario = 'joao@test.com';
      const nomeEstabelecimento = 'Bar do João';

      await service.sendRejectionEmail(emailProprietario, nomeEstabelecimento);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const callArg = mockSendMail.mock.calls[0][0];
      expect(callArg.html).toContain(nomeEstabelecimento);
      expect(callArg.html).not.toContain('Motivo:');
    });

    it('should throw error if email sending fails', async () => {
      mockSendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        service.sendRejectionEmail('joao@test.com', 'Bar do João'),
      ).rejects.toThrow('SMTP error');
    });
  });
});

