import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Citation, CitationBubble, CitationTooltip } from "./Citation";
import MarkdownRenderer from "./MarkdownRenderer";

// Interfacce per le citazioni
export interface ParsedMessage {
  text: string;
  citations: Citation[];
}

// Funzione per parsare i messaggi e estrarre le citazioni
export const parseMessageWithCitations = (text: string): ParsedMessage => {
  const citationRegex =
    /\[src name="([^"]+)" page="([^"]+)" total_pages="([^"]+)"\]/g;
  const citations: Citation[] = [];
  let citationCounter = 1;

  // Sostituiamo ogni citazione con un placeholder numerato
  const parsedText = text.replace(
    citationRegex,
    (match, src, page, total_pages) => {
      const citation: Citation = {
        id: citationCounter,
        src,
        page,
        total_pages,
        displayText: `${src} - Page ${page}/${total_pages}`,
      };
      citations.push(citation);
      return `◐${citationCounter++}◑`; // Placeholder temporaneo
    }
  );

  return { text: parsedText, citations };
};

// Componente principale per renderizzare il testo con citazioni
export const MessageWithCitations: React.FC<{
  text: string;
  messageStyle: any;
  sourceTooltipTitle: string;
  pageText: string;
  ofText: string;
  citationBubbleColor: string;
  enableMarkdown: boolean;
  markdownFontSize: number;
}> = ({
  text,
  messageStyle,
  sourceTooltipTitle,
  pageText,
  ofText,
  citationBubbleColor,
  enableMarkdown,
  markdownFontSize,
}) => {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
    null
  );
  const parsedMessage = parseMessageWithCitations(text);

  // Dividiamo il testo in parti e citazioni
  const renderTextWithCitations = () => {
    const parts: React.ReactNode[] = [];
    let currentText = parsedMessage.text;
    let keyCounter = 0;

    parsedMessage.citations.forEach((citation) => {
      const placeholder = `◐${citation.id}◑`;
      const splitIndex = currentText.indexOf(placeholder);

      if (splitIndex !== -1) {
        // Aggiungiamo il testo prima della citazione
        if (splitIndex > 0) {
          parts.push(
            <MarkdownRenderer
              key={`text-${keyCounter++}`}
              content={currentText.substring(0, splitIndex)}
              style={messageStyle}
              markdownFontSize={markdownFontSize}
              enableMarkdown={enableMarkdown}
            />
          );
        }

        // Aggiungiamo la citazione
        parts.push(
          <CitationBubble
            key={`citation-${citation.id}`}
            citation={citation}
            onPress={() => setSelectedCitation(citation)}
            citationBubbleColor={citationBubbleColor}
          />
        );

        // Continuiamo con il resto del testo
        currentText = currentText.substring(splitIndex + placeholder.length);
      }
    });

    // Aggiungiamo il testo rimanente
    if (currentText) {
      parts.push(
        <MarkdownRenderer
          key={`text-final`}
          content={currentText}
          style={messageStyle}
          markdownFontSize={markdownFontSize}
          enableMarkdown={enableMarkdown}
        />
      );
    }

    return parts;
  };

  return (
    <View style={styles.messageWithCitations}>
      <View style={styles.citationTextContainer}>
        {renderTextWithCitations()}
      </View>

      <CitationTooltip
        citation={selectedCitation!}
        visible={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
        sourceTitle={sourceTooltipTitle}
        pageText={pageText}
        ofText={ofText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  messageWithCitations: {
    flexDirection: "row",
    alignItems: "center",
  },
  citationTextContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
});
