import { EcommerceController } from './ecommerce.controller';
import { StorefrontController } from './storefront.controller';
import { EcommerceService } from './ecommerce.service';
import { DatabaseModule } from '../../common/database/database.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [EcommerceController, StorefrontController],
  providers: [EcommerceService],
  exports: [EcommerceService],
})
export class EcommerceModule {}
