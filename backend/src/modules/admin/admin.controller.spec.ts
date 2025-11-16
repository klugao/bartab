import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ApprovalStatus } from '../../common/enums';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  const mockEstablishment = {
    id: 'est-1',
    name: 'Bar do João',
    email: 'bar@test.com',
    address: 'Rua Test, 123',
    phone: '123456789',
    statusAprovacao: ApprovalStatus.PENDENTE,
    created_at: new Date('2024-01-01'),
    proprietario: {
      name: 'João',
      email: 'joao@test.com',
    },
  };

  const mockAdminService = {
    getPendingEstablishments: jest.fn(),
    getAllEstablishments: jest.fn(),
    approveEstablishment: jest.fn(),
    rejectEstablishment: jest.fn(),
    getStatistics: jest.fn(),
    deactivateEstablishment: jest.fn(),
    activateEstablishment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPendingEstablishments', () => {
    it('should return list of pending establishments', async () => {
      const establishments = [mockEstablishment];
      mockAdminService.getPendingEstablishments.mockResolvedValue(establishments);

      const result = await controller.getPendingEstablishments();

      expect(adminService.getPendingEstablishments).toHaveBeenCalled();
      expect(result).toEqual(establishments);
    });
  });

  describe('getAllEstablishments', () => {
    it('should return all establishments without filter', async () => {
      const establishments = [mockEstablishment];
      mockAdminService.getAllEstablishments.mockResolvedValue(establishments);

      const result = await controller.getAllEstablishments();

      expect(adminService.getAllEstablishments).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(establishments);
    });

    it('should return establishments filtered by status', async () => {
      const establishments = [mockEstablishment];
      mockAdminService.getAllEstablishments.mockResolvedValue(establishments);

      const result = await controller.getAllEstablishments(ApprovalStatus.APROVADO);

      expect(adminService.getAllEstablishments).toHaveBeenCalledWith(
        ApprovalStatus.APROVADO,
      );
      expect(result).toEqual(establishments);
    });
  });

  describe('approveEstablishment', () => {
    it('should approve an establishment', async () => {
      const response = {
        message: 'Estabelecimento aprovado com sucesso',
        establishment: {
          id: 'est-1',
          name: 'Bar do João',
          statusAprovacao: ApprovalStatus.APROVADO,
        },
      };
      mockAdminService.approveEstablishment.mockResolvedValue(response);

      const result = await controller.approveEstablishment('est-1');

      expect(adminService.approveEstablishment).toHaveBeenCalledWith('est-1');
      expect(result).toEqual(response);
    });
  });

  describe('rejectEstablishment', () => {
    it('should reject an establishment', async () => {
      const response = {
        message: 'Estabelecimento rejeitado',
        establishment: {
          id: 'est-1',
          name: 'Bar do João',
          statusAprovacao: ApprovalStatus.REJEITADO,
        },
      };
      mockAdminService.rejectEstablishment.mockResolvedValue(response);

      const result = await controller.rejectEstablishment('est-1', 'Dados inválidos');

      expect(adminService.rejectEstablishment).toHaveBeenCalledWith(
        'est-1',
        'Dados inválidos',
      );
      expect(result).toEqual(response);
    });

    it('should reject establishment without reason', async () => {
      const response = {
        message: 'Estabelecimento rejeitado',
        establishment: {
          id: 'est-1',
          name: 'Bar do João',
          statusAprovacao: ApprovalStatus.REJEITADO,
        },
      };
      mockAdminService.rejectEstablishment.mockResolvedValue(response);

      const result = await controller.rejectEstablishment('est-1');

      expect(adminService.rejectEstablishment).toHaveBeenCalledWith('est-1', undefined);
      expect(result).toEqual(response);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      const stats = {
        total: 10,
        pendentes: 3,
        aprovados: 5,
        rejeitados: 2,
        ativos: 7,
        inativos: 3,
      };
      mockAdminService.getStatistics.mockResolvedValue(stats);

      const result = await controller.getStatistics();

      expect(adminService.getStatistics).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('deactivateEstablishment', () => {
    it('should deactivate an establishment', async () => {
      const response = {
        message: 'Estabelecimento inativado com sucesso',
        establishment: {
          id: 'est-1',
          name: 'Bar do João',
          active: false,
        },
      };
      mockAdminService.deactivateEstablishment.mockResolvedValue(response);

      const result = await controller.deactivateEstablishment('est-1', {});

      expect(adminService.deactivateEstablishment).toHaveBeenCalledWith('est-1');
      expect(result).toEqual(response);
    });
  });

  describe('activateEstablishment', () => {
    it('should activate an establishment', async () => {
      const response = {
        message: 'Estabelecimento ativado com sucesso',
        establishment: {
          id: 'est-1',
          name: 'Bar do João',
          active: true,
        },
      };
      mockAdminService.activateEstablishment.mockResolvedValue(response);

      const result = await controller.activateEstablishment('est-1');

      expect(adminService.activateEstablishment).toHaveBeenCalledWith('est-1');
      expect(result).toEqual(response);
    });
  });
});

