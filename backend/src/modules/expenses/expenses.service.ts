import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, establishmentId: string): Promise<Expense> {
    const expense = this.expensesRepository.create({
      ...createExpenseDto,
      establishment_id: establishmentId,
    });
    return await this.expensesRepository.save(expense);
  }

  async findByPeriod(year: number, month: number, establishmentId: string): Promise<Expense[]> {
    return await this.expensesRepository.find({
      where: { year, month, establishment_id: establishmentId },
      order: { created_at: 'DESC' }
    });
  }

  async findByEstablishment(establishmentId: string): Promise<Expense[]> {
    return await this.expensesRepository.find({
      where: { establishment_id: establishmentId },
      select: ['year', 'month'],
    });
  }

  async delete(id: string, establishmentId: string): Promise<void> {
    await this.expensesRepository.delete({ id, establishment_id: establishmentId });
  }
}

