import { StatusBar } from "expo-status-bar";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import LangFlowChatWidget, { LangFlowError, LangFlowMessage } from "./src";

// Esempio di componente personalizzato per il pulsante trigger
const CustomChatIcon = () => (
  <View style={styles.customIcon}>
    <Text style={styles.customIconText}>🤖</Text>
  </View>
);

export default function App() {
  const { width, height } = useWindowDimensions();

  const handleMessage = (message: LangFlowMessage) => {
    console.log("Message received:", message);
  };

  const handleError = (error: LangFlowError) => {
    console.error("Chat error:", error);
    Alert.alert("Chat Error", error.message);
  };

  const handleLoad = () => {
    console.log("Chat widget loaded successfully");
  };

  const handleModalVisibilityChange = (isVisible: boolean) => {
    console.log("Modal visibility changed:", isVisible ? "OPENED" : "CLOSED");
    // Qui puoi:
    // - Aggiornare lo stato della tua app
    // - Pausare/riprendere animazioni
    // - Tracciare analytics
    // - Modificare altri elementi UI
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>LangFlow Chat Widget Demo</Text>
        <Text style={styles.subtitle}>React Native Native Implementation</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features:</Text>
          <Text style={styles.feature}>
            ✅ Native React Native implementation
          </Text>
          <Text style={styles.feature}>
            ✅ Modal overlay for proper positioning
          </Text>
          <Text style={styles.feature}>✅ Customizable trigger button</Text>
          <Text style={styles.feature}>✅ Full LangFlow API integration</Text>
          <Text style={styles.feature}>✅ Custom styling support</Text>
          <Text style={styles.feature}>✅ Keyboard handling</Text>
          <Text style={styles.feature}>✅ Message history</Text>
          <Text style={styles.feature}>✅ Loading states</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions:</Text>
          <Text style={styles.instruction}>
            1. Update the flowId and hostUrl props below with your LangFlow
            configuration
          </Text>
          <Text style={styles.instruction}>
            2. Add your API key if required
          </Text>
          <Text style={styles.instruction}>
            3. Tap the chat button in the bottom-right corner to start chatting
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration:</Text>
          <Text style={styles.config}>Flow ID: your-flow-id-here</Text>
          <Text style={styles.config}>
            Host URL: https://your-langflow-host.com
          </Text>
          <Text style={styles.config}>Position: bottom-right</Text>
          <Text style={styles.config}>Custom styling: enabled</Text>
        </View>
      </ScrollView>

      {/* Default Chat Widget */}
      <LangFlowChatWidget
        flowId="c8b0d41d-f984-4dc9-8503-7efa84ca9133" // Replace with your actual flow ID
        hostUrl="https://api.dev.documinds.net/lf/" // Replace with your actual host URL
        apiKey="sk-AE3rxdN6X3__mUszoYdn2lSV6XPMqgik8ue5XSF6VU0" // Replace with your actual API key
        tweaks={{
          Qdrant: {
            collection_name: "onestore-diesel",
          },
        }}
        windowTitle="User Guide"
        placeholder="Type your question..."
        placeholderSending="Sending..."
        chatPosition="bottom-right"
        citationBubbleColor="#4a4a4a" // Dark gray citation bubbles
        debugEnabled={__DEV__} // Enable debug logs in development
        enableMarkdown={true} // Enable markdown rendering
        // Event handlers
        fontSize={12}
        onMessage={handleMessage}
        onError={handleError}
        onLoad={handleLoad}
        onModalVisibilityChange={handleModalVisibilityChange}
        width={width * 0.95} // Larghezza personalizzata (default: 90% dello schermo)
        height={height * 0.84} // Altezza personalizzata (default: 90% dello schermo)
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
    fontStyle: "italic",
  },
  section: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  feature: {
    fontSize: 14,
    marginBottom: 5,
    color: "#555",
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    color: "#555",
    lineHeight: 20,
  },
  config: {
    fontSize: 14,
    marginBottom: 5,
    color: "#007AFF",
    fontFamily: "monospace",
  },
  customIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  customIconText: {
    fontSize: 28,
  },
});
