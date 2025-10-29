import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { SyncModule } from './sync/sync.module';
import { CategoriesModule } from './categories/categories.module';
import { ReportsModule } from './reports/reports.module';
import { AppInfoModule } from './app-info/app-info.module';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Sale } from './sales/sale.entity';
import { SaleItem } from './sales/sale-item.entity';
import { Category } from './categories/category.entity';
import { AppInfo } from './app-info/app-info.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'postgres' | 'mysql'>('DB_TYPE', 'postgres'),
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'stocklite'),
        password: configService.get<string>('DB_PASSWORD', 'stocklite123'),
        database: configService.get<string>('DB_DATABASE', 'stocklite_db'),
        entities: [User, Product, Sale, SaleItem, Category, AppInfo],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    SalesModule,
    CategoriesModule,
    ReportsModule,
    SyncModule,
    AppInfoModule,
  ],
})
export class AppModule {}
