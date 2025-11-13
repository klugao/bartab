import { Test, TestingModule } from '@nestjs/testing';
import { PrivacyController } from './privacy.controller';
import { PrivacyService } from './privacy.service';

describe('PrivacyController', () => {
  let controller: PrivacyController;
  let service: PrivacyService;

  const mockPrivacyService = {
    exportUserData: jest.fn(),
    deleteUserAccount: jest.fn(),
  };

  const mockRequest = {
    user: {
      sub: 'user-1',
      establishmentId: 'est-1',
    },
  };

  const mockExportData = {
    export_info: {
      exported_at: new Date().toISOString(),
      export_version: '1.0',
      format: 'JSON',
      lgpd_reference: 'Art. 18, I e V - Lei 13.709/2018',
    },
    user_data: {
      id: 'user-1',
      name: 'João Silva',
      email: 'joao@test.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrivacyController],
      providers: [
        {
          provide: PrivacyService,
          useValue: mockPrivacyService,
        },
      ],
    }).compile();

    controller = module.get<PrivacyController>(PrivacyController);
    service = module.get<PrivacyService>(PrivacyService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('exportUserData', () => {
    it('should export user data', async () => {
      mockPrivacyService.exportUserData.mockResolvedValue(mockExportData);

      const result = await controller.exportUserData(mockRequest);

      expect(service.exportUserData).toHaveBeenCalledWith('user-1', 'est-1');
      expect(result).toEqual(mockExportData);
      expect(result.export_info.lgpd_reference).toContain('Art. 18');
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      mockPrivacyService.deleteUserAccount.mockResolvedValue({
        success: true,
        message: 'Conta excluída com sucesso',
      });

      const result = await controller.deleteAccount(mockRequest);

      expect(service.deleteUserAccount).toHaveBeenCalledWith('user-1', 'est-1');
      expect(result.message).toContain('excluída com sucesso');
      expect(result.timestamp).toBeDefined();
      expect(result.note).toContain('anonimizados');
    });
  });

  describe('getDataProcessingInfo', () => {
    it('should return data processing information', async () => {
      const result = await controller.getDataProcessingInfo();

      expect(result).toBeDefined();
      expect(result.controller).toBeDefined();
      expect(result.purpose).toBeDefined();
      expect(Array.isArray(result.purpose)).toBe(true);
      expect(result.data_collected).toBeDefined();
      expect(result.data_collected.user).toBeDefined();
      expect(result.data_collected.establishment).toBeDefined();
      expect(result.data_collected.customers).toBeDefined();
      expect(result.data_collected.transactions).toBeDefined();
      expect(result.retention_periods).toBeDefined();
      expect(result.data_sharing).toBeDefined();
      expect(result.your_rights).toBeDefined();
      expect(Array.isArray(result.your_rights)).toBe(true);
      expect(result.contact).toBeDefined();
      expect(result.contact.email).toBeDefined();
      expect(result.contact.response_time).toBeDefined();
    });

    it('should include all required purposes', async () => {
      const result = await controller.getDataProcessingInfo();

      expect(result.purpose).toContain('Autenticação e controle de acesso ao sistema');
      expect(result.purpose).toContain('Gestão de vendas e pagamentos');
      expect(result.purpose).toContain('Controle de contas fiadas');
    });

    it('should include all user rights', async () => {
      const result = await controller.getDataProcessingInfo();

      expect(result.your_rights).toContain('Acesso aos seus dados');
      expect(result.your_rights).toContain('Correção de dados incorretos');
      expect(result.your_rights).toContain(
        'Exclusão de dados (quando não houver obrigação legal)',
      );
      expect(result.your_rights).toContain('Portabilidade em formato estruturado');
    });

    it('should include retention periods', async () => {
      const result = await controller.getDataProcessingInfo();

      expect(result.retention_periods.active_users).toBeDefined();
      expect(result.retention_periods.deleted_users).toContain('30 dias');
      expect(result.retention_periods.transactions).toContain('5 anos');
    });
  });
});

