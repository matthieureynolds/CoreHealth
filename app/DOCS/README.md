# CoreHealth — Personal Health Intelligence

A comprehensive React Native health companion app that aggregates personal health data, provides AI-powered insights, and supports travel health monitoring.

---

## Tech Stack

| Area | Tech |
|------|------|
| Runtime | Expo ~54, React Native 0.81, React 19 |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation v7 (stack + bottom tabs) |
| Backend / Auth | Supabase (PostgreSQL + Auth + Row Level Security) |
| State | React Context API + useReducer |
| AI Assistant | OpenAI SDK (GPT-4) |
| Storage | AsyncStorage |
| Maps | react-native-maps + Expo Location |
| Auth extras | Google Sign-In, Expo Auth Session |
| UI | Reanimated, Gesture Handler, Expo Linear Gradient, Expo Blur |

---

## Features

### Authentication
- Email/password registration with email verification required
- Google Sign-In
- Password reset flow
- Persistent sessions via Supabase Auth

### Health Dashboard
- Personalised health score with supporting metric rings
- Lab results with AI-generated insights
- Biomarker tracking and history
- Medical timeline
- Travel health summary block

### Interactive Body Map
- Organs, circulatory system, skeleton, and nutrition tabs
- Per-system health data and risk indicators
- Detailed data modules for vitamins, minerals, and body systems

### AI Health Assistant (Toto)
- OpenAI-backed conversational health assistant
- Command bus architecture for structured health queries
- Media and document support

### Travel Health
- Per-trip health metrics: air quality, water, UV, pollen, altitude, disease outbreaks
- Hospital and pharmacy finder
- Vaccination tracker
- Jet lag planner
- Travel medication availability

### Profile & Medical History
- Personal info, health IDs, emergency contacts, primary doctor
- Conditions, medications, allergies, family history, surgeries, vaccinations
- Medical records and appointments
- Biometric lock (Face ID / Touch ID)

### Settings
- Notifications (sleep reminders, supplement reminders, health summaries, medical appointments)
- Display format (units, date/time format, language)
- Connected devices (Apple Health, WHOOP, Oura, Garmin, Withings, Fitbit, Dexcom, and more)
- Data sync and privacy controls
- Legal compliance (HIPAA, GDPR, consent forms, privacy policy, terms)

---

## Project Structure

```
app/
├── assets/
│   ├── icon.png
│   ├── images/
│   │   ├── body-map/       # Body map, circulation, skeleton images
│   │   ├── brand/          # Logo, loading logo, Toto avatar
│   │   └── travel/         # Travel-related images
│   ├── device-logos/       # Connected device brand logos
│   └── flags/              # Country flag images
├── src/
│   ├── features/
│   │   ├── auth/           # Login, register, onboarding, email verification
│   │   ├── body-map/       # Interactive body map + data modules
│   │   ├── home/           # Dashboard, health score, lab results, travel block
│   │   ├── onboarding/     # Onboarding flow screens
│   │   ├── profile/        # Full profile, medical history, settings, privacy
│   │   ├── toto-chat/      # AI health assistant
│   │   └── travel/         # Travel health, trips, jet lag, hospitals
│   └── shared/
│       ├── components/     # Reusable UI components
│       ├── config/         # Supabase client, API config
│       ├── context/        # AuthContext, HealthDataContext, SettingsContext
│       ├── hooks/          # Shared hooks (biometric, location, bedtime reminder, etc.)
│       ├── navigation/     # RootNavigator, MainNavigator, AuthNavigator, profile groups
│       ├── services/       # Data, air quality, pollen, jet lag, family risk, etc.
│       ├── theme/          # Colours, typography, spacing
│       └── types/          # All TypeScript types and navigation param lists
├── supabase/
│   └── functions/          # Supabase Edge Functions
├── DOCS/
│   ├── README.md           # This file
│   └── SECURITY_FEATURES.md
└── app.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- Supabase account: [supabase.com](https://supabase.com)

### Installation

```bash
git clone <repository-url>
cd CoreHealth/app
npm install
```

### Configure Supabase

Update `src/shared/config/supabase.ts` with your project URL and anon key:

```ts
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';
```

### Configure API Keys (optional)

For AI document processing and travel health features, add to a `.env` file:

```
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-key
EXPO_PUBLIC_GOOGLE_VISION_API_KEY=your-vision-key
```

Without these, the app falls back to mock data for development.

### Run

```bash
npx expo start
```

---

## Database (Supabase)

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User info linked to Supabase Auth UID |
| `medical_conditions` | User medical history |
| `vaccinations` | Vaccination records |
| `biomarkers` | Health metrics and trends |
| `device_data` | Device metrics (JSON) |
| `lab_results` | Laboratory test results |

Row Level Security (RLS) is enabled on all tables — users can only access their own data via `auth.uid()` policies.

---

## Navigation Structure

```
RootNavigator
├── AuthNavigator (unauthenticated)
│   ├── OnboardingScreen
│   ├── LoginScreen
│   ├── RegisterScreen
│   ├── ForgotPasswordScreen
│   └── EmailVerificationScreen
└── MainNavigator (authenticated)
    ├── Tab: Dashboard
    ├── Tab: Body Map
    ├── Tab: Health Assistant
    ├── Tab: Travel
    └── Tab: Profile (large nested stack)
```

---

## Security

See `SECURITY_FEATURES.md` for full details on:
- Biometric authentication (Face ID / Touch ID)
- Location access controls
- HIPAA / GDPR compliance notes
- Row Level Security via Supabase
