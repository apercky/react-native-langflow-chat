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
  markdownFontSize: number;
  enableMarkdown?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  style,
  markdownFontSize,
  enableMarkdown = true,
}) => {
  if (!enableMarkdown || !useMarkdown) {
    // Anche il testo normale deve usare markdownFontSize per coerenza
    return (
      <Text style={[style, { fontSize: markdownFontSize }]}>{content}</Text>
    );
  }

  try {
    // Usa useMarkdown hook invece del componente per evitare VirtualizedLists nested
    const elements = useMarkdown(content, {
      styles: {
        heading1: {
          fontSize: Math.max(markdownFontSize + 8, 18), // Più piccoli ma proporzionali
          fontWeight: "bold",
          marginVertical: 4,
          color: style.color || "#000",
        },
        heading2: {
          fontSize: Math.max(markdownFontSize + 5, 16),
          fontWeight: "bold",
          marginVertical: 3,
          color: style.color || "#000",
        },
        heading3: {
          fontSize: Math.max(markdownFontSize + 3, 15),
          fontWeight: "bold",
          marginVertical: 2,
          color: style.color || "#000",
        },
        paragraph: {
          ...style,
          fontSize: markdownFontSize, // Stessa dimensione del testo normale
          marginVertical: 2,
        },
        strong: {
          ...style,
          fontSize: markdownFontSize, // Stessa dimensione del testo normale
          fontWeight: "bold",
        },
        em: {
          ...style,
          fontSize: markdownFontSize, // Stessa dimensione del testo normale
          fontStyle: "italic",
        },
        codespan: {
          ...style,
          fontSize: Math.max(markdownFontSize - 1, 11),
          fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
          backgroundColor: "rgba(0,0,0,0.1)",
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 4,
        },
        code: {
          ...style,
          fontSize: Math.max(markdownFontSize - 1, 11),
          fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
          backgroundColor: "rgba(0,0,0,0.1)",
          padding: 8,
          borderRadius: 6,
          marginVertical: 4,
        },
        listItem: {
          ...style,
          fontSize: markdownFontSize, // Stessa dimensione del testo normale
          marginVertical: 1,
        },
        link: {
          ...style,
          fontSize: markdownFontSize, // Stessa dimensione del testo normale
          color: "#007AFF",
          textDecorationLine: "underline",
        },
        blockquote: {
          ...style,
          fontSize: markdownFontSize, // Stessa dimensione del testo normale
          fontStyle: "italic",
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
        <View
          style={{
            width: "100%",
            flexShrink: 1,
          }}
        >
          {elements.map((element: React.ReactNode, index: number) => (
            <View
              key={`markdown-${index}`}
              style={{
                width: "100%",
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
  }

  // Fallback finale con dimensione coerente
  return <Text style={[style, { fontSize: markdownFontSize }]}>{content}</Text>;
};

export default MarkdownRenderer;
