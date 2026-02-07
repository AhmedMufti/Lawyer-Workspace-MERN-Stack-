# Pakistan Legal Nexus - Project Summary

> **A comprehensive MERN stack web application designed for the legal community of Pakistan, providing lawyers, litigants, and clerks with a unified platform for case management, collaboration, and legal resources.**

---

## 📋 Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Architecture](#project-architecture)
3. [Key Features Implemented](#key-features-implemented)
4. [Database Models](#database-models)
5. [API Endpoints](#api-endpoints)
6. [Frontend Pages](#frontend-pages)
7. [Security Features](#security-features)
8. [Real-time Features](#real-time-features)
9. [How to Run](#how-to-run)

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 4.18.2 | Web framework |
| **MongoDB** | Atlas | Database (NoSQL) |
| **Mongoose** | 8.0.0 | ODM for MongoDB |
| **Socket.io** | 4.6.1 | Real-time communication |
| **JWT** | 9.0.2 | Authentication tokens |
| **Bcrypt.js** | 2.4.3 | Password hashing |
| **Helmet** | 8.1.0 | Security headers |
| **Joi** | 18.0.2 | Request validation |
| **Multer** | 1.4.5 | File uploads |
| **Winston** | 3.19.0 | Logging |
| **Nodemailer** | 6.9.7 | Email services |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI library |
| **Redux Toolkit** | 2.0.1 | State management |
| **React Router** | 6.20.0 | Client-side routing |
| **Axios** | 1.6.2 | HTTP client |
| **Socket.io Client** | 4.6.1 | Real-time client |
| **Framer Motion** | 10.16.16 | Animations |
| **Recharts** | 2.10.3 | Charts & graphs |
| **React Icons** | 4.12.0 | Icon library |
| **React Toastify** | 9.1.3 | Notifications |
| **date-fns** | 3.0.0 | Date utilities |

---

## 🏗️ Project Architecture

```
pakistan-legal-nexus/
├── backend/
│   ├── config/           # Database & app configuration
│   ├── controllers/      # Route handlers & business logic
│   ├── middleware/       # Auth, error handling, validation
│   ├── models/           # Mongoose schemas (16 models)
│   ├── routes/           # API route definitions
│   ├── utils/            # Helper functions & utilities
│   ├── validators/       # Joi validation schemas
│   └── server.js         # Entry point
│
├── frontend/
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       ├── store/        # Redux slices
│       ├── utils/        # Helper functions
│       └── App.js        # Main app component
```

---

## ✨ Key Features Implemented

### 1. 🔐 Authentication & Authorization
- **User Registration** with role selection (Lawyer, Litigant, Clerk, Admin)
- **Secure Login** with JWT access & refresh tokens
- **Password Hashing** using bcrypt with salt rounds
- **Role-Based Access Control (RBAC)** for protected routes
- **Account Lockout** after failed login attempts
- **Session Management** with automatic token refresh

### 2. 📁 Case Management
- **Create Cases** with detailed information (parties, court, dates)
- **Case Dashboard** with filtering by status, type, priority
- **Case Details View** with tabbed interface:
  - Overview (case info, court details)
  - Parties (petitioner, respondent)
  - Team (lawyers, clerks, litigants)
  - Documents
- **Edit Case** functionality for lead lawyers
- **Team Management**:
  - Add litigants/clerks by email search
  - Remove team members with confirmation
  - Litigants can view cases they're assigned to
- **Case Status Tracking** (Filed → In Progress → Decided)

### 3. 📄 Document Management
- **Upload Documents** to cases (PDF, DOCX, images)
- **Document Categories** (Petition, Evidence, Order, etc.)
- **Version Control** for document updates
- **Access Control** based on case permissions
- **File Hash** for integrity verification

### 4. 🏪 Marketplace
- **Lawyer Profiles** with specializations, experience, fees
- **Profile Listings** with search and filter
- **Detailed Profile View** with modal popup
- **Contact Lawyer** functionality
- **Rating & Reviews** system
- **Marketplace Items** for legal services/products

### 5. 💬 Real-time Chat
- **Socket.io Integration** for live messaging
- **Chat Rooms** for case discussions
- **Direct Messaging** between users
- **Message History** persistence
- **Typing Indicators** (real-time)
- **Online Status** tracking

### 6. 📊 Dashboard
- **Role-Specific Metrics**:
  - Lawyers: Total cases, active cases, completed cases
  - Litigants: Cases assigned, case status
- **Upcoming Hearings** widget
- **Recent Activity** feed
- **Quick Statistics** cards

### 7. 📚 Legal Research
- **Acts Database** with search functionality
- **Case Laws** repository
- **Court Forms** templates
- **Search & Filter** by category, date, court

### 8. 🗳️ Polling System
- **Create Polls** for legal community
- **Vote on Issues**
- **View Results** with charts
- **Poll Categories** and expiration

### 9. 👤 User Profiles
- **Profile Management** with avatar
- **Lawyer Profile Enhancement** (bar license, specializations)
- **Profile Visibility** settings
- **Edit Profile** with validation

### 10. 🔔 Notifications
- **Real-time Notifications** via Socket.io
- **Notification Categories** (case updates, messages, hearings)
- **Mark as Read** functionality
- **Notification Preferences**

---

## 📦 Database Models

| Model | Description |
|-------|-------------|
| **User** | Core user model with authentication fields, roles |
| **LawyerProfile** | Extended profile for lawyers (specializations, fees) |
| **Case** | Legal case with parties, court, status, team access |
| **Document** | Case documents with metadata, versions |
| **Hearing** | Court hearing schedules and details |
| **ChatRoom** | Chat room for discussions |
| **Message** | Chat messages with sender, content, timestamp |
| **MarketplaceItem** | Items/services listed in marketplace |
| **Poll** | Community polls with options |
| **Vote** | User votes on polls |
| **Review** | Lawyer reviews and ratings |
| **Transaction** | Payment/transaction records |
| **Notification** | User notifications |
| **Act** | Legal acts database |
| **CaseLaw** | Case law precedents |
| **CourtForm** | Court form templates |

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | User registration |
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| POST | `/refresh-token` | Refresh access token |
| GET | `/me` | Get current user |

### Cases (`/api/cases`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user's cases |
| POST | `/` | Create new case |
| GET | `/:id` | Get case by ID |
| PATCH | `/:id` | Update case |
| DELETE | `/:id` | Delete case |
| GET | `/search` | Search cases |

### Documents (`/api/documents`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/case/:caseId` | Get case documents |
| POST | `/upload` | Upload document |
| GET | `/:id` | Get document |
| DELETE | `/:id` | Delete document |

### Users (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search` | Search user by email |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get dashboard stats |

### Marketplace (`/api/marketplace`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles` | Get lawyer profiles |
| GET | `/profiles/me` | Get own profile |
| POST | `/profiles` | Create/update profile |
| GET | `/items` | Get marketplace items |

### Chat (`/api/chat`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rooms` | Get chat rooms |
| GET | `/messages/:roomId` | Get room messages |
| POST | `/messages` | Send message |

### Research (`/api/research`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/acts` | Get legal acts |
| GET | `/case-laws` | Get case laws |
| GET | `/court-forms` | Get court forms |

### Polls (`/api/polls`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get polls |
| POST | `/` | Create poll |
| POST | `/:id/vote` | Vote on poll |

---

## 🖥️ Frontend Pages

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Landing page with features |
| **Login** | `/login` | User authentication |
| **Register** | `/register` | User registration |
| **Dashboard** | `/dashboard` | Main dashboard |
| **Cases** | `/dashboard/cases` | Case list & management |
| **Case Detail** | `/dashboard/cases/:id` | Case details & editing |
| **Chat** | `/dashboard/chat` | Real-time messaging |
| **Marketplace** | `/dashboard/marketplace` | Lawyer profiles & services |
| **Find Lawyers** | `/find-lawyers` | Public lawyer search |
| **Research** | `/dashboard/research` | Legal research tools |
| **Polls** | `/dashboard/polls` | Community polls |
| **Profile** | `/dashboard/profile` | User profile settings |

---

## 🔒 Security Features

1. **Helmet.js** - Secure HTTP headers
2. **Rate Limiting** - 100 requests/15min (5 for auth)
3. **CORS** - Configured for frontend origin
4. **Password Hashing** - bcrypt with 12 salt rounds
5. **JWT Authentication** - Access & refresh tokens
6. **Input Validation** - Joi schemas on all endpoints
7. **SQL Injection Prevention** - MongoDB with Mongoose
8. **XSS Protection** - Content Security Policy
9. **Account Lockout** - After failed attempts
10. **HTTPS Ready** - For production deployment

---

## ⚡ Real-time Features

- **Socket.io** server integrated with Express
- **Chat Messaging** - Instant message delivery
- **Notifications** - Push notifications to clients
- **Online Status** - Track user presence
- **Typing Indicators** - Show when users are typing

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
# Create .env file with required variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables (Backend `.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRES=1h
JWT_REFRESH_EXPIRES=7d
```

### Quick Start
Use the provided batch files:
- `start-backend.bat` - Start backend server
- `start-frontend.bat` - Start frontend dev server

---

## 📈 Project Statistics

- **Backend Routes:** 11 route files
- **Database Models:** 16 Mongoose models
- **Frontend Pages:** 12+ page components
- **Total Files:** 120+ source files
- **Lines of Code:** 15,000+

---

## 👥 User Roles

| Role | Capabilities |
|------|--------------|
| **Lawyer** | Create/manage cases, team access, full features |
| **Litigant** | View assigned cases, documents, chat |
| **Clerk** | View assigned cases, document management |
| **Admin** | Full system access, user management |

---

## 📝 License

This project is developed for educational purposes as part of a Web Programming course.

---

*Last Updated: January 2026*
