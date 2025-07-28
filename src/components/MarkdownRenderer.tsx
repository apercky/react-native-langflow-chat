import React, { ReactElement } from "react";
import { Platform, Text, View } from "react-native";
import { useMarkdown } from "react-native-marked";

interface MarkdownRendererProps {
  content: string;
  style: any;
  fontSize: number;
  enableMarkdown?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  style,
  fontSize,
  enableMarkdown = true,
}) => {
  // Disable markdown on web to avoid compatibility issues
  if (!enableMarkdown) {
    return <Text style={[style, { fontSize: fontSize }]}>{content}</Text>;
  }

  try {
    // Create safe base text style for React Native only
    const baseTextStyle = {
      fontSize: fontSize,
      color: style?.color || "#2c2c2c",
      fontWeight: "300" as const,
      lineHeight: fontSize * 1.4,
    };

    // Use useMarkdown hook with safer styles
    const elements = useMarkdown(content, {
      styles: {
        // Basic text styles
        text: {
          ...baseTextStyle,
        },

        // Headings with safe properties
        h1: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 8, 18),
          fontWeight: "bold" as const,
          marginVertical: 4,
        },
        h2: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 5, 16),
          fontWeight: "bold" as const,
          marginVertical: 3,
        },
        h3: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 3, 15),
          fontWeight: "bold" as const,
          marginVertical: 2,
        },

        // Paragraphs
        paragraph: {
          ...baseTextStyle,
          overflow: "hidden",
        },

        // Bold text
        strong: {
          ...baseTextStyle,
          fontWeight: "bold" as const,
          overflow: "hidden",
        },

        // Italic text
        em: {
          ...baseTextStyle,
          fontStyle: "italic" as const,
          overflow: "hidden",
        },

        // Inline code with safe properties
        codespan: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize - 1, 11),
          fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
          backgroundColor: "rgba(0,0,0,0.1)",
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 4,
          overflow: "hidden",
        },

        // Code blocks
        code: {
          ...baseTextStyle,
          backgroundColor: "rgba(0,0,0,0.1)",
          padding: 8,
          borderRadius: 6,
          marginVertical: 4,
          overflow: "hidden",
        },

        // List items
        li: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize, 10),
          fontWeight: "normal" as const,
          marginVertical: 0,
          overflow: "hidden",
        },

        list: {
          ...baseTextStyle,
          left: 0,
          overflow: "hidden",
          marginVertical: 0,
        },

        // Links
        link: {
          ...baseTextStyle,
          color: "#007AFF",
          textDecorationLine: "underline" as const,
          overflow: "hidden",
        },

        // Blockquotes
        blockquote: {
          ...baseTextStyle,
          borderLeftWidth: 3,
          borderLeftColor: "#ccc",
          paddingLeft: 8,
          marginVertical: 4,
          backgroundColor: "rgba(0,0,0,0.05)",
          paddingVertical: 4,
        },
      },
    });

    if (elements && elements.length > 0) {
      // Cast elements to ReactElement[] to ensure type safety
      const safeElements = elements.map((element) => element as ReactElement);

      // Go back to using View-based rendering but with better styling
      return (
        <View
          style={{
            width: "85%",
            marginTop: 0,
            paddingTop: 0,
            marginBottom: 0,
            paddingBottom: 0,
          }}
        >
          {safeElements.map((element, index) => (
            <View
              key={`markdown-${index}`}
              style={{
                marginTop: 14,
                paddingTop: 0,
                marginBottom: 0,
                paddingBottom: 0,
              }}
            >
              {element}
            </View>
          ))}
        </View>
      );
    }
  } catch (error) {
    // Fallback to plain text if markdown rendering fails
    console.warn("MarkdownRenderer error:", error);
  }

  // Final fallback
  return <Text style={[style, { fontSize: fontSize }]}>{content}</Text>;
};

export default MarkdownRenderer;
