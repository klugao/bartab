import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
  ) {}

  async create(createItemDto: CreateItemDto, establishmentId: string): Promise<Item> {
    const item = this.itemsRepository.create({
      name: createItemDto.name,
      price: createItemDto.price.toString(),
      establishment_id: establishmentId,
    } as unknown as Item);
    return await this.itemsRepository.save(item);
  }

  async findAll(establishmentId: string, page?: number, limit?: number): Promise<Item[] | PaginatedResponse<Item>> {
    const pageNumber = page || 1;
    const pageSize = limit || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Se não há parâmetros de paginação, retorna todos (compatibilidade)
    if (!page && !limit) {
      return await this.itemsRepository.find({
        where: { establishment_id: establishmentId },
        order: { name: 'ASC' }
      });
    }

    // Com paginação
    const [data, total] = await this.itemsRepository.findAndCount({
      where: { establishment_id: establishmentId },
      order: { name: 'ASC' },
      skip,
      take: pageSize,
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      meta: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages,
      },
    };
  }

  async findActive(establishmentId: string): Promise<Item[]> {
    return await this.itemsRepository.find({
      where: { active: true, establishment_id: establishmentId },
      order: { name: 'ASC' }
    });
  }

  async findActiveOrderedBySales(establishmentId: string): Promise<Item[]> {
    // Busca itens ativos ordenados pela quantidade total vendida (maior para menor)
    // Items sem vendas também aparecem, mas por último
    const items = await this.itemsRepository
      .createQueryBuilder('item')
      .leftJoin('item.tabItems', 'tabItem')
      .where('item.active = :active', { active: true })
      .andWhere('item.establishment_id = :establishmentId', { establishmentId })
      .select('item.id', 'id')
      .addSelect('item.name', 'name')
      .addSelect('item.price', 'price')
      .addSelect('item.active', 'active')
      .addSelect('item.establishment_id', 'establishment_id')
      .addSelect('COALESCE(SUM(tabItem.qty), 0)', 'total_sold')
      .groupBy('item.id')
      .addGroupBy('item.name')
      .addGroupBy('item.price')
      .addGroupBy('item.active')
      .addGroupBy('item.establishment_id')
      .orderBy('total_sold', 'DESC')
      .addOrderBy('item.name', 'ASC')
      .getRawMany();

    // Transformar resultado raw em objetos Item
    return items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      active: item.active,
      establishment_id: item.establishment_id,
      tabItems: []
    } as any));
  }

  async findOne(id: string, establishmentId: string): Promise<Item> {
    const item = await this.itemsRepository.findOne({ 
      where: { id, establishment_id: establishmentId } 
    });
    if (!item) {
      throw new NotFoundException(`Item com ID ${id} não encontrado`);
    }
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto, establishmentId: string): Promise<Item> {
    const item = await this.findOne(id, establishmentId);
    if (updateItemDto.name !== undefined) {
      item.name = updateItemDto.name;
    }
    if (updateItemDto.price !== undefined) {
      // Persistir como string para coluna numeric
      item.price = updateItemDto.price.toString();
    }
    return await this.itemsRepository.save(item);
  }

  async remove(id: string, establishmentId: string): Promise<void> {
    const item = await this.findOne(id, establishmentId);
    try {
      await this.itemsRepository.remove(item);
    } catch (error) {
      // Se o erro for de constraint de chave estrangeira (item está sendo usado)
      if (error.code === '23503') {
        throw new BadRequestException(
          'Não é possível excluir este item pois ele está sendo usado em contas. Use a opção "Desativar" ao invés de excluir.'
        );
      }
      // Re-lançar outros erros
      throw error;
    }
  }

  async deactivate(id: string, establishmentId: string): Promise<Item> {
    const item = await this.findOne(id, establishmentId);
    item.active = false;
    return await this.itemsRepository.save(item);
  }
}
