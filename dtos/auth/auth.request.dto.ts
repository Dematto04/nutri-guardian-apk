export interface RegisterRequestDto {
    email: string,
    password: string,
    confirmPassword: string,
    fullName: string,
    dateOfBirth: string,
    gender: string
}
export interface VerifyOTPRequest {
    userId: string;
    code: string;
    type: number;
}

export interface ResendOTPRequest {
    email: string;
}