import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

interface FileViewerModalProps {
  visible: boolean;
  onClose: () => void;
  fileUri: string;
  fileName: string;
  fileType?: string;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({
  visible,
  onClose,
  fileUri,
  fileName,
  fileType
}) => {
  const [webViewError, setWebViewError] = useState(false);

  // Determine file type from extension if not provided
  const getFileType = (uri: string, providedType?: string): string => {
    if (providedType) return providedType.toLowerCase();
    
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'image';
      case 'pages':
      case 'docx':
      case 'doc':
        return 'document';
      default:
        return 'unknown';
    }
  };

  const detectedFileType = getFileType(fileUri, fileType);

  const handleWebViewError = () => {
    setWebViewError(true);
  };

  const renderPDFWithWebView = () => {
    // Debug logging
    
    if (webViewError) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <Text style={styles.errorTitle}>Cannot Display PDF</Text>
          <Text style={styles.errorText}>
            Unable to display this PDF in the viewer. This might be due to file format or access restrictions.
          </Text>
          <Text style={styles.debugText}>URI: {fileUri}</Text>
          <TouchableOpacity 
            style={styles.fallbackButton} 
            onPress={() => {
              Linking.openURL(fileUri).catch((error) => {
                Alert.alert(
                  'Cannot Open File',
                  'Unable to open this file. Please try accessing it through your device\'s file manager.',
                  [{ text: 'OK' }]
                );
              });
            }}
          >
            <Text style={styles.fallbackButtonText}>Try Opening Externally</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // For local files, we need to handle them differently
    if (fileUri.startsWith('file://')) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="document" size={64} color="#3AABF0" />
          <Text style={styles.errorTitle}>Local PDF File</Text>
          <Text style={styles.errorText}>
            This PDF is stored locally on your device. WebView cannot directly access local files in Expo Go.
          </Text>
          <Text style={styles.debugText}>URI: {fileUri}</Text>
          <TouchableOpacity 
            style={styles.fallbackButton} 
            onPress={() => {
              Alert.alert(
                'Local File',
                'This file is stored locally. In a production app, you would be able to view it directly. For now, the file is safely stored with your appointment.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.fallbackButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <WebView
        source={{ uri: fileUri }}
        style={styles.webView}
        onError={(error) => {
          handleWebViewError();
        }}
        onHttpError={(error) => {
          handleWebViewError();
        }}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading PDF...</Text>
          </View>
        )}
      />
    );
  };

  const getFileIcon = () => {
    switch (detectedFileType) {
      case 'pdf':
        return 'document';
      case 'image':
        return 'image';
      case 'document':
        return 'document-text';
      default:
        return 'document';
    }
  };

  const getFileDescription = () => {
    return 'This file has been attached to your appointment. Tap "Open File" to view it.';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.fileName} numberOfLines={1}>
              {fileName}
            </Text>
            <Text style={styles.fileType}>
              {detectedFileType.toUpperCase()} File
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {detectedFileType === 'pdf' ? (
            renderPDFWithWebView()
          ) : (
            <View style={styles.nonPdfContainer}>
              <View style={styles.fileIconContainer}>
                <Ionicons name={getFileIcon()} size={64} color="#3AABF0" />
              </View>
              
              <Text style={styles.fileTitle}>{fileName}</Text>
              <Text style={styles.fileDescription}>
                {getFileDescription()}
              </Text>
              
              <TouchableOpacity 
                style={styles.openButton} 
                onPress={() => {
                  Linking.openURL(fileUri).catch((error) => {
                    Alert.alert(
                      'Cannot Open File',
                      'Unable to open this file. Please try accessing it through your device\'s file manager.',
                      [{ text: 'OK' }]
                    );
                  });
                }}
              >
                <Ionicons name="open-outline" size={20} color="#FFFFFF" />
                <Text style={styles.openButtonText}>Open File</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2C2C2E',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  fileType: {
    fontSize: 12,
    color: '#8E8E93',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#3A3A3C',
  },
  content: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  nonPdfContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3AABF020',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  fileTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  fileDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3AABF0',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  fallbackButton: {
    backgroundColor: '#3AABF0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  debugText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },
});

export default FileViewerModal;