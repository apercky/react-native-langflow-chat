import React from "react";
import { Platform, Text, TextStyle, View } from "react-native";
import { useMarkdown } from "react-native-marked";
import { Citation, CitationBubble } from "./Citation";

interface MarkdownRendererProps {
  content: string;
  style: any;
  fontSize: number;
  enableMarkdown?: boolean;
  citations?: Citation[];
  onCitationPress?: (citation: Citation) => void;
  citationBubbleColor?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  style,
  fontSize,
  enableMarkdown = true,
  citations = [],
  onCitationPress,
  citationBubbleColor = "#4a4a4a",
}) => {
  // Disable markdown on web to avoid compatibility issues
  if (!enableMarkdown) {
    return <Text style={[style, { fontSize: fontSize }]}>{content}</Text>;
  }

  // Metodo semplificato per gestire le citazioni direttamente
  if (citations && citations.length > 0) {
    const hasCitationPlaceholders = citations.some((citation) =>
      content.includes(`◐${citation.id}◑`)
    );

    if (hasCitationPlaceholders) {
      // Approccio diretto senza usare markdown per il contenuto con citazioni
      // Tratta ogni paragrafo separatamente
      const paragraphs = content.split("\n\n");
      const renderedParagraphs = paragraphs.map((paragraph, paragraphIndex) => {
        // Se il paragrafo non contiene citazioni, renderizzalo normalmente
        if (
          !citations.some((citation) => paragraph.includes(`◐${citation.id}◑`))
        ) {
          return (
            <Text key={`para-${paragraphIndex}`} style={style}>
              {paragraph}
            </Text>
          );
        }

        // Altrimenti, processa le citazioni nel paragrafo
        let currentText = paragraph;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        // Ordina le citazioni per posizione
        const citationPositions = citations
          .map((citation) => {
            const placeholder = `◐${citation.id}◑`;
            const index = currentText.indexOf(placeholder);
            return { citation, index, placeholder };
          })
          .filter((item) => item.index !== -1)
          .sort((a, b) => a.index - b.index);

        if (citationPositions.length === 0) {
          // Non ci sono citazioni in questo paragrafo
          return (
            <Text key={`para-${paragraphIndex}`} style={style}>
              {paragraph}
            </Text>
          );
        }

        // Processa ogni citazione in questo paragrafo
        citationPositions.forEach(({ citation, index, placeholder }) => {
          if (index > lastIndex) {
            // Aggiungi testo prima della citazione
            parts.push(currentText.substring(lastIndex, index));
          }

          // Aggiungi la bolla della citazione (inline)
          parts.push(
            <CitationBubble
              key={`citation-${paragraphIndex}-${citation.id}`}
              citation={citation}
              onPress={() => onCitationPress && onCitationPress(citation)}
              citationBubbleColor={citationBubbleColor}
              fontSize={fontSize}
            />
          );

          lastIndex = index + placeholder.length;
        });

        // Aggiungi il testo rimanente
        if (lastIndex < currentText.length) {
          parts.push(currentText.substring(lastIndex));
        }

        // Renderizza l'intero paragrafo come un unico elemento Text
        // Questo è cruciale per mantenere tutto sulla stessa riga
        return (
          <Text key={`para-${paragraphIndex}`} style={style}>
            {parts}
          </Text>
        );
      });

      // Renderizza tutti i paragrafi
      return (
        <View style={{ width: "100%" }}>
          {renderedParagraphs.map((paragraph, index) => (
            <View
              key={`paragraph-container-${index}`}
              style={{
                marginTop: index > 0 ? 14 : 0,
                marginBottom: 0,
              }}
            >
              {paragraph}
            </View>
          ))}
        </View>
      );
    }
  }

  try {
    // Create safe base text style for React Native only
    const baseTextStyle: TextStyle = {
      fontSize: fontSize,
      color: style?.color || "#2c2c2c",
      fontWeight: "300",
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
          fontWeight: "bold",
          marginVertical: 4,
        },
        h2: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 5, 16),
          fontWeight: "bold",
          marginVertical: 3,
        },
        h3: {
          ...baseTextStyle,
          fontSize: Math.max(fontSize + 3, 15),
          fontWeight: "bold",
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
          fontWeight: "bold",
          overflow: "hidden",
        },

        // Italic text
        em: {
          ...baseTextStyle,
          fontStyle: "italic",
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
          fontWeight: "normal",
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
          textDecorationLine: "underline",
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
      const safeElements = elements.map((element) =>
        React.isValidElement(element) ? (
          element
        ) : (
          <Text style={baseTextStyle}>{element}</Text>
        )
      );

      // Go back to using View-based rendering but with better styling
      return (
        <View
          style={{
            width: "100%",
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
                marginTop: index > 0 ? 14 : 0,
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
