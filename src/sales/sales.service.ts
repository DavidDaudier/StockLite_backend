import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale, SaleStatus } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ProductsService } from '../products/products.service';
import { getTodayRange } from '../common/utils/date.util';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    private productsService: ProductsService,
    private auditLogsService: AuditLogsService,
  ) {}

  async create(createSaleDto: CreateSaleDto, sellerId: string, request?: any): Promise<Sale> {
    let subtotal = 0;
    const saleItems: Partial<SaleItem>[] = [];

    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productId);

      if (product.quantity < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour le produit ${product.name}. Disponible: ${product.quantity}`,
        );
      }

      const itemDiscount = item.discount || 0;
      const itemSubtotal = item.quantity * item.unitPrice - itemDiscount;
      subtotal += itemSubtotal;

      saleItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
        subtotal: itemSubtotal,
      });

      await this.productsService.updateStock(product.id, -item.quantity);
    }

    const discount = createSaleDto.discount || 0;
    const tax = createSaleDto.tax || 0;
    const total = subtotal - discount + tax;

    const saleNumber = await this.generateSaleNumber();

    const sale = this.saleRepository.create({
      saleNumber,
      sellerId,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod: createSaleDto.paymentMethod,
      customerName: createSaleDto.customerName,
      customerPhone: createSaleDto.customerPhone,
      notes: createSaleDto.notes,
      clientSaleId: createSaleDto.clientSaleId,
      synced: false,
    });

    const savedSale = await this.saleRepository.save(sale);

    for (const item of saleItems) {
      item.saleId = savedSale.id;
      await this.saleItemRepository.save(item);
    }

    const fullSale = await this.findOne(savedSale.id);

    // Log the sale action
    try {
      await this.auditLogsService.create({
        userId: sellerId,
        username: fullSale.seller?.username || 'Unknown',
        role: fullSale.seller?.role || 'seller',
        action: 'sale',
        module: 'Vente',
        subject: `Vente ${saleNumber} - ${createSaleDto.items.length} produit(s)`,
        browser: request?.headers?.['user-agent'] || 'Unknown',
        ipAddress: request?.ip || 'Unknown',
        details: {
          after: {
            saleId: fullSale.id,
            saleNumber: fullSale.saleNumber,
            total: fullSale.total,
            itemCount: fullSale.items.length,
            paymentMethod: fullSale.paymentMethod
          }
        }
      });
    } catch (error) {
      console.error('Error logging sale action:', error);
    }

    return fullSale;
  }

  async findAll(
    sellerId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Sale[]> {
    const where: any = {};

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    return await this.saleRepository.find({
      where,
      relations: ['items', 'items.product', 'seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'seller'],
    });

    if (!sale) {
      throw new NotFoundException('Vente non trouvée');
    }

    return sale;
  }

  /**
   * Récupère toutes les ventes d'aujourd'hui
   *
   * Cette méthode utilise getTodayRange() pour garantir que seules
   * les ventes du jour actuel (de 00:00:00.000 à 23:59:59.999) sont retournées.
   *
   * @param sellerId - (Optionnel) ID du vendeur pour filtrer les ventes
   * @returns Promise<Sale[]> - Liste des ventes d'aujourd'hui
   */
  async getTodaySales(sellerId?: string): Promise<Sale[]> {
    // Utiliser la fonction utilitaire pour obtenir les limites exactes du jour
    const { startOfDay, endOfDay } = getTodayRange();

    console.log('📅 [getTodaySales] Récupération des ventes du jour:');
    console.log(`   - Début: ${startOfDay.toISOString()}`);
    console.log(`   - Fin: ${endOfDay.toISOString()}`);

    return this.findAll(sellerId, startOfDay, endOfDay);
  }

  async getSalesStats(sellerId?: string, startDate?: Date, endDate?: Date) {
    const sales = await this.findAll(sellerId, startDate, endDate);

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalProfit = sales.reduce((sum, sale) => {
      const profit = sale.items.reduce((itemSum, item) => {
        const costPrice = item.product?.costPrice || 0;
        return itemSum + (item.unitPrice - costPrice) * item.quantity;
      }, 0);
      return sum + profit;
    }, 0);

    return {
      totalSales,
      totalRevenue,
      totalProfit,
      averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
    };
  }

  private async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `SL${year}${month}${day}`;

    const lastSale = await this.saleRepository.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    let sequence = 1;
    if (lastSale && lastSale.saleNumber.startsWith(prefix)) {
      const lastSequence = parseInt(lastSale.saleNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  async markAsSynced(ids: string[]): Promise<void> {
    await this.saleRepository.update(ids, { synced: true });
  }

  // Draft management methods
  async getDrafts(sellerId: string): Promise<Sale[]> {
    return await this.saleRepository.find({
      where: { sellerId, status: SaleStatus.DRAFT },
      relations: ['items', 'items.product'],
      order: { updatedAt: 'DESC' },
    });
  }

  async createDraft(createSaleDto: CreateSaleDto, sellerId: string): Promise<Sale> {
    let subtotal = 0;
    const saleItems: Partial<SaleItem>[] = [];

    // Validate products exist and build items (without checking stock)
    for (const item of createSaleDto.items) {
      const product = await this.productsService.findOne(item.productId);

      const itemDiscount = item.discount || 0;
      const itemSubtotal = item.quantity * item.unitPrice - itemDiscount;
      subtotal += itemSubtotal;

      saleItems.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: itemDiscount,
        subtotal: itemSubtotal,
      });
    }

    const discount = createSaleDto.discount || 0;
    const tax = createSaleDto.tax || 0;
    const total = subtotal - discount + tax;

    const saleNumber = await this.generateSaleNumber();

    const sale = this.saleRepository.create({
      saleNumber,
      sellerId,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod: createSaleDto.paymentMethod,
      customerName: createSaleDto.customerName,
      customerPhone: createSaleDto.customerPhone,
      notes: createSaleDto.notes,
      clientSaleId: createSaleDto.clientSaleId,
      status: SaleStatus.DRAFT,
      synced: false,
    });

    const savedSale = await this.saleRepository.save(sale);

    for (const item of saleItems) {
      item.saleId = savedSale.id;
      await this.saleItemRepository.save(item);
    }

    return await this.findOne(savedSale.id);
  }

  async completeDraft(id: string): Promise<Sale> {
    const draft = await this.saleRepository.findOne({
      where: { id, status: SaleStatus.DRAFT },
      relations: ['items', 'items.product'],
    });

    if (!draft) {
      throw new NotFoundException('Brouillon non trouvé');
    }

    // Validate stock availability
    for (const item of draft.items) {
      const product = await this.productsService.findOne(item.productId);

      if (product.quantity < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour le produit ${product.name}. Disponible: ${product.quantity}`,
        );
      }
    }

    // Update stock for all items
    for (const item of draft.items) {
      await this.productsService.updateStock(item.productId, -item.quantity);
    }

    // Update status to completed
    draft.status = SaleStatus.COMPLETED;
    await this.saleRepository.save(draft);

    return await this.findOne(id);
  }

  async deleteDraft(id: string): Promise<void> {
    const draft = await this.saleRepository.findOne({
      where: { id, status: SaleStatus.DRAFT },
    });

    if (!draft) {
      throw new NotFoundException('Brouillon non trouvé');
    }

    await this.saleRepository.remove(draft);
  }

  async delete(id: string): Promise<void> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!sale) {
      throw new NotFoundException('Vente non trouvée');
    }

    // If sale is completed, restore stock for all items
    if (sale.status === SaleStatus.COMPLETED) {
      for (const item of sale.items) {
        await this.productsService.updateStock(item.productId, item.quantity);
      }
    }

    await this.saleRepository.remove(sale);
  }
}
