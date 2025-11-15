import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: ExpensesService;

  const mockExpense = {
    id: 'expense-1',
    description: 'Compra de cerveja',
    amount: 500.0,
    year: 2024,
    month: 1,
    establishment_id: 'est-1',
    created_at: new Date(),
  };

  const mockExpensesService = {
    create: jest.fn(),
    findByPeriod: jest.fn(),
    findByEstablishment: jest.fn(),
    delete: jest.fn(),
  };

  const mockRequest = {
    user: {
      establishmentId: 'est-1',
      id: 'user-1',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: mockExpensesService,
        },
      ],
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
    service = module.get<ExpensesService>(ExpensesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      const createExpenseDto: CreateExpenseDto = {
        description: 'Compra de cerveja',
        amount: '500.0',
        year: 2024,
        month: 1,
      };

      mockExpensesService.create.mockResolvedValue(mockExpense);

      const result = await controller.create(createExpenseDto, mockRequest);

      expect(service.create).toHaveBeenCalledWith(createExpenseDto, 'est-1');
      expect(result).toEqual(mockExpense);
    });
  });

  describe('findByPeriod', () => {
    it('should find expenses by period', async () => {
      const expenses = [mockExpense];
      mockExpensesService.findByPeriod.mockResolvedValue(expenses);

      const result = await controller.findByPeriod('2024', '1', mockRequest);

      expect(service.findByPeriod).toHaveBeenCalledWith(2024, 1, 'est-1');
      expect(result).toEqual(expenses);
    });
  });

  describe('delete', () => {
    it('should delete an expense', async () => {
      mockExpensesService.delete.mockResolvedValue(undefined);

      await controller.delete('expense-1', mockRequest);

      expect(service.delete).toHaveBeenCalledWith('expense-1', 'est-1');
    });
  });
});

