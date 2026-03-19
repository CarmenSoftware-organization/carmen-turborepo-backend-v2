import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
  Req,
  Res,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Config_RunningCodeService } from './config_running-code.service';
import { BaseHttpController } from '@/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RunningCodeCreateRequest, RunningCodeUpdateRequest } from './swagger/request';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { PaginateQuery } from 'src/shared-dto/paginate.dto';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { IPaginateQuery } from 'src/shared-dto/paginate.dto';
import {
  IRunningCodeUpdate,
  RunningCodeCreateDto,
  RunningCodeUpdateDto,
} from './dto/config_running-code.dto';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/config/:bu_code/running-code')
@ApiTags('Configuration')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class Config_RunningCodeController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    Config_RunningCodeController.name,
  );

  constructor(
    private readonly config_runningCodeService: Config_RunningCodeService,
  ) {
    super();
  }

  /**
   * Retrieves a specific auto-numbering rule configuration
   * ค้นหาการกำหนดค่ารหัสรันนิ่งเดียวตาม ID สำหรับสร้างรหัสเอกสารอัตโนมัติ (เช่น PR-001, PO-001)
   * @param id - Running code ID / รหัสรหัสรันนิ่ง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param version - API version / เวอร์ชัน API
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('runningCode.findOne'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a running code by ID', description: 'Retrieves a specific auto-numbering rule configuration used to generate sequential document codes (e.g., PR-001, PO-001, GRN-001) for procurement and inventory documents.', operationId: 'configRunningCode_findOne', tags: ['Configuration', 'Running Code'] })
  async findOne(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_runningCodeService.findOne(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Retrieves the running code configuration for a specific document type
   * ค้นหาการกำหนดค่ารหัสรันนิ่งตามประเภทเอกสาร (เช่น ใบขอซื้อ ใบสั่งซื้อ)
   * @param type - Document type / ประเภทเอกสาร
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param version - API version / เวอร์ชัน API
   */
  @Get('result/:type')
  @UseGuards(new AppIdGuard('runningCode.findByType'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Get a running code result by type', description: 'Retrieves the running code configuration for a specific document type (e.g., purchase request, purchase order). Returns the current counter and format pattern for generating the next document number.', operationId: 'configRunningCode_findByType', tags: ['Configuration', 'Running Code'] })
  async findByType(
    @Param('type') type: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findByType',
        type,
        version,
      },
      Config_RunningCodeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_runningCodeService.findByType(
      type,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Lists all auto-numbering rule configurations for the business unit
   * ค้นหาการกำหนดค่ารหัสรันนิ่งทั้งหมดสำหรับหน่วยธุรกิจ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param query - Pagination parameters / พารามิเตอร์การแบ่งหน้า
   * @param version - API version / เวอร์ชัน API
   */
  @Get()
  @UseGuards(new AppIdGuard('runningCode.findAll'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({ summary: 'Get all running codes', description: 'Returns all auto-numbering rule configurations for the business unit. Each rule defines the format pattern, prefix, and counter for a specific document type.', operationId: 'configRunningCode_findAll', tags: ['Configuration', 'Running Code'] })
  async findAll(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query() query?: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      Config_RunningCodeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.config_runningCodeService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Initialize all default running code configurations (PL, PR, SI, SO, PO, GRN, CN)
   * สร้างการตั้งค่ารหัสรันนิ่งเริ่มต้นทั้งหมดสำหรับหน่วยธุรกิจ
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param version - API version / เวอร์ชัน API
   */
  @Post('init')
  @UseGuards(new AppIdGuard('runningCode.init'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Initialize default running codes', description: 'Creates all default auto-numbering rule configurations (PL, PR, SI, SO, PO, GRN, CN) for the business unit. Skips types that already exist.', operationId: 'configRunningCode_init', tags: ['Configuration', 'Running Code'] })
  async init(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'init',
        version,
      },
      Config_RunningCodeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_runningCodeService.init(
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Defines a new auto-numbering rule for a document type
   * สร้างกฎการกำหนดเลขอัตโนมัติใหม่สำหรับประเภทเอกสาร
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param createDto - Creation data / ข้อมูลสำหรับสร้าง
   * @param version - API version / เวอร์ชัน API
   */
  @Post()
  @UseGuards(new AppIdGuard('runningCode.create'))
  @HttpCode(HttpStatus.CREATED)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Create a new running code', description: 'Defines a new auto-numbering rule for a document type, specifying the prefix, format pattern, starting number, and reset frequency. Controls how document codes are automatically generated.', operationId: 'configRunningCode_create', tags: ['Configuration', 'Running Code'] })
  @ApiBody({ type: RunningCodeCreateRequest })
  async create(
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Body() createDto: RunningCodeCreateDto,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createDto,
        version,
      },
      Config_RunningCodeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_runningCodeService.create(
      createDto,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result, HttpStatus.CREATED);
  }

  /**
   * Modifies an existing auto-numbering rule
   * อัปเดตกฎการกำหนดเลขอัตโนมัติที่มีอยู่ เช่น เปลี่ยนรูปแบบหรือรีเซ็ตตัวนับ
   * @param id - Running code ID / รหัสรหัสรันนิ่ง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param updateDto - Update data / ข้อมูลสำหรับอัปเดต
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param version - API version / เวอร์ชัน API
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('runningCode.update'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Update a running code', description: 'Modifies an existing auto-numbering rule, such as changing the format pattern, prefix, or resetting the counter. Changes affect how future document numbers are generated.', operationId: 'configRunningCode_update', tags: ['Configuration', 'Running Code'] })
  @ApiBody({ type: RunningCodeUpdateRequest })
  async update(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Body() updateDto: RunningCodeUpdateDto,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateDto,
        version,
      },
      Config_RunningCodeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const data: IRunningCodeUpdate = {
      ...updateDto,
      id,
    };
    const result = await this.config_runningCodeService.update(
      data,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes an auto-numbering rule from the system
   * ลบกฎการกำหนดเลขอัตโนมัติออกจากระบบ
   * @param id - Running code ID / รหัสรหัสรันนิ่ง
   * @param bu_code - Business unit code / รหัสหน่วยธุรกิจ
   * @param req - HTTP request / คำขอ HTTP
   * @param res - HTTP response / การตอบกลับ HTTP
   * @param version - API version / เวอร์ชัน API
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('runningCode.delete'))
  @HttpCode(HttpStatus.OK)
  @ApiVersionMinRequest()
  @ApiOperation({ summary: 'Delete a running code', description: 'Removes an auto-numbering rule from the system. The associated document type will no longer have automatic code generation until a new rule is configured.', operationId: 'configRunningCode_delete', tags: ['Configuration', 'Running Code'] })
  async remove(
    @Param('id') id: string,
    @Param('bu_code') bu_code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      Config_RunningCodeController.name,
    );
    const { user_id } = ExtractRequestHeader(req);
    const result = await this.config_runningCodeService.delete(
      id,
      user_id,
      bu_code,
      version,
    );
    this.respond(res, result);
  }
}
