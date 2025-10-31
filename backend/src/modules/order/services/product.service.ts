import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../product.entity';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from '../dto/product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Create a new product
   */
  async create(
    createProductDto: CreateProductDto,
    tenantId: string,
  ): Promise<Product> {
    // Check for duplicate slug
    const existing = await this.productRepository.findOne({
      where: { slug: createProductDto.slug, tenantId },
    });

    if (existing) {
      throw new ConflictException('Product with this slug already exists');
    }

    const product = this.productRepository.create({
      ...createProductDto,
      tenantId,
    });

    const saved = await this.productRepository.save(product);

    this.logger.log(`Created product ${saved.id} (${saved.name})`);

    return saved;
  }

  /**
   * Find all products with filters and pagination
   */
  async findAll(
    queryDto: ProductQueryDto,
    tenantId: string,
  ): Promise<{ data: Product[]; total: number; page: number; limit: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId });

    // Search
    if (queryDto.search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${queryDto.search}%` },
      );
    }

    // Filter by status
    if (queryDto.status) {
      queryBuilder.andWhere('product.status = :status', {
        status: queryDto.status,
      });
    }

    // Filter by type
    if (queryDto.productType) {
      queryBuilder.andWhere('product.productType = :productType', {
        productType: queryDto.productType,
      });
    }

    // Filter by category
    if (queryDto.category) {
      queryBuilder.andWhere(':category = ANY(product.categories)', {
        category: queryDto.category,
      });
    }

    // Filter by tag
    if (queryDto.tag) {
      queryBuilder.andWhere(':tag = ANY(product.tags)', {
        tag: queryDto.tag,
      });
    }

    // Filter by featured
    if (queryDto.featured !== undefined) {
      queryBuilder.andWhere('product.featured = :featured', {
        featured: queryDto.featured,
      });
    }

    // Pagination and sorting
    queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .skip(skip);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Find one product by ID
   */
  async findOne(id: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, tenantId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Increment view count
    await this.productRepository.increment({ id }, 'viewCount', 1);

    return product;
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug, tenantId },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    // Increment view count
    await this.productRepository.increment({ id: product.id }, 'viewCount', 1);

    return product;
  }

  /**
   * Update product
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    tenantId: string,
  ): Promise<Product> {
    const product = await this.findOne(id, tenantId);

    // Check for slug conflict
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existing = await this.productRepository.findOne({
        where: { slug: updateProductDto.slug, tenantId },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    Object.assign(product, updateProductDto);

    // Update published date if status changes to active
    if (
      updateProductDto.status === ProductStatus.ACTIVE &&
      !product.publishedAt
    ) {
      product.publishedAt = new Date();
    }

    return this.productRepository.save(product);
  }

  /**
   * Delete product
   */
  async remove(id: string, tenantId: string): Promise<void> {
    const product = await this.findOne(id, tenantId);
    await this.productRepository.softRemove(product);
    this.logger.log(`Deleted product ${id} (${product.name})`);
  }

  /**
   * Update inventory
   */
  async updateInventory(
    id: string,
    quantity: number,
    tenantId: string,
  ): Promise<Product> {
    const product = await this.findOne(id, tenantId);

    if (!product.trackInventory) {
      throw new ConflictException('Product does not track inventory');
    }

    product.inventoryQuantity += quantity;

    if (product.inventoryQuantity < 0) {
      product.inventoryQuantity = 0;
    }

    return this.productRepository.save(product);
  }

  /**
   * Check if product is in stock
   */
  async isInStock(
    id: string,
    quantity: number,
    tenantId: string,
  ): Promise<boolean> {
    const product = await this.findOne(id, tenantId);

    if (!product.trackInventory) {
      return true;
    }

    if (product.allowBackorder) {
      return true;
    }

    return product.inventoryQuantity >= quantity;
  }

  /**
   * Get product statistics
   */
  async getStats(tenantId: string): Promise<any> {
    const total = await this.productRepository.count({ where: { tenantId } });

    const byStatus = await this.productRepository
      .createQueryBuilder('product')
      .select('product.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('product.tenantId = :tenantId', { tenantId })
      .groupBy('product.status')
      .getRawMany();

    const lowStock = await this.productRepository
      .createQueryBuilder('product')
      .where('product.tenantId = :tenantId', { tenantId })
      .andWhere('product.trackInventory = true')
      .andWhere('product.inventoryQuantity <= product.lowStockThreshold')
      .andWhere('product.lowStockThreshold IS NOT NULL')
      .getCount();

    const totalRevenue = await this.productRepository
      .createQueryBuilder('product')
      .select('SUM(product.totalRevenue)', 'sum')
      .where('product.tenantId = :tenantId', { tenantId })
      .getRawOne()
      .then((result) => parseFloat(result.sum || '0'));

    return {
      total,
      byStatus,
      lowStock,
      totalRevenue,
    };
  }
}
