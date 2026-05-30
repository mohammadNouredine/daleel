import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { HelpType, SubCategory } from '../../common/enums';
import {
  HELP_REQUEST_OPTIONS,
  type LocalizedReferenceOption,
  type SupportedLocale,
} from './data/help-request-options.data';
import type { HelpRequestOptionsResponseDto } from './dto/help-request-options-response.dto';

@Injectable()
export class ReferenceService implements OnModuleInit {
  onModuleInit(): void {
    this.assertEnumCoverage(
      Object.values(HelpType),
      HELP_REQUEST_OPTIONS.helpTypes,
      'HelpType',
    );
    this.assertEnumCoverage(
      Object.values(SubCategory),
      HELP_REQUEST_OPTIONS.subCategories,
      'SubCategory',
    );
  }

  getHelpRequestOptions(locale: SupportedLocale): HelpRequestOptionsResponseDto {
    return {
      locale,
      helpTypes: this.mapOptions(HELP_REQUEST_OPTIONS.helpTypes, locale),
      subCategories: this.mapOptions(
        HELP_REQUEST_OPTIONS.subCategories,
        locale,
      ),
    };
  }

  private mapOptions(
    options: readonly LocalizedReferenceOption[],
    locale: SupportedLocale,
  ) {
    return options.map((option) => ({
      value: option.value,
      label: option.labels[locale],
    }));
  }

  private assertEnumCoverage(
    enumValues: string[],
    options: readonly LocalizedReferenceOption[],
    enumName: string,
  ): void {
    const optionValues = new Set(options.map((option) => option.value));
    const missing = enumValues.filter((value) => !optionValues.has(value));

    if (missing.length > 0) {
      throw new InternalServerErrorException(
        `Reference data missing ${enumName} values: ${missing.join(', ')}`,
      );
    }
  }
}
