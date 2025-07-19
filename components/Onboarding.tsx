import { setOnboardingComplete } from "@/utils/onboardingStorage";

import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import PagerView from "react-native-pager-view";

const { width, height } = Dimensions.get("window");

const onboardingData = [
  {
    id: 1,
    title: "Chào mừng bạn đến với\ndịch vụ của chúng tôi",
    subtitle: "Chăm sóc sức khỏe của bạn là ưu tiên hàng đầu của chúng tôi",
    buttonText: "Bắt đầu",
    image: require("@/assets/images/onboarding.png"),
  },
  {
    id: 2,
    title: "Quản lý dị ứng\nthực phẩm thông minh",
    subtitle:
      "Theo dõi và cảnh báo các thành phần gây dị ứng trong thực phẩm một cách tự động",
    buttonText: "Tiếp theo",
    image: require("@/assets/images/slide1.png"),
  },
  {
    id: 3,
    title: "Kế hoạch dinh dưỡng\ncá nhân hóa",
    subtitle:
      "Tạo thực đơn phù hợp với nhu cầu dinh dưỡng và sở thích riêng của bạn",
    buttonText: "Tiếp theo",
    image: require("@/assets/images/slide2.png"),
  },
  {
    id: 4,
    title: "Hỗ trợ AI thông minh\nhàng ngày",
    subtitle:
      "Trợ lý AI giúp bạn lựa chọn món ăn phù hợp và tư vấn dinh dưỡng 24/7",
    buttonText: "Bắt đầu sử dụng",
    image: require("@/assets/images/slide3.png"),
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      const nextPage = currentPage + 1;
      pagerRef.current?.setPage(nextPage);
      setCurrentPage(nextPage);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await setOnboardingComplete();
      onComplete();
    } catch (error) {
      console.error("Error saving onboarding completion:", error);
      onComplete();
    }
  };

  const handlePageSelected = (e: any) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const renderSlide = (item: (typeof onboardingData)[0]) => (
    <View style={styles.slide}>
      <ImageBackground
        source={item.image}
        style={styles.backgroundImage}
        resizeMode="contain"
      >
        {/* Overlay */}
        <View style={styles.overlay} />

        {/* Content */}
        <View style={styles.content}>
          {/* Logo/Icon area */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Image
                source={require("@/assets/images/IMG_4837.png")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
                alt="logo"
              />
            </View>
          </View>

          {/* Main content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>

          {/* Dots Indicator */}
          <View style={styles.dotsContainer}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentPage
                        ? "#4FC3F7"
                        : "rgba(255,255,255,0.5)",
                  },
                ]}
              />
            ))}
          </View>

          {/* Button */}
          <View style={styles.buttonContainer}>
            {currentPage < onboardingData.length - 1 ? (
              <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>{item.buttonText}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleComplete}
                style={styles.getStartedButton}
              >
                <Text style={styles.getStartedButtonText}>
                  {item.buttonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {onboardingData.map((item) => (
          <View key={item.id} style={styles.page}>
            {renderSlide(item)}
          </View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  logoIcon: {
    width: 300,
    height: 300,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 36,
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: "#4FC3F7",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
  },
  nextButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  getStartedButton: {
    backgroundColor: "#4FC3F7",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
  },
  getStartedButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});
