import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Establishment } from '../auth/entities/establishment.entity';
import { User } from '../auth/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { ApprovalStatus } from '../../common/enums';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let establishmentRepository: Repository<Establishment>;
  let userRepository: Repository<User>;
  let notificationService: NotificationService;

  const mockEstablishment = {
    id: 'est-1',
    name: 'Bar do João',
    email: 'bar@test.com',
    address: 'Rua Test, 123',
    phone: '123456789',
    active: true,
    statusAprovacao: ApprovalStatus.PENDENTE,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    users: [
      {
        id: 'user-1',
        name: 'João',
        email: 'joao@test.com',
        role: 'PROPRIETARIO',
      },
    ],
  };

  const mockEstablishmentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockNotificationService = {
    sendApprovalEmail: jest.fn(),
    sendRejectionEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Establishment),
          useValue: mockEstablishmentRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    establishmentRepository = module.get<Repository<Establishment>>(
      getRepositoryToken(Establishment),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    notificationService = module.get<NotificationService>(NotificationService);

    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    
    // Silenciar logs do console durante os testes
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPendingEstablishments', () => {
    it('should return list of pending establishments', async () => {
      const establishments = [mockEstablishment];
      mockEstablishmentRepository.find.mockResolvedValue(establishments);

      const result = await service.getPendingEstablishments();

      expect(mockEstablishmentRepository.find).toHaveBeenCalledWith({
        where: { statusAprovacao: ApprovalStatus.PENDENTE },
        relations: ['users'],
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bar do João');
      expect(result[0].proprietario).toBeDefined();
      expect(result[0].proprietario?.name).toBe('João');
    });

    it('should handle establishments without users', async () => {
      const estWithoutUsers = { ...mockEstablishment, users: [] };
      mockEstablishmentRepository.find.mockResolvedValue([estWithoutUsers]);

      const result = await service.getPendingEstablishments();

      expect(result[0].proprietario).toBeNull();
    });
  });

  describe('getAllEstablishments', () => {
    it('should return all establishments without status filter', async () => {
      mockEstablishmentRepository.find.mockResolvedValue([mockEstablishment]);

      const result = await service.getAllEstablishments();

      expect(mockEstablishmentRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['users'],
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].proprietarios).toHaveLength(1);
    });

    it('should return establishments filtered by status', async () => {
      mockEstablishmentRepository.find.mockResolvedValue([mockEstablishment]);

      const result = await service.getAllEstablishments(ApprovalStatus.APROVADO);

      expect(mockEstablishmentRepository.find).toHaveBeenCalledWith({
        where: { statusAprovacao: ApprovalStatus.APROVADO },
        relations: ['users'],
        order: { created_at: 'DESC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('approveEstablishment', () => {
    it('should approve a pending establishment', async () => {
      const establishment = { ...mockEstablishment };
      mockEstablishmentRepository.findOne.mockResolvedValue(establishment);
      mockEstablishmentRepository.save.mockResolvedValue({
        ...establishment,
        statusAprovacao: ApprovalStatus.APROVADO,
      });
      mockNotificationService.sendApprovalEmail.mockResolvedValue(undefined);

      const result = await service.approveEstablishment('est-1');

      expect(mockEstablishmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'est-1' },
        relations: ['users'],
      });
      expect(mockEstablishmentRepository.save).toHaveBeenCalled();
      expect(mockNotificationService.sendApprovalEmail).toHaveBeenCalledWith(
        'joao@test.com',
        'Bar do João',
      );
      expect(result.message).toBe('Estabelecimento aprovado com sucesso');
      expect(result.establishment.statusAprovacao).toBe(ApprovalStatus.APROVADO);
    });

    it('should throw NotFoundException if establishment not found', async () => {
      mockEstablishmentRepository.findOne.mockResolvedValue(null);

      await expect(service.approveEstablishment('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if already approved', async () => {
      const approvedEst = {
        ...mockEstablishment,
        statusAprovacao: ApprovalStatus.APROVADO,
      };
      mockEstablishmentRepository.findOne.mockResolvedValue(approvedEst);

      await expect(service.approveEstablishment('est-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle email sending errors gracefully', async () => {
      const establishment = { ...mockEstablishment };
      mockEstablishmentRepository.findOne.mockResolvedValue(establishment);
      mockEstablishmentRepository.save.mockResolvedValue({
        ...establishment,
        statusAprovacao: ApprovalStatus.APROVADO,
      });
      mockNotificationService.sendApprovalEmail.mockRejectedValue(
        new Error('Email error'),
      );

      // Não deve lançar erro mesmo se o email falhar
      const result = await service.approveEstablishment('est-1');

      expect(result.message).toBe('Estabelecimento aprovado com sucesso');
    });

    it('should handle establishment without users', async () => {
      const establishment = { ...mockEstablishment, users: [] };
      mockEstablishmentRepository.findOne.mockResolvedValue(establishment);
      mockEstablishmentRepository.save.mockResolvedValue({
        ...establishment,
        statusAprovacao: ApprovalStatus.APROVADO,
      });

      const result = await service.approveEstablishment('est-1');

      expect(mockNotificationService.sendApprovalEmail).not.toHaveBeenCalled();
      expect(result.message).toBe('Estabelecimento aprovado com sucesso');
    });
  });

  describe('rejectEstablishment', () => {
    it('should reject a pending establishment', async () => {
      const establishment = { ...mockEstablishment };
      mockEstablishmentRepository.findOne.mockResolvedValue(establishment);
      mockEstablishmentRepository.save.mockResolvedValue({
        ...establishment,
        statusAprovacao: ApprovalStatus.REJEITADO,
      });
      mockNotificationService.sendRejectionEmail.mockResolvedValue(undefined);

      const result = await service.rejectEstablishment('est-1', 'Dados inválidos');

      expect(mockEstablishmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'est-1' },
        relations: ['users'],
      });
      expect(mockEstablishmentRepository.save).toHaveBeenCalled();
      expect(mockNotificationService.sendRejectionEmail).toHaveBeenCalledWith(
        'joao@test.com',
        'Bar do João',
        'Dados inválidos',
      );
      expect(result.message).toBe('Estabelecimento rejeitado');
    });

    it('should throw NotFoundException if establishment not found', async () => {
      mockEstablishmentRepository.findOne.mockResolvedValue(null);

      await expect(service.rejectEstablishment('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if already rejected', async () => {
      const rejectedEst = {
        ...mockEstablishment,
        statusAprovacao: ApprovalStatus.REJEITADO,
      };
      mockEstablishmentRepository.findOne.mockResolvedValue(rejectedEst);

      await expect(service.rejectEstablishment('est-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle email sending errors gracefully', async () => {
      const establishment = { ...mockEstablishment };
      mockEstablishmentRepository.findOne.mockResolvedValue(establishment);
      mockEstablishmentRepository.save.mockResolvedValue({
        ...establishment,
        statusAprovacao: ApprovalStatus.REJEITADO,
      });
      mockNotificationService.sendRejectionEmail.mockRejectedValue(
        new Error('Email error'),
      );

      const result = await service.rejectEstablishment('est-1');

      expect(result.message).toBe('Estabelecimento rejeitado');
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      mockEstablishmentRepository.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // pendentes
        .mockResolvedValueOnce(5) // aprovados
        .mockResolvedValueOnce(2) // rejeitados
        .mockResolvedValueOnce(7) // ativos
        .mockResolvedValueOnce(3); // inativos

      const result = await service.getStatistics();

      expect(result).toEqual({
        total: 10,
        pendentes: 3,
        aprovados: 5,
        rejeitados: 2,
        ativos: 7,
        inativos: 3,
      });
      expect(mockEstablishmentRepository.count).toHaveBeenCalledTimes(6);
    });
  });

  describe('deactivateEstablishment', () => {
    it('should deactivate an establishment', async () => {
      const establishment = { ...mockEstablishment, active: true };
      mockEstablishmentRepository.findOne.mockResolvedValue(establishment);
      mockEstablishmentRepository.save.mockResolvedValue({
        ...establishment,
        active: false,
      });

      const result = await service.deactivateEstablishment('est-1');

      expect(mockEstablishmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'est-1' },
      });
      expect(mockEstablishmentRepository.save).toHaveBeenCalled();
      expect(result.message).toBe('Estabelecimento inativado com sucesso');
      expect(result.establishment.active).toBe(false);
    });

    it('should throw NotFoundException if establishment not found', async () => {
      mockEstablishmentRepository.findOne.mockResolvedValue(null);

      await expect(service.deactivateEstablishment('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activateEstablishment', () => {
    it('should activate an establishment', async () => {
      const establishment = { ...mockEstablishment, active: false };
      mockEstablishmentRepository.findOne.mockResolvedValue(establishment);
      mockEstablishmentRepository.save.mockResolvedValue({
        ...establishment,
        active: true,
      });

      const result = await service.activateEstablishment('est-1');

      expect(mockEstablishmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'est-1' },
      });
      expect(mockEstablishmentRepository.save).toHaveBeenCalled();
      expect(result.message).toBe('Estabelecimento ativado com sucesso');
      expect(result.establishment.active).toBe(true);
    });

    it('should throw NotFoundException if establishment not found', async () => {
      mockEstablishmentRepository.findOne.mockResolvedValue(null);

      await expect(service.activateEstablishment('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

