import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto, @Req() req: any) {
    return this.itemsService.create(createItemDto, req.user.establishmentId);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() req: any) {
    return this.itemsService.findAll(req.user.establishmentId, paginationDto.page, paginationDto.limit);
  }

  @Get('active')
  findActive(@Req() req: any) {
    return this.itemsService.findActive(req.user.establishmentId);
  }

  @Get('active/best-sellers')
  findActiveOrderedBySales(@Req() req: any) {
    return this.itemsService.findActiveOrderedBySales(req.user.establishmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.itemsService.findOne(id, req.user.establishmentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto, @Req() req: any) {
    return this.itemsService.update(id, updateItemDto, req.user.establishmentId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.itemsService.remove(id, req.user.establishmentId);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @Req() req: any) {
    return this.itemsService.deactivate(id, req.user.establishmentId);
  }
}
