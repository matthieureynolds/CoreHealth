import { useState, useCallback } from "react";

export function useFileViewer() {
  const [fileViewerVisible, setFileViewerVisible] = useState(false);
  const [currentFileUri, setCurrentFileUri] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentFileType, setCurrentFileType] = useState("");

  const handleViewFile = useCallback(
    (fileUri: string, fileName: string, fileType?: string) => {
      setCurrentFileUri(fileUri);
      setCurrentFileName(fileName);
      setCurrentFileType(fileType || "");
      setFileViewerVisible(true);
    },
    [],
  );

  const closeFileViewer = useCallback(() => {
    setFileViewerVisible(false);
  }, []);

  return {
    fileViewerVisible,
    currentFileUri,
    currentFileName,
    currentFileType,
    handleViewFile,
    closeFileViewer,
  };
}
