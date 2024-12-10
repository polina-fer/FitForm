import { Image, StyleSheet, Platform, Button, Alert } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import VideoPicker from "@/components/MediaPicker";

export default function HomeScreen() {
  const handleSubmit = async () => {
    try {
      const response = await fetch("http://192.168.178.48:8000/test", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      Alert.alert("Success", data);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to connect to the backend");
    }
  };
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to FitForm App!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedText>
        Detect joints in a video in real time or in an uploaded file
      </ThemedText>
      <ThemedView style={styles.stepContainer}>
        <Button
          title="Open camera"
          onPress={() => Alert.alert("Simple Button pressed")}
        />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <VideoPicker />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
