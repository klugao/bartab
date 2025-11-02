import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @Req() req: any) {
    console.log('ExpensesController.create - Dados recebidos:', createExpenseDto);
    return this.expensesService.create(createExpenseDto, req.user.establishmentId);
  }

  @Get()
  findByPeriod(@Query('year') year: string, @Query('month') month: string, @Req() req: any) {
    console.log('ExpensesController.findByPeriod - Período:', { year, month });
    return this.expensesService.findByPeriod(parseInt(year), parseInt(month), req.user.establishmentId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    console.log('ExpensesController.delete - ID:', id);
    return this.expensesService.delete(id, req.user.establishmentId);
  }
}

