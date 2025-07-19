import api from "@/config/api";
import { RegisterRequestDto, ResendOTPRequest, VerifyOTPRequest } from "@/dtos/auth/auth.request.dto";
import AsyncStorage from "@react-native-async-storage/async-storage";



class AuthServiceBase {
    private readonly pathUrl = "authentication"

    async login(form: {
        email: string,
        password: string
    }) {
        return api.post(`/${this.pathUrl}/login`, form)
    }
    async register(form: RegisterRequestDto){
        return api.post(`${this.pathUrl}/register`, form)
    }
    async verifyOTP(form: VerifyOTPRequest) {
        return api.post(`${this.pathUrl}/verify-otp`, form)
    }
    async resendOTP(form: ResendOTPRequest) {
        return api.post(`${this.pathUrl}/resend-otp`, form)
    }
    async refreshToken(refreshToken: string, userId: number) {
        return api.post(`${this.pathUrl}/refresh-token`, {
            refreshToken,
            userId
        })
    }
    async logout(){
        await AsyncStorage.removeItem('user')
        await AsyncStorage.removeItem('accessToken')
        await AsyncStorage.removeItem('refreshToken')
    }
}

export const AuthService = new AuthServiceBase()