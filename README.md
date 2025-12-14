# 🏛️ Pakistan Legal Nexus (PLN)

> An all-in-one digital platform revolutionizing the Pakistani legal landscape for lawyers, litigants, and law clerks.

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## 🌟 Overview

Pakistan Legal Nexus is a comprehensive MERN stack application designed to digitalize and streamline legal operations in Pakistan. The platform integrates case management, legal research, professional networking, marketplace, community chat rooms, and election polling into one secure ecosystem.

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Multer** - File uploads
- **Hugging Face API** - AI integration

### Frontend
- **React** - UI framework
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io Client** - WebSocket client
- **i18next** - Internationalization (Multi-language support)
- **Framer Motion** - Animations
- **React Icons** - Icon library

## ✨ Features

### 🔒 Module 1: Smart Case Management
- Secure cloud-based case filing
- Daily cause list integration (App + SMS)
- Digital case file repository
- Automated order sheet tracking
- CamScanner-like document upload

### 📚 Module 2: Legal Research Hub
- Bare Acts library (downloadable)
- Court forms repository
- Advanced case law search
- Better than PakistanLawSite.com
- Smart filters and sharing options

### 👥 Module 3: Legal Professional Network
- Lawyer/Law firm profiles (ZOR-like)
- Hire lawyers directory
- Marketplace for legal products
- Free stuff category

### 💬 Module 4: Secure Communication
- Bar-specific chat rooms
- Verified access control
- Separate clerk chat rooms

### 🗳️ Module 5: Election & Polling
- Bar association polls
- Provincial and national bar councils
- Real-time voting results

### 🌍 Module 6: Multi-Language & Payments
- **Languages**: Urdu, Sindhi, Pashto, Balochi, English, Arabic, Chinese, French, Dutch
- **Payment**: JazzCash, EasyPaisa, Bank integrations

### 🤖 Module 7: AI & Analytics
- Contract drafting AI
- Legal research summarization
- Analytics dashboard
- Market trend analysis

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (installed locally or MongoDB Atlas account)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Update the `.env` file with your configurations:
     - MongoDB URI (if using local: `mongodb://localhost:27017/pakistan-legal-nexus`)
     - JWT Secret
     - Hugging Face API token (already provided)
     - Payment gateway credentials (when ready)

4. **Start MongoDB** (if using local installation)
   ```bash
   mongod
   ```

5. **Run the backend server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # OR Production mode
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

### Verify Setup

1. Open browser and go to `http://localhost:3000` - You should see the PLN homepage
2. Test backend API: `http://localhost:5000/api/health` - Should return a JSON response

## 📁 Project Structure

```
pakistan-legal-nexus/
├── backend/
│   ├── config/          # Configuration files (DB, etc.)
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware (auth, etc.)
│   ├── utils/           # Utility functions
│   ├── uploads/         # Uploaded files storage
│   ├── .env.example     # Environment variables template
│   ├── .gitignore       # Git ignore file
│   ├── package.json     # Dependencies
│   └── server.js        # Entry point
│
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   ├── i18n/        # Language translations
│   │   ├── App.js       # Main app component
│   │   ├── App.css      # App styles
│   │   ├── index.js     # Entry point
│   │   └── index.css    # Global styles
│   ├── .gitignore       # Git ignore file
│   └── package.json     # Dependencies
│
├── instructions.md      # Project requirements
└── README.md           # This file
```

## 📦 Package Tiers

| Tier | Features | Price |
|------|----------|-------|
| **Standard** (Free) | Basic case entry, chat rooms, limited marketplace, 5 searches/day | Free |
| **Gold** | All Standard + Advanced case management, SMS alerts, unlimited research | Monthly/Annual |
| **Premium** | All Gold + AI drafting, analytics, priority support, polls | Monthly/Annual |
| **Platinum** | All Premium + Firm management, API access, dedicated account manager | Enterprise |

## 🔗 API Endpoints (Coming Soon)

- `/api/auth` - Authentication routes
- `/api/cases` - Case management
- `/api/research` - Legal research
- `/api/marketplace` - Marketplace operations
- `/api/chat` - Chat rooms
- `/api/elections` - Polling system
- `/api/lawyers` - Lawyer profiles
- `/api/ai` - AI features

## 🌐 Supported Languages

- Urdu (اردو)
- English
- Sindhi (سنڌي)
- Pashto (پښتو)
- Balochi (بلوچی)
- Arabic (العربية)
- Chinese (中文)
- French (Français)
- Dutch (Nederlands)

## 🤝 Contributing

This is a semester project for Web Programming Fall-2025.

## 📄 License

This project is developed as part of an academic project.

## 🆘 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for the Pakistani Legal Community**
