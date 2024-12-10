import React, { useState, useRef } from "react";
import { View, Button, Alert, Image, StyleSheet } from "react-native";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";

export default function MediaPicker() {
  const videoRef = useRef<Video>(null);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);

  const pickMediaFromGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Denied", "Gallery access is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const isVideo = result.assets[0].type === "video";
        setIsVideo(isVideo);
        setMediaUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while picking the media.");
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pick Media from Gallery" onPress={pickMediaFromGallery} />
      {mediaUri &&
        (isVideo ? (
          <Video
            ref={videoRef}
            source={{ uri: mediaUri }}
            useNativeControls
            isLooping
            style={styles.media}
            onPlaybackStatusUpdate={(status) => console.log(status)}
          />
        ) : (
          <Image
            source={{ uri: mediaUri }}
            style={styles.media}
            resizeMode="contain"
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  media: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
});
