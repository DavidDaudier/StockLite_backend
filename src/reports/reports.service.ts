import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale } from '../sales/sale.entity';
import { SaleItem } from '../sales/sale-item.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getDailySalesReport(date?: Date) {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.saleRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
      relations: ['items', 'items.product', 'seller'],
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discount), 0);
    const totalTax = sales.reduce((sum, sale) => sum + Number(sale.tax), 0);

    const paymentMethods = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod;
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 };
      }
      acc[method].count++;
      acc[method].total += Number(sale.total);
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return {
      date: targetDate.toISOString().split('T')[0],
      totalSales,
      totalRevenue,
      totalDiscount,
      totalTax,
      averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
      paymentMethods,
      sales,
    };
  }

  async getWeeklySalesReport(startDate?: Date) {
    const start = startDate || new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const sales = await this.saleRepository.find({
      where: {
        createdAt: Between(start, end),
      },
      relations: ['items', 'items.product', 'seller'],
    });

    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(start);
      dayStart.setDate(dayStart.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const daySales = sales.filter(
        (sale) => sale.createdAt >= dayStart && sale.createdAt <= dayEnd,
      );

      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        salesCount: daySales.length,
        revenue: daySales.reduce((sum, sale) => sum + Number(sale.total), 0),
      });
    }

    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      totalSales: sales.length,
      totalRevenue,
      averageDailyRevenue: totalRevenue / 7,
      dailyBreakdown,
    };
  }

  async getMonthlySalesReport(year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month !== undefined ? month : now.getMonth();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    const sales = await this.saleRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['items', 'items.product', 'seller'],
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discount), 0);

    const topProducts = await this.getTopSellingProducts(startDate, endDate);
    const topSellers = await this.getTopSellers(startDate, endDate);

    return {
      year: targetYear,
      month: targetMonth + 1,
      monthName: new Date(targetYear, targetMonth).toLocaleString('fr-FR', { month: 'long' }),
      totalSales,
      totalRevenue,
      totalDiscount,
      averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
      topProducts,
      topSellers,
    };
  }

  async getTopSellingProducts(startDate: Date, endDate: Date, limit = 10) {
    const result = await this.saleItemRepository
      .createQueryBuilder('saleItem')
      .select('saleItem.productId', 'productId')
      .addSelect('saleItem.productName', 'productName')
      .addSelect('SUM(saleItem.quantity)', 'total_quantity')
      .addSelect('SUM(saleItem.subtotal)', 'total_revenue')
      .addSelect('COUNT(DISTINCT saleItem.saleId)', 'sales_count')
      .innerJoin('saleItem.sale', 'sale')
      .where('sale.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('saleItem.productId')
      .addGroupBy('saleItem.productName')
      .orderBy('total_quantity', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalQuantity: parseInt(item.total_quantity),
      totalRevenue: parseFloat(item.total_revenue),
      salesCount: parseInt(item.sales_count),
    }));
  }

  async getTopSellers(startDate: Date, endDate: Date, limit = 10) {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('sale.sellerId', 'sellerId')
      .addSelect('user.fullName', 'sellerName')
      .addSelect('COUNT(sale.id)', 'totalSales')
      .addSelect('SUM(sale.total)', 'totalRevenue')
      .innerJoin('sale.seller', 'user')
      .where('sale.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('sale.sellerId')
      .addGroupBy('user.fullName')
      .orderBy('totalRevenue', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      totalSales: parseInt(item.totalSales),
      totalRevenue: parseFloat(item.totalRevenue),
    }));
  }

  async getInventoryReport() {
    const products = await this.productRepository.find({
      where: { isActive: true },
      order: { quantity: 'ASC' },
    });

    const totalProducts = products.length;
    const totalStockValue = products.reduce(
      (sum, product) => sum + Number(product.price) * product.quantity,
      0,
    );

    const lowStockProducts = products.filter((p) => p.quantity <= p.minStock);
    const outOfStockProducts = products.filter((p) => p.quantity === 0);

    const categoryBreakdown = products.reduce((acc, product) => {
      const category = product.category || 'Sans catégorie';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalQuantity: 0,
          totalValue: 0,
        };
      }
      acc[category].count++;
      acc[category].totalQuantity += product.quantity;
      acc[category].totalValue += Number(product.price) * product.quantity;
      return acc;
    }, {} as Record<string, { count: number; totalQuantity: number; totalValue: number }>);

    return {
      totalProducts,
      totalStockValue,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      categoryBreakdown,
      lowStockProducts,
      outOfStockProducts,
    };
  }

  async getFinancialReport(startDate: Date, endDate: Date) {
    const sales = await this.saleRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['items', 'items.product'],
    });

    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
    const totalCost = sales.reduce((sum, sale) => {
      const saleCost = sale.items.reduce((itemSum, item) => {
        const costPrice = item.product?.costPrice || 0;
        return itemSum + Number(costPrice) * item.quantity;
      }, 0);
      return sum + saleCost;
    }, 0);

    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const totalDiscount = sales.reduce((sum, sale) => sum + Number(sale.discount), 0);
    const totalTax = sales.reduce((sum, sale) => sum + Number(sale.tax), 0);

    return {
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      totalSales: sales.length,
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      totalDiscount,
      totalTax,
      netProfit: grossProfit - totalTax,
    };
  }
}
