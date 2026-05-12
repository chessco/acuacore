import { Controller, Get, Post, Patch, Body, Param, Headers } from '@nestjs/common';
import { EcommerceService } from './ecommerce.service';

@Controller('ecommerce')
export class EcommerceController {
  constructor(private readonly ecommerceService: EcommerceService) {}

  @Get('products')
  findAllProducts(@Headers('x-tenant-id') tenantId: string) {
    return this.ecommerceService.findAllProducts(tenantId);
  }

  @Post('products/generate-description')
  generateDescription(@Body('imageUrl') imageUrl: string, @Body('sector') sector: string) {
    return this.ecommerceService.generateProductDescription(imageUrl, sector);
  }

  @Post('products')
  createProduct(@Headers('x-tenant-id') tenantId: string, @Body() data: any) {
    return this.ecommerceService.createProduct(tenantId, data);
  }

  @Patch('products/:id')
  updateProduct(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.ecommerceService.updateProduct(id, tenantId, data);
  }

  @Get('categories')
  findAllCategories(@Headers('x-tenant-id') tenantId: string) {
    return this.ecommerceService.findAllCategories(tenantId);
  }

  @Post('categories')
  createCategory(@Headers('x-tenant-id') tenantId: string, @Body('name') name: string) {
    return this.ecommerceService.createCategory(tenantId, name);
  }

  @Get('orders')
  findAllOrders(@Headers('x-tenant-id') tenantId: string) {
    return this.ecommerceService.findAllOrders(tenantId);
  }

  @Post('orders')
  createOrder(@Headers('x-tenant-id') tenantId: string, @Body() data: any) {
    return this.ecommerceService.createOrder(tenantId, data);
  }
}
