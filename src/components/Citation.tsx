import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Interfaccia per le citazioni
export interface Citation {
  id: number;
  src: string;
  page: string;
  total_pages: string;
  displayText: string;
}

// Componente per il pallino della citazione
export const CitationBubble: React.FC<{
  citation: Citation;
  onPress: () => void;
  citationBubbleColor: string;
  fontSize?: number;
}> = ({ citation, onPress, citationBubbleColor, fontSize = 12 }) => {
  // Calcola le dimensioni del pallino basate sul fontSize - più piccole per le citazioni
  const bubbleSize = Math.max(fontSize + 2, 16); // Minimo 16px, più discreto
  const textSize = Math.max(fontSize - 4, 8); // Testo più piccolo per le citazioni

  return (
    <TouchableOpacity
      style={[
        styles.citationBubble,
        {
          backgroundColor: citationBubbleColor,
          width: bubbleSize,
          height: bubbleSize,
          borderRadius: bubbleSize / 2,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.citationNumber, { fontSize: textSize }]}>
        {citation.id}
      </Text>
    </TouchableOpacity>
  );
};

// Componente per il tooltip della citazione
export const CitationTooltip: React.FC<{
  citation: Citation;
  visible: boolean;
  onClose: () => void;
  sourceTitle: string;
  pageText: string;
  ofText: string;
}> = ({ citation, visible, onClose, sourceTitle, pageText, ofText }) => {
  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.tooltipOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltipTitle}>{sourceTitle}</Text>
          <Text style={styles.tooltipText}>{citation.src}</Text>
          <Text style={styles.tooltipPage}>
            {pageText} {citation.page} {ofText} {citation.total_pages}
          </Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  citationBubble: {
    // Le dimensioni sono ora calcolate dinamicamente
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    marginRight: 4,
  },
  citationNumber: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  tooltipContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    maxWidth: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  tooltipText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  tooltipPage: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
