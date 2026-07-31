import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AttachedFile } from "@shared/types";
import { formModalStyles as s } from "./formModalStyles";

interface AttachmentsSectionProps {
  attachments: AttachedFile[];
  onAdd: () => void;
  onRemove: (name: string) => void;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  attachments,
  onAdd,
  onRemove,
}) => (
  <>
    <Text style={s.sectionLabel}>Attachments</Text>
    <View style={s.attachRow}>
      {attachments.map((file) => (
        <View key={file.uri} style={s.attachChip}>
          <Ionicons
            name={
              file.type?.includes("pdf") ? "document-outline" : "image-outline"
            }
            size={14}
            color="#FFFFFF"
          />
          <Text style={s.attachText} numberOfLines={1}>
            {file.name}
          </Text>
          <TouchableOpacity onPress={() => onRemove(file.name)}>
            <Ionicons
              name="close"
              size={14}
              color="#FFFFFF"
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={s.addAttach} onPress={onAdd}>
        <Ionicons name="attach" size={16} color="#3AABF0" />
        <Text style={s.addAttachText}>Add file</Text>
      </TouchableOpacity>
    </View>
    <Text style={s.attachHelp}>PDFs and images are supported.</Text>
  </>
);

export default AttachmentsSection;
