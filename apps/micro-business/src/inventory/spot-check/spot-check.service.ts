import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient_SYSTEM } from '@repo/prisma-shared-schema-platform';
import { PrismaClient_TENANT, enum_spot_check_method } from '@repo/prisma-shared-schema-tenant';
import { TenantService } from '@/tenant/tenant.service';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { format } from 'date-fns';
import QueryParams from '@/libs/paginate.query';
import { IPaginate } from '@/common/shared-interface/paginate.interface';
import { BackendLogger } from '@/common/helpers/backend.logger';
import { Result, ErrorCode, TryCatch } from '@/common';
import { SpotCheckLogic } from './spot-check.logic';

@Injectable()
export class SpotCheckService {
  private readonly logger = new BackendLogger(SpotCheckService.name);

  constructor(
    @Inject('PRISMA_SYSTEM')
    private readonly prismaSystem: typeof PrismaClient_SYSTEM,
    @Inject('PRISMA_TENANT')
    private readonly prismaTenant: typeof PrismaClient_TENANT,
    @Inject('MASTER_SERVICE')
    private readonly masterService: ClientProxy,
    private readonly tenantService: TenantService,
    private readonly spotCheckLogic: SpotCheckLogic,
  ) { }

  private async getPrisma(user_id: string, tenant_id: string) {
    const tenant = await this.tenantService.getdb_connection(
      user_id,
      tenant_id,
    );
    if (!tenant) return null;
    return this.prismaTenant(tenant.tenant_id, tenant.db_connection);
  }

  @TryCatch
  async findOne(
    id: string,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findOne', id, user_id, tenant_id },
      SpotCheckService.name,
    );

    const prisma = await this.getPrisma(user_id, tenant_id);
    if (!prisma) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const spotCheck = await prisma.tb_spot_check.findFirst({
      where: { id },
      include: {
        tb_location: { select: { id: true, name: true, code: true } },
        tb_spot_check_detail: {
          where: { deleted_at: null },
          orderBy: { sequence_no: 'asc' },
          include: {
            tb_product: { select: { id: true, name: true, code: true } },
          },
        },
      },
    });

    if (!spotCheck) {
      return Result.error('Spot check not found', ErrorCode.NOT_FOUND);
    }

    return Result.ok(spotCheck);
  }

  @TryCatch
  async findAll(
    user_id: string,
    tenant_id: string,
    paginate: IPaginate,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'findAll', user_id, tenant_id, paginate },
      SpotCheckService.name,
    );

    const defaultSearchFields = ['spot_check_no', 'location_name'];
    const q = new QueryParams(
      paginate.page,
      paginate.perpage,
      paginate.search,
      paginate.searchfields,
      defaultSearchFields,
      paginate.filter,
      paginate.sort,
      paginate.advance,
    );

    const prisma = await this.getPrisma(user_id, tenant_id);
    if (!prisma) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const [data, total] = await Promise.all([
      prisma.tb_spot_check.findMany({
        where: q.where(),
        orderBy: q.orderBy(),
        skip: q.perpage < 0 ? undefined : (q.page - 1) * q.perpage,
        take: q.perpage < 0 ? undefined : q.perpage,
        include: {
          tb_location: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.tb_spot_check.count({ where: q.where() }),
    ]);

    return Result.ok({
      data,
      paginate: {
        total,
        page: q.perpage < 0 ? 1 : q.page,
        perpage: q.perpage < 0 ? total : q.perpage,
        pages:
          total === 0 || q.perpage < 0 ? 1 : Math.ceil(total / q.perpage),
      },
    });
  }

  @TryCatch
  async create(
    data: {
      location_id: string;
      method?: enum_spot_check_method;
      items?: number;
      product_id?: string[];
      description?: string;
      note?: string;
    },
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'create', data, user_id, tenant_id },
      SpotCheckService.name,
    );

    const prisma = await this.getPrisma(user_id, tenant_id);
    if (!prisma) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const location = await prisma.tb_location.findFirst({
      where: { id: data.location_id },
      select: { id: true, name: true, code: true },
    });
    if (!location) {
      return Result.error('Location not found', ErrorCode.NOT_FOUND);
    }

    const allProducts = await this.spotCheckLogic.getProductsByLocation(
      prisma,
      data.location_id,
    );
    const productTotal = allProducts.length;

    if (productTotal === 0) {
      return Result.error(
        'No products found at this location',
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    let selectedProducts;
    const method = data.method || 'random';
    const productCount = data.items || productTotal;

    switch (method) {
      case 'random': {
        const count = Math.min(productCount, productTotal);
        selectedProducts = this.spotCheckLogic.selectRandom(
          allProducts,
          count,
        );
        break;
      }
      case 'manual': {
        if (
          !data.product_id ||
          !Array.isArray(data.product_id) ||
          data.product_id.length === 0
        ) {
          return Result.error(
            'product_id is required for manual selection',
            ErrorCode.INVALID_ARGUMENT,
          );
        }
        const manualIds = data.product_id;
        selectedProducts = this.spotCheckLogic.selectManual(
          allProducts,
          manualIds,
        );
        if (selectedProducts.length === 0) {
          return Result.error(
            'None of the selected products were found at this location',
            ErrorCode.INVALID_ARGUMENT,
          );
        }
        break;
      }
      case 'high_value': {
        return Result.error(
          'high_value method is not yet implemented',
          ErrorCode.INVALID_ARGUMENT,
        );
      }
      default:
        return Result.error(
          `Invalid method: ${method}`,
          ErrorCode.INVALID_ARGUMENT,
        );
    }

    const spotCheckNo = await this.generateSCNo(
      new Date().toISOString(),
      tenant_id,
      user_id,
    );

    const spotCheck = await prisma.tb_spot_check.create({
      data: {
        spot_check_no: spotCheckNo,
        location_id: location.id,
        location_name: location.name,
        location_code: location.code,
        method: method,
        size: selectedProducts.length,
        description: data.description,
        note: data.note,
        doc_status: 'pending',
        created_by_id: user_id,
      },
    });

    const detailData = this.spotCheckLogic.buildDetailCreateData(
      selectedProducts,
      spotCheck.id,
      user_id,
    );
    for (const detail of detailData) {
      await prisma.tb_spot_check_detail.create({ data: detail });
    }

    return Result.ok({ id: spotCheck.id });
  }

  @TryCatch
  async update(
    id: string,
    data: {
      description?: string;
      note?: string;
    },
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'update', id, data, user_id, tenant_id },
      SpotCheckService.name,
    );

    const prisma = await this.getPrisma(user_id, tenant_id);
    if (!prisma) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const spotCheck = await prisma.tb_spot_check.findFirst({
      where: { id, deleted_at: null },
    });
    if (!spotCheck) {
      return Result.error('Spot check not found', ErrorCode.NOT_FOUND);
    }

    if (spotCheck.doc_status !== 'pending') {
      return Result.error(
        'Only pending spot checks can be updated',
        ErrorCode.INVALID_ARGUMENT,
      );
    }

    const updated = await prisma.tb_spot_check.update({
      where: { id },
      data: {
        description: data.description,
        note: data.note,
        updated_by_id: user_id,
        updated_at: new Date(),
      },
    });

    return Result.ok(updated);
  }

  @TryCatch
  async delete(
    id: string,
    user_id: string,
    tenant_id: string,
  ): Promise<Result<unknown>> {
    this.logger.debug(
      { function: 'delete', id, user_id, tenant_id },
      SpotCheckService.name,
    );

    const prisma = await this.getPrisma(user_id, tenant_id);
    if (!prisma) return Result.error('Tenant not found', ErrorCode.NOT_FOUND);

    const spotCheck = await prisma.tb_spot_check.findFirst({
      where: { id },
    });
    if (!spotCheck) {
      return Result.error('Spot check not found', ErrorCode.NOT_FOUND);
    }

    await prisma.tb_spot_check.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        deleted_by_id: user_id,
      },
    });

    return Result.ok({ id });
  }

  private async generateSCNo(
    scDate: string,
    bu_code: string,
    user_id: string,
  ): Promise<string> {
    this.logger.debug(
      { function: 'generateSCNo', scDate, bu_code, user_id },
      SpotCheckService.name,
    );

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ClientProxy.send() response shape varies
      const res: Observable<any> = this.masterService.send(
        {
          cmd: 'running-code.get-pattern-by-type',
          service: 'running-codes',
        },
        { type: 'SC', user_id, bu_code },
      );
      const response = await firstValueFrom(res);
      const patterns = response.data;

      if (!patterns || patterns.length === 0) {
        return `SC-${format(new Date(scDate), 'yyyyMMdd')}-${Date.now().toString(36)}`;
      }

      let datePattern;
      let runningPattern;
      patterns.forEach((pattern: Record<string, unknown>) => {
        if (pattern.type === 'date') datePattern = pattern;
        else if (pattern.type === 'running') runningPattern = pattern;
      });

      if (!datePattern || !runningPattern) {
        return `SC-${format(new Date(scDate), 'yyyyMMdd')}-${Date.now().toString(36)}`;
      }

      const getDate = new Date(scDate);
      const datePatternValue = format(getDate, datePattern.pattern);

      const prisma = await this.getPrisma(user_id, bu_code);
      const latestSC = prisma
        ? await prisma.tb_spot_check.findFirst({
          where: { spot_check_no: { contains: datePatternValue } },
          orderBy: { spot_check_no: 'desc' },
        })
        : null;

      const latestNumber = latestSC?.spot_check_no
        ? Number(
          latestSC.spot_check_no.slice(-Number(runningPattern.pattern)),
        )
        : 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ClientProxy.send() response shape varies
      const generateCodeRes: Observable<any> = this.masterService.send(
        { cmd: 'running-code.generate-code', service: 'running-codes' },
        {
          type: 'SC',
          issueDate: getDate,
          last_no: latestNumber,
          user_id,
          bu_code,
        },
      );
      const generateCodeResponse = await firstValueFrom(generateCodeRes);
      return generateCodeResponse.data.code;
    } catch (error) {
      this.logger.warn(
        { function: 'generateSCNo', error: (error as Error).message },
        SpotCheckService.name,
      );
      return `SC-${format(new Date(scDate), 'yyyyMMdd')}-${Date.now().toString(36)}`;
    }
  }
}
