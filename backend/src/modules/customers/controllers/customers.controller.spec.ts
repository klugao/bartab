import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  const mockCustomer = {
    id: 'customer-1',
    name: 'João Silva',
    email: 'joao@test.com',
    phone: '123456789',
    balance_due: 0,
    establishment_id: 'est-1',
  };

  const mockCustomersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findCustomersWithDebts: jest.fn(),
    payDebt: jest.fn(),
  };

  const mockRequest = {
    user: {
      establishmentId: 'est-1',
      id: 'user-1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new customer', async () => {
      const createCustomerDto: CreateCustomerDto = {
        name: 'João Silva',
        phone: '123456789',
      };

      mockCustomersService.create.mockResolvedValue(mockCustomer);

      const result = await controller.create(createCustomerDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createCustomerDto, 'est-1');
      expect(result).toEqual(mockCustomer);
    });

    it('should handle errors when creating customer', async () => {
      const createCustomerDto: CreateCustomerDto = {
        name: 'João Silva',
        phone: '123456789',
      };

      mockCustomersService.create.mockRejectedValue(new Error('Database error'));

      await expect(controller.create(createCustomerDto, mockRequest)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('testEndpoint', () => {
    it('should return test message', () => {
      const result = controller.testEndpoint();

      expect(result).toEqual({ message: 'Endpoint de teste funcionando' });
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      const customers = [mockCustomer];
      mockCustomersService.findAll.mockResolvedValue(customers);
      const paginationDto = { page: 1, limit: 10 };

      const result = await controller.findAll(paginationDto, mockRequest);

      expect(service.findAll).toHaveBeenCalledWith('est-1', 1, 10);
      expect(result).toEqual(customers);
    });

    it('should handle errors when finding all customers', async () => {
      mockCustomersService.findAll.mockRejectedValue(new Error('Database error'));
      const paginationDto = { page: 1, limit: 10 };

      const result = await controller.findAll(paginationDto, mockRequest);

      expect(result).toEqual({ error: 'Database error' });
    });
  });

  describe('findCustomersWithDebts', () => {
    it('should return customers with debts', async () => {
      const customers = [{ ...mockCustomer, balance_due: -50 }];
      mockCustomersService.findCustomersWithDebts.mockResolvedValue(customers);

      const result = await controller.findCustomersWithDebts(mockRequest);

      expect(service.findCustomersWithDebts).toHaveBeenCalledWith('est-1');
      expect(result).toEqual(customers);
    });

    it('should handle errors when finding customers with debts', async () => {
      mockCustomersService.findCustomersWithDebts.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.findCustomersWithDebts(mockRequest)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findOne', () => {
    it('should return a single customer', async () => {
      mockCustomersService.findOne.mockResolvedValue(mockCustomer);

      const result = await controller.findOne('customer-1', mockRequest);

      expect(service.findOne).toHaveBeenCalledWith('customer-1', 'est-1');
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('update', () => {
    it('should update a customer', async () => {
      const updateCustomerDto: UpdateCustomerDto = {
        name: 'João Silva Updated',
        phone: '987654321',
      };
      const updatedCustomer = { ...mockCustomer, ...updateCustomerDto };
      mockCustomersService.update.mockResolvedValue(updatedCustomer);

      const result = await controller.update('customer-1', updateCustomerDto, mockRequest);

      expect(service.update).toHaveBeenCalledWith('customer-1', updateCustomerDto, 'est-1');
      expect(result).toEqual(updatedCustomer);
    });
  });

  describe('remove', () => {
    it('should remove a customer', async () => {
      mockCustomersService.remove.mockResolvedValue(undefined);

      await controller.remove('customer-1', mockRequest);

      expect(service.remove).toHaveBeenCalledWith('customer-1', 'est-1');
    });
  });

  describe('payDebt', () => {
    it('should process debt payment', async () => {
      const paymentData = {
        amount: '50.00',
        method: 'CASH',
        note: 'Payment',
      };
      const updatedCustomer = { ...mockCustomer, balance_due: -50 };
      mockCustomersService.payDebt.mockResolvedValue(updatedCustomer);

      const result = await controller.payDebt('customer-1', paymentData, mockRequest);

      expect(service.payDebt).toHaveBeenCalledWith(
        'customer-1',
        '50.00',
        'CASH',
        'est-1',
        'Payment',
      );
      expect(result).toEqual(updatedCustomer);
    });

    it('should handle errors when processing debt payment', async () => {
      const paymentData = {
        amount: '50.00',
        method: 'CASH',
      };
      mockCustomersService.payDebt.mockRejectedValue(new Error('Payment error'));

      await expect(
        controller.payDebt('customer-1', paymentData, mockRequest),
      ).rejects.toThrow('Payment error');
    });
  });
});

