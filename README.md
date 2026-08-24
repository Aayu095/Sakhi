# Sakhi — Speak. Learn. Feel Confident.

<p align="center">
  <img src="./assets/images/didi_avatar.jpg" width="132" alt="Sakhi, the learning companion" />
</p>

<p align="center">
  <strong>A voice-guided digital-confidence companion for women—designed to meet them in the language that feels most familiar.</strong>
</p>

<p align="center">
  <a href="#why-sakhi">Why Sakhi</a> ·
  <a href="#what-judges-can-experience">Demo flow</a> ·
  <a href="#technology">Technology</a> ·
  <a href="#run-locally">Run locally</a>
</p>

---

## The idea in one line

**Sakhi turns intimidating digital tasks into a calm conversation with a trusted didi.**

Sakhi is for women who have a smartphone but do not yet feel confident using it independently. A phone may be in their hands, but sending a payment, scanning a QR code, identifying a scam, finding trustworthy health information, or even pressing the wrong button can still feel risky. Sakhi makes that first step feel safe: ask a question in a familiar language, receive a short and empathetic explanation, and learn one useful skill at a time.

## Why Sakhi?

Digital access is not the same as digital confidence.

Across India, many women own or can access a smartphone but still depend on someone else for important digital tasks. Text-heavy apps, unfamiliar English, fear of making a costly mistake, and hesitation to ask for help can keep everyday services out of reach. A small mistake can feel expensive: sharing an OTP, opening a suspicious link, or making an incorrect payment.

Sakhi responds to that gap with a familiar interaction model:

- **Built for women’s everyday realities** — practical support for the tasks that affect independence, safety, and access to information.
- **Language that feels familiar** — the current prototype demonstrates Hindi/Hinglish; Sakhi’s product direction is to adapt the same experience and content for local languages, so language is not another barrier to learning.
- **Voice-style learning** — users can speak when optional speech transcription is configured, or write when it is not.
- **Practical topics** — smartphone basics, digital payments, fraud awareness, health education, safety, and rights.
- **Learning without judgement** — guidance is framed like a patient conversation, not a lecture.

> Sakhi is an educational companion—not a doctor, lawyer, emergency service, bank, or replacement for professional support.

## What judges can experience

### 1. Start with a welcoming, women-first journey
Create an account, complete onboarding, and enter a calm interface built with readable Devanagari typography and accessible controls. The submission build presents this journey in Hindi/Hinglish; its voice-led, simple-language approach is intended to be carried into additional local languages.

### 2. Ask Sakhi a question
Open **“सखी से बोलकर सीखें”** and choose a topic such as digital literacy, financial safety, health, or rights.

- Tap the microphone to speak when cloud transcription is configured.
- Use **“लिखकर जवाब देना है?”** to open a focused text composer at any time.
- Sakhi keeps the latest exchange visible, so users can read an answer even after speech has finished.

### 3. Learn a safer digital habit
Explore focused learning and safety experiences for topics such as OTP protection and suspicious-link awareness. The app reinforces practical habits such as: **never share an OTP or PIN**.

### 4. Learn together
Use Community Learning to share stories, request help, offer support, and report inappropriate content. Community content is restricted to signed-in users through the included Firestore rules.

## Product highlights

| Experience | What Sakhi provides |
| --- | --- |
| **Voice-style conversation** | A responsive call surface with live call state, typed fallback, spoken output, latest-turn review, and a clear end-of-call summary. |
| **Digital confidence for women** | Simple guidance for smartphones, WhatsApp, UPI awareness, OTP safety, and suspicious links—skills that support everyday independence. |
| **Familiar-language learning** | The current experience is Hindi/Hinglish-first, with a product direction that supports adapting lessons and conversations for local languages. |
| **Guided learning** | Video and read-and-learn routes for small, focused lessons instead of overwhelming information dumps. |
| **Safety-aware design** | Sensitive health, rights, and financial topics are presented as educational guidance with clear boundaries. |
| **Community Learning** | Signed-in users can create stories and help requests, offer help, and report content. |
| **Accessible by default** | Readable Devanagari typography, clear tap targets, visible states, and an uncluttered mobile UI. |
| **Graceful fallback** | Optional cloud services can be unavailable without blocking the base flow: typed input, local topic guidance, and device speech keep the experience usable. |

## Screens

<p align="center">
  <img src="./assets/screenshots/welcome.jpeg" width="220" alt="Sakhi welcome experience" />
  <img src="./assets/screenshots/call.jpeg" width="220" alt="Sakhi conversation screen" />
  <img src="./assets/screenshots/learn.png" width="350" alt="Sakhi learning experience" />
</p>

## How it works

```text
Woman chooses a topic
        ↓
Speaks or writes in a familiar language
        ↓
Sakhi gives concise, topic-aware guidance
        ↓
Answer is spoken on-device or through optional cloud speech
        ↓
She reviews the latest exchange and continues learning
```

The current submission build demonstrates the interaction in Hindi/Hinglish. Sakhi is intentionally designed to grow into a local-language experience: the same patient, voice-led flow can be adapted with translated content and language-specific review rather than expecting women to learn through English-first interfaces.

### Resilient interaction model

Sakhi deliberately does not make the experience dependent on a single provider:

- **Default base flow:** local topic guidance, typed interaction, and on-device speech work without an AWS backend.
- **Optional cloud assistant:** API Gateway/Lambda chat and Polly can be enabled when a backend is available.
- **Optional cloud transcription:** microphone audio can be transcribed when a Gemini key is configured.
- **Clear fallback:** if transcription or microphone permission is unavailable, Sakhi switches to an explicitly labelled writing mode instead of pretending voice recognition worked.

## Technology

| Layer | Technology |
| --- | --- |
| Mobile client | React Native, Expo, React Navigation |
| Current language experience | Noto Sans Devanagari, Hindi/Hinglish UI, Expo Speech, Expo AV |
| Future language direction | Local-language content and conversation adaptation, with language-specific review before expansion |
| Authentication | Firebase Authentication with email/password sign-in |
| User data & community | Cloud Firestore, Firebase rules, AsyncStorage profile cache |
| Optional assistant backend | Serverless Framework, AWS Lambda, API Gateway, Bedrock, Polly, Transcribe, DynamoDB, S3 |
| Optional transcription | Gemini generate-content API for audio transcription |
| UI feedback | Expo Haptics, Linear Gradients, vector icons, custom voice visualizer |

## Architecture

```text
                         ┌──────────────────────────┐
                         │       Sakhi mobile app    │
                         │   React Native + Expo     │
                         └─────────────┬────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
                ▼                      ▼                      ▼
       Firebase Auth +           Guided learning         Community Learning
       Firestore profile         + safety lessons        + Firestore rules
                │
                ▼
       Voice or typed question
                │
       ┌────────┴────────┐
       │                 │
       ▼                 ▼
Optional cloud STT     Typed fallback
       │                 │
       └────────┬────────┘
                ▼
 Optional cloud assistant ───────► Local topic fallback
                │                         │
                └────────────┬────────────┘
                             ▼
             Optional Polly / on-device speech
```

## Safety & trust principles

Sakhi is built around a few non-negotiable product choices:

1. **No false confidence:** unavailable speech recognition becomes a visible writing fallback.
2. **No professional impersonation:** health, legal, and financial content stays educational and encourages appropriate professional support when needed.
3. **Safer digital behavior:** scam-awareness lessons reinforce OTP/PIN and suspicious-link safety.
4. **Account-aware community:** Firestore rules scope user profiles to their owner and require authentication for Community Learning access.
5. **Optional cloud, useful base experience:** the app remains demonstrable without requiring an active AWS deployment.
6. **Language should not exclude:** the current Hindi/Hinglish prototype is a starting point, not the limit of who Sakhi is intended to serve.

## Run locally

### Prerequisites

- Node.js 18+
- npm
- Expo Go for Android/iOS **or** a modern browser for the web preview
- Firebase configuration for sign-in and profile/community features

### 1. Install dependencies

```bash
npm install
```

### 2. Add local environment values

Copy `.env.example` to `.env`, then add your Firebase values.

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

The app can run its base voice-style experience without an AWS endpoint:

```env
EXPO_PUBLIC_ENABLE_CLOUD_ASSISTANT=false
```

### 3. Start Sakhi

```bash
npm start
# or
npm run web
npm run android
npm run ios
```

### Optional cloud services

The repository includes an optional Serverless backend. Enable it only after deploying/configuring your own backend:

```env
EXPO_PUBLIC_ENABLE_CLOUD_ASSISTANT=true
EXPO_PUBLIC_API_GATEWAY_URL=https://your-api-id.execute-api.your-region.amazonaws.com
```

To enable microphone transcription, configure a Gemini API key in `.env`:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

> `EXPO_PUBLIC_*` values are bundled into the client. Do not treat them as server-side secrets; use appropriately restricted keys and never commit `.env` files.

## Repository map

```text
Sakhi/
├── App.js                     # App routes, authentication gate, font loading
├── src/
│   ├── screens/               # Home, voice, lessons, community, profile, help
│   ├── components/            # Shared UI, avatar, visualizer, navigation
│   ├── services/              # Firebase, community, speech, assistant clients
│   ├── providers/             # Auth and profile state
│   └── config/                # Theme and optional service configuration
├── backend/                   # Optional Serverless/AWS implementation
├── assets/                    # Sakhi visuals and screenshots
├── firestore.rules            # Community and profile access rules
└── .env.example               # Required configuration template
```

## Future direction

- Add thoughtfully reviewed experiences in more regional and local languages.
- Source-backed public-service information and stronger referral pathways.
- More guided practice for digital payments and scam recognition.
- Better privacy controls, consent, account-data management, and moderation workflows.

## License

Distributed under the [Apache License 2.0](./LICENSE).

---

<p align="center">
  <strong>Built so every woman can make the next tap feel less frightening—and the next skill feel possible.</strong>
</p>
