# LangFlow Chat Widget - Expo Example

Questo è un progetto Expo di esempio che dimostra come utilizzare il componente LangFlowChatWidget nativo per React Native.

## Caratteristiche

- ✅ **Implementazione React Native nativa** - Nessuna WebView, solo componenti nativi
- ✅ **Overlay modale** - La chat si apre sopra tutto il contenuto
- ✅ **Pulsante trigger personalizzabile** - Supporta componenti personalizzati
- ✅ **Integrazione completa API LangFlow** - Comunicazione diretta con il server
- ✅ **Styling personalizzabile** - Tutti gli stili sono configurabili
- ✅ **Gestione keyboard** - Supporto nativo per la tastiera
- ✅ **Cronologia messaggi** - Mantiene la conversazione
- ✅ **Stati di caricamento** - Feedback visivo durante l'invio

## Setup

1.**Installa le dipendenze:**

```bash
cd example
npm install
   ```

2.**Crea il link simbolico (se non esiste già):**

```bash
cd example
ln -sf ../src ./src
```

3.**Configura LangFlow:**

Apri `App.tsx` e aggiorna le seguenti proprietà con i tuoi valori:

```typescript
<LangFlowChatWidget
  flowId="your-flow-id-here"           // Il tuo Flow ID
  hostUrl="https://your-langflow-host.com"  // Il tuo server LangFlow
  apiKey="your-api-key"                // La tua API key (opzionale)
  // ... altre configurazioni
/>
```

4.**Avvia il progetto:**

```bash
npm start
```

## Configurazione LangFlow

Per utilizzare questo componente, hai bisogno di:

1. **Un server LangFlow attivo** - Locale o hosted
2. **Un Flow creato** - Con componenti Chat Input e Chat Output
3. **API Key** (opzionale) - Se il tuo server richiede autenticazione

### Esempio di configurazione completa

```typescript
<LangFlowChatWidget
  // Configurazione obbligatoria
  flowId="dcbed533-859f-4b99-b1f5-16fce884f28f"
  hostUrl="https://your-langflow-server.com"
  apiKey="sk-your-api-key"
  
  // Personalizzazione interfaccia
  windowTitle="AI Assistant"
  placeholder="Scrivi il tuo messaggio..."
  placeholderSending="L'AI sta pensando..."
  onlineMessage="🟢 Assistente online"
  
  // Posizionamento e dimensioni
  chatPosition="bottom-right"
  height={600}
  width={350}
  
  // Styling personalizzato
  chatWindowStyle={{
    borderRadius: 16,
    shadowOpacity: 0.4,
  }}
  botMessageStyle={{
    backgroundColor: "#f0f8ff",
    borderRadius: 16,
  }}
  userMessageStyle={{
    backgroundColor: "#007AFF",
    borderRadius: 16,
  }}
  
  // Event handlers
  onMessage={(message) => console.log('Messaggio:', message)}
  onError={(error) => console.error('Errore:', error)}
  onLoad={() => console.log('Widget caricato')}
/>
```

## Esempi di Utilizzo

### 1. Chat Widget Standard

Il widget standard con pulsante flottante e styling di base.

### 2. Pulsante Personalizzato

Esempio con icona personalizzata:

```typescript
const CustomIcon = () => (
  <View style={customIconStyle}>
    <Text>🤖</Text>
  </View>
);

<LangFlowChatWidget
  // ... altre props
  triggerComponent={<CustomIcon />}
  triggerButtonStyle={{
    backgroundColor: "transparent",
    elevation: 0,
  }}
/>
```

### 3. Styling Avanzato

Personalizzazione completa di colori, bordi e ombre.

## Posizioni Disponibili

Il pulsante può essere posizionato in 9 diverse posizioni:

- `top-left`, `top-center`, `top-right`
- `center-left`, `center-right`
- `bottom-left`, `bottom-center`, `bottom-right`

## Troubleshooting

### Problemi Comuni

1. **Errore di connessione:**
   - Verifica che `hostUrl` sia corretto e raggiungibile
   - Controlla che il server LangFlow sia attivo
   - Assicurati che l'URL usi HTTPS in produzione

2. **Flow non trovato:**
   - Verifica che `flowId` sia corretto
   - Controlla che il flow sia pubblicato e attivo

3. **Problemi di autenticazione:**
   - Verifica che `apiKey` sia valida
   - Controlla le impostazioni di autenticazione del server

### Debug

Abilita il debug aprendo la console e osservando i log:

- Messaggi ricevuti
- Errori di rete
- Stati del widget

## Struttura del Progetto

```bash
example/
├── App.tsx              # App principale con esempi
├── package.json         # Dipendenze Expo
├── app.json            # Configurazione Expo
├── babel.config.js     # Configurazione Babel
└── tsconfig.json       # Configurazione TypeScript
```

## Supporto

Per problemi o domande:

1. Controlla la documentazione LangFlow
2. Verifica la configurazione del server
3. Controlla i log della console per errori specifici
