import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class EcommerceService {
  constructor(
    private db: DatabaseService,
    private ai: AiService
  ) {}

  async generateProductDescription(imageUrl: string, sector: string = 'retail') {
    const prompt = `Actúa como un experto en marketing y técnico especializado en el sector: ${sector.toUpperCase()}.
    Analiza la imagen adjunta de un producto y genera:
    1. Un nombre comercial atractivo.
    2. Una descripción detallada resaltando beneficios y especificaciones técnicas.
    3. 3 etiquetas clave (tags).
    
    Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
    {
      "suggestedName": "...",
      "description": "...",
      "tags": ["...", "...", "..."]
    }`;

    const result = await this.ai.analyzeVision(imageUrl, prompt);
    try {
      // Clean result in case of markdown blocks
      const jsonStr = result.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (err) {
      return { suggestedName: '', description: result, tags: [] };
    }
  }

  // PRODUCTS
  async findAllProducts(tenantId: string) {
    return this.db.mysql.product.findMany({
      where: { tenantId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(tenantId: string, data: any) {
    const { movements, ...productData } = data;
    const product = await this.db.mysql.product.create({
      data: {
        ...productData,
        tenantId,
      },
    });

    // Record initial stock as movement
    if (product.stock > 0) {
      await this.db.mysql.stockMovement.create({
        data: {
          productId: product.id,
          tenantId,
          type: 'IN',
          quantity: product.stock,
          reason: 'Initial stock',
        }
      });
    }

    return product;
  }

  async updateProduct(id: string, tenantId: string, data: any) {
    const { movements, ...productData } = data;
    return this.db.mysql.product.update({
      where: { id, tenantId },
      data: productData,
    });
  }

  async adjustStock(tenantId: string, productId: string, quantity: number, type: 'IN' | 'OUT' | 'ADJUSTMENT', reason: string, userId?: string) {
    const product = await this.db.mysql.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    const newStock = type === 'IN' ? product.stock + quantity : product.stock - quantity;

    return this.db.mysql.$transaction([
      this.db.mysql.product.update({
        where: { id: productId },
        data: { stock: newStock }
      }),
      this.db.mysql.stockMovement.create({
        data: {
          productId,
          tenantId,
          type,
          quantity,
          reason,
          userId
        }
      })
    ]);
  }

  async getMovements(tenantId: string, productId?: string) {
    return this.db.mysql.stockMovement.findMany({
      where: { 
        tenantId,
        productId: productId || undefined
      },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
      take: 50
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
    
    return this.db.mysql.$transaction(async (tx) => {
      const order = await tx.order.create({
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

      // Update stock and record movements for each item
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            tenantId,
            type: 'SALE',
            quantity: item.quantity,
            reason: `Orden #${order.id.slice(0,8)}`,
          }
        });
      }

      return order;
    });
  }

  // CURRENCY
  async getExchangeRate() {
    // In a real app, this would call a fixer.io or similar API
    return 17.50; // Mock rate USD to MXN
  }

  // STOREFRONT (Public)
  async findPublicProductsBySlug(slug: string) {
    const tenant = await this.db.mysql.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new Error('Tenant not found');
    return this.findAllProducts(tenant.id);
  }

  async findPublicCategoriesBySlug(slug: string) {
    const tenant = await this.db.mysql.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new Error('Tenant not found');
    return this.findAllCategories(tenant.id);
  }

  async getOrderStatus(orderId: string) {
    return this.db.mysql.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });
  }

  async createPublicOrder(slug: string, data: any) {
    const tenant = await this.db.mysql.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new Error('Tenant not found');
    return this.createOrder(tenant.id, data);
  }

  async createPaymentIntent(slug: string, amount: number) {
    const tenant = await this.db.mysql.tenant.findUnique({ where: { slug } });
    if (!tenant || !tenant.stripeApiKey) throw new Error('Payments not configured for this store');
    
    // Stripe integration would go here
    // const stripe = new Stripe(tenant.stripeApiKey);
    // return stripe.paymentIntents.create({ amount, currency: 'usd' });
    
    return { clientSecret: 'mock_secret_' + Math.random().toString(36).substring(7) };
  }
}
