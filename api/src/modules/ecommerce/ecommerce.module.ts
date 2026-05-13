import { Module } from '@nestjs/common';
import { EcommerceController } from './ecommerce.controller';
import { StorefrontController } from './storefront.controller';
import { EcommerceService } from './ecommerce.service';
import { DatabaseModule } from '../../common/database/database.module';
import { AiModule } from '../ai/ai.module';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [DatabaseModule, AiModule, CrmModule],
  controllers: [EcommerceController, StorefrontController],
  providers: [EcommerceService],
  exports: [EcommerceService],
})
export class EcommerceModule {}
