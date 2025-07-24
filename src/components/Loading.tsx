import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

// Componente per l'animazione loading dots
export const LoadingDots: React.FC<{ style?: any; dotStyle?: any }> = ({
  style,
  dotStyle,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 3);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.loadingDotsContainer, style]}>
      {[0, 1, 2].map((index) => (
        <Text
          key={index}
          style={[
            styles.loadingDot,
            dotStyle,
            {
              opacity: index <= activeIndex ? 1 : 0.3,
            },
          ]}
        >
          •
        </Text>
      ))}
    </View>
  );
};

// Componente per la bubble di loading con three dots
export const LoadingBubble: React.FC<{
  botMessageStyle?: ViewStyle & TextStyle;
}> = ({ botMessageStyle }) => {
  return (
    <View style={styles.messageContainer}>
      <View style={styles.botMessageContainer}>
        <View
          style={[
            styles.messageBubble,
            styles.botMessageBubble,
            styles.loadingBubble,
            botMessageStyle, // Usa lo stesso stile delle bubble bot
          ]}
        >
          <LoadingDots
            style={styles.bubbleLoadingDots}
            dotStyle={[
              styles.bubbleLoadingDot,
              { color: botMessageStyle?.color || "#666" }, // Usa il colore del testo bot
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4, // Ridotto da 6 a 4
  },
  botMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16, // Ridotto da 18 a 16
    paddingVertical: 12, // Ridotto da 14 a 12
    borderRadius: 20, // Ridotto da 24 a 20
    marginVertical: 2,
  },
  botMessageBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 6, // Ridotto da 8 a 6
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  loadingDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    height: 20,
  },
  loadingDot: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    marginHorizontal: 1,
    lineHeight: 16,
  },
  loadingBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    // Rimuovo background e border fissi - userà quelli di botMessageBubble
  },
  bubbleLoadingDots: {
    marginLeft: 4,
  },
  bubbleLoadingDot: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
    marginHorizontal: 1,
    lineHeight: 16,
  },
});
