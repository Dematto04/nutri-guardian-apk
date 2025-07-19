import { Allergen } from "./allergen.dto";

export interface AllergenResponse {
  isSucceeded: boolean;
  timestamp: string;
  messages: Record<string, unknown>;
  data: Allergen[];
  pagination: number | null;
}

