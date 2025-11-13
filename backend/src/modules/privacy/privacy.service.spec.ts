import { Test, TestingModule } from '@nestjs/testing';
import { PrivacyService } from './privacy.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Establishment } from '../auth/entities/establishment.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Tab } from '../tabs/entities/tab.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Item } from '../items/entities/item.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PrivacyService', () => {
  let service: PrivacyService;
  let userRepository: Repository<User>;
  let establishmentRepository: Repository<Establishment>;
  let customerRepository: Repository<Customer>;
  let tabRepository: Repository<Tab>;
  let paymentRepository: Repository<Payment>;
  let itemRepository: Repository<Item>;

  const mockUser = {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao@test.com',
    picture: 'photo.jpg',
    role: 'PROPRIETARIO',
    active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const mockEstablishment = {
    id: 'est-1',
    name: 'Bar do João',
    email: 'bar@test.com',
    phone: '123456789',
    address: 'Rua Test, 123',
    statusAprovacao: 'APROVADO',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const mockCustomer = {
    id: 'customer-1',
    name: 'Cliente Test',
    phone: '987654321',
    balance_due: '0',
    negative_balance_since: null,
    establishment_id: 'est-1',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const mockItem = {
    id: 'item-1',
    name: 'Cerveja',
    price: '8.00',
    active: true,
    establishment_id: 'est-1',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  };

  const mockTab = {
    id: 'tab-1',
    name: 'Mesa 1',
    status: 'CLOSED',
    total: '50.00',
    establishment_id: 'est-1',
    customer: mockCustomer,
    tabItems: [],
    payments: [],
    created_at: new Date('2024-01-01'),
    closed_at: new Date('2024-01-01'),
    opened_at: new Date('2024-01-01'),
  };

  const mockRepositories = {
    user: {
      findOne: jest.fn(),
      remove: jest.fn(),
    },
    establishment: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
    customer: {
      find: jest.fn(),
      save: jest.fn(),
    },
    tab: {
      find: jest.fn(),
      save: jest.fn(),
    },
    payment: {
      find: jest.fn(),
    },
    item: {
      find: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrivacyService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepositories.user,
        },
        {
          provide: getRepositoryToken(Establishment),
          useValue: mockRepositories.establishment,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepositories.customer,
        },
        {
          provide: getRepositoryToken(Tab),
          useValue: mockRepositories.tab,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepositories.payment,
        },
        {
          provide: getRepositoryToken(Item),
          useValue: mockRepositories.item,
        },
      ],
    }).compile();

    service = module.get<PrivacyService>(PrivacyService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    establishmentRepository = module.get<Repository<Establishment>>(
      getRepositoryToken(Establishment),
    );
    customerRepository = module.get<Repository<Customer>>(
      getRepositoryToken(Customer),
    );
    tabRepository = module.get<Repository<Tab>>(getRepositoryToken(Tab));
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    itemRepository = module.get<Repository<Item>>(getRepositoryToken(Item));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportUserData', () => {
    it('should export all user data', async () => {
      mockRepositories.user.findOne.mockResolvedValue(mockUser);
      mockRepositories.establishment.findOne.mockResolvedValue(mockEstablishment);
      mockRepositories.customer.find.mockResolvedValue([mockCustomer]);
      mockRepositories.tab.find.mockResolvedValue([mockTab]);
      mockRepositories.item.find.mockResolvedValue([mockItem]);

      const result = await service.exportUserData('user-1', 'est-1');

      expect(mockRepositories.user.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        relations: ['establishment'],
      });
      expect(result.export_info).toBeDefined();
      expect(result.export_info.lgpd_reference).toContain('Art. 18');
      expect(result.user_data.id).toBe('user-1');
      expect(result.establishment_data.name).toBe('Bar do João');
      expect(result.customers_data).toHaveLength(1);
      expect(result.items_data).toHaveLength(1);
      expect(result.sales_history).toHaveLength(1);
      expect(result.statistics.total_customers).toBe(1);
      expect(result.your_rights).toBeDefined();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepositories.user.findOne.mockResolvedValue(null);

      await expect(service.exportUserData('invalid-id', 'est-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle establishment without data', async () => {
      mockRepositories.user.findOne.mockResolvedValue(mockUser);
      mockRepositories.establishment.findOne.mockResolvedValue(null);
      mockRepositories.customer.find.mockResolvedValue([]);
      mockRepositories.tab.find.mockResolvedValue([]);
      mockRepositories.item.find.mockResolvedValue([]);

      const result = await service.exportUserData('user-1', 'est-1');

      expect(result.establishment_data).toBeNull();
      expect(result.customers_data).toHaveLength(0);
      expect(result.statistics.total_customers).toBe(0);
    });
  });

  describe('deleteUserAccount', () => {
    it('should delete user account and anonymize data', async () => {
      mockRepositories.user.findOne.mockResolvedValue(mockUser);
      mockRepositories.customer.find.mockResolvedValue([
        { ...mockCustomer, balance_due: '0' },
      ]);
      mockRepositories.tab.find.mockResolvedValue([mockTab]);
      mockRepositories.establishment.findOne.mockResolvedValue(mockEstablishment);
      mockRepositories.tab.save.mockResolvedValue(mockTab);
      mockRepositories.customer.save.mockResolvedValue(mockCustomer);
      mockRepositories.establishment.save.mockResolvedValue(mockEstablishment);
      mockRepositories.item.delete.mockResolvedValue({ affected: 1 });
      mockRepositories.user.remove.mockResolvedValue(mockUser);

      const result = await service.deleteUserAccount('user-1', 'est-1');

      expect(result.success).toBe(true);
      expect(result.message).toContain('excluída com sucesso');
      expect(mockRepositories.tab.save).toHaveBeenCalled();
      expect(mockRepositories.customer.save).toHaveBeenCalled();
      expect(mockRepositories.establishment.save).toHaveBeenCalled();
      expect(mockRepositories.item.delete).toHaveBeenCalled();
      expect(mockRepositories.user.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepositories.user.findOne.mockResolvedValue(null);

      await expect(
        service.deleteUserAccount('invalid-id', 'est-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if there are pending debts', async () => {
      mockRepositories.user.findOne.mockResolvedValue(mockUser);
      // balance_due positivo significa crédito do cliente (ele pagou a mais)
      mockRepositories.customer.find.mockResolvedValue([
        { ...mockCustomer, balance_due: '100.50' },
      ]);

      await expect(service.deleteUserAccount('user-1', 'est-1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.deleteUserAccount('user-1', 'est-1')).rejects.toThrow(
        /débitos pendentes/,
      );
    });

    it('should anonymize data correctly', async () => {
      const tabToSave = { ...mockTab };
      const customerToSave = { ...mockCustomer };
      const establishmentToSave = { ...mockEstablishment };

      mockRepositories.user.findOne.mockResolvedValue(mockUser);
      mockRepositories.customer.find.mockResolvedValue([
        { ...mockCustomer, balance_due: '0' },
      ]);
      mockRepositories.tab.find.mockResolvedValue([tabToSave]);
      mockRepositories.establishment.findOne.mockResolvedValue(establishmentToSave);
      mockRepositories.tab.save.mockImplementation((tab) => {
        expect(tab.name).toContain('CONTA_ANONIMIZADA');
        return Promise.resolve(tab);
      });
      mockRepositories.customer.save.mockImplementation((customer) => {
        expect(customer.name).toContain('CLIENTE_ANONIMIZADO');
        expect(customer.phone).toBeUndefined();
        return Promise.resolve(customer);
      });
      mockRepositories.establishment.save.mockImplementation((est) => {
        expect(est.name).toContain('ESTABELECIMENTO_EXCLUIDO');
        expect(est.email).toContain('anonimizado.local');
        return Promise.resolve(est);
      });
      mockRepositories.item.delete.mockResolvedValue({ affected: 1 });
      mockRepositories.user.remove.mockResolvedValue(mockUser);

      await service.deleteUserAccount('user-1', 'est-1');

      expect(mockRepositories.tab.save).toHaveBeenCalled();
      expect(mockRepositories.customer.save).toHaveBeenCalled();
      expect(mockRepositories.establishment.save).toHaveBeenCalled();
    });

    it('should handle establishment not found during deletion', async () => {
      mockRepositories.user.findOne.mockResolvedValue(mockUser);
      mockRepositories.customer.find.mockResolvedValue([]);
      mockRepositories.tab.find.mockResolvedValue([]);
      mockRepositories.establishment.findOne.mockResolvedValue(null);
      mockRepositories.item.delete.mockResolvedValue({ affected: 0 });
      mockRepositories.user.remove.mockResolvedValue(mockUser);

      const result = await service.deleteUserAccount('user-1', 'est-1');

      expect(result.success).toBe(true);
      expect(mockRepositories.user.remove).toHaveBeenCalled();
    });
  });
});

