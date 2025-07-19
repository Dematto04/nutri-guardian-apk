export interface UserAllergyRequest {
    allergenIds: number[],
    severity: string,
    diagnosisDate: string,
    diagnosedBy: string,
    lastReactionDate: string,
    avoidanceNotes: string,
    outgrown: boolean,
    outgrownDate: string,
    needsVerification: boolean
}