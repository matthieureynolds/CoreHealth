# CoreHealth - Personal Health Intelligence

> **100% Supabase-Powered Health Tracking App**

CoreHealth is a comprehensive React Native application that aggregates and analyzes personal health data to provide personalized insights and recommendations. Built entirely on **Supabase** for authentication, database, and real-time features.

## 🏗️ Architecture

**Frontend**: React Native with TypeScript + Expo
**Backend**: Supabase (PostgreSQL + Auth + Real-time)
**Navigation**: React Navigation 6
**State Management**: React Context API
**UI Components**: React Native + Expo Vector Icons

## ✨ Features

### 🔐 Authentication (Supabase Auth)
- **Email/Password Registration** with separate first name & surname fields
- **Email Verification Required** - users must verify before login
- **Password Reset** functionality
- **Account Confirmation Screen** with professional UI
- **Resend Verification** option from login screen
- Persistent sessions with automatic token refresh

### 📊 Health Dashboard
- Personalized health score (82/100)
- Key biomarker tracking (HRV, heart rate, blood glucose)
- Daily health insights with actionable recommendations
- Metric cards for sleep, activity, stress, recovery
- Quick action buttons for common tasks

### 🫀 Interactive Body Map
- Body systems overview with risk assessment
- Color-coded health status indicators
- Biomarker integration per body system
- Real-time health status updates

### 📱 Device Integration
- WHOOP, Apple Watch, Eight Sleep support
- Smart toothbrush and smart toilet integration
- Device connection status and sync management
- Auto-sync settings with manual sync options

### ✈️ Travel Health
- Location-based health insights
- Air quality monitoring
- Vaccination recommendations
- Travel health tips and alerts

### 👤 User Profile
- Comprehensive profile management
- Medical history and vaccination tracking
- Privacy settings and data export options

## 🗄️ Database Schema (Supabase)

### Core Tables
- **profiles** - User information linked to Supabase Auth UID
- **medical_conditions** - User medical history
- **vaccinations** - Vaccination records
- **biomarkers** - Health metrics and trends
- **device_data** - Device metrics in JSON format
- **lab_results** - Laboratory test results

### Security
- **Row Level Security (RLS)** enabled on all tables
- **User isolation** using `auth.uid()` policies
- **Automatic data filtering** per authenticated user

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g @expo/cli`
- Supabase account: [supabase.com](https://supabase.com)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CoreHealth
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Update `src/config/supabase.ts` with your project URL and anon key
   - Run the SQL schema from `supabase_schema.sql` in your Supabase SQL editor

4. **Configure email verification**
   - Follow the guide in `SUPABASE_EMAIL_SETUP.md`
   - Configure email templates and SMTP settings

5. **Start the development server**
```bash
npx expo start
```

## 📁 Project Structure

```
CoreHealth/
├── src/
│   ├── components/          # Reusable UI components
│   ├── config/             
│   │   └── supabase.ts     # Supabase configuration
│   ├── context/            
│   │   └── AuthContext.tsx # Authentication state management
│   ├── navigation/         # React Navigation setup
│   ├── screens/            # App screens
│   │   ├── auth/           # Authentication screens
│   │   ├── dashboard/      # Health dashboard
│   │   ├── body-map/       # Interactive body map
│   │   ├── devices/        # Device management
│   │   ├── travel/         # Travel health
│   │   └── profile/        # User profile
│   ├── services/           
│   │   └── dataService.ts  # Supabase data operations
│   └── types/              # TypeScript type definitions
├── supabase_schema.sql     # Database schema
├── SUPABASE_EMAIL_SETUP.md # Email configuration guide
└── package.json
```

## 🔧 Key Technologies

- **Supabase**: Authentication, database, real-time subscriptions
- **React Native**: Cross-platform mobile development
- **TypeScript**: Type safety and developer experience
- **Expo**: Development platform and build tools
- **React Navigation**: Navigation and routing
- **React Context**: State management

## 🛡️ Security Features

- **Email verification required** for all new accounts
- **Row Level Security** ensures users only see their data
- **Encrypted sessions** managed by Supabase
- **Secure password reset** with email verification
- **PKCE flow** for enhanced authentication security

## 📧 Email Verification Flow

1. User registers with first name, surname, email, password
2. Supabase sends verification email automatically
3. User clicks verification link in email
4. App shows "Account Confirmed!" screen
5. User can now login with verified credentials

## 🚀 Production Deployment

### Supabase Configuration
- Configure production SMTP provider (SendGrid, Gmail, etc.)
- Set production Site URL for proper email redirects
- Enable and configure custom domain if needed
- Set up monitoring and logging

### App Deployment
- Build with `expo build`
- Deploy to App Store / Google Play
- Configure deep linking for email verification
- Set up crash reporting and analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the `SUPABASE_EMAIL_SETUP.md` for email configuration
- Review Supabase documentation for backend issues
- Open an issue in this repository

## 🆕 New Features: AI-Powered Document Processing

### File Upload + Health Data Extraction

CoreHealth now includes advanced document processing capabilities:

1. **📷 Smart Document Scanning**
   - Camera integration for scanning lab reports
   - File upload support (PDF, JPG, PNG)
   - 10MB file size limit for optimal processing

2. **🤖 AI-Powered OCR**
   - Google Cloud Vision API for text extraction
   - High accuracy document text recognition
   - Support for various lab report formats

3. **🧠 GPT-4 Biomarker Structuring**
   - OpenAI GPT-4 analyzes extracted text
   - Automatically identifies biomarkers, values, units
   - Determines reference ranges and health status
   - Groups results by organ system

4. **📊 Interactive Results Display**
   - Biomarkers grouped by organ (Heart, Liver, Kidneys, etc.)
   - Color-coded status indicators (Normal, High, Low, Critical)
   - Real-time body map updates with new data

## 🏥 Supported Lab Reports

- Blood test panels (CBC, CMP, Lipid Panel)
- Liver function tests (ALT, AST, Bilirubin)
- Kidney function (Creatinine, eGFR, BUN)
- Metabolic panels (Glucose, HbA1c)
- Thyroid function (TSH, T3, T4)
- Lipid profiles (Cholesterol, HDL, LDL, Triglycerides)

## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
cd CoreHealth
npm install
```

### 2. Configure API Keys (Optional)

For real document processing, set up API keys:

1. Create `.env` file in CoreHealth directory
2. Add your API keys:
```
EXPO_PUBLIC_GOOGLE_VISION_API_KEY=your-google-vision-api-key
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key
```

See `API_SETUP.md` for detailed instructions.

**Note:** Without API keys, the app uses mock data for development.

### 3. Run the App
```bash
npx expo start
```

## 📱 Usage

1. Open the **Body Map** tab
2. Scroll to the "Upload Your Lab Results" section
3. Choose to scan with camera or upload a file
4. Tap "Scan My Results" to process with AI
5. View extracted biomarkers grouped by organ
6. Tap organ groups to see detailed biomarker information

## 🔒 Privacy & Security

- Documents are processed securely via API calls
- No personal health data is stored permanently
- All processing happens with user consent
- API keys should be kept secure and private

## 💰 API Costs

- Google Vision: ~$1.50 per 1000 documents
- OpenAI GPT-4: ~$0.10 per document
- **Total: ~$0.15 per lab report processed**

## 🛠️ Technical Implementation

### Document Processing Flow

1. **File Upload** → User selects document via camera or file picker
2. **OCR Processing** → Google Cloud Vision extracts raw text
3. **AI Structuring** → OpenAI GPT-4 identifies and structures biomarkers
4. **Data Integration** → Results are integrated into the body map
5. **Display** → Biomarkers shown grouped by organ system

### Fallback Mechanisms

- Mock OCR text if Vision API unavailable
- Regex-based parsing if GPT API unavailable  
- Graceful error handling with user feedback
- Development-friendly with or without API keys

## 🏗️ Architecture

```
CoreHealth/
├── src/
│   ├── screens/body-map/
│   │   ├── BodyMapScreen.tsx      # Main screen with upload UI
│   │   └── components/BodyMap.tsx # Interactive body visualization
│   ├── services/
│   │   └── documentProcessor.ts   # AI processing logic
│   └── ...
├── API_SETUP.md                   # API configuration guide
└── README.md                      # This file
```

## 🚀 Features

- **Authentication**: Firebase Auth with email verification
- **Health Dashboard**: Personalized health scores and insights
- **Interactive Body Map**: Visual organ system navigation
- **AI Document Processing**: Lab report scanning and analysis
- **Device Integration**: Connect health devices and wearables
- **Travel Health**: Location-based health recommendations
- **User Profile**: Manage personal health information

Built with React Native, TypeScript, Expo, Firebase, and Supabase.

---

**Built with ❤️ using Supabase and React Native** 