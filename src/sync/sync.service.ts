import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../sales/sale.entity';
import { Product } from '../products/product.entity';
import { SyncGateway } from './sync.gateway';

export interface SyncQueueItem {
  id: string;
  type: 'sale' | 'product' | 'stock';
  data: any;
  timestamp: Date;
  synced: boolean;
  attempts: number;
}

@Injectable()
export class SyncService {
  private syncQueue: Map<string, SyncQueueItem> = new Map();
  private maxAttempts = 3;

  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private syncGateway: SyncGateway,
  ) {}

  addToQueue(item: Omit<SyncQueueItem, 'attempts' | 'synced'>): void {
    this.syncQueue.set(item.id, {
      ...item,
      attempts: 0,
      synced: false,
    });
  }

  async processSyncQueue(): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const [id, item] of this.syncQueue.entries()) {
      if (item.synced || item.attempts >= this.maxAttempts) {
        continue;
      }

      try {
        await this.syncItem(item);
        item.synced = true;
        item.attempts++;
        success++;

        this.syncQueue.delete(id);
      } catch (error) {
        item.attempts++;
        failed++;
        console.error(`Erreur de synchronisation pour l'item ${id}:`, error.message);
      }
    }

    return { success, failed };
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'sale':
        await this.syncSale(item.data);
        break;
      case 'product':
        await this.syncProduct(item.data);
        break;
      case 'stock':
        await this.syncStockUpdate(item.data);
        break;
      default:
        throw new Error(`Type de synchronisation non supporté: ${item.type}`);
    }
  }

  private async syncSale(saleData: any): Promise<void> {
    const sale = await this.saleRepository.findOne({
      where: { clientSaleId: saleData.clientSaleId },
    });

    if (!sale) {
      throw new Error('Vente non trouvée');
    }

    await this.saleRepository.update(sale.id, { synced: true });

    this.syncGateway.notifyNewSale(sale);
  }

  private async syncProduct(productData: any): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productData.id },
    });

    if (!product) {
      throw new Error('Produit non trouvé');
    }

    this.syncGateway.notifyProductUpdate(product);
  }

  private async syncStockUpdate(stockData: any): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: stockData.productId },
    });

    if (!product) {
      throw new Error('Produit non trouvé');
    }

    await this.productRepository.update(product.id, {
      quantity: stockData.newQuantity,
    });

    if (product.quantity <= product.minStock) {
      this.syncGateway.notifyLowStock(product);
    }

    this.syncGateway.notifyProductUpdate(product);
  }

  getQueueStatus(): {
    total: number;
    pending: number;
    synced: number;
    failed: number;
  } {
    const items = Array.from(this.syncQueue.values());
    return {
      total: items.length,
      pending: items.filter((i) => !i.synced && i.attempts < this.maxAttempts).length,
      synced: items.filter((i) => i.synced).length,
      failed: items.filter((i) => !i.synced && i.attempts >= this.maxAttempts).length,
    };
  }

  clearQueue(): void {
    this.syncQueue.clear();
  }

  async getUnsyncedSales(): Promise<Sale[]> {
    return await this.saleRepository.find({
      where: { synced: false },
      relations: ['items', 'seller'],
      order: { createdAt: 'ASC' },
    });
  }

  async batchSyncSales(saleIds: string[]): Promise<void> {
    await this.saleRepository.update(saleIds, { synced: true });

    const sales = await this.saleRepository.find({
      where: saleIds.map((id) => ({ id })),
      relations: ['items', 'seller'],
    });

    sales.forEach((sale) => {
      this.syncGateway.notifyNewSale(sale);
    });
  }
}
