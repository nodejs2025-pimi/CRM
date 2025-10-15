import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { EstablishmentModule } from './establishment/establishment.module';

@Module({
  imports: [UserModule, ProductModule, OrderModule, EstablishmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
