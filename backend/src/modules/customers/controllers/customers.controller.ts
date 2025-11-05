import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto, @Req() req: any) {
    try {
      const customer = await this.customersService.create(createCustomerDto, req.user.establishmentId);
      return customer;
    } catch (error) {
      console.error('Erro ao criar customer:', error.message);
      throw error;
    }
  }

  @Get('test')
  testEndpoint() {
    return { message: 'Endpoint de teste funcionando' };
  }

  @Get()
  async findAll(@Req() req: any) {
    try {
      const customers = await this.customersService.findAll(req.user.establishmentId);
      // Log sem dados pessoais (LGPD)
      console.log('Clientes listados', { count: customers.length, establishmentId: req.user.establishmentId.substring(0, 8) });
      return customers;
    } catch (error) {
      console.error('Erro ao buscar customers:', error.message);
      return { error: error.message };
    }
  }

  @Get('debts/list')
  async findCustomersWithDebts(@Req() req: any) {
    try {
      const customers = await this.customersService.findCustomersWithDebts(req.user.establishmentId);
      // Log sem dados pessoais (LGPD)
      console.log('Clientes com dívidas listados', { count: customers.length });
      return customers;
    } catch (error) {
      console.error('Erro ao buscar clientes com dívidas:', error.message);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.customersService.findOne(id, req.user.establishmentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @Req() req: any) {
    return this.customersService.update(id, updateCustomerDto, req.user.establishmentId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.customersService.remove(id, req.user.establishmentId);
  }

  @Post(':id/pay-debt')
  async payDebt(@Param('id') id: string, @Body() data: { amount: string; method: string; note?: string }, @Req() req: any) {
    try {
      const customer = await this.customersService.payDebt(id, data.amount, data.method, req.user.establishmentId, data.note);
      // Log sem dados financeiros completos (LGPD)
      console.log('Pagamento de dívida processado', { customerId: id.substring(0, 8), method: data.method });
      return customer;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error.message);
      throw error;
    }
  }
}
