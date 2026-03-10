import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { NewsService } from './news.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KeycloakGuard } from 'src/auth/guards/keycloak.guard';
import {
  ApiUserFilterQueries,
  ApiVersionMinRequest,
} from 'src/common/decorator/userfilter.decorator';
import { IPaginateQuery, PaginateQuery } from 'src/shared-dto/paginate.dto';
import { ExtractRequestHeader } from 'src/common/helpers/extract_header';
import { BackendLogger } from 'src/common/helpers/backend.logger';
import { AppIdGuard } from 'src/common/guard/app-id.guard';
import { ApiHeaderRequiredXAppId } from 'src/common/decorator/x-app-id.decorator';
import { BaseHttpController } from '@/common';

@Controller('/api/news')
@ApiTags('Document & Log')
@ApiHeaderRequiredXAppId()
@UseGuards(KeycloakGuard)
@ApiBearerAuth()
export class NewsController extends BaseHttpController {
  private readonly logger: BackendLogger = new BackendLogger(
    NewsController.name,
  );

  constructor(private readonly newsService: NewsService) {
    super();
  }

  /**
   * Retrieves all internal announcements published within the business unit,
   * used to communicate operational updates and policy changes to hotel staff.
   */
  @Get()
  @UseGuards(new AppIdGuard('news.findAll'))
  @ApiVersionMinRequest()
  @ApiUserFilterQueries()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all news',
    description: 'Retrieves all internal announcements and news articles published within the business unit, used to communicate operational updates, policy changes, and important notices to hotel staff.',
    tags: ['Document & Log', 'News'],
  })
  async findAll(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: IPaginateQuery,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findAll',
        query,
        version,
      },
      NewsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const paginate = PaginateQuery(query);
    
    const result = await this.newsService.findAll(user_id, paginate, version);
    this.respond(res, result);
  }

  /**
   * Retrieves a specific internal announcement by ID,
   * including its full content and publication details.
   */
  @Get(':id')
  @UseGuards(new AppIdGuard('news.findOne'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a news by ID',
    description: 'Retrieves a specific internal announcement or news article by its ID, including its full content, publication date, and target audience within the business unit.',
    tags: ['Document & Log', 'News'],
  })
  async findOne(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'findOne',
        id,
        version,
      },
      NewsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.newsService.findOne(id, user_id, version);
    this.respond(res, result);
  }

  /**
   * Publishes a new internal announcement to inform business unit staff
   * about operational updates, procurement policy changes, or hotel-wide notices.
   */
  @Post()
  @UseGuards(new AppIdGuard('news.create'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a news',
    description: 'Publishes a new internal announcement or news article to inform business unit users about operational updates, procurement policy changes, or other important hotel-wide notices.',
    tags: ['Document & Log', 'News'],
  })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createNewsDto: Record<string, unknown>,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'create',
        createNewsDto,
        version,
      },
      NewsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.newsService.create(
      createNewsDto,
      user_id,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Modifies an existing internal announcement, allowing administrators
   * to correct content or update publication scope within the business unit.
   */
  @Put(':id')
  @UseGuards(new AppIdGuard('news.update'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a news by ID',
    description: 'Modifies an existing internal announcement or news article, allowing administrators to correct content, update details, or change the publication scope within the business unit.',
    tags: ['Document & Log', 'News'],
  })
  async update(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Body() updateNewsDto: Record<string, unknown>,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'update',
        id,
        updateNewsDto,
        version,
      },
      NewsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.newsService.update(
      id,
      updateNewsDto,
      user_id,
      version,
    );
    this.respond(res, result);
  }

  /**
   * Removes an internal announcement from the business unit,
   * archiving it so it is no longer visible to staff.
   */
  @Delete(':id')
  @UseGuards(new AppIdGuard('news.delete'))
  @ApiVersionMinRequest()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a news by ID',
    description: 'Removes an internal announcement or news article from the business unit, archiving it so it is no longer visible to staff.',
    tags: ['Document & Log', 'News'],
  })
  async delete(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string,
    @Query('version') version: string = 'latest',
  ): Promise<void> {
    this.logger.debug(
      {
        function: 'delete',
        id,
        version,
      },
      NewsController.name,
    );

    const { user_id } = ExtractRequestHeader(req);
    const result = await this.newsService.delete(id, user_id, version);
    this.respond(res, result);
  }
}
