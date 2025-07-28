import React from "react";
import { Platform, Text, View } from "react-native";

// Optional markdown support - only import if available
let ReactNativeMarked: any = null;
let useMarkdown: any = null;
try {
  const marked = require("react-native-marked");
  ReactNativeMarked = marked.default;
  useMarkdown = marked.useMarkdown;
} catch (error) {
  // react-native-marked not available, will use plain text
}

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
  if (!enableMarkdown || !useMarkdown || Platform.OS === "web") {
    return <Text style={[style, { fontSize: fontSize }]}>{content}</Text>;
  }

  try {
    // Create safe base text style for React Native only
    const baseTextStyle = {
      fontSize: fontSize,
      color: style?.color || "#2c2c2c",
      fontWeight: "400" as const,
    };

    // Use useMarkdown hook with safer styles
    const elements = useMarkdown(content, {
      styles: {
        // Basic text styles
        text: baseTextStyle,
        body: baseTextStyle,
        root: baseTextStyle,

        // Headings with safe properties
        heading1: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 8, 18),
          fontWeight: "bold" as const,
          marginVertical: 4,
        },
        heading2: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 5, 16),
          fontWeight: "bold" as const,
          marginVertical: 3,
        },
        heading3: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 3, 15),
          fontWeight: "bold" as const,
          marginVertical: 2,
        },

        // Paragraphs
        paragraph: {
          ...baseTextStyle,
          marginVertical: 2,
        },

        // Bold text
        strong: {
          ...baseTextStyle,
          fontWeight: "bold" as const,
        },

        // Italic text
        em: {
          ...baseTextStyle,
          fontStyle: "italic" as const,
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
        },

        // Code blocks
        code: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize - 1, 11),
          fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
          backgroundColor: "rgba(0,0,0,0.1)",
          padding: 8,
          borderRadius: 6,
          marginVertical: 4,
        },

        // List items
        listItem: {
          ...baseTextStyle,
          marginVertical: 1,
        },

        // Links
        link: {
          ...baseTextStyle,
          color: "#007AFF",
          textDecorationLine: "underline" as const,
        },

        // Blockquotes
        blockquote: {
          ...baseTextStyle,
          fontStyle: "italic" as const,
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
      return (
        <View style={{ width: "100%", flexShrink: 1 }}>
          {elements.map((element: React.ReactNode, index: number) => (
            <View key={`markdown-${index}`} style={{ width: "100%" }}>
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
