import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { SyncModule } from './sync/sync.module';
import { CategoriesModule } from './categories/categories.module';
import { ReportsModule } from './reports/reports.module';
import { AppInfoModule } from './app-info/app-info.module';
import { InventoriesModule } from './inventories/inventories.module';
import { SessionsModule } from './sessions/sessions.module';
import { SessionActivityMiddleware } from './common/middleware/session-activity.middleware';
import { User } from './users/user.entity';
import { Product } from './products/product.entity';
import { Sale } from './sales/sale.entity';
import { SaleItem } from './sales/sale-item.entity';
import { Category } from './categories/category.entity';
import { AppInfo } from './app-info/app-info.entity';
import { Inventory } from './inventories/inventory.entity';
import { InventoryItem } from './inventories/inventory-item.entity';
import { Session } from './sessions/session.entity';
import { ReceivedSheetConfigModule } from './received-sheet-config/received-sheet-config.module';
import { ReceivedSheetConfig } from './received-sheet-config/entities/received-sheet-config.entity';
import { DeletionRequestsModule } from './deletion-requests/deletion-requests.module';
import { DeletionRequest } from './deletion-requests/deletion-request.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<'postgres' | 'mysql'>('DB_TYPE', 'postgres'),
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'stocklite'),
        password: configService.get<string>('DB_PASSWORD', 'stocklite123'),
        database: configService.get<string>('DB_DATABASE', 'stocklite_db'),
        entities: [User, Product, Sale, SaleItem, Category, AppInfo, Inventory, InventoryItem, Session, ReceivedSheetConfig, DeletionRequest],
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
    InventoriesModule,
    SessionsModule,
    ReceivedSheetConfigModule,
    DeletionRequestsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionActivityMiddleware)
      .forRoutes('*'); // Applique le middleware à toutes les routes
  }
}
