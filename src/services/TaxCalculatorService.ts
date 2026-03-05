export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface TaxCalculationResult {
  grossIncome: number;
  adjustedGrossIncome: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  afterTaxIncome: number;
  breakdown: TaxBreakdown[];
  federalCredits: number;
  provincialCredits: number;
}

export interface TaxBreakdown {
  bracket: string;
  income: number;
  rate: number;
  tax: number;
}

export type FilingStatus = 'single' | 'commonLaw' | 'singleParent';
export type ProvinceCode =
  | 'AB'
  | 'BC'
  | 'MB'
  | 'NB'
  | 'NL'
  | 'NS'
  | 'NT'
  | 'NU'
  | 'ON'
  | 'PE'
  | 'QC'
  | 'SK'
  | 'YT';

type ProvinceTaxProfile = {
  name: string;
  basicPersonalAmount: number;
  brackets: TaxBracket[];
};

export interface TaxCalculationOptions {
  dependantIncome?: number;
  hasEmploymentIncome?: boolean;
  taxYear?: TaxYear;
}

export type TaxYear = 2024 | 2026;

export const CANADIAN_PROVINCES: Array<{ code: ProvinceCode; name: string }> = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' }
];

export class TaxCalculatorService {
  private static readonly CANADA_EMPLOYMENT_AMOUNT: Record<TaxYear, number> = {
    2024: 1433,
    2026: 1501
  };

  private static readonly FEDERAL_RULES: Record<
    TaxYear,
    {
      brackets: TaxBracket[];
      basicPersonalAmount: number;
      basicPersonalAmountMin: number;
      bpaPhaseoutStart: number;
      bpaPhaseoutEnd: number;
    }
  > = {
    2024: {
      brackets: [
        { min: 0, max: 55867, rate: 0.15 },
        { min: 55867, max: 111733, rate: 0.205 },
        { min: 111733, max: 173205, rate: 0.26 },
        { min: 173205, max: 246752, rate: 0.29 },
        { min: 246752, max: Infinity, rate: 0.33 }
      ],
      basicPersonalAmount: 15705,
      basicPersonalAmountMin: 14156,
      bpaPhaseoutStart: 173205,
      bpaPhaseoutEnd: 246752
    },
    2026: {
      brackets: [
        { min: 0, max: 58523, rate: 0.14 },
        { min: 58523, max: 117045, rate: 0.205 },
        { min: 117045, max: 181440, rate: 0.26 },
        { min: 181440, max: 258482, rate: 0.29 },
        { min: 258482, max: Infinity, rate: 0.33 }
      ],
      basicPersonalAmount: 16452,
      basicPersonalAmountMin: 14829,
      bpaPhaseoutStart: 181440,
      bpaPhaseoutEnd: 258482
    }
  };

  private static readonly PROVINCE_TAX_PROFILES_BY_YEAR: Record<TaxYear, Record<ProvinceCode, ProvinceTaxProfile>> = {
    2024: {
    AB: {
      name: 'Alberta',
      basicPersonalAmount: 21885,
      brackets: [
        { min: 0, max: 148269, rate: 0.10 },
        { min: 148269, max: 177922, rate: 0.12 },
        { min: 177922, max: 237230, rate: 0.13 },
        { min: 237230, max: 355845, rate: 0.14 },
        { min: 355845, max: Infinity, rate: 0.15 }
      ]
    },
    BC: {
      name: 'British Columbia',
      basicPersonalAmount: 12580,
      brackets: [
        { min: 0, max: 47937, rate: 0.0506 },
        { min: 47937, max: 95875, rate: 0.077 },
        { min: 95875, max: 110076, rate: 0.105 },
        { min: 110076, max: 133664, rate: 0.1229 },
        { min: 133664, max: 181232, rate: 0.147 },
        { min: 181232, max: 252752, rate: 0.168 },
        { min: 252752, max: Infinity, rate: 0.205 }
      ]
    },
    MB: {
      name: 'Manitoba',
      basicPersonalAmount: 15000,
      brackets: [
        { min: 0, max: 47000, rate: 0.108 },
        { min: 47000, max: 100000, rate: 0.1275 },
        { min: 100000, max: Infinity, rate: 0.174 }
      ]
    },
    NB: {
      name: 'New Brunswick',
      basicPersonalAmount: 13202,
      brackets: [
        { min: 0, max: 49958, rate: 0.094 },
        { min: 49958, max: 99916, rate: 0.14 },
        { min: 99916, max: 185064, rate: 0.16 },
        { min: 185064, max: Infinity, rate: 0.195 }
      ]
    },
    NL: {
      name: 'Newfoundland and Labrador',
      basicPersonalAmount: 10818,
      brackets: [
        { min: 0, max: 43198, rate: 0.087 },
        { min: 43198, max: 86395, rate: 0.145 },
        { min: 86395, max: 154244, rate: 0.158 },
        { min: 154244, max: 215943, rate: 0.178 },
        { min: 215943, max: 275870, rate: 0.198 },
        { min: 275870, max: 551739, rate: 0.208 },
        { min: 551739, max: 1103478, rate: 0.213 },
        { min: 1103478, max: Infinity, rate: 0.218 }
      ]
    },
    NS: {
      name: 'Nova Scotia',
      basicPersonalAmount: 8481,
      brackets: [
        { min: 0, max: 29590, rate: 0.0879 },
        { min: 29590, max: 59180, rate: 0.1495 },
        { min: 59180, max: 93000, rate: 0.1667 },
        { min: 93000, max: 150000, rate: 0.175 },
        { min: 150000, max: Infinity, rate: 0.21 }
      ]
    },
    NT: {
      name: 'Northwest Territories',
      basicPersonalAmount: 17373,
      brackets: [
        { min: 0, max: 50597, rate: 0.059 },
        { min: 50597, max: 101198, rate: 0.086 },
        { min: 101198, max: 164525, rate: 0.122 },
        { min: 164525, max: Infinity, rate: 0.1405 }
      ]
    },
    NU: {
      name: 'Nunavut',
      basicPersonalAmount: 17925,
      brackets: [
        { min: 0, max: 54707, rate: 0.04 },
        { min: 54707, max: 109413, rate: 0.07 },
        { min: 109413, max: 177881, rate: 0.09 },
        { min: 177881, max: Infinity, rate: 0.115 }
      ]
    },
    ON: {
      name: 'Ontario',
      basicPersonalAmount: 12399,
      brackets: [
        { min: 0, max: 51446, rate: 0.0505 },
        { min: 51446, max: 102894, rate: 0.0915 },
        { min: 102894, max: 150000, rate: 0.1116 },
        { min: 150000, max: 220000, rate: 0.1216 },
        { min: 220000, max: Infinity, rate: 0.1316 }
      ]
    },
    PE: {
      name: 'Prince Edward Island',
      basicPersonalAmount: 13500,
      brackets: [
        { min: 0, max: 32656, rate: 0.0965 },
        { min: 32656, max: 64313, rate: 0.1363 },
        { min: 64313, max: 105000, rate: 0.1665 },
        { min: 105000, max: 140000, rate: 0.18 },
        { min: 140000, max: Infinity, rate: 0.1875 }
      ]
    },
    QC: {
      name: 'Quebec',
      basicPersonalAmount: 18056,
      brackets: [
        { min: 0, max: 51780, rate: 0.14 },
        { min: 51780, max: 103545, rate: 0.19 },
        { min: 103545, max: 126000, rate: 0.24 },
        { min: 126000, max: Infinity, rate: 0.2575 }
      ]
    },
    SK: {
      name: 'Saskatchewan',
      basicPersonalAmount: 18091,
      brackets: [
        { min: 0, max: 52057, rate: 0.105 },
        { min: 52057, max: 148734, rate: 0.125 },
        { min: 148734, max: Infinity, rate: 0.145 }
      ]
    },
    YT: {
      name: 'Yukon',
      basicPersonalAmount: 15705,
      brackets: [
        { min: 0, max: 55867, rate: 0.064 },
        { min: 55867, max: 111733, rate: 0.09 },
        { min: 111733, max: 173205, rate: 0.109 },
        { min: 173205, max: 500000, rate: 0.128 },
        { min: 500000, max: Infinity, rate: 0.15 }
      ]
    }
    },
    2026: {
      AB: {
        name: 'Alberta',
        basicPersonalAmount: 22769,
        brackets: [
          { min: 0, max: 61200, rate: 0.08 },
          { min: 61200, max: 154259, rate: 0.10 },
          { min: 154259, max: 185111, rate: 0.12 },
          { min: 185111, max: 246813, rate: 0.13 },
          { min: 246813, max: 370220, rate: 0.14 },
          { min: 370220, max: Infinity, rate: 0.15 }
        ]
      },
      BC: {
        name: 'British Columbia',
        basicPersonalAmount: 13216,
        brackets: [
          { min: 0, max: 50363, rate: 0.0506 },
          { min: 50363, max: 100728, rate: 0.077 },
          { min: 100728, max: 115648, rate: 0.105 },
          { min: 115648, max: 140430, rate: 0.1229 },
          { min: 140430, max: 190405, rate: 0.147 },
          { min: 190405, max: 265545, rate: 0.168 },
          { min: 265545, max: Infinity, rate: 0.205 }
        ]
      },
      MB: {
        name: 'Manitoba',
        basicPersonalAmount: 15780,
        brackets: [
          { min: 0, max: 47000, rate: 0.108 },
          { min: 47000, max: 100000, rate: 0.1275 },
          { min: 100000, max: Infinity, rate: 0.174 }
        ]
      },
      NB: {
        name: 'New Brunswick',
        basicPersonalAmount: 13664,
        brackets: [
          { min: 0, max: 52333, rate: 0.094 },
          { min: 52333, max: 104666, rate: 0.14 },
          { min: 104666, max: 193861, rate: 0.16 },
          { min: 193861, max: Infinity, rate: 0.195 }
        ]
      },
      NL: {
        name: 'Newfoundland and Labrador',
        basicPersonalAmount: 11188,
        brackets: [
          { min: 0, max: 44678, rate: 0.087 },
          { min: 44678, max: 89354, rate: 0.145 },
          { min: 89354, max: 159528, rate: 0.158 },
          { min: 159528, max: 223340, rate: 0.178 },
          { min: 223340, max: 285319, rate: 0.198 },
          { min: 285319, max: 570638, rate: 0.208 },
          { min: 570638, max: 1141275, rate: 0.213 },
          { min: 1141275, max: Infinity, rate: 0.218 }
        ]
      },
      NS: {
        name: 'Nova Scotia',
        basicPersonalAmount: 11932,
        brackets: [
          { min: 0, max: 30995, rate: 0.0879 },
          { min: 30995, max: 61991, rate: 0.1495 },
          { min: 61991, max: 97417, rate: 0.1667 },
          { min: 97417, max: 157124, rate: 0.175 },
          { min: 157124, max: Infinity, rate: 0.21 }
        ]
      },
      NT: {
        name: 'Northwest Territories',
        basicPersonalAmount: 18198,
        brackets: [
          { min: 0, max: 53003, rate: 0.059 },
          { min: 53003, max: 106009, rate: 0.086 },
          { min: 106009, max: 172346, rate: 0.122 },
          { min: 172346, max: Infinity, rate: 0.1405 }
        ]
      },
      NU: {
        name: 'Nunavut',
        basicPersonalAmount: 19659,
        brackets: [
          { min: 0, max: 55801, rate: 0.04 },
          { min: 55801, max: 111602, rate: 0.07 },
          { min: 111602, max: 181439, rate: 0.09 },
          { min: 181439, max: Infinity, rate: 0.115 }
        ]
      },
      ON: {
        name: 'Ontario',
        basicPersonalAmount: 12989,
        brackets: [
          { min: 0, max: 53891, rate: 0.0505 },
          { min: 53891, max: 107785, rate: 0.0915 },
          { min: 107785, max: 150000, rate: 0.1116 },
          { min: 150000, max: 220000, rate: 0.1216 },
          { min: 220000, max: Infinity, rate: 0.1316 }
        ]
      },
      PE: {
        name: 'Prince Edward Island',
        basicPersonalAmount: 15000,
        brackets: [
          { min: 0, max: 33928, rate: 0.095 },
          { min: 33928, max: 65820, rate: 0.1347 },
          { min: 65820, max: 106890, rate: 0.166 },
          { min: 106890, max: 142250, rate: 0.1762 },
          { min: 142250, max: Infinity, rate: 0.19 }
        ]
      },
      QC: {
        name: 'Quebec',
        basicPersonalAmount: 18952,
        brackets: [
          { min: 0, max: 53255, rate: 0.14 },
          { min: 53255, max: 106495, rate: 0.19 },
          { min: 106495, max: 129590, rate: 0.24 },
          { min: 129590, max: Infinity, rate: 0.2575 }
        ]
      },
      SK: {
        name: 'Saskatchewan',
        basicPersonalAmount: 20381,
        brackets: [
          { min: 0, max: 54532, rate: 0.105 },
          { min: 54532, max: 155805, rate: 0.125 },
          { min: 155805, max: Infinity, rate: 0.145 }
        ]
      },
      YT: {
        name: 'Yukon',
        basicPersonalAmount: 16452,
        brackets: [
          { min: 0, max: 58523, rate: 0.064 },
          { min: 58523, max: 117045, rate: 0.09 },
          { min: 117045, max: 181440, rate: 0.109 },
          { min: 181440, max: 500000, rate: 0.128 },
          { min: 500000, max: Infinity, rate: 0.15 }
        ]
      }
    }
  };

  public static calculateTax(
    income: number,
    filingStatus: FilingStatus,
    province: ProvinceCode,
    deductions: number = 0,
    options: TaxCalculationOptions = {}
  ): TaxCalculationResult {
    const taxYear = options.taxYear ?? 2026;
    const federalRules = this.FEDERAL_RULES[taxYear];
    const provinceProfile = this.PROVINCE_TAX_PROFILES_BY_YEAR[taxYear][province];
    const adjustedGrossIncome = income;
    const taxableIncome = Math.max(0, adjustedGrossIncome - deductions);
    const dependantIncome = Math.max(0, options.dependantIncome || 0);
    const payrollContributions = this.calculatePayrollContributions(income, province, taxYear);

    const federalBase = this.calculateProgressiveTax(taxableIncome, federalRules.brackets);
    const federalCredits = this.calculateFederalCredits(
      income,
      adjustedGrossIncome,
      filingStatus,
      dependantIncome,
      payrollContributions,
      options.hasEmploymentIncome ?? true,
      taxYear
    );
    const federalTaxBeforeAbatement = Math.max(0, federalBase.tax - federalCredits);
    const federalTax = province === 'QC'
      ? this.applyQuebecAbatement(federalTaxBeforeAbatement)
      : federalTaxBeforeAbatement;

    const provinceBase = this.calculateProgressiveTax(taxableIncome, provinceProfile.brackets);
    const provincialCredits = this.calculateProvincialCredits(
      province,
      income,
      filingStatus,
      dependantIncome,
      payrollContributions,
      taxYear
    );
    const baseProvincialTax = Math.max(0, provinceBase.tax - provincialCredits);
    const surtaxedProvincialTax = this.applyProvincialSurtax(province, baseProvincialTax, taxYear);
    const stateTax = province === 'ON'
      ? surtaxedProvincialTax + this.calculateOntarioHealthPremium(taxableIncome)
      : surtaxedProvincialTax;

    const ficaTax = payrollContributions;
    const totalTax = federalTax + stateTax + payrollContributions;
    const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;
    const marginalRate = (
      this.getMarginalRate(taxableIncome, federalRules.brackets) +
      this.getMarginalRate(taxableIncome, provinceProfile.brackets) +
      this.getMarginalPayrollRate(income, province, taxYear)
    ) * 100;
    const afterTaxIncome = income - totalTax;

    void filingStatus;

    return {
      grossIncome: income,
      adjustedGrossIncome,
      taxableIncome,
      federalTax,
      stateTax,
      ficaTax,
      totalTax,
      effectiveRate,
      marginalRate,
      afterTaxIncome,
      breakdown: federalBase.breakdown,
      federalCredits,
      provincialCredits
    };
  }

  private static calculateFederalCredits(
    income: number,
    netIncome: number,
    filingStatus: FilingStatus,
    dependantIncome: number,
    payrollContributions: number,
    hasEmploymentIncome: boolean,
    taxYear: TaxYear
  ): number {
    const federalRules = this.FEDERAL_RULES[taxYear];
    const lowestFederalRate = federalRules.brackets[0].rate;
    const basicPersonalAmount = this.calculateFederalBasicPersonalAmount(netIncome, taxYear);
    const spouseOrDependantAmount = filingStatus === 'single'
      ? 0
      : Math.max(0, basicPersonalAmount - dependantIncome);
    const canadaEmploymentAmount = hasEmploymentIncome ? Math.min(this.CANADA_EMPLOYMENT_AMOUNT[taxYear], income) : 0;

    return (
      basicPersonalAmount * lowestFederalRate +
      spouseOrDependantAmount * lowestFederalRate +
      canadaEmploymentAmount * lowestFederalRate +
      payrollContributions * lowestFederalRate
    );
  }

  private static calculateProvincialCredits(
    province: ProvinceCode,
    income: number,
    filingStatus: FilingStatus,
    dependantIncome: number,
    payrollContributions: number,
    taxYear: TaxYear
  ): number {
    const provinceProfile = this.PROVINCE_TAX_PROFILES_BY_YEAR[taxYear][province];
    const lowestProvincialRate = provinceProfile.brackets[0].rate;
    const spouseOrDependantAmount = filingStatus === 'single'
      ? 0
      : Math.max(0, provinceProfile.basicPersonalAmount - dependantIncome);
    const employmentAmount = Math.min(this.CANADA_EMPLOYMENT_AMOUNT[taxYear], income);

    return (
      provinceProfile.basicPersonalAmount * lowestProvincialRate +
      spouseOrDependantAmount * lowestProvincialRate +
      payrollContributions * lowestProvincialRate +
      employmentAmount * lowestProvincialRate
    );
  }

  private static calculateFederalBasicPersonalAmount(netIncome: number, taxYear: TaxYear): number {
    const federalRules = this.FEDERAL_RULES[taxYear];

    if (netIncome <= federalRules.bpaPhaseoutStart) {
      return federalRules.basicPersonalAmount;
    }

    if (netIncome >= federalRules.bpaPhaseoutEnd) {
      return federalRules.basicPersonalAmountMin;
    }

    const reductionRange = federalRules.basicPersonalAmount - federalRules.basicPersonalAmountMin;
    const phaseoutProgress =
      (netIncome - federalRules.bpaPhaseoutStart) /
      (federalRules.bpaPhaseoutEnd - federalRules.bpaPhaseoutStart);

    return federalRules.basicPersonalAmount - reductionRange * phaseoutProgress;
  }

  private static applyProvincialSurtax(province: ProvinceCode, taxAfterCredits: number, taxYear: TaxYear): number {
    if (province !== 'ON') {
      return taxAfterCredits;
    }

    const firstThreshold = taxYear === 2026 ? 5710 : 5554;
    const secondThreshold = taxYear === 2026 ? 7307 : 7108;
    const firstSurtax = Math.max(0, taxAfterCredits - firstThreshold) * 0.2;
    const secondSurtax = Math.max(0, taxAfterCredits - secondThreshold) * 0.36;

    return taxAfterCredits + firstSurtax + secondSurtax;
  }

  private static applyQuebecAbatement(federalTaxAfterCredits: number): number {
    return federalTaxAfterCredits * (1 - 0.165);
  }

  private static calculateOntarioHealthPremium(taxableIncome: number): number {
    if (taxableIncome <= 20000) return 0;
    if (taxableIncome <= 36000) return Math.min(300, (taxableIncome - 20000) * 0.06);
    if (taxableIncome <= 48000) return Math.min(450, 300 + (taxableIncome - 36000) * 0.06);
    if (taxableIncome <= 72000) return Math.min(600, 450 + (taxableIncome - 48000) * 0.25);
    if (taxableIncome <= 200000) return Math.min(750, 600 + (taxableIncome - 72000) * 0.25);
    return Math.min(900, 750 + (taxableIncome - 200000) * 0.25);
  }

  private static calculatePayrollContributions(income: number, province: ProvinceCode, taxYear: TaxYear): number {
    const cppYearRules = taxYear === 2026
      ? { ympe: 74600, yamt: 68900, ymce: 71100, cppRate: 0.0595, qppRate: 0.063, eiRate: 0.0163, qcEiRate: 0.013, qpipRate: 0.0043, qpipMaxIncome: 103000 }
      : { ympe: 68500, yamt: 63200, ymce: 65000, cppRate: 0.0595, qppRate: 0.064, eiRate: 0.0166, qcEiRate: 0.0132, qpipRate: 0.00494, qpipMaxIncome: 94000 };

    if (province === 'QC') {
      const qppBase = Math.max(0, Math.min(income, cppYearRules.ympe) - 3500) * cppYearRules.qppRate;
      const qpp2 = Math.max(0, Math.min(income, cppYearRules.yamt) - cppYearRules.ympe) * 0.04;
      const ei = Math.min(income, cppYearRules.ymce) * cppYearRules.qcEiRate;
      const qpip = Math.min(income, cppYearRules.qpipMaxIncome) * cppYearRules.qpipRate;
      return qppBase + qpp2 + ei + qpip;
    }

    const cppBase = Math.max(0, Math.min(income, cppYearRules.ympe) - 3500) * cppYearRules.cppRate;
    const cpp2 = Math.max(0, Math.min(income, cppYearRules.yamt) - cppYearRules.ympe) * 0.04;
    const ei = Math.min(income, cppYearRules.ymce) * cppYearRules.eiRate;
    return cppBase + cpp2 + ei;
  }

  private static getMarginalPayrollRate(income: number, province: ProvinceCode, taxYear: TaxYear): number {
    const payrollRules = taxYear === 2026
      ? { ympe: 74600, yamt: 68900, ymce: 71100, cppRate: 0.0595, qppRate: 0.063, eiRate: 0.0163, qcEiRate: 0.013, qpipRate: 0.0043, qpipMaxIncome: 103000 }
      : { ympe: 68500, yamt: 63200, ymce: 65000, cppRate: 0.0595, qppRate: 0.064, eiRate: 0.0166, qcEiRate: 0.0132, qpipRate: 0.00494, qpipMaxIncome: 94000 };

    if (province === 'QC') {
      let rate = income < payrollRules.ymce ? payrollRules.qcEiRate : 0;
      if (income > 0 && income < payrollRules.qpipMaxIncome) rate += payrollRules.qpipRate;
      if (income > 3500 && income < payrollRules.ympe) rate += payrollRules.qppRate;
      if (income >= payrollRules.ympe && income < payrollRules.yamt) rate += 0.04;
      return rate;
    }

    let rate = income < payrollRules.ymce ? payrollRules.eiRate : 0;
    if (income > 3500 && income < payrollRules.ympe) rate += payrollRules.cppRate;
    if (income >= payrollRules.ympe && income < payrollRules.yamt) rate += 0.04;
    return rate;
  }

  private static calculateProgressiveTax(
    taxableIncome: number,
    brackets: TaxBracket[]
  ): { tax: number; breakdown: TaxBreakdown[] } {
    let tax = 0;
    const breakdown: TaxBreakdown[] = [];

    for (const bracket of brackets) {
      if (taxableIncome <= bracket.min) continue;

      const taxableAtThisBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      const taxAtThisBracket = taxableAtThisBracket * bracket.rate;

      if (taxableAtThisBracket > 0) {
        tax += taxAtThisBracket;
        breakdown.push({
          bracket: `${(bracket.rate * 100).toFixed(2)}%`,
          income: taxableAtThisBracket,
          rate: bracket.rate,
          tax: taxAtThisBracket
        });
      }
    }

    return { tax, breakdown };
  }

  private static getMarginalRate(taxableIncome: number, brackets: TaxBracket[]): number {
    for (const bracket of brackets) {
      if (taxableIncome >= bracket.min && taxableIncome < bracket.max) {
        return bracket.rate;
      }
    }

    return brackets[brackets.length - 1].rate;
  }

  public static getDeductionSuggestions(income: number, profession: string): Array<{
    name: string;
    estimatedAmount: number;
    category: string;
    description: string;
    requirements: string[];
  }> {
    const suggestions = [];

    if (income > 30000) {
      suggestions.push({
        name: 'Home Office Expenses',
        estimatedAmount: Math.min(1500, income * 0.02),
        category: 'Business',
        description: 'Workspace, utilities, and related home office expenses used to earn income.',
        requirements: ['Workspace used regularly for work', 'Expenses must support earned income', 'Keep receipts and allocation notes']
      });
    }

    suggestions.push({
      name: 'Professional Development',
      estimatedAmount: Math.min(2000, income * 0.015),
      category: 'Education',
      description: 'Continuing education, courses, and certifications related to your work.',
      requirements: ['Directly related to your profession', 'Not reimbursed by employer', 'Documentation retained']
    });

    if (profession.includes('tech') || profession.includes('consultant')) {
      suggestions.push({
        name: 'Computer and Equipment',
        estimatedAmount: Math.min(3000, income * 0.025),
        category: 'Business',
        description: 'Devices, software, and equipment used for self-employment or contract work.',
        requirements: ['Used to earn income', 'Business-use portion supportable', 'Capital vs expense treatment reviewed']
      });
    }

    return suggestions;
  }
}
