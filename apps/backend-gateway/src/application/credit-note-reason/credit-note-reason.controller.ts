import {
  Controller,
  HttpStatus,
  Get,
  Post,
  HttpCode,
  Query,
  Req,
  Res,
  UseGuards,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { CreditNoteReasonService } from './credit-note-reason.service';
import {
  BaseHttpController,
  ZodSerializerInterceptor,
} from '@/common';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';

@Controller('api/:bu_code/credit-note-reason')
@ApiTags('Procurement')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
@Controller('api/:bu_code/credit-note-reason')
export class CreditNoteReasonController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    CreditNoteReasonController.name,
  );

  constructor(
    private readonly creditNoteReasonService: CreditNoteReasonService,
  ) {
    super();
  }

  /**
   * Lists all configurable reasons for issuing vendor credit notes (e.g., damaged
   * goods, short delivery, quality issues) to populate reason dropdowns.
   */
  @Get()
  @UseGuards(new AppIdGuard('creditNoteReason.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @ApiOperation({
    summary: 'Get all credit note reasons',
    description: 'Lists all configurable reasons for issuing vendor credit notes (e.g., damaged goods, short delivery, quality issues), used to populate reason dropdowns when creating credit notes.',
    operationId: 'findAllCreditNoteReasons',
    tags: ['Procurement', 'Credit Note Reason'],
  })
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Param('bu_code') bu_code: string,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      CreditNoteReasonController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    const result = await this.creditNoteReasonService.findAll(
      user_id,
      bu_code,
      paginate,
      version,
    );
    this.respond(res, result);
  }
}
