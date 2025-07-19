import ai_rec from "@/assets/images/ai_re.png";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
    generateNutritionAnswerFromAI,
    getFallbackNutritionAdvice,
} from "@/service/aiChat.service";
import { Ionicons } from "@expo/vector-icons";
import {
    Box,
    Button,
    HStack,
    Image,
    Input,
    InputField,
    Pressable,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Component để render text với formatting
const FormattedText = ({ text, isUser }: { text: string; isUser: boolean }) => {
  const textColor = isUser ? Colors.text.light : Colors.text.primary;
  const boldColor = isUser ? Colors.text.light : Colors.text.primary;

  // Parse text thành các phần
  const parseText = (inputText: string) => {
    const lines = inputText.split("\n");
    const elements: React.ReactElement[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine === "") {
        // Empty line - add space
        elements.push(<View key={`space-${index}`} style={{ height: 6 }} />);
      } else if (
        trimmedLine.startsWith("*   **") &&
        trimmedLine.includes(":**")
      ) {
        // Bold bullet point với description (e.g., "*   **Title:** description")
        const content = trimmedLine.replace("*   **", "");
        const boldEndIndex = content.indexOf(":**");
        if (boldEndIndex !== -1) {
          const title = content.substring(0, boldEndIndex);
          const description = content.substring(boldEndIndex + 3);
          elements.push(
            <View
              key={index}
              style={{ flexDirection: "row", marginBottom: 8, paddingLeft: 4 }}
            >
              <Text
                style={{
                  color: Colors.primary,
                  fontSize: 16,
                  marginRight: 8,
                  fontWeight: "bold",
                }}
              >
                •
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: boldColor, fontSize: 14, fontWeight: "bold" }}
                >
                  {title}:
                </Text>
                {description.trim() && (
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 14,
                      marginTop: 2,
                      lineHeight: 20,
                    }}
                  >
                    {description.trim()}
                  </Text>
                )}
              </View>
            </View>
          );
        }
      } else if (trimmedLine.startsWith("*   ")) {
        // Regular bullet point
        const content = trimmedLine.replace("*   ", "");
        elements.push(
          <View
            key={index}
            style={{ flexDirection: "row", marginBottom: 6, paddingLeft: 4 }}
          >
            <Text
              style={{
                color: Colors.primary,
                fontSize: 16,
                marginRight: 8,
                fontWeight: "bold",
              }}
            >
              •
            </Text>
            <Text
              style={{
                color: textColor,
                fontSize: 14,
                flex: 1,
                lineHeight: 20,
              }}
            >
              {content}
            </Text>
          </View>
        );
      } else if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
        // Section headers (bold text)
        const content = trimmedLine.replace(/\*\*/g, "");
        elements.push(
          <View key={index} style={{ marginTop: 12, marginBottom: 8 }}>
            <Text
              style={{
                color: boldColor,
                fontSize: 15,
                fontWeight: "bold",
                backgroundColor: isUser
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(70,197,223,0.1)",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              {content}
            </Text>
          </View>
        );
      } else if (trimmedLine.includes("**") && !trimmedLine.startsWith("**")) {
        // Inline bold text
        const parts = trimmedLine.split(/(\*\*[^*]+\*\*)/);
        const textElements = parts.map((part, partIndex) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const boldText = part.replace(/\*\*/g, "");
            return (
              <Text
                key={partIndex}
                style={{ fontWeight: "bold", color: boldColor }}
              >
                {boldText}
              </Text>
            );
          }
          return (
            <Text key={partIndex} style={{ color: textColor }}>
              {part}
            </Text>
          );
        });

        elements.push(
          <Text
            key={index}
            style={{ fontSize: 14, marginBottom: 6, lineHeight: 20 }}
          >
            {textElements}
          </Text>
        );
      } else {
        // Regular text
        elements.push(
          <Text
            key={index}
            style={{
              color: textColor,
              fontSize: 14,
              marginBottom: 4,
              lineHeight: 20,
            }}
          >
            {trimmedLine}
          </Text>
        );
      }
    });

    return elements;
  };

  return <View style={{ paddingVertical: 2 }}>{parseText(text)}</View>;
};

export default function ChatScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là AI assistant của NutriGuardian. 🥗\n\n**Tôi có thể giúp bạn về:**\n\n*   **Tư vấn dinh dưỡng:** Chế độ ăn lành mạnh cho mọi lứa tuổi\n*   **Hướng dẫn dị ứng:** Cách phòng tránh và thực phẩm thay thế\n*   **Công thức nấu ăn:** Món ăn dinh dưỡng và dễ làm\n*   **Giá trị dinh dưỡng:** Thông tin chi tiết về thực phẩm\n*   **Lối sống khỏe mạnh:** Lời khuyên về tập luyện và sức khỏe\n\n**Bạn cần hỗ trợ gì hôm nay?** 😊",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Quick action suggestions
  const quickActions = [
    {
      id: 1,
      text: "🥗 Tư vấn chế độ ăn lành mạnh",
      message: "Tôi muốn tư vấn về chế độ ăn lành mạnh cho người trưởng thành",
    },
    {
      id: 2,
      text: "🚫 Hỏi về dị ứng thực phẩm",
      message:
        "Tôi bị dị ứng với một số thực phẩm, cần lời khuyên về chế độ ăn an toàn",
    },
    {
      id: 3,
      text: "🍳 Gợi ý công thức nấu ăn",
      message: "Hãy gợi ý cho tôi một số công thức nấu ăn dinh dưỡng và dễ làm",
    },
    {
      id: 4,
      text: "💪 Dinh dưỡng cho tập luyện",
      message: "Tôi cần tư vấn dinh dưỡng để hỗ trợ tập luyện thể thao",
    },
  ];

  const handleQuickAction = (message: string) => {
    setInputText(message);
  };

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const originalMessage = inputText.trim();
    setInputText("");
    setIsLoading(true);

    try {
      // Call AI service để lấy phản hồi thực tế
      const aiResponse = await generateNutritionAnswerFromAI(userMessage.text);

      // Kiểm tra nếu response là error message thì dùng fallback
      const isErrorResponse =
        aiResponse.includes("vấn đề kỹ thuật") ||
        aiResponse.includes("thử lại sau") ||
        aiResponse.includes("yêu cầu");

      const finalResponse = isErrorResponse
        ? getFallbackNutritionAdvice(originalMessage)
        : aiResponse;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: finalResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Sử dụng fallback thông minh thay vì error message chung
      const fallbackResponse = getFallbackNutritionAdvice(originalMessage);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      // Chỉ hiển thị alert nếu là lỗi nghiêm trọng
      if (error instanceof Error && error.message.includes("401")) {
        Alert.alert(
          "Lỗi xác thực",
          "Có vấn đề với API key. Vui lòng liên hệ quản trị viên.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.background[colorScheme ?? "light"],
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <HStack
          alignItems="center"
          p="$4"
          style={{ backgroundColor: Colors.primary }}
          borderBottomWidth="$1"
          borderBottomColor="$gray200"
        >
          <Pressable onPress={() => router.back()} mr="$3">
            <Ionicons name="arrow-back" size={24} color={Colors.text.light} />
          </Pressable>
          <VStack flex={1}>
            <Text
              fontSize="$lg"
              fontWeight="$semibold"
              color={Colors.text.light}
            >
              Chat với AI
            </Text>
            <Text
              fontSize="$sm"
              style={{ color: Colors.text.light, opacity: 0.8 }}
            >
              NutriGuardian Assistant
            </Text>
          </VStack>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: "100%",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image source={ai_rec} style={{ width: "100%", height: "100%" }} alt="AI" />
          </View>
        </HStack>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{
            flex: 1,
            backgroundColor: Colors.background[colorScheme ?? "light"],
          }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              alignSelf={message.isUser ? "flex-end" : "flex-start"}
              maxWidth="80%"
              mb="$3"
            >
              <Box
                style={{
                  backgroundColor: message.isUser
                    ? Colors.primary
                    : Colors.background.light,
                  padding: 12,
                  borderRadius: 16,
                  borderWidth: message.isUser ? 0 : 1,
                  borderColor: message.isUser ? "transparent" : "#e5e7eb",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <FormattedText text={message.text} isUser={message.isUser} />
              </Box>
              <Text
                style={{
                  fontSize: 12,
                  color: Colors.text.secondary,
                  marginTop: 4,
                  textAlign: message.isUser ? "right" : "left",
                }}
              >
                {message.timestamp.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </Box>
          ))}

          {/* Quick Actions - chỉ hiển thị khi chưa có tin nhắn nào từ user */}
          {messages.length === 1 && !isLoading && (
            <Box mb="$4">
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.text.secondary,
                  marginBottom: 12,
                  textAlign: "center",
                }}
              >
                Hoặc chọn một trong những chủ đề phổ biến:
              </Text>
              <VStack space="sm">
                {quickActions.map((action) => (
                  <Pressable
                    key={action.id}
                    onPress={() => handleQuickAction(action.message)}
                    style={{
                      backgroundColor: Colors.background.light,
                      borderWidth: 1,
                      borderColor: Colors.primary,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.primary,
                        fontSize: 14,
                        textAlign: "center",
                        fontWeight: "500",
                      }}
                    >
                      {action.text}
                    </Text>
                  </Pressable>
                ))}
              </VStack>
            </Box>
          )}

          {isLoading && (
            <Box alignSelf="flex-start" maxWidth="80%" mb="$3">
              <Box
                style={{
                  backgroundColor: Colors.background.light,
                  padding: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#e5e7eb",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <HStack alignItems="center" space="sm">
                  <Text style={{ color: Colors.text.secondary, fontSize: 14 }}>
                    AI đang soạn tin nhắn
                  </Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text
                      style={{
                        color: Colors.primary,
                        fontSize: 16,
                        fontWeight: "bold",
                        marginLeft: 2,
                      }}
                    >
                      ...
                    </Text>
                  </View>
                </HStack>
              </Box>
            </Box>
          )}
        </ScrollView>

        {/* Input */}
        <HStack
          p="$4"
          style={{ backgroundColor: Colors.background.light }}
          borderTopWidth="$1"
          borderTopColor="$gray200"
          alignItems="flex-end"
          space="md"
        >
          <Input
            flex={1}
            variant="outline"
            size="md"
            style={{
              backgroundColor: Colors.input.background,
              borderColor: "#e5e7eb",
              borderRadius: 20,
              minHeight: 50,
              height: "auto",
            }}
          >
            <InputField
              placeholder="Nhập câu hỏi về dinh dưỡng, sức khỏe..."
              placeholderTextColor={Colors.input.placeholder}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              multiline
              style={{
                minHeight: 40,
                maxHeight: 120,
                color: Colors.text.primary,
                paddingHorizontal: 16,
                paddingVertical: 12,
                textAlignVertical: "top",
              }}
            />
          </Input>
          <Button
            variant="solid"
            isDisabled={!inputText.trim() || isLoading}
            onPress={handleSendMessage}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 25,
              width: 55,
              height: 55,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="send" size={16} color={Colors.text.light} />
          </Button>
        </HStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
