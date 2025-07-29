import React, { ReactNode } from "react";
import {
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import type { RendererInterface } from "react-native-marked";
import { Renderer, useMarkdown } from "react-native-marked";
import { Citation } from "./Citation";

interface MarkdownRendererProps {
  content: string;
  style: any;
  fontSize: number;
  enableMarkdown?: boolean;
  citations?: Citation[];
  onCitationPress?: (citation: Citation) => void;
  citationBubbleColor?: string;
}

class CustomRenderer extends Renderer implements RendererInterface {
  private citations: Citation[];
  private onCitationPress?: (citation: Citation) => void;
  private citationBubbleColor: string;
  private fontSize: number;

  constructor(
    citations: Citation[] = [],
    onCitationPress?: (citation: Citation) => void,
    citationBubbleColor: string = "#4a4a4a",
    fontSize: number = 14
  ) {
    super();
    this.citations = citations;
    this.onCitationPress = onCitationPress;
    this.citationBubbleColor = citationBubbleColor;
    this.fontSize = fontSize;
  }

  // Sovrascrivo solo il metodo link per gestire le citazioni
  link(
    children: string | ReactNode[],
    href: string,
    styles?: TextStyle
  ): ReactNode {
    // Se è un link di citazione, renderizza come CitationBubble
    if (href && href.startsWith("citation://")) {
      const citationId = href.replace("citation://", "");
      const citation = this.citations.find(
        (c) => c.id.toString() === citationId
      );

      if (citation) {
        return (
          <TouchableOpacity
            key={this.getKey()}
            onPress={() =>
              this.onCitationPress && this.onCitationPress(citation)
            }
            style={{
              backgroundColor: this.citationBubbleColor,
              width: Math.max(this.fontSize + 2, 16),
              height: Math.max(this.fontSize + 2, 16),
              borderRadius: Math.max(this.fontSize + 2, 16) / 2,
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: 1,
              marginTop: -2,
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={{
                color: "white",
                fontSize: Math.max(this.fontSize - 4, 8),
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {citation.id}
            </Text>
          </TouchableOpacity>
        );
      }
    }

    // Per tutti gli altri link, usa il comportamento di default della classe padre
    return super.link(children, href, styles);
  }
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
  if (!enableMarkdown) {
    return <Text style={[style, { fontSize: fontSize }]}>{content}</Text>;
  }

  // Trasformiamo i placeholder delle citazioni in link markdown
  let processedContent = content;
  if (citations && citations.length > 0) {
    citations.forEach((citation) => {
      const placeholder = `◐${citation.id}◑`;
      if (processedContent.includes(placeholder)) {
        processedContent = processedContent.replace(
          placeholder,
          `[${citation.id}](citation://${citation.id})`
        );
      }
    });
  }

  const baseTextStyle: TextStyle = {
    fontSize: fontSize,
    color: style?.color || "#2c2c2c",
    fontWeight: "300",
    lineHeight: fontSize * 1.4,
  };

  try {
    const renderer = new CustomRenderer(
      citations,
      onCitationPress,
      citationBubbleColor,
      fontSize
    );

    const elements = useMarkdown(processedContent, {
      renderer: renderer,
      styles: {
        // Basic text styles
        text: {
          ...baseTextStyle,
        },

        // Headings
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

        // Inline code
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
          backgroundColor: "rgba(0,0,0,0.1)",
          padding: 8,
          borderRadius: 6,
          marginVertical: 0,
          height: "auto",
          minHeight: 0,
          maxHeight: undefined,
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
      const safeElements = elements.map((element, index) =>
        React.isValidElement(element) ? (
          element
        ) : (
          <Text key={`text-${index}`} style={baseTextStyle}>
            {element}
          </Text>
        )
      );

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
                marginTop: 14,
                paddingTop: 0,
                marginBottom: 0,
                paddingBottom: 0,
                width: "90%",
              }}
            >
              {element}
            </View>
          ))}
        </View>
      );
    }
  } catch (error) {
    console.warn("MarkdownRenderer error:", error);
  }

  return <Text style={[style, { fontSize: fontSize }]}>{content}</Text>;
};

export default MarkdownRenderer;
