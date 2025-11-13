import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let repository: Repository<Expense>;

  const mockExpense = {
    id: 'expense-1',
    description: 'Compra de cerveja',
    amount: 500.0,
    year: 2024,
    month: 1,
    establishment_id: 'est-1',
    created_at: new Date(),
  };

  const mockExpensesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpensesRepository,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    repository = module.get<Repository<Expense>>(getRepositoryToken(Expense));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new expense', async () => {
      const createExpenseDto: CreateExpenseDto = {
        description: 'Compra de cerveja',
        amount: 500.0,
        year: 2024,
        month: 1,
      };
      const establishmentId = 'est-1';

      mockExpensesRepository.create.mockReturnValue(mockExpense);
      mockExpensesRepository.save.mockResolvedValue(mockExpense);

      const result = await service.create(createExpenseDto, establishmentId);

      expect(mockExpensesRepository.create).toHaveBeenCalledWith({
        ...createExpenseDto,
        establishment_id: establishmentId,
      });
      expect(mockExpensesRepository.save).toHaveBeenCalledWith(mockExpense);
      expect(result).toEqual(mockExpense);
    });
  });

  describe('findByPeriod', () => {
    it('should find expenses by year and month', async () => {
      const year = 2024;
      const month = 1;
      const establishmentId = 'est-1';
      const expenses = [mockExpense];

      mockExpensesRepository.find.mockResolvedValue(expenses);

      const result = await service.findByPeriod(year, month, establishmentId);

      expect(mockExpensesRepository.find).toHaveBeenCalledWith({
        where: { year, month, establishment_id: establishmentId },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(expenses);
    });

    it('should return empty array when no expenses found', async () => {
      mockExpensesRepository.find.mockResolvedValue([]);

      const result = await service.findByPeriod(2024, 1, 'est-1');

      expect(result).toEqual([]);
    });
  });

  describe('findByEstablishment', () => {
    it('should find expenses by establishment', async () => {
      const establishmentId = 'est-1';
      const expenses = [
        { year: 2024, month: 1 },
        { year: 2024, month: 2 },
      ];

      mockExpensesRepository.find.mockResolvedValue(expenses);

      const result = await service.findByEstablishment(establishmentId);

      expect(mockExpensesRepository.find).toHaveBeenCalledWith({
        where: { establishment_id: establishmentId },
        select: ['year', 'month'],
      });
      expect(result).toEqual(expenses);
    });
  });

  describe('delete', () => {
    it('should delete an expense', async () => {
      const expenseId = 'expense-1';
      const establishmentId = 'est-1';

      mockExpensesRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(expenseId, establishmentId);

      expect(mockExpensesRepository.delete).toHaveBeenCalledWith({
        id: expenseId,
        establishment_id: establishmentId,
      });
    });
  });
});

