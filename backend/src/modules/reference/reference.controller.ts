import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { HelpRequestOptionsResponseDto } from './dto/help-request-options-response.dto';
import { LocaleQueryDto } from './dto/locale-query.dto';
import { ReferenceService } from './reference.service';

@ApiTags('Reference')
@Controller('reference')
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Get('help-request-options')
  @ApiOperation({
    summary: 'Get localized help type and sub-category options',
    description:
      'Returns reference labels for help request forms and filters. Pass `locale=en` or `locale=ar`.',
  })
  @ApiOkResponse({ type: HelpRequestOptionsResponseDto })
  getHelpRequestOptions(@Query() query: LocaleQueryDto) {
    const locale = query.locale ?? 'en';
    return this.referenceService.getHelpRequestOptions(locale);
  }
}
