import { ThemedButton } from "@/components/ThemedButton";
import { ThemedInput } from "@/components/ThemedInput";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { AuthService } from "@/service/auth.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const isFocused = useIsFocused();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const checkLogined = async () => {
      const token = await AsyncStorage.getItem("accessToken")
      if(token){
        router.replace('/(tabs)/explore')
      }
    };
    checkLogined()
  }, [isFocused]);
  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
        text2: "Vui lòng nhập email và mật khẩu",
        swipeable: true,
      });
      return;
    }
    try {
      setIsLoading(true)

      const res = await AuthService.login({ email, password });

      if (res.status === 200) {
        const account = res.data.data;
        Toast.show({
          type: "success",
          text1: "Đăng nhập thất thành công",
          text2: `Xin chào ${account.fullName} 😊`,
        });
        await AsyncStorage.setItem("accessToken", account.token);
        await AsyncStorage.setItem("refreshToken", account.refreshToken);
        await AsyncStorage.setItem("user", JSON.stringify(account));
        console.log(res);

        router.replace("/(tabs)/explore");
      }
    } catch (error: any) {
      console.log({ error });
      Toast.show({
        type: "error",
        text1: "Đăng nhập thất bại",
        text2: error.response.data.messages.EmailVerification
          ? "Tài khoản chưa xác nhận email"
          : "Sai tài khoản hoặc mật khẩu",
        swipeable: true,
      });
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.formContainer}>
        <ThemedText type="subtitle" style={styles.title}>
          Xin chào!
        </ThemedText>

        <View style={styles.inputContainer}>
          <ThemedInput
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <ThemedInput
            placeholder="Mật khẩu"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <ThemedButton title="Đăng nhập" disabled={isLoading} onPress={handleLogin} />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: Colors.text.secondary }]}>
            Chưa có tài khoản?
          </Text>
          <View>
            <ThemedButton
              title="Đăng kí"
              variant="secondary"
              onPress={() => router.push("/(auth)/register")}
            />
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    gap: 15,
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
    gap: 10,
  },
  footerText: {
    color: Colors.text.secondary,
  },
});
