import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface LoadingProps {
  text1?: string;
  text2?: string;
}

function LoadingComponent(props: LoadingProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.spinner, { transform: [{ rotate: spin }] }]}
      >
        <View style={styles.innerCircle} />
      </Animated.View>
      <Text style={styles.text}>
        {props.text1 ? props.text1 : "Đang tìm kiếm món ăn an toàn cho bạn..."}
      </Text>
      <Text style={styles.subText}>
        {props.text2 ? props.text2 : "Kiểm tra thành phần để tránh dị ứng"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 6,
    borderColor: "#e0e0e0",
    borderTopColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  innerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#34C759",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default LoadingComponent;
