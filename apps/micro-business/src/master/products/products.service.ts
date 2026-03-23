import { HttpStatus, Injectable, Logger, HttpException } from '@nestjs/common';
import { TenantService } from '@/tenant/tenant.service';
import { enum_product_status_type, enum_unit_type, PrismaClient } from '@repo/prisma-shared-schema-tenant';
import {
  ICreateProduct,
  IProductInfo,
  IUpdateProduct,
} from './interface/products.interface';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import QueryParams from '@/common/libs/paginate.query';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { isUUID } from 'class-validator';
import { ERROR_MISSING_BU_CODE, ERROR_MISSING_TENANT_ID, ERROR_MISSING_USER_ID } from '@/common/constant';
import order from '@/common/helpers/order_by';
import getPaginationParams from '@/common/helpers/pagination.params';
import {
  TryCatch,
  Result,
  ErrorCode,
  createProductCreateValidation,
  createProductUpdateValidation,
  ProductDetailResponseSchema,
  ProductListItemResponseSchema,
  ProductLocationListItemResponseSchema,
  ProductItemGroupResponseSchema,
} from '@/common';

@Injectable()
export class ProductsService {
  get bu_code(): string {
    if (this._bu_code) {
      return String(this._bu_code);
    }
    throw new HttpException(
      ERROR_MISSING_BU_CODE,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  get userId(): string {
    if (isUUID(this._userId, 4)) {
      return String(this._userId);
    }
    throw new HttpException(
      ERROR_MISSING_USER_ID,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  set bu_code(value: string) {
    this._bu_code = value;
  }

  set userId(value: string) {
    this._userId = value;
  }

  private _bu_code?: string;
  private _userId?: string;

  async initializePrismaService(bu_code: string, userId: string): Promise<void> {
    this._prismaService = await this.tenantService.prismaTenantInstance(bu_code, userId);
  }

  private _prismaService: PrismaClient | undefined;

  get prismaService(): PrismaClient {
    if (!this._prismaService) {
      throw new HttpException(
        'Prisma service is not initialized',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return this._prismaService;
  }

  private readonly logger: BackendLogger = new BackendLogger(
    ProductsService.name,
  );

  constructor(
    private readonly tenantService: TenantService,
  ) { }

  /**
   * Find a single product by ID with full details including locations, units, and category hierarchy
   * ค้นหารายการสินค้าเดียวตาม ID พร้อมรายละเอียดทั้งหมดรวมถึงสถานที่ หน่วย และลำดับชั้นหมวดหมู่
   * @param id - Product ID / ID ของสินค้า
   * @returns Product detail with related data or error if not found / รายละเอียดสินค้าพร้อมข้อมูลที่เกี่ยวข้อง หรือข้อผิดพลาดหากไม่พบ
   */
  @TryCatch
  async findOne(id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id: this.userId, tenant_id: this.bu_code },
      ProductsService.name,
    );


    const product = await this.prismaService.tb_product
      .findFirst({
        where: { id },
        include: {
          tb_unit: true,
        },
      })
      .then(async (res) => {
        const productLocation = await this.prismaService.tb_product_location.findMany({
          where: { product_id: res.id },
          include: {
            tb_location: true,
          },
        });

        const productOrderUnit = await this.prismaService.tb_unit_conversion.findMany({
          where: {
            product_id: res.id,
            unit_type: enum_unit_type.order_unit,
          },
        });

        const productIngredientUnit = await this.prismaService.tb_unit_conversion.findMany({
          where: {
            product_id: res.id,
            unit_type: enum_unit_type.ingredient_unit,
          },
        });

        let productItemGroup;
        let productSubCategory;
        let productCategory;

        if (res.product_item_group_id) {
          productItemGroup = await this.prismaService.tb_product_item_group.findFirst({
            where: {
              id: res.product_item_group_id,
            },
          });

          if (productItemGroup) {
            productSubCategory =
              await this.prismaService.tb_product_sub_category.findFirst({
                where: {
                  id: productItemGroup.product_subcategory_id,
                },
              });

            if (productSubCategory) {
              productCategory = await this.prismaService.tb_product_category.findFirst({
                where: {
                  id: productSubCategory.product_category_id,
                },
              });
            }
          }
        }

        if (!res) {
          throw new Error('Product not found');
        }

        return {
          id: res.id,
          code: res.code,
          barcode: res.barcode,
          sku: res.sku,
          name: res.name,
          local_name: res.local_name,
          description: res.description,
          product_status_type: res.product_status_type,
          inventory_unit: {
            id: res.inventory_unit_id,
            name: res.tb_unit?.name ?? res.inventory_unit_name,
          },
          is_sold_directly: res.is_sold_directly,
          is_used_in_recipe: res.is_used_in_recipe,
          price_deviation_limit: Number(res.price_deviation_limit),
          qty_deviation_limit: Number(res.qty_deviation_limit),
          tax_profile_id: res.tax_profile_id,
          tax_profile_name: res.tax_profile_name,
          tax_rate: Number(res.tax_rate),
          info: (res?.info as unknown as Record<string, unknown>)?.attributes ?? [],
          product_item_group: productItemGroup
            ? {
              id: productItemGroup.id,
              name: productItemGroup.name,
            }
            : {},
          locations:
            productLocation.map((location) => ({
              id: location.id,
              location_id: location.location_id,
              location_name: location.tb_location?.name,
              location_type: location.tb_location?.location_type,
              is_active: location.tb_location?.is_active,
              delivery_point_id: location.tb_location?.delivery_point_id,
              delivery_point: location.tb_location?.delivery_point_name,
            })) || [],
          order_units:
            productOrderUnit.map((orderUnit) => ({
              id: orderUnit.id,
              from_unit_id: orderUnit.from_unit_id,
              from_unit_name: orderUnit.from_unit_name,
              from_unit_qty: Number(orderUnit.from_unit_qty),
              to_unit_id: orderUnit.to_unit_id,
              to_unit_name: orderUnit.to_unit_name,
              to_unit_qty: Number(orderUnit.to_unit_qty),
              unit_type: orderUnit.unit_type,
              description: orderUnit.description,
              is_active: orderUnit.is_active,
              is_default: orderUnit.is_default,
            })) || [],
          ingredient_units:
            productIngredientUnit.map((ingredientUnit) => ({
              id: ingredientUnit.id,
              from_unit_id: ingredientUnit.from_unit_id,
              from_unit_name: ingredientUnit.from_unit_name,
              from_unit_qty: Number(ingredientUnit.from_unit_qty),
              to_unit_id: ingredientUnit.to_unit_id,
              to_unit_name: ingredientUnit.to_unit_name,
              to_unit_qty: Number(ingredientUnit.to_unit_qty),
              unit_type: ingredientUnit.unit_type,
              description: ingredientUnit.description,
              is_active: ingredientUnit.is_active,
              is_default: ingredientUnit.is_default,
            })) || [],
          product_sub_category: productSubCategory
            ? {
              id: productSubCategory.id,
              name: productSubCategory.name,
            }
            : {},
          product_category: productCategory
            ? {
              id: productCategory.id,
              name: productCategory.name,
            }
            : {},
        };
      });

    if (!product) {
      return Result.error('Product not found', ErrorCode.NOT_FOUND);
    }

    // Serialize response data
    const serializedProduct = ProductDetailResponseSchema.parse(product);

    return Result.ok(serializedProduct);
  }

  /**
   * Get products by location ID with pagination
   * ดึงรายการสินค้าตาม ID สถานที่พร้อมการแบ่งหน้า
   * @param location_id - Location ID / ID ของสถานที่
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   * @returns Paginated list of products at the location / รายการสินค้าที่สถานที่พร้อมการแบ่งหน้า
   */
  @TryCatch
  async getByLocationId(
    location_id: string,
    paginate: IPaginate,
    version: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      {
        function: 'getByLocationId',
        user_id: this.userId,
        tenant_id: this.bu_code,
        location_id,
        paginate,
        version,
      },
      ProductsService.name,
    );
    const defaultSearchFields = ['name', 'code', 'local_name'];

    const q = new QueryParams(
      paginate.page,
      paginate.perpage,
      paginate.search,
      defaultSearchFields,
      typeof paginate.filter === 'object' && !Array.isArray(paginate.filter) ? paginate.filter as any : {},
      paginate.sort,
      paginate.advance,
    );

    const products = await this.prismaService.tb_product
      .findMany({
        ...q.findMany(),
        where: {
          ...q.where(),
          tb_product_location: {
            some: {
              location_id: location_id,
            },
          },
        },
        include: {
          tb_unit: true,
        },
      })
      .then(async (res) => {
        const products = await Promise.all(
          res.map(async (product) => {
            return {
              id: product.id,
              name: product.name,
              code: product.code,
              inventory_unit: {
                id: product.inventory_unit_id,
                name: product.tb_unit?.name ?? product.inventory_unit_name,
              },
            };
          }),
        );
        return products;
      });

    const total = await this.prismaService.tb_product.count({
      where: {
        ...q.where(),
        tb_product_location: {
          some: {
            location_id: location_id,
          },
        },
      },
    });

    // Serialize response data
    const serializedProducts = products.map((product) => ProductLocationListItemResponseSchema.parse(product));

    return Result.ok({
      paginate: {
        total: total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? 1 : q.perpage,
        pages: total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
      data: serializedProducts,
    });
  }

  /**
   * Find all products with pagination, search, and sorting
   * ค้นหารายการสินค้าทั้งหมดพร้อมการแบ่งหน้า ค้นหา และเรียงลำดับ
   * @param paginate - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @returns Paginated list of products with category hierarchy / รายการสินค้าพร้อมลำดับชั้นหมวดหมู่และการแบ่งหน้า
   */
  @TryCatch
  async findAll(
    paginate: IPaginate,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id: this.userId, tenant_id: this.bu_code, paginate },
      ProductsService.name,
    );
    const defaultSearchFields = ['name', 'code', 'local_name'];

    const q = new QueryParams(
      paginate.page,
      paginate.perpage,
      paginate.search,
      paginate.searchfields,
      defaultSearchFields,
      typeof paginate.filter === 'object' && !Array.isArray(paginate.filter) ? paginate.filter : {},
      paginate.sort,
      paginate.advance,
    );

    const pagination = getPaginationParams(q.page, q.perpage);
    const whereClause = q.where();

    const [data, total] = await Promise.all([
      this.prismaService.tb_product.findMany({
        where: whereClause,
        orderBy: q.orderBy(),
        ...pagination,
        select: {
          id: true,
          code: true,
          name: true,
          local_name: true,
          description: true,
          product_status_type: true,
          inventory_unit_id: true,
          inventory_unit_name: true,
          tb_unit: {
            select: { id: true, name: true },
          },
          tb_product_item_group: {
            select: {
              id: true,
              name: true,
              tb_product_sub_category: {
                select: {
                  id: true,
                  name: true,
                  tb_product_category: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prismaService.tb_product.count({ where: whereClause }),
    ]);

    const products = data.map((product) => {
      const itemGroup = product.tb_product_item_group;
      const subCategory = itemGroup?.tb_product_sub_category;
      const category = subCategory?.tb_product_category;

      return {
        id: product.id,
        code: product.code,
        name: product.name,
        local_name: product.local_name,
        description: product.description,
        product_status_type: product.product_status_type,
        inventory_unit_id: product.inventory_unit_id,
        inventory_unit_name: product.inventory_unit_name || product.tb_unit?.name,
        product_item_group: itemGroup
          ? { id: itemGroup.id, name: itemGroup.name }
          : {},
        product_sub_category: subCategory
          ? { id: subCategory.id, name: subCategory.name }
          : {},
        product_category: category
          ? { id: category.id, name: category.name }
          : {},
      };
    });

    // Serialize response data
    const serializedProducts = products.map((product) => ProductListItemResponseSchema.parse(product));

    return Result.ok({
      paginate: {
        total: total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? 1 : q.perpage,
        pages: total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
      data: serializedProducts,
    });
  }

  /**
   * Find multiple products by their IDs
   * ค้นหารายการสินค้าหลายรายการตาม ID
   * @param ids - Array of product IDs / อาร์เรย์ของ ID สินค้า
   * @returns List of products matching the IDs / รายการสินค้าที่ตรงกับ ID
   */
  @TryCatch
  async findManyById(
    ids: string[],
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findManyById', ids, user_id: this.userId, tenant_id: this.bu_code },
      ProductsService.name,
    );

    const products = await this.prismaService.tb_product.findMany({
      where: {
        id: { in: ids },
      },
    });

    // Serialize response data
    const serializedProducts = products.map((product) => ProductListItemResponseSchema.parse(product));

    return Result.ok(serializedProducts);
  }

  /**
   * Create a new product with locations, order units, and ingredient units in a transaction
   * สร้างสินค้าใหม่พร้อมสถานที่ หน่วยสั่งซื้อ และหน่วยส่วนผสมในธุรกรรม
   * @param data - Product creation data / ข้อมูลสำหรับสร้างสินค้า
   * @returns Created product ID / ID ของสินค้าที่สร้างขึ้น
   */
  @TryCatch
  async create(
    data: ICreateProduct,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id: this.userId, tenant_id: this.bu_code },
      ProductsService.name,
    );

    // Validate using factory function
    const validationSchema = createProductCreateValidation(this.prismaService);
    const validationResult = await validationSchema.safeParseAsync(data);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return Result.error(`Validation failed: ${errorMessages}`, ErrorCode.VALIDATION_FAILURE);
    }

    // Business validation: check duplicate name/code
    const foundProduct = await this.prismaService.tb_product.findFirst({
      where: {
        OR: [
          { name: data.name },
          { code: data.code }
        ]
      },
    });

    if (foundProduct) {
      return Result.error('Product already exists', ErrorCode.ALREADY_EXISTS);
    }

    // Check for duplicate locations in the request
    if (data.locations?.add) {
      const locationIds = data.locations.add.map((location) => location.location_id);
      if (new Set(locationIds).size !== locationIds.length) {
        return Result.error('Add Location duplicate', ErrorCode.ALREADY_EXISTS);
      }
    }

    // Get inventory unit name for denormalization
    const inventoryUnit = await this.prismaService.tb_unit.findFirst({
      where: { id: data.inventory_unit_id },
    });

    const tx = await this.prismaService.$transaction(async (prisma) => {
      const productObject: ICreateProduct = {
        ...data,
        inventory_unit_name: inventoryUnit.name,
      };
      const info = { ...productObject.product_info as IProductInfo }
      delete productObject.product_info;
      delete productObject.locations;
      delete productObject.order_units;
      delete productObject.ingredient_units;

      const createProduct = await prisma.tb_product.create({
        data: {
          ...productObject,
          ...info,
          created_by_id: this.userId,
        },
      });

      if (data.locations?.add?.length > 0) {
        const productLocationObj = data.locations?.add?.map((location) => ({
          location_id: location.location_id,
          product_id: createProduct.id,
        }));

        await prisma.tb_product_location.createMany({
          data: productLocationObj,
        });
      }

      if (data.order_units?.add?.length > 0) {
        const productOrderUnitObj = await Promise.all(
          data.order_units.add.map(async (orderUnit) => {
            const fromUnit = await prisma.tb_unit.findFirst({
              where: {
                id: orderUnit.from_unit_id,
              },
            });

            const toUnit = await prisma.tb_unit.findFirst({
              where: {
                id: orderUnit.to_unit_id,
              },
            });

            return {
              product_id: createProduct.id,
              from_unit_id: orderUnit.from_unit_id,
              from_unit_name: fromUnit.name,
              from_unit_qty: orderUnit.from_unit_qty,
              to_unit_id: orderUnit.to_unit_id,
              to_unit_name: toUnit.name,
              to_unit_qty: orderUnit.to_unit_qty,
              unit_type: enum_unit_type.order_unit,
              description: orderUnit.description ?? null,
              is_active: true,
              is_default: orderUnit.is_default ?? false,
              created_by_id: this.userId
            };
          }),
        );

        await prisma.tb_unit_conversion.createMany({
          data: productOrderUnitObj,
        });
      }

      if (data.ingredient_units?.add?.length > 0) {
        const productIngredientUnitObj = await Promise.all(
          data.ingredient_units.add.map(async (ingredientUnit) => {
            const fromUnit = await prisma.tb_unit.findFirst({
              where: {
                id: ingredientUnit.from_unit_id,
              },
            });

            const toUnit = await prisma.tb_unit.findFirst({
              where: {
                id: ingredientUnit.to_unit_id,
              },
            });

            return {
              product_id: createProduct.id,
              from_unit_id: ingredientUnit.from_unit_id,
              from_unit_name: fromUnit.name,
              from_unit_qty: ingredientUnit.from_unit_qty,
              to_unit_id: ingredientUnit.to_unit_id,
              to_unit_name: toUnit.name,
              to_unit_qty: ingredientUnit.to_unit_qty,
              unit_type: enum_unit_type.ingredient_unit,
              description: ingredientUnit.description ?? null,
              is_active: true,
              is_default: ingredientUnit.is_default ?? false,
              created_by_id: this.userId,
            };
          }),
        );

        await prisma.tb_unit_conversion.createMany({
          data: productIngredientUnitObj,
        });
      }

      return { id: createProduct.id };
    });

    return Result.ok(tx);
  }

  /**
   * Update an existing product with locations, order units, and ingredient units in a transaction
   * อัปเดตสินค้าที่มีอยู่พร้อมสถานที่ หน่วยสั่งซื้อ และหน่วยส่วนผสมในธุรกรรม
   * @param data - Product update data / ข้อมูลสำหรับอัปเดตสินค้า
   * @returns Updated product ID / ID ของสินค้าที่อัปเดต
   */
  @TryCatch
  async update(
    data: IUpdateProduct,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', data, user_id: this.userId, tenant_id: this.bu_code },
      ProductsService.name,
    );

    // Validate using factory function
    const validationSchema = createProductUpdateValidation(this.prismaService);
    const validationResult = await validationSchema.safeParseAsync(data);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return Result.error(`Validation failed: ${errorMessages}`, ErrorCode.VALIDATION_FAILURE);
    }

    // Check if product exists
    const product = await this.prismaService.tb_product.findFirst({
      where: { id: data.id },
    });

    if (!product) {
      return Result.error('Product not found', ErrorCode.NOT_FOUND);
    }

    // Business validation: check duplicate name/code
    if (data.name || data.code) {
      const foundProduct = await this.prismaService.tb_product.findFirst({
        where: {
          name: data.name ?? product.name,
          code: data.code ?? product.code,
          id: { not: data.id },
        },
      });

      if (foundProduct) {
        return Result.error('Product already exists', ErrorCode.ALREADY_EXISTS);
      }
    }

    // Business validation: check if locations already exist for product
    if (data.locations?.add) {
      const productLocation = await this.prismaService.tb_product_location.findMany({
        where: {
          product_id: data.id,
          location_id: { in: data.locations.add.map((location) => location.location_id) },
        },
      });

      if (productLocation.length > 0) {
        return Result.error('Add Location already exists', ErrorCode.ALREADY_EXISTS);
      }
    }

    // Business validation: check if product locations to remove exist
    if (data.locations?.remove) {
      const locationIds = data.locations.remove.map((l) => l.location_id);
      const existingLocations = await this.prismaService.tb_product_location.findMany({
        where: { product_id: data.id, location_id: { in: locationIds } },
      });

      if (existingLocations.length !== locationIds.length) {
        return Result.error('Remove Location not found', ErrorCode.NOT_FOUND);
      }
    }

    // Business validation: check if order units to update/remove exist
    if (data.order_units?.update) {
      const orderUnitIds = data.order_units.update.map((u) => u.product_order_unit_id);
      const existingOrderUnits = await this.prismaService.tb_unit_conversion.findMany({
        where: { id: { in: orderUnitIds } },
      });

      if (existingOrderUnits.length !== orderUnitIds.length) {
        return Result.error('Update Order Unit not found', ErrorCode.NOT_FOUND);
      }
    }

    if (data.order_units?.remove) {
      const orderUnitIds = data.order_units.remove.map((u) => u.product_order_unit_id);
      const existingOrderUnits = await this.prismaService.tb_unit_conversion.findMany({
        where: { id: { in: orderUnitIds } },
      });

      if (existingOrderUnits.length !== orderUnitIds.length) {
        return Result.error('Remove Order Unit not found', ErrorCode.NOT_FOUND);
      }
    }

    // Business validation: check if ingredient units to update/remove exist
    if (data.ingredient_units?.update) {
      const ingredientUnitIds = data.ingredient_units.update.map((u) => u.product_ingredient_unit_id);
      const existingIngredientUnits = await this.prismaService.tb_unit_conversion.findMany({
        where: { id: { in: ingredientUnitIds } },
      });

      if (existingIngredientUnits.length !== ingredientUnitIds.length) {
        return Result.error('Update Ingredient Unit not found', ErrorCode.NOT_FOUND);
      }
    }

    if (data.ingredient_units?.remove) {
      const ingredientUnitIds = data.ingredient_units.remove.map((u) => u.product_ingredient_unit_id);
      const existingIngredientUnits = await this.prismaService.tb_unit_conversion.findMany({
        where: { id: { in: ingredientUnitIds } },
      });

      if (existingIngredientUnits.length !== ingredientUnitIds.length) {
        return Result.error('Remove Ingredient Unit not found', ErrorCode.NOT_FOUND);
      }
    }

    // Get inventory unit name for denormalization
    let inventoryUnitName: string | undefined;
    if (data.inventory_unit_id) {
      const inventoryUnit = await this.prismaService.tb_unit.findFirst({
        where: { id: data.inventory_unit_id },
      });
      inventoryUnitName = inventoryUnit?.name;
    }

    const tx = await this.prismaService.$transaction(async (prisma) => {
      const productObject: IUpdateProduct = { ...data };
      delete productObject.id;
      if (data.inventory_unit_id) {
        productObject.inventory_unit_name = inventoryUnitName;
      }
      const info = { ...productObject.product_info as IProductInfo }
      delete productObject.product_info;
      delete productObject.locations;
      delete productObject.order_units;
      delete productObject.ingredient_units;

      if (Object.keys(productObject).length > 0) {
        productObject.id = data.id;

        await prisma.tb_product.update({
          where: {
            id: data.id,
          },
          data: {
            ...productObject,
            ...info,
            updated_by_id: this.userId,
          },
        });
      }

      if (data.product_info) {
        const productInfoObject: IProductInfo = { ...data.product_info };

        if (productInfoObject.info) {
          productInfoObject.info = {
            attributes: productInfoObject.info,
          };
        }
      }

      if (data.locations) {
        if (data.locations.add.length > 0) {
          const productLocationAddObj = data.locations?.add?.map(
            (location) => ({
              location_id: location.location_id,
              product_id: data.id,
            }),
          );

          await prisma.tb_product_location.createMany({
            data: productLocationAddObj,
          });
        }

        if (data.locations.remove.length > 0) {
          const locationIds = data.locations?.remove?.map(
            (location) => location.location_id,
          );

          await prisma.tb_product_location.deleteMany({
            where: {
              product_id: data.id,
              location_id: { in: locationIds },
            },
          });
        }
      }

      if (data.order_units) {
        if (data.order_units.add.length > 0) {
          const productOrderUnitAddObj = await Promise.all(
            data.order_units.add.map(async (orderUnit) => {
              const fromUnit = await prisma.tb_unit.findFirst({
                where: { id: orderUnit.from_unit_id },
              });

              const toUnit = await prisma.tb_unit.findFirst({
                where: { id: orderUnit.to_unit_id },
              });

              return {
                product_id: data.id,
                from_unit_id: orderUnit.from_unit_id,
                from_unit_name: fromUnit.name,
                from_unit_qty: orderUnit.from_unit_qty,
                to_unit_id: orderUnit.to_unit_id,
                to_unit_name: toUnit.name,
                to_unit_qty: orderUnit.to_unit_qty,
                unit_type: enum_unit_type.order_unit,
                description: orderUnit.description ?? null,
                is_active: orderUnit.is_active ?? true,
                is_default: orderUnit.is_default ?? false,
                created_by_id: this.userId,
                created_at: new Date().toISOString()
              };
            }),
          );

          await prisma.tb_unit_conversion.createMany({
            data: productOrderUnitAddObj,
          });
        }

        if (data.order_units.update.length > 0) {
          await Promise.all(
            data.order_units.update.map(async (orderUnit) => {
              const productOrderUnit =
                await prisma.tb_unit_conversion.findFirst({
                  where: { id: orderUnit.product_order_unit_id },
                });

              const fromUnit = await prisma.tb_unit.findFirst({
                where: { id: orderUnit.from_unit_id },
              });

              const toUnit = await prisma.tb_unit.findFirst({
                where: { id: orderUnit.to_unit_id },
              });

              const data = {
                id: productOrderUnit.id,
                from_unit_id: fromUnit.id ?? productOrderUnit.from_unit_id,
                from_unit_name:
                  fromUnit.name ?? productOrderUnit.from_unit_name,
                from_unit_qty:
                  orderUnit.from_unit_qty ?? productOrderUnit.from_unit_qty,
                to_unit_id: toUnit.id ?? productOrderUnit.to_unit_id,
                to_unit_name: toUnit.name ?? productOrderUnit.to_unit_name,
                to_unit_qty:
                  orderUnit.to_unit_qty ?? productOrderUnit.to_unit_qty,
                description:
                  orderUnit.description ?? productOrderUnit.description,
                is_default: orderUnit.is_default ?? productOrderUnit.is_default,
                is_active: orderUnit.is_active ?? productOrderUnit.is_active,
                updated_by_id: this.userId,
              };

              await prisma.tb_unit_conversion.updateMany({
                where: { id: data.id },
                data: { ...data },
              });
            }),
          );
        }

        if (data.order_units.remove.length > 0) {
          const productOrderUnitIds = data.order_units?.remove?.map(
            (orderUnit) => orderUnit.product_order_unit_id,
          );

          await prisma.tb_unit_conversion.deleteMany({
            where: { id: { in: productOrderUnitIds } },
          });
        }
      }

      if (data.ingredient_units) {
        if (data.ingredient_units.add.length > 0) {
          const productIngredientUnitObj = await Promise.all(
            data.ingredient_units.add.map(async (ingredientUnit) => {
              const fromUnit = await prisma.tb_unit.findFirst({
                where: {
                  id: ingredientUnit.from_unit_id,
                },
              });

              const toUnit = await prisma.tb_unit.findFirst({
                where: {
                  id: ingredientUnit.to_unit_id,
                },
              });

              return {
                product_id: data.id,
                from_unit_id: ingredientUnit.from_unit_id,
                from_unit_name: fromUnit.name,
                from_unit_qty: ingredientUnit.from_unit_qty,
                to_unit_id: ingredientUnit.to_unit_id,
                to_unit_name: toUnit.name,
                to_unit_qty: ingredientUnit.to_unit_qty,
                unit_type: enum_unit_type.ingredient_unit,
                description: ingredientUnit.description ?? null,
                is_active: ingredientUnit.is_active ?? true,
                is_default: ingredientUnit.is_default ?? false,
                created_by_id: this.userId,
                created_at: new Date().toISOString(),
              };
            }),
          );

          await prisma.tb_unit_conversion.createMany({
            data: productIngredientUnitObj,
          });
        }

        if (data.ingredient_units.update.length > 0) {
          await Promise.all(
            data.ingredient_units.update.map(async (ingredientUnit) => {
              const productIngredientUnit =
                await prisma.tb_unit_conversion.findFirst({
                  where: { id: ingredientUnit.product_ingredient_unit_id },
                });

              const fromUnit = await prisma.tb_unit.findFirst({
                where: { id: ingredientUnit.from_unit_id },
              });

              const toUnit = await prisma.tb_unit.findFirst({
                where: { id: ingredientUnit.to_unit_id },
              });

              const data = {
                id: productIngredientUnit.id,
                from_unit_id: fromUnit.id ?? productIngredientUnit.from_unit_id,
                from_unit_name:
                  fromUnit.name ?? productIngredientUnit.from_unit_name,
                from_unit_qty:
                  ingredientUnit.from_unit_qty ??
                  productIngredientUnit.from_unit_qty,
                to_unit_id: toUnit.id ?? productIngredientUnit.to_unit_id,
                to_unit_name: toUnit.name ?? productIngredientUnit.to_unit_name,
                to_unit_qty:
                  ingredientUnit.to_unit_qty ??
                  productIngredientUnit.to_unit_qty,
                description:
                  ingredientUnit.description ??
                  productIngredientUnit.description,
                is_default:
                  ingredientUnit.is_default ?? productIngredientUnit.is_default,
                is_active:
                  ingredientUnit.is_active ?? productIngredientUnit.is_active,
                updated_by_id: this.userId,
              };

              await prisma.tb_unit_conversion.updateMany({
                where: { id: data.id },
                data: { ...data },
              });
            }),
          );
        }

        if (data.ingredient_units.remove.length > 0) {
          const productIngredientUnitIds = data.ingredient_units?.remove?.map(
            (ingredientUnit) => ingredientUnit.product_ingredient_unit_id,
          );

          await prisma.tb_unit_conversion.deleteMany({
            where: { id: { in: productIngredientUnitIds } },
          });
        }
      }

      return { id: data.id };
    });

    return Result.ok(tx);
  }

  /**
   * Delete a product (soft delete) and deactivate related unit conversions
   * ลบสินค้า (ลบแบบซอฟต์) และปิดการใช้งานการแปลงหน่วยที่เกี่ยวข้อง
   * @param id - Product ID / ID ของสินค้า
   * @returns Deleted product ID / ID ของสินค้าที่ลบ
   */
  @TryCatch
  async delete(id: string): Promise<Result<unknown>> {
    this.logger.debug({ function: 'delete', id, user_id: this.userId, tenant_id: this.bu_code }, ProductsService.name);

    const product = await this.prismaService.tb_product.findFirst({
      where: {
        id,
      },
    });

    if (!product) {
      return Result.error('Product not found', ErrorCode.NOT_FOUND);
    }

    // await prisma.tb_product_info.delete({
    //   where: { product_id: product.id },
    // });

    // await prisma.tb_product_location.deleteMany({
    //   where: { product_id: product.id },
    // });

    await this.prismaService.tb_product.update({
      where: { id: product.id },
      data: {
        product_status_type: enum_product_status_type.inactive,
        updated_by_id: this.userId,
        deleted_at: new Date().toISOString(),
        deleted_by_id: this.userId,
      },
    });

    await this.prismaService.tb_unit_conversion.updateMany({
      where: { product_id: product.id },
      data: {
        is_active: false,
        updated_by_id: this.userId,
        deleted_at: new Date().toISOString(),
        deleted_by_id: this.userId,
      },
    });

    return Result.ok({ id });
  }

  /**
   * Find the item group hierarchy (item group, sub-category, category) by item group ID
   * ค้นหาลำดับชั้นกลุ่มสินค้า (กลุ่มสินค้า หมวดหมู่ย่อย หมวดหมู่) ตาม ID กลุ่มสินค้า
   * @param id - Product item group ID / ID ของกลุ่มสินค้า
   * @returns Item group with sub-category and category details / กลุ่มสินค้าพร้อมรายละเอียดหมวดหมู่ย่อยและหมวดหมู่
   */
  @TryCatch
  async findItemGroup(
    id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findItemGroup', id, user_id: this.userId, tenant_id: this.bu_code },
      ProductsService.name,
    );

    const productItemGroup = await this.prismaService.tb_product_item_group.findFirst({
      where: {
        id,
      },
    });

    const productSubCategory = await this.prismaService.tb_product_sub_category.findFirst({
      where: {
        id: productItemGroup.product_subcategory_id,
      },
    });

    const productCategory = await this.prismaService.tb_product_category.findFirst({
      where: {
        id: productSubCategory.product_category_id,
      },
    });

    const res = {
      product_item_group: productItemGroup
        ? {
          id: productItemGroup.id,
          name: productItemGroup.name,
        }
        : {},
      product_subcategory: productSubCategory
        ? {
          id: productSubCategory.id,
          name: productSubCategory.name,
        }
        : {},
      product_category: productCategory
        ? {
          id: productCategory.id,
          name: productCategory.name,
        }
        : {},
    };

    // Serialize response data
    const serializedRes = ProductItemGroupResponseSchema.parse(res);

    return Result.ok(serializedRes);
  }

  /**
   * Get last GRN detail by product ID and receiving date
   * ค้นหาใบรับสินค้าล่าสุดตาม ID สินค้าและวันที่รับ
   * @param product_id - Product ID / รหัสสินค้า
   * @param date - Receiving date (YYYY-MM-DD) / วันที่รับ
   * @returns Last GRN detail for this product / รายละเอียดใบรับสินค้าล่าสุด
   */
  @TryCatch
  async getLastPurchase(product_id: string, date: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'getLastPurchase', product_id, date, user_id: this.userId, tenant_id: this.bu_code },
      ProductsService.name,
    );

    const endDate = new Date(`${date}T23:59:59.999Z`);

    const grnDetail = await this.prismaService.tb_good_received_note_detail.findFirst({
      where: {
        product_id,
        tb_good_received_note: {
          grn_date: { lte: endDate },
          doc_status: 'committed',
          deleted_at: null,
        },
      },
      orderBy: {
        tb_good_received_note: { grn_date: 'desc' },
      },
      select: {
        id: true,
        good_received_note_id: true,
        product_id: true,
        product_code: true,
        product_name: true,
        product_local_name: true,
        location_id: true,
        location_name: true,
        tb_good_received_note: {
          select: {
            id: true,
            grn_no: true,
            grn_date: true,
            vendor_id: true,
            vendor_name: true,
            currency_code: true,
            exchange_rate: true,
          },
        },
        tb_good_received_note_detail_item: {
          select: {
            id: true,
            received_qty: true,
            received_unit_name: true,
            received_base_qty: true,
            sub_total_price: true,
            net_amount: true,
            total_price: true,
            base_total_price: true,
            tax_rate: true,
            tax_amount: true,
            discount_rate: true,
            discount_amount: true,
          },
        },
      },
    });

    if (!grnDetail) {
      return Result.error('No GRN found for this product', ErrorCode.NOT_FOUND);
    }

    const items = grnDetail.tb_good_received_note_detail_item.map((item) => ({
      id: item.id,
      received_qty: Number(item.received_qty),
      received_unit_name: item.received_unit_name,
      received_base_qty: Number(item.received_base_qty),
      sub_total_price: Number(item.sub_total_price),
      net_amount: Number(item.net_amount),
      total_price: Number(item.total_price),
      base_total_price: Number(item.base_total_price),
      tax_rate: Number(item.tax_rate),
      tax_amount: Number(item.tax_amount),
      discount_rate: Number(item.discount_rate),
      discount_amount: Number(item.discount_amount),
    }));

    return Result.ok({
      id: grnDetail.id,
      grn_id: grnDetail.good_received_note_id,
      grn_no: grnDetail.tb_good_received_note.grn_no,
      grn_date: grnDetail.tb_good_received_note.grn_date,
      vendor_id: grnDetail.tb_good_received_note.vendor_id,
      vendor_name: grnDetail.tb_good_received_note.vendor_name,
      currency_code: grnDetail.tb_good_received_note.currency_code,
      exchange_rate: Number(grnDetail.tb_good_received_note.exchange_rate),
      product_id: grnDetail.product_id,
      product_code: grnDetail.product_code,
      product_name: grnDetail.product_name,
      product_local_name: grnDetail.product_local_name,
      location_id: grnDetail.location_id,
      location_name: grnDetail.location_name,
      items,
    });
  }

  /**
   * Get on-hand quantity for a product, optionally filtered by location
   * ดึงจำนวนสินค้าคงเหลือ โดยกรองตามสถานที่ได้
   * @param product_id - Product ID / รหัสสินค้า
   * @param location_id - Optional location ID / รหัสสถานที่ (ไม่บังคับ)
   * @returns On-hand balance per location / ยอดคงเหลือตามสถานที่
   */
  @TryCatch
  async getOnHand(product_id: string, location_id?: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'getOnHand', product_id, location_id, user_id: this.userId, tenant_id: this.bu_code },
      ProductsService.name,
    );

    // Fetch product info with unit relation
    const product = await this.prismaService.tb_product.findFirst({
      where: { id: product_id, deleted_at: null },
      select: {
        id: true,
        code: true,
        name: true,
        local_name: true,
        sku: true,
        inventory_unit_id: true,
        inventory_unit_name: true,
        tb_unit: { select: { name: true } },
      },
    });

    if (!product) {
      return Result.error('Product not found', ErrorCode.NOT_FOUND);
    }

    // Fetch product-location settings (min/max qty)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plWhere: any = { product_id, deleted_at: null };
    if (location_id) plWhere.location_id = location_id;

    const productLocations = await this.prismaService.tb_product_location.findMany({
      where: plWhere,
      select: {
        location_id: true,
        location_name: true,
        min_qty: true,
        max_qty: true,
      },
    });
    const plMap = new Map(productLocations.map((pl) => [pl.location_id, pl]));

    // Fetch cost layers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layerWhere: any = { product_id, deleted_at: null };
    if (location_id) layerWhere.location_id = location_id;

    const layers = await this.prismaService.tb_inventory_transaction_cost_layer.findMany({
      where: layerWhere,
      select: {
        product_id: true,
        location_id: true,
        location_code: true,
        in_qty: true,
        out_qty: true,
        average_cost_per_unit: true,
      },
    });

    // Aggregate per location
    const balanceMap = new Map<string, {
      location_id: string | null;
      location_code: string | null;
      total_in: number;
      total_out: number;
      latest_avg_cost: number;
    }>();

    for (const layer of layers) {
      const key = layer.location_id || '_no_location_';
      const existing = balanceMap.get(key);
      if (existing) {
        existing.total_in += Number(layer.in_qty);
        existing.total_out += Number(layer.out_qty);
        existing.latest_avg_cost = Number(layer.average_cost_per_unit) || existing.latest_avg_cost;
      } else {
        balanceMap.set(key, {
          location_id: layer.location_id,
          location_code: layer.location_code,
          total_in: Number(layer.in_qty),
          total_out: Number(layer.out_qty),
          latest_avg_cost: Number(layer.average_cost_per_unit),
        });
      }
    }

    // Fetch last counted date per location from physical count details
    const locationIds = [...balanceMap.keys()].filter((k) => k !== '_no_location_');
    let lastCountedMap = new Map<string, Date>();
    if (locationIds.length > 0) {
      const lastCounted = await this.prismaService.tb_physical_count.findMany({
        where: {
          location_id: { in: locationIds },
          status: 'completed',
          deleted_at: null,
        },
        select: {
          location_id: true,
          completed_at: true,
        },
        orderBy: { completed_at: 'desc' },
      });
      for (const lc of lastCounted) {
        if (lc.completed_at && !lastCountedMap.has(lc.location_id)) {
          lastCountedMap.set(lc.location_id, lc.completed_at);
        }
      }
    }

    const locations = [...balanceMap.values()].map((item) => {
      const balance = item.total_in - item.total_out;
      const pl = item.location_id ? plMap.get(item.location_id) : undefined;
      return {
        location_id: item.location_id,
        location_name: pl?.location_name || null,
        on_hand_qty: balance,
        max_qty: pl ? Number(pl.max_qty) : 0,
        min_qty: pl ? Number(pl.min_qty) : 0,
        last_counted_date: item.location_id ? (lastCountedMap.get(item.location_id) || null) : null,
      };
    });

    const total_on_hand = locations.reduce((sum, loc) => sum + loc.on_hand_qty, 0);

    return Result.ok({
      product_id: product.id,
      product_code: product.code,
      product_name: product.name,
      product_local_name: product.local_name,
      inventory_unit_id: product.inventory_unit_id,
      inventory_unit_name: product.inventory_unit_name || product.tb_unit?.name,
      sku: product.sku,
      total_on_hand,
      locations,
    });
  }

  /**
   * Get on-order quantity for a product (ordered but not fully received)
   * ดึงจำนวนสินค้าที่สั่งซื้อแล้วแต่ยังไม่ได้รับครบ
   * @param product_id - Product ID / รหัสสินค้า
   * @returns On-order details per PO / รายละเอียดการสั่งซื้อที่ยังไม่ได้รับครบ
   */
  @TryCatch
  async getOnOrder(product_id: string): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'getOnOrder', product_id, user_id: this.userId, tenant_id: this.bu_code },
      ProductsService.name,
    );

    // Fetch product info
    const product = await this.prismaService.tb_product.findFirst({
      where: { id: product_id, deleted_at: null },
      select: {
        id: true,
        code: true,
        name: true,
        local_name: true,
        sku: true,
        inventory_unit_id: true,
        inventory_unit_name: true,
        tb_unit: { select: { name: true } },
      },
    });

    if (!product) {
      return Result.error('Product not found', ErrorCode.NOT_FOUND);
    }

    // Fetch PO details for active POs (in_progress, sent, partial)
    const poDetails = await this.prismaService.tb_purchase_order_detail.findMany({
      where: {
        product_id,
        deleted_at: null,
        tb_purchase_order: {
          po_status: { in: ['in_progress', 'sent', 'partial'] },
          deleted_at: null,
        },
      },
      select: {
        id: true,
        order_qty: true,
        received_qty: true,
        cancelled_qty: true,
        order_unit_name: true,
        price: true,
        tb_purchase_order: {
          select: {
            id: true,
            po_no: true,
            po_status: true,
            vendor_name: true,
            delivery_date: true,
          },
        },
      },
    });

    const orders = poDetails.map((detail) => {
      const orderQty = Number(detail.order_qty) || 0;
      const receivedQty = Number(detail.received_qty) || 0;
      const cancelledQty = Number(detail.cancelled_qty) || 0;
      const pendingQty = orderQty - receivedQty - cancelledQty;

      return {
        po_id: detail.tb_purchase_order?.id,
        po_no: detail.tb_purchase_order?.po_no,
        po_status: detail.tb_purchase_order?.po_status,
        vendor_name: detail.tb_purchase_order?.vendor_name,
        delivery_date: detail.tb_purchase_order?.delivery_date,
        order_qty: orderQty,
        received_qty: receivedQty,
        cancelled_qty: cancelledQty,
        pending_qty: pendingQty,
        unit_name: detail.order_unit_name,
        price: Number(detail.price) || 0,
      };
    });

    const total_on_order = orders.reduce((sum, o) => sum + o.pending_qty, 0);

    return Result.ok({
      product_id: product.id,
      product_code: product.code,
      product_name: product.name,
      product_local_name: product.local_name,
      inventory_unit_id: product.inventory_unit_id,
      inventory_unit_name: product.inventory_unit_name || product.tb_unit?.name,
      sku: product.sku,
      total_on_order,
      orders,
    });
  }
}
