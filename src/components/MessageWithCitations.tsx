import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Citation, CitationTooltip } from "./Citation";
import MarkdownRenderer from "./MarkdownRenderer";

// Interface for citations
export interface ParsedMessage {
  text: string;
  citations: Citation[];
}

// Function to parse messages and extract citations
export const parseMessageWithCitations = (text: string): ParsedMessage => {
  const citationRegex =
    /\[src name="([^"]+)" page="([^"]+)" total_pages="([^"]+)"\]/g;
  const citations: Citation[] = [];
  let citationCounter = 1;

  // Replace each citation with a numbered placeholder
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
      return `◐${citationCounter++}◑`; // Temporary placeholder
    }
  );

  return { text: parsedText, citations };
};

// Main component to render text with citations
export const MessageWithCitations: React.FC<{
  text: string;
  messageStyle: any;
  sourceTooltipTitle: string;
  pageText: string;
  ofText: string;
  citationBubbleColor: string;
  enableMarkdown: boolean;
  fontSize: number;
}> = ({
  text,
  messageStyle,
  sourceTooltipTitle,
  pageText,
  ofText,
  citationBubbleColor,
  enableMarkdown,
  fontSize,
}) => {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
    null
  );
  const parsedMessage = parseMessageWithCitations(text);

  return (
    <View style={styles.messageWithCitations}>
      <MarkdownRenderer
        content={parsedMessage.text}
        style={messageStyle}
        fontSize={fontSize}
        enableMarkdown={enableMarkdown}
        citations={parsedMessage.citations}
        onCitationPress={setSelectedCitation}
        citationBubbleColor={citationBubbleColor}
      />

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
    flexDirection: "column",
    width: "100%",
  },
});
