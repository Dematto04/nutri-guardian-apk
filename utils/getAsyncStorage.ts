import AsyncStorage from "@react-native-async-storage/async-storage"

export const getUserFromStorage = async () => {
    const user = await AsyncStorage.getItem('user')
    if(user){
        return JSON.parse('user')
    }
    return null
}
export const getAccessTokenFromStorage = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken')
    return accessToken
}
export const getRefreshTokenFromStorage = async () => {
    const rf = await AsyncStorage.getItem('refreshToken')
    return rf
}