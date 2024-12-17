import React, { useState, useRef } from "react";
import { View, Button, Alert, Image, StyleSheet } from "react-native";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";

export default function MediaPicker() {
  const videoRef = useRef<Video>(null);
  const [mediaUri, setMediaUri] = useState("");
  const [isVideo, setIsVideo] = useState(false);
  const [processedVideoUri, setProcessedVideoUri] = useState("");

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
  async function handleSubmit() {
    if (!mediaUri) {
      alert("No media URI available to fetch.");
      return;
    }

    try {
      // Step 1: Fetch the video file from the mediaUri
      const response = await fetch(mediaUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Step 2: Transform Blob into a File
      const file = new File([blob], "video.mp4", { type: blob.type });

      // Step 3: Create FormData and append the file
      const formData = new FormData();
      formData.append("file", file);

      // Step 4: Upload the video file to the server for processing
      const uploadResponse = await fetch("http://192.168.178.48:8000/video", {
        method: "POST",
        headers: {
          Accept: "application/json", // or "video/mp4" if the server returns video directly
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorDetails = await uploadResponse.text();
        throw new Error(`Error processing video: ${errorDetails}`);
      }

      // Step 5: Receive the base64-encoded video from the server
      const responseJson = await uploadResponse.json();
      const base64Video = responseJson.video;

      // Step 6: Decode the base64 string into binary data
      const binaryString = atob(base64Video);
      const byteArray = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }

      // Step 7: Create a Blob URL from the binary data
      const videoBlob = new Blob([byteArray], { type: "video/mp4" });
      const videoUrl = URL.createObjectURL(videoBlob);

      // Step 8: Set the processed video URL for the video component
      setProcessedVideoUri(videoUrl);
      alert("Video processed successfully!");
    } catch (error) {
      console.error(error);
      alert("Error processing video.");
    }
  }

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
          />
        ) : (
          <Image
            source={{ uri: mediaUri }}
            style={styles.media}
            resizeMode="contain"
          />
        ))}
      <Button title="Upload file" onPress={handleSubmit} />
      {processedVideoUri && (
        <Video
          source={{ uri: processedVideoUri }}
          useNativeControls
          isLooping
          style={styles.media}
        />
      )}
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
