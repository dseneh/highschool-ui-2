/* ------------------------------------------------------------------ */
/*  Types for Marking Period API                                       */
/*  Base URL: /api/v1/marking-periods                                  */
/* ------------------------------------------------------------------ */

export interface MarkingPeriodDto {
  id: string;
  name: string;
  short_name: string;
  start_date: string;
  end_date: string;
  active: boolean;
  is_current: boolean;
  semester: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
}

export interface CreateMarkingPeriodCommand {
  name: string;
  short_name?: string;
  start_date: string;
  end_date: string;
  description?: string;
}

export interface UpdateMarkingPeriodCommand {
  name?: string;
  short_name?: string;
  start_date?: string;
  end_date?: string;
  active?: boolean;
}
