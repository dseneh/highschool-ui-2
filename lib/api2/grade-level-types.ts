/* ------------------------------------------------------------------ */
/*  Types for Grade Level API                                          */
/*  Base URL: /api/v1/grade-levels                                     */
/* ------------------------------------------------------------------ */

export interface SectionDto {
  id: string;
  name: string;
  students: number;
}

export interface DivisionDto {
  id: string;
  name: string;
  description: string | null;
}

export interface GradeLevelDto {
  id: string;
  name: string;
  level: number;
  description: string | null;
  division: DivisionDto;
  short_name: string | null;
  active: boolean;
  status: "active" | "disabled";
  sections: SectionDto[];
  tuition_fees: Array<{
    id: string;
    fee_type: string;
    amount: number;
  }>;
  currency: {
    id: string;
    name: string;
    symbol: string;
  } | null;
}

export interface CreateGradeLevelCommand {
  name: string;
  level: number;
  division_id: string;
  short_name?: string;
  description?: string;
}

export interface UpdateGradeLevelCommand {
  name?: string;
  level?: number;
  division_id?: string;
  short_name?: string;
  description?: string;
  active?: boolean;
}

export interface TuitionFeeDto {
  id: string;
  fee_type: string;
  amount: number;
}

export interface UpdateGradeLevelTuitionsCommand {
  tuition_fees: Array<{
    id: string;
    amount: number;
  }>;
}
