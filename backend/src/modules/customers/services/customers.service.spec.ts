import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { TabStatus } from '../../tabs/entities/tab.entity';
import { Payment } from '../../payments/entities/payment.entity';

describe('CustomersService', () => {
  let service: CustomersService;
  let repository: Repository<Customer>;
  let paymentRepository: Repository<Payment>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPaymentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo cliente com sucesso', async () => {
      const createDto: CreateCustomerDto = {
        name: 'João Silva',
        phone: '(11) 98765-4321',
      };
      const establishmentId = 'est-1';

      const newCustomer = {
        id: 'customer-1',
        ...createDto,
        balance_due: '0',
        establishment_id: establishmentId,
      };

      mockRepository.create.mockReturnValue(newCustomer);
      mockRepository.save.mockResolvedValue(newCustomer);

      const result = await service.create(createDto, establishmentId);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        balance_due: '0',
        establishment_id: establishmentId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(newCustomer);
      expect(result).toEqual(newCustomer);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os clientes do estabelecimento', async () => {
      const establishmentId = 'est-1';
      const customers = [
        { id: '1', name: 'Cliente A', establishment_id: establishmentId },
        { id: '2', name: 'Cliente B', establishment_id: establishmentId },
      ];

      mockRepository.find.mockResolvedValue(customers);

      const result = await service.findAll(establishmentId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { establishment_id: establishmentId },
        order: { name: 'ASC' },
      });
      // O serviço adiciona o campo days_in_negative_balance
      expect(result).toEqual([
        { ...customers[0], days_in_negative_balance: null },
        { ...customers[1], days_in_negative_balance: null },
      ]);
    });
  });

  describe('findOne', () => {
    it('deve retornar um cliente por ID', async () => {
      const customer = {
        id: 'customer-1',
        name: 'João Silva',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(customer);

      const result = await service.findOne('customer-1', 'est-1');

      // O serviço adiciona o campo days_in_negative_balance
      expect(result).toEqual({
        ...customer,
        days_in_negative_balance: null,
      });
    });

    it('deve lançar NotFoundException se cliente não existir', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'est-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar um cliente', async () => {
      const updateDto: UpdateCustomerDto = {
        name: 'João Silva Atualizado',
        phone: '(11) 91234-5678',
      };

      const existingCustomer = {
        id: 'customer-1',
        name: 'João Silva',
        cpf: '123.456.789-00',
        phone: '(11) 98765-4321',
        establishment_id: 'est-1',
      };

      const updatedCustomer = {
        ...existingCustomer,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValue(existingCustomer);
      mockRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.update('customer-1', updateDto, 'est-1');

      expect(result.name).toBe(updateDto.name);
      expect(result.phone).toBe(updateDto.phone);
    });
  });

  describe('remove', () => {
    it('deve remover um cliente', async () => {
      const customer = {
        id: 'customer-1',
        name: 'João Silva',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(customer);
      mockRepository.remove.mockResolvedValue(customer);

      await service.remove('customer-1', 'est-1');

      expect(mockRepository.remove).toHaveBeenCalledWith(customer);
    });
  });

  describe('updateBalanceDue', () => {
    it('deve atualizar o saldo devedor do cliente', async () => {
      const customer = {
        id: 'customer-1',
        name: 'João Silva',
        balance_due: '100',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(customer);
      mockRepository.save.mockResolvedValue({
        ...customer,
        balance_due: '50',
      });

      await service.updateBalanceDue('customer-1', '-50', 'est-1');

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...customer,
        balance_due: '50',
      });
    });

    it('deve adicionar valor negativo ao saldo (criar dívida)', async () => {
      const customer = {
        id: 'customer-1',
        name: 'João Silva',
        balance_due: '0',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(customer);
      mockRepository.save.mockResolvedValue({
        ...customer,
        balance_due: '-50',
      });

      await service.updateBalanceDue('customer-1', '-50', 'est-1');

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...customer,
        balance_due: '-50',
      });
    });
  });

  describe('findCustomersWithDebts', () => {
    it('deve retornar clientes com dívidas', async () => {
      const establishmentId = 'est-1';
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 'customer-1',
            name: 'Cliente Devedor',
            balance_due: '-100',
            tabs: [
              {
                id: 'tab-1',
                status: TabStatus.CLOSED,
                tabItems: [{ total: '100' }],
                payments: [],
              },
            ],
          },
        ]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findCustomersWithDebts(establishmentId);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('payDebt', () => {
    it('deve pagar parte da dívida', async () => {
      const customer = {
        id: 'customer-1',
        name: 'João Silva',
        balance_due: '-100',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(customer);
      mockRepository.save.mockResolvedValue({
        ...customer,
        balance_due: '-50',
      });

      const result = await service.payDebt('customer-1', '50', 'pix', 'est-1');

      expect(result.balance_due).toBe('-50');
    });

    it('deve pagar dívida completa', async () => {
      const customer = {
        id: 'customer-1',
        name: 'João Silva',
        balance_due: '-100',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(customer);
      mockRepository.save.mockResolvedValue({
        ...customer,
        balance_due: '0',
      });

      const result = await service.payDebt('customer-1', '100', 'dinheiro', 'est-1');

      expect(result.balance_due).toBe('0');
    });

    it('deve lançar erro se valor for zero ou negativo', async () => {
      const customer = {
        id: 'customer-1',
        name: 'João Silva',
        balance_due: '-100',
        establishment_id: 'est-1',
      };

      mockRepository.findOne.mockResolvedValue(customer);

      await expect(service.payDebt('customer-1', '0', 'dinheiro', 'est-1')).rejects.toThrow(
        'O valor do pagamento deve ser maior que zero',
      );
    });
  });
});

