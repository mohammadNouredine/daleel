import { HelpType, SubCategory } from '../../../common/enums';

export type SupportedLocale = 'en' | 'ar';

export type LocalizedReferenceOption = {
  value: string;
  labels: Record<SupportedLocale, string>;
};

export const HELP_REQUEST_OPTIONS = {
  helpTypes: [
    {
      value: HelpType.MATERIAL,
      labels: { en: 'Material', ar: 'مواد' },
    },
    {
      value: HelpType.FINANCIAL,
      labels: { en: 'Financial', ar: 'مالي' },
    },
    {
      value: HelpType.MEDICAL,
      labels: { en: 'Medical', ar: 'طبي' },
    },
    {
      value: HelpType.SHELTER,
      labels: { en: 'Shelter', ar: 'مأوى' },
    },
    {
      value: HelpType.TRANSPORT,
      labels: { en: 'Transport', ar: 'نقل' },
    },
  ],
  subCategories: [
    {
      value: SubCategory.FOOD,
      labels: { en: 'Food', ar: 'طعام' },
    },
    {
      value: SubCategory.WATER,
      labels: { en: 'Water', ar: 'ماء' },
    },
    {
      value: SubCategory.DIAPERS,
      labels: { en: 'Diapers', ar: 'حفاضات' },
    },
    {
      value: SubCategory.MILK,
      labels: { en: 'Milk', ar: 'حليب' },
    },
    {
      value: SubCategory.MEDICINE,
      labels: { en: 'Medicine', ar: 'دواء' },
    },
    {
      value: SubCategory.BEDDING,
      labels: { en: 'Bedding', ar: 'فراش' },
    },
    {
      value: SubCategory.CLOTHES,
      labels: { en: 'Clothes', ar: 'ملابس' },
    },
    {
      value: SubCategory.SURGERY,
      labels: { en: 'Surgery', ar: 'جراحة' },
    },
    {
      value: SubCategory.HOSPITAL,
      labels: { en: 'Hospital', ar: 'مستشفى' },
    },
    {
      value: SubCategory.RENT,
      labels: { en: 'Rent', ar: 'إيجار' },
    },
    {
      value: SubCategory.FURNITURE_TRANSPORT,
      labels: { en: 'Furniture / transport', ar: 'أثاث / نقل' },
    },
  ],
} as const satisfies {
  helpTypes: LocalizedReferenceOption[];
  subCategories: LocalizedReferenceOption[];
};
