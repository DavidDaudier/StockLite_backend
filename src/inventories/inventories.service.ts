import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory, InventoryStatus } from './inventory.entity';
import { InventoryItem, InventoryItemStatus } from './inventory-item.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class InventoriesService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryItem)
    private inventoryItemRepository: Repository<InventoryItem>,
    private productsService: ProductsService,
  ) {}

  async create(createInventoryDto: CreateInventoryDto, userId: string): Promise<Inventory> {
    // Generate inventory number
    const count = await this.inventoryRepository.count();
    const inventoryNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Create inventory
    const inventory = this.inventoryRepository.create({
      inventoryNumber,
      userId,
      notes: createInventoryDto.notes,
      totalItems: createInventoryDto.items.length,
      countedItems: 0,
      itemsWithDiscrepancy: 0,
      totalDiscrepancy: 0,
      status: InventoryStatus.IN_PROGRESS,
    });

    const savedInventory = await this.inventoryRepository.save(inventory);

    // Create inventory items
    const items = createInventoryDto.items.map(itemDto => {
      const theoreticalQty = itemDto.theoreticalQuantity ?? 0;
      const item = this.inventoryItemRepository.create({
        inventoryId: savedInventory.id,
        productId: itemDto.productId,
        theoreticalQuantity: theoreticalQty,
        physicalQuantity: itemDto.physicalQuantity ?? null,
        difference: itemDto.physicalQuantity ? itemDto.physicalQuantity - theoreticalQty : 0,
        status: itemDto.physicalQuantity !== undefined
          ? (itemDto.physicalQuantity === theoreticalQty
              ? InventoryItemStatus.COUNTED
              : InventoryItemStatus.DISCREPANCY)
          : InventoryItemStatus.PENDING,
        notes: itemDto.notes,
      });
      return item;
    });

    await this.inventoryItemRepository.save(items);

    // Update stats
    await this.updateInventoryStats(savedInventory.id);

    return this.findOne(savedInventory.id);
  }

  async findAll(userId?: string): Promise<Inventory[]> {
    const query = this.inventoryRepository.createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.user', 'user')
      .leftJoinAndSelect('inventory.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('inventory.createdAt', 'DESC');

    if (userId) {
      query.where('inventory.userId = :userId', { userId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  async updateItem(inventoryId: string, itemId: string, updateDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const inventory = await this.findOne(inventoryId);

    if (inventory.status !== InventoryStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot update items of a completed or cancelled inventory');
    }

    const item = await this.inventoryItemRepository.findOne({
      where: { id: itemId, inventoryId },
      relations: ['product'],
    });

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${itemId} not found`);
    }

    // Update item
    if (updateDto.physicalQuantity !== undefined) {
      item.physicalQuantity = updateDto.physicalQuantity;
      item.difference = item.physicalQuantity - item.theoreticalQuantity;
      item.status = item.difference === 0 ? InventoryItemStatus.COUNTED : InventoryItemStatus.DISCREPANCY;
    }

    if (updateDto.notes !== undefined) {
      item.notes = updateDto.notes;
    }

    const updatedItem = await this.inventoryItemRepository.save(item);

    // Update inventory stats
    await this.updateInventoryStats(inventoryId);

    return updatedItem;
  }

  async complete(id: string): Promise<Inventory> {
    const inventory = await this.findOne(id);

    if (inventory.status !== InventoryStatus.IN_PROGRESS) {
      throw new BadRequestException('Inventory is not in progress');
    }

    // Apply adjustments to products
    const itemsWithDiscrepancy = inventory.items.filter(item =>
      item.physicalQuantity !== null && item.difference !== 0
    );

    for (const item of itemsWithDiscrepancy) {
      await this.productsService.update(item.productId, {
        quantity: item.physicalQuantity,
      });
    }

    // Update inventory status
    inventory.status = InventoryStatus.COMPLETED;
    inventory.completedAt = new Date();

    return this.inventoryRepository.save(inventory);
  }

  async cancel(id: string): Promise<Inventory> {
    const inventory = await this.findOne(id);

    if (inventory.status !== InventoryStatus.IN_PROGRESS) {
      throw new BadRequestException('Inventory is not in progress');
    }

    inventory.status = InventoryStatus.CANCELLED;
    return this.inventoryRepository.save(inventory);
  }

  async delete(id: string): Promise<void> {
    const inventory = await this.findOne(id);
    await this.inventoryRepository.remove(inventory);
  }

  private async updateInventoryStats(inventoryId: string): Promise<void> {
    const items = await this.inventoryItemRepository.find({
      where: { inventoryId },
    });

    const totalItems = items.length;
    const countedItems = items.filter(i => i.physicalQuantity !== null).length;
    const itemsWithDiscrepancy = items.filter(i => i.status === InventoryItemStatus.DISCREPANCY).length;
    const totalDiscrepancy = items.reduce((sum, i) => sum + Math.abs(i.difference), 0);

    await this.inventoryRepository.update(inventoryId, {
      totalItems,
      countedItems,
      itemsWithDiscrepancy,
      totalDiscrepancy,
    });
  }
}
