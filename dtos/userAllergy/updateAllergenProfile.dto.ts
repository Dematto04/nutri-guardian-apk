export interface UpdateAllergenProfileDto {
  newAllergenId: number;
  severity: string;
  diagnosisDate: string; // Format: YYYY-MM-DD
  diagnosedBy: string;
  lastReactionDate: string; // Format: YYYY-MM-DD
  avoidanceNotes: string;
  outgrown: boolean;
  outgrownDate: string; // Format: YYYY-MM-DD or "0001-01-01"
  needsVerification: boolean;
}

export interface UpdateAllergenProfileResponse {
  isSucceeded: boolean;
  message: string;
  data?: any;
}
