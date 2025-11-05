import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards, Req } from '@nestjs/common';
import { TabsService } from './tabs.service';
import { CreateTabDto } from './dto/create-tab.dto';
import { UpdateTabDto } from './dto/update-tab.dto';
import { AddItemDto } from './dto/add-item.dto';
import { AddPaymentDto } from '../payments/dto/add-payment.dto';
import { PaymentMethod } from '../payments/entities/payment.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('tabs')
@UseGuards(JwtAuthGuard)
export class TabsController {
  constructor(private readonly tabsService: TabsService) {}

  @Post()
  open(@Body() createTabDto: CreateTabDto, @Req() req: any) {
    // Log sem dados pessoais (LGPD)
    console.log('Nova conta aberta', { hasCustomer: !!createTabDto.customerId });
    return this.tabsService.open(createTabDto, req.user.establishmentId);
  }

  @Post('add-item')
  addItemToTab(@Body() data: { tabId: string; itemId: string; qty: number }, @Req() req: any) {
    // Log sem dados sensíveis (LGPD)
    console.log('Item adicionado à conta', { tabId: data.tabId.substring(0, 8), qty: data.qty });
    return this.tabsService.addItem(data.tabId, { itemId: data.itemId, qty: data.qty }, req.user.establishmentId);
  }

  @Post('remove-item')
  removeItemFromTab(@Body() data: { tabId: string; tabItemId: string }, @Req() req: any) {
    // Log sem dados sensíveis (LGPD)
    console.log('Item removido da conta', { tabId: data.tabId.substring(0, 8) });
    return this.tabsService.removeItem(data.tabId, data.tabItemId, req.user.establishmentId);
  }

  @Post('update-item-quantity')
  updateItemQuantity(@Body() data: { tabId: string; tabItemId: string; qty: number }, @Req() req: any) {
    // Log sem dados sensíveis (LGPD)
    console.log('Quantidade atualizada', { tabId: data.tabId.substring(0, 8), newQty: data.qty });
    return this.tabsService.updateItemQuantity(data.tabId, data.tabItemId, data.qty, req.user.establishmentId);
  }

  @Get()
  findOpen(@Req() req: any) {
    return this.tabsService.findOpen(req.user.establishmentId);
  }

  @Get('closed')
  findClosed(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @Req() req?: any) {
    // Converter strings de data em objetos Date se fornecidos
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.tabsService.findClosed(req.user.establishmentId, start, end);
  }

  @Post(':id/delete')
  deleteTab(@Param('id') id: string, @Req() req: any) {
    console.log('TabsController.deleteTab - ID recebido:', id);
    return this.tabsService.delete(id, req.user.establishmentId);
  }

  @Post('delete-tab')
  deleteTabAlternative(@Body() data: { tabId: string }, @Req() req: any) {
    console.log('TabsController.deleteTabAlternative - Dados recebidos:', data);
    return this.tabsService.delete(data.tabId, req.user.establishmentId);
  }

  @Post('add-payment')
  addPaymentToTab(@Body() data: { tabId: string; method: string; amount: string; note?: string }, @Req() req: any) {
    console.log('TabsController.addPaymentToTab - Dados recebidos:', data);
    const { tabId, ...paymentData } = data;
    // Garantir que o method seja do tipo PaymentMethod
    const addPaymentDto: AddPaymentDto = {
      method: paymentData.method as PaymentMethod,
      amount: paymentData.amount,
      note: paymentData.note
    };
    return this.tabsService.addPayment(tabId, addPaymentDto, req.user.establishmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.tabsService.findOne(id, req.user.establishmentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTabDto: UpdateTabDto, @Req() req: any) {
    console.log('TabsController.update - ID:', id, 'Data:', updateTabDto);
    return this.tabsService.update(id, updateTabDto, req.user.establishmentId);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() addItemDto: AddItemDto, @Req() req: any) {
    console.log('TabsController.addItem - ID:', id, 'Data:', addItemDto);
    return this.tabsService.addItem(id, addItemDto, req.user.establishmentId);
  }

  @Delete(':id/items/:tabItemId')
  removeItem(@Param('id') id: string, @Param('tabItemId') tabItemId: string, @Req() req: any) {
    return this.tabsService.removeItem(id, tabItemId, req.user.establishmentId);
  }

  @Post(':id/payments')
  addPayment(@Param('id') id: string, @Body() addPaymentDto: AddPaymentDto, @Req() req: any) {
    return this.tabsService.addPayment(id, addPaymentDto, req.user.establishmentId);
  }

  @Patch(':id/close')
  close(@Param('id') id: string, @Req() req: any) {
    return this.tabsService.close(id, req.user.establishmentId);
  }

  @Get('reports/available-months')
  getAvailableMonths(@Req() req: any) {
    console.log('TabsController.getAvailableMonths - Buscando meses disponíveis');
    return this.tabsService.getAvailableMonths(req.user.establishmentId);
  }

  @Get('reports/consumption')
  getConsumptionReport(@Query('year') year: string, @Query('month') month: string, @Req() req: any) {
    console.log('TabsController.getConsumptionReport - Dados recebidos:', { year, month });
    return this.tabsService.getConsumptionReport(parseInt(year), parseInt(month), req.user.establishmentId);
  }
}
