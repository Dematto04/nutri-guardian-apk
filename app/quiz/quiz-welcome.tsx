import { Ionicons } from "@expo/vector-icons"
import { Box, Button, ButtonText, Center, HStack, Text, VStack } from "@gluestack-ui/themed"
import { useIsFocused } from "@react-navigation/native"
import axios from "axios"
import { useRouter } from "expo-router"
import { useEffect } from "react"
import { ScrollView } from "react-native"

export default function AllergenWelcomeScreen() {
  const router = useRouter()
  const handleGetStarted = () => {
    router.push('/quiz/main')
  }
    const isFocused = useIsFocused();
    useEffect(() => {
      const fetchAllergens = async () => {
        try {
          const response = await axios.get("https://drhan-eebacffvehcwefdq.southeastasia-01.azurewebsites.net/api/allergen")
          console.log("Response status:", response.status);
          if (!response.status.toString().startsWith("2")) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = response.data;
          console.log("Fetched Allergens:", data);
        } catch (error) {
          console.error("Error fetching allergens:", error);
        }
      };
  
      fetchAllergens();
    }, [isFocused]); 

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <Box flex={1} p="$6">
        <VStack space="xl" alignItems="center">
          {/* Header */}
          <Center mt="$8" mb="$4">
            <Box w="$20" h="$20" bg="$blue500" rounded="$full" alignItems="center" justifyContent="center" mb="$4">
              <Ionicons name="shield-checkmark" size={40} color="white" />
            </Box>

            <Text
              fontSize="$2xl"
              fontWeight="$bold"
              textAlign="center"
              color="$gray900"
              fontFamily="System"
              lineHeight="$2xl"
            >
              Chào mừng đến với{"\n"}Hồ sơ Dị ứng
            </Text>

            <Text
              fontSize="$md"
              textAlign="center"
              color="$gray600"
              mt="$3"
              px="$4"
              fontFamily="System"
              lineHeight="$md"
            >
              Hãy cho chúng tôi biết về tình trạng dị ứng của bạn để có trải nghiệm an toàn nhất
            </Text>
          </Center>

          {/* Benefits */}
          <VStack space="md" w="$full">
            <HStack space="md" alignItems="center" p="$4" bg="$white" rounded="$lg">
              <Box w="$10" h="$10" bg="$blue100" rounded="$full" alignItems="center" justifyContent="center">
                <Ionicons name="shield-outline" size={20} color="#3b82f6" />
              </Box>
              <VStack flex={1}>
                <Text fontWeight="$semibold" color="$gray900" fontFamily="System">
                  An toàn tuyệt đối
                </Text>
                <Text fontSize="$sm" color="$gray600" fontFamily="System">
                  Cảnh báo về các thành phần gây dị ứng
                </Text>
              </VStack>
            </HStack>

            <HStack space="md" alignItems="center" p="$4" bg="$white" rounded="$lg">
              <Box w="$10" h="$10" bg="$red100" rounded="$full" alignItems="center" justifyContent="center">
                <Ionicons name="heart-outline" size={20} color="#ef4444" />
              </Box>
              <VStack flex={1}>
                <Text fontWeight="$semibold" color="$gray900" fontFamily="System">
                  Chăm sóc cá nhân
                </Text>
                <Text fontSize="$sm" color="$gray600" fontFamily="System">
                  Gợi ý món ăn phù hợp với bạn
                </Text>
              </VStack>
            </HStack>

            <HStack space="md" alignItems="center" p="$4" bg="$white" rounded="$lg">
              <Box w="$10" h="$10" bg="$green100" rounded="$full" alignItems="center" justifyContent="center">
                <Ionicons name="checkmark-circle-outline" size={20} color="#22c55e" />
              </Box>
              <VStack flex={1}>
                <Text fontWeight="$semibold" color="$gray900" fontFamily="System">
                  Yên tâm thưởng thức
                </Text>
                <Text fontSize="$sm" color="$gray600" fontFamily="System">
                  Ăn uống không lo dị ứng
                </Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Common Allergens Preview */}
          <Box w="$full" p="$4" bg="$amber50" rounded="$lg" borderWidth="$1" borderColor="$amber200">
            <HStack space="sm" alignItems="center" justifyContent="center" mb="$3">
              <Ionicons name="warning-outline" size={20} color="#f59e0b" />
              <Text fontWeight="$semibold" color="$amber800" fontFamily="System">
                Các chất gây dị ứng phổ biến
              </Text>
            </HStack>
            <Text fontSize="$sm" textAlign="center" color="$amber700" mb="$3" fontFamily="System">
              Sữa • Trứng • Đậu phộng • Hạt cây • Cá • Tôm cua • Lúa mì • Đậu nành • Mè
            </Text>
          </Box>

          {/* Privacy */}
          <Box w="$full" p="$4" bg="$green50" rounded="$lg" borderWidth="$1" borderColor="$green200">
            <Center mb="$2">
              <Ionicons name="lock-closed-outline" size={24} color="#22c55e" />
            </Center>
            <Text fontWeight="$semibold" textAlign="center" color="$green800" mb="$2" fontFamily="System">
              Thông tin được bảo mật
            </Text>
            <Text fontSize="$sm" textAlign="center" color="$green700" fontFamily="System">
              Chúng tôi không chia sẻ thông tin dị ứng của bạn với bên thứ ba
            </Text>
          </Box>

          {/* CTA Button */}
          <VStack space="sm" alignItems="center" mt="$4" mb="$8">
            <Button size="lg" bg="$blue600" onPress={handleGetStarted} w="$full" maxWidth="$80">
              <HStack space="sm" alignItems="center">
                <ButtonText color="$white" fontWeight="$semibold" fontFamily="System">
                  Bắt đầu thiết lập hồ sơ
                </ButtonText>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </HStack>
            </Button>

            <Text fontSize="$sm" color="$gray500" textAlign="center" fontFamily="System">
              Chỉ mất 2-3 phút để hoàn thành
            </Text>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  )
}
