import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { HealthAssistantService } from "@shared/services/ai/healthAssistantService";
import { DataService } from "@shared/services/data/dataService";
import { api } from "@shared/services/data/apiClient";
import { fetchAuthSession } from "aws-amplify/auth";
import type { ChatMessage } from "../types";

interface UseMediaInputParams {
  profile: any;
  biomarkers: any;
  healthScore: any;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsLoading: (v: boolean) => void;
  generateId: (prefix: string) => string;
  stripEmojis: (input: string) => string;
  onBiomarkersAdded?: () => void;
}

export function useMediaInput({
  profile,
  biomarkers,
  healthScore,
  setMessages,
  setIsLoading,
  generateId,
  stripEmojis,
  onBiomarkersAdded,
}: UseMediaInputParams) {
  const [showImageInputModal, setShowImageInputModal] = useState(false);
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageInputText, setImageInputText] = useState("");

  const handleImageInput = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
      setImageInputText("");
      setShowImageInputModal(true);
    }
  };

  const sendImageWithText = async () => {
    if (!selectedImage) return;
    setIsLoading(true);
    setShowImageInputModal(false);
    try {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: imageInputText.trim() || "[Image]",
          timestamp: new Date(),
          imageUri: selectedImage.uri,
        },
      ]);
      const prompt =
        imageInputText.trim() ||
        "Please analyze this image and provide any relevant health insights or descriptions.";
      const { analysis } = await DataService.analyzeImage(
        selectedImage.base64 ?? "",
        selectedImage.mimeType || "image/jpeg",
        prompt,
      );
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: stripEmojis(analysis || "[No analysis returned]"),
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert("Error", "Failed to analyze image.");
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
      setImageInputText("");
    }
  };

  const handleDocumentInput = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf"],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setIsLoading(true);
      try {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "user",
            content: asset.name || "[Document]",
            timestamp: new Date(),
            documentName: asset.name,
            documentUri: asset.uri,
          },
        ]);
        let aiContent = "[No analysis returned]";
        if (asset.mimeType && asset.mimeType.startsWith("image/")) {
          const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: "base64",
          });
          const { analysis } = await DataService.analyzeImage(
            base64,
            asset.mimeType || "image/jpeg",
          );
          aiContent = stripEmojis(analysis || "[No analysis returned]");
        } else if (asset.mimeType === "application/pdf") {
          try {
            const MAX_PDF_BYTES = 5 * 1024 * 1024; // 5MB — API Gateway limit is 10MB, base64 inflates ~33%
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);
            if (fileInfo.exists && (fileInfo as any).size > MAX_PDF_BYTES) {
              aiContent =
                "This PDF is too large to process (over 5MB). Try splitting it into smaller files, or enter the key values manually.";
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: aiContent,
                  timestamp: new Date(),
                },
              ]);
              return;
            }
            const fileBase64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: "base64",
            });
            const session = await fetchAuthSession();
            const userId = session.tokens?.idToken?.payload?.sub as
              | string
              | undefined;
            if (!userId) throw new Error("Not authenticated");
            const response = await api.post<{
              reply: string;
              biomarkersAdded: number;
              recordsAdded: number;
            }>(`/users/${userId}/ai/chat`, {
              message: "",
              fileBase64,
              fileName: asset.name,
            });
            aiContent = stripEmojis(response.reply || "[No analysis returned]");
            if (response.recordsAdded > 0) {
              onBiomarkersAdded?.();
            }
          } catch (e: any) {
            console.error("PDF upload error:", e);
            const isTimeout =
              e?.message?.includes("504") ||
              e?.message?.includes("timeout") ||
              e?.message?.includes("408");
            aiContent = isTimeout
              ? "Your PDF is taking too long to process — it may have a lot of data. Try uploading a single page or a smaller section, or enter the key values manually."
              : "I received your PDF but had trouble processing it. Please try again or enter the values manually.";
          }
        }
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: stripEmojis(aiContent),
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error("Error analyzing document:", error);
        Alert.alert("Error", "Failed to analyze document.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    showImageInputModal,
    setShowImageInputModal,
    selectedImage,
    imageInputText,
    setImageInputText,
    handleImageInput,
    sendImageWithText,
    handleDocumentInput,
  };
}

// Plan and timeline history loading
interface UsePlanHistoryParams {
  setPlanHistory: (v: any[]) => void;
  setShowPlanHistory: (v: boolean) => void;
  setPlanHistoryLoading: (v: boolean) => void;
  setTimelineHistory: (v: any[]) => void;
  setShowTimelineHistory: (v: boolean) => void;
  setTimelineHistoryLoading: (v: boolean) => void;
  setTimelineHistoryTitle: (v: string) => void;
}

export function usePlanHistory({
  setPlanHistory,
  setShowPlanHistory,
  setPlanHistoryLoading,
  setTimelineHistory,
  setShowTimelineHistory,
  setTimelineHistoryLoading,
  setTimelineHistoryTitle,
}: UsePlanHistoryParams) {
  // TODO: wire to CDK health_alerts / timeline endpoints once built
  const openTimelineHistory = async (
    _type: "Supplement" | "Appointment" | "Lab",
    title: string,
  ) => {
    setTimelineHistoryTitle(title);
    setShowTimelineHistory(true);
    setTimelineHistory([]);
    setTimelineHistoryLoading(false);
  };

  const handleLoadPlanHistory = async () => {
    setShowPlanHistory(true);
    setPlanHistory([]);
    setPlanHistoryLoading(false);
  };

  return { openTimelineHistory, handleLoadPlanHistory };
}
