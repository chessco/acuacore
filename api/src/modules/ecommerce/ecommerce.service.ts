import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class EcommerceService {
  constructor(private db: DatabaseService) {}

  // PRODUCTS
  async findAllProducts(tenantId: string) {
    return this.db.mysql.product.findMany({
      where: { tenantId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(tenantId: string, data: any) {
    return this.db.mysql.product.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async updateProduct(id: string, tenantId: string, data: any) {
    return this.db.mysql.product.update({
      where: { id, tenantId },
      data,
    });
  }

  // CATEGORIES
  async findAllCategories(tenantId: string) {
    return this.db.mysql.category.findMany({
      where: { tenantId },
    });
  }

  async createCategory(tenantId: string, name: string) {
    return this.db.mysql.category.create({
      data: { name, tenantId },
    });
  }

  // ORDERS
  async findAllOrders(tenantId: string) {
    return this.db.mysql.order.findMany({
      where: { tenantId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrder(tenantId: string, data: any) {
    const { items, ...orderData } = data;
    return this.db.mysql.order.create({
      data: {
        ...orderData,
        tenantId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });
  }
}
