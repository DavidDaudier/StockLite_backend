import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new ConflictException('Un produit avec ce SKU existe déjà');
    }

    const product = this.productRepository.create(createProductDto);
    return await this.productRepository.save(product);
  }

  async findAll(search?: string, category?: string): Promise<Product[]> {
    const where: any = {};

    if (search) {
      return await this.productRepository.find({
        where: [
          { name: Like(`%${search}%`) },
          { sku: Like(`%${search}%`) },
          { barcode: Like(`%${search}%`) },
        ],
      });
    }

    if (category) {
      where.category = category;
    }

    // Retourne tous les produits (actifs et inactifs)
    return await this.productRepository.find({ where });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { sku, isActive: true },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });

      if (existingProduct) {
        throw new ConflictException('Un produit avec ce SKU existe déjà');
      }
    }

    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.findOne(id);
    const newQuantity = product.quantity + quantity;

    if (newQuantity < 0) {
      throw new ConflictException('Stock insuffisant');
    }

    await this.productRepository.update(id, { quantity: newQuantity });
    return this.findOne(id);
  }

  async toggleStatus(id: string): Promise<Product> {
    // Chercher le produit sans filtre isActive
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    // Basculer le statut
    const newStatus = !product.isActive;
    await this.productRepository.update(id, { isActive: newStatus });

    // Retourner le produit mis à jour
    return await this.productRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.update(id, { isActive: false });
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await this.productRepository
      .createQueryBuilder('product')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.quantity <= product.minStock')
      .getMany();
  }
}
