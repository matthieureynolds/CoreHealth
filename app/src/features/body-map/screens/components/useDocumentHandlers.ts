import { Alert } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  DocumentProcessor,
  ProcessedDocument,
  ExtractedBiomarker,
} from "@shared/services/data/documentProcessor";

interface UseDocumentHandlersParams {
  uploadedDocuments: ProcessedDocument[];
  setUploadedDocuments: React.Dispatch<
    React.SetStateAction<ProcessedDocument[]>
  >;
  setProcessedDocuments: React.Dispatch<
    React.SetStateAction<ProcessedDocument[]>
  >;
  setIsProcessing: (id: string | null) => void;
  setProcessingStep: (step: string) => void;
  setExtractedBiomarkers: React.Dispatch<
    React.SetStateAction<ExtractedBiomarker[]>
  >;
  onOrganPress: (organId: string) => void;
}

export const useDocumentHandlers = ({
  uploadedDocuments,
  setUploadedDocuments,
  setProcessedDocuments,
  setIsProcessing,
  setProcessingStep,
  setExtractedBiomarkers,
  onOrganPress,
}: UseDocumentHandlersParams) => {
  const handleProcessDocument = async (document: any) => {
    setIsProcessing(document.id);
    setProcessingStep("Preparing document...");

    try {
      setProcessingStep("📷 Scanning document with AI...");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setProcessingStep("🧠 Extracting biomarkers with GPT...");
      const processedDoc = await DocumentProcessor.processDocument(
        document.uri,
        document.name,
      );

      setProcessingStep("✅ Processing complete!");
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProcessedDocuments((prev) => [...prev, processedDoc]);
      setExtractedBiomarkers((prev) => [
        ...prev,
        ...processedDoc.extractedBiomarkers,
      ]);

      const updatedBiomarkers = DocumentProcessor.updateOrganBiomarkers(
        processedDoc.extractedBiomarkers,
      );
      const biomarkerCount = processedDoc.extractedBiomarkers.length;
      const processingTime = processedDoc.processingTimeMs
        ? Math.round(processedDoc.processingTimeMs / 1000)
        : 0;

      Alert.alert(
        "🎉 Success!",
        `Found ${biomarkerCount} biomarkers in ${processingTime}s!\n\nYour body map has been updated with the latest lab results.`,
        [
          {
            text: "View Results",
            onPress: () => {
              const firstOrgan = Object.keys(updatedBiomarkers)[0];
              if (firstOrgan) {
                onOrganPress(firstOrgan);
              }
            },
          },
          { text: "Continue", style: "cancel" },
        ],
      );
    } catch (error) {
      console.error("Document processing error:", error);
      Alert.alert(
        "Processing Error",
        "Failed to process document. Please try again with a clearer image or different document.",
      );
    } finally {
      setIsProcessing(null);
      setProcessingStep("");
    }
  };

  const handleCameraPress = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to scan documents.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const newDoc: ProcessedDocument & { uri: string; size: number } = {
        id: Date.now().toString(),
        type: "unknown" as const,
        uri: result.assets[0].uri,
        name: `Scanned Document ${uploadedDocuments.length + 1}`,
        uploadDate: new Date(),
        extractedBiomarkers: [],
        confidence: 0,
        size: result.assets[0].fileSize || 0,
      };
      setUploadedDocuments((prev) => [...prev, newDoc]);
      Alert.alert(
        "Document Scanned Successfully! 📱",
        'Your document is ready for processing. Tap "Scan My Results" to extract biomarkers using AI.',
        [
          { text: "Later", style: "cancel" },
          { text: "Scan Now", onPress: () => handleProcessDocument(newDoc) },
        ],
      );
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select a file smaller than 10MB for optimal processing.",
          );
          return;
        }

        const newDoc: ProcessedDocument & { uri: string; size: number } = {
          id: Date.now().toString(),
          type: "unknown" as const,
          uri: asset.uri,
          name: asset.name || `Document ${uploadedDocuments.length + 1}`,
          uploadDate: new Date(),
          extractedBiomarkers: [],
          confidence: 0,
          size: asset.size || 0,
        };
        setUploadedDocuments((prev) => [...prev, newDoc]);
        Alert.alert(
          "Document Uploaded Successfully! 📄",
          'Your document is ready for processing. Tap "Scan My Results" to extract biomarkers using AI.',
          [
            { text: "Later", style: "cancel" },
            { text: "Scan Now", onPress: () => handleProcessDocument(newDoc) },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        "Upload Error",
        "Failed to upload document. Please try again.",
      );
    }
  };

  return { handleCameraPress, handleDocumentPicker, handleProcessDocument };
};
