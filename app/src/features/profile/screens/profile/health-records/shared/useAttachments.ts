import { useState, useCallback } from "react";
import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { AttachedFile } from "@shared/types";

export function useAttachments(initial: AttachedFile[] = []) {
  const [attachments, setAttachments] = useState<AttachedFile[]>(initial);

  const pickFile = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length) {
        const a = result.assets[0];
        setAttachments((prev) => [
          ...prev,
          { uri: a.uri, name: a.name || "attachment", type: a.mimeType },
        ]);
      }
    } catch {
      Alert.alert("Attachment Error", "Failed to attach file.");
    }
  }, []);

  const removeFile = useCallback((name: string) => {
    setAttachments((prev) => prev.filter((a) => a.name !== name));
  }, []);

  return { attachments, setAttachments, pickFile, removeFile };
}
