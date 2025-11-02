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
      console.log('Criando customer com dados:', createCustomerDto);
      const customer = await this.customersService.create(createCustomerDto, req.user.establishmentId);
      console.log('Customer criado com sucesso:', customer);
      return customer;
    } catch (error) {
      console.error('Erro ao criar customer:', error.message);
      console.error('Stack:', error.stack);
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
      console.log('Buscando customers...');
      const customers = await this.customersService.findAll(req.user.establishmentId);
      console.log('Encontrados:', customers.length, 'customers');
      return customers;
    } catch (error) {
      console.error('Erro ao buscar customers:', error.message);
      return { error: error.message };
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

  @Get('debts/list')
  async findCustomersWithDebts(@Req() req: any) {
    try {
      console.log('Buscando clientes com dívidas...');
      const customers = await this.customersService.findCustomersWithDebts(req.user.establishmentId);
      console.log('Encontrados:', customers.length, 'clientes com dívidas');
      return customers;
    } catch (error) {
      console.error('Erro ao buscar clientes com dívidas:', error.message);
      throw error;
    }
  }

  @Post(':id/pay-debt')
  async payDebt(@Param('id') id: string, @Body() data: { amount: string; method: string; note?: string }, @Req() req: any) {
    try {
      console.log('Processando pagamento de dívida para cliente:', id, 'valor:', data.amount);
      const customer = await this.customersService.payDebt(id, data.amount, req.user.establishmentId);
      console.log('Pagamento processado com sucesso. Novo saldo:', customer.balance_due);
      return customer;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error.message);
      throw error;
    }
  }
}
