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
  if (!enableMarkdown || !useMarkdown) {
    // Anche il testo normale deve usare fontSize per coerenza
    return <Text style={[style, { fontSize: fontSize }]}>{content}</Text>;
  }

  try {
    // Crea uno stile base con il fontSize per assicurare consistenza
    const baseTextStyle = {
      ...style,
      fontSize: fontSize,
    };

    // Usa useMarkdown hook invece del componente per evitare VirtualizedLists nested
    const elements = useMarkdown(content, {
      styles: {
        // Stile di default per tutto il testo
        text: baseTextStyle,
        body: baseTextStyle,
        root: baseTextStyle,

        // Headings proporzionali al fontSize
        heading1: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 8, 18),
          fontWeight: "bold",
          marginVertical: 4,
        },
        heading2: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 5, 16),
          fontWeight: "bold",
          marginVertical: 3,
        },
        heading3: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 3, 15),
          fontWeight: "bold",
          marginVertical: 2,
        },

        // Paragrafi con dimensione base
        paragraph: {
          ...baseTextStyle,
          marginVertical: 2,
        },

        // Testo in grassetto - mantiene la dimensione base
        strong: {
          ...baseTextStyle,
          fontWeight: "bold",
        },

        // Testo in corsivo - mantiene la dimensione base
        em: {
          ...baseTextStyle,
          fontStyle: "italic",
        },

        // Codice inline - leggermente più piccolo
        codespan: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize - 1, 11),
          fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
          backgroundColor: "rgba(0,0,0,0.1)",
          paddingHorizontal: 4,
          paddingVertical: 2,
          borderRadius: 4,
        },

        // Blocchi di codice - leggermente più piccoli
        code: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize - 1, 11),
          fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
          backgroundColor: "rgba(0,0,0,0.1)",
          padding: 8,
          borderRadius: 6,
          marginVertical: 4,
        },

        // Elementi di lista - dimensione base
        listItem: {
          ...baseTextStyle,
          marginVertical: 1,
        },

        // Link - dimensione base
        link: {
          ...baseTextStyle,
          color: "#007AFF",
          textDecorationLine: "underline",
        },

        // Citazioni - dimensione base
        blockquote: {
          ...baseTextStyle,
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
  return <Text style={[style, { fontSize: fontSize }]}>{content}</Text>;
};

export default MarkdownRenderer;
