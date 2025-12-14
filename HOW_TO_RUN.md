# 🚀 How to Run Pakistan Legal Nexus

## 🎯 Quick Start (Easiest Way!)

### **Option 1: Double-Click to Start Everything** ⭐ RECOMMENDED
**Just double-click:** `START_ALL.bat`

This will:
- ✅ Open 2 separate windows (Backend + Frontend)
- ✅ Start backend on http://localhost:5000
- ✅ Start frontend on http://localhost:3000
- ✅ Automatically open browser to frontend

**To stop:** Close the terminal windows or press Ctrl+C in each

---

### **Option 2: Development Mode (Single Window)**
**Double-click:** `START_DEV_MODE.bat`

This will:
- ✅ Run both servers in ONE window
- ✅ Show color-coded logs (Blue=Backend, Magenta=Frontend)
- ✅ Use `concurrently` to manage both processes

**To stop:** Press Ctrl+C once (stops both)

---

## 📋 Manual Commands

### Run Backend Only:

**Option A:** Using batch file
```bash
# Double-click: start-backend.bat
```

**Option B:** Manual command
```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Server is running on port 5000
📝 Environment: development
🔗 API: http://localhost:5000/api/health
✅ MongoDB Connected: ac-c00lfc8-shard-00-02.wfdehtp.mongodb.net
📊 Database: test
```

**Test Backend:**
- Open browser: http://localhost:5000/api/health
- Should see: `{"success": true, "message": "Pakistan Legal Nexus API is running"}`

---

### Run Frontend Only:

**Option A:** Using batch file
```bash
# Double-click: start-frontend.bat
```

**Option B:** Manual command
```bash
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view pakistan-legal-nexus-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

**Test Frontend:**
- Browser opens automatically to http://localhost:3000
- Should see beautiful gradient homepage with "Pakistan Legal Nexus"

---

## 🎨 What You'll See

### Backend (http://localhost:5000)
```
✅ Running on port 5000
✅ Connected to MongoDB Atlas
✅ API ready to handle requests
```

### Frontend (http://localhost:3000)
- 🎨 Dark gradient background (navy to purple)
- ✨ Animated "Pakistan Legal Nexus" gradient text
- 🎯 Feature pills (Case Management, Legal Research, etc.)
- 💫 Glassmorphism effects
- 📱 Responsive design

---

## 📂 All Available Startup Files

| File | Purpose | Windows |
|------|---------|---------|
| `START_ALL.bat` | Start both (separate windows) | 2 windows |
| `START_DEV_MODE.bat` | Start both (same window) | 1 window |
| `start-backend.bat` | Backend only | 1 window |
| `start-frontend.bat` | Frontend only | 1 window |
| `QUICK_START.bat` | Interactive menu | 1 window |

---

## 🔄 Complete Workflow

### First Time Setup:
1. ✅ Dependencies installed (already done!)
2. ✅ MongoDB Atlas configured (already done!)
3. ✅ Environment variables set (already done!)

### Every Time You Code:

**Simple Way:**
```
1. Double-click START_ALL.bat
2. Wait for both servers to start
3. Browser opens automatically
4. Start coding!
```

**Manual Way:**
```
Terminal 1:
  cd backend
  npm run dev

Terminal 2:
  cd frontend
  npm start
```

---

## 🌐 URLs Reference

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React app UI |
| **Backend API** | http://localhost:5000 | Express server |
| **Health Check** | http://localhost:5000/api/health | Verify backend is running |
| **MongoDB Atlas** | https://cloud.mongodb.com | Database dashboard |

---

## 🧪 Testing the Setup

### Test 1: Backend Health Check
```bash
# After starting backend, run:
curl http://localhost:5000/api/health

# Or open in browser:
http://localhost:5000/api/health

# Expected response:
{
  "success": true,
  "message": "Pakistan Legal Nexus API is running",
  "timestamp": "2025-12-14T12:19:53.000Z"
}
```

### Test 2: Frontend Loading
```bash
# Open browser to:
http://localhost:3000

# Should see:
✓ Beautiful gradient background
✓ "Pakistan Legal Nexus" title
✓ Feature pills
✓ Modern animations
```

### Test 3: Frontend-Backend Communication
```bash
# Once both are running:
# Open browser console (F12)
# No CORS errors should appear
# Network tab should show successful connections
```

---

## 🛑 How to Stop Servers

### If using START_ALL.bat:
- Close both terminal windows
- OR press Ctrl+C in each window

### If using START_DEV_MODE.bat:
- Press Ctrl+C once (stops both)

### If running manually:
- Press Ctrl+C in each terminal

---

## 🔧 Troubleshooting

### Issue: Port 5000 already in use
**Solution:**
```bash
# Find what's using port 5000:
netstat -ano | findstr :5000

# Kill the process:
taskkill /PID <process_id> /F

# Or change port in backend/.env:
PORT=5001
```

### Issue: Port 3000 already in use
**Solution:**
- React will automatically ask if you want to use port 3001
- Press `Y` to use alternate port

### Issue: "npm: command not found"
**Solution:**
- Node.js not installed or not in PATH
- Install from: https://nodejs.org/
- Restart terminal after installation

### Issue: Backend won't connect to MongoDB
**Solution:**
- Check internet connection
- Verify credentials in backend/.env
- Check MongoDB Atlas dashboard
- See MONGODB_ATLAS_GUIDE.md

### Issue: PowerShell script execution error
**Solution:**
- Use the .bat files instead (they bypass PowerShell restrictions)
- Or run: `cmd /c npm run dev`

---

## 💡 Pro Tips

### 1. Keep Terminals Open
- Don't close the terminal windows while developing
- They need to stay running for servers to work

### 2. Use START_ALL.bat for Daily Development
- Easiest way to get started
- Separate windows = easier to debug

### 3. Watch the Terminal Logs
- Backend terminal shows API requests
- Frontend terminal shows compilation status
- Errors will appear here first!

### 4. Auto-Reload Features
- ✅ Backend auto-reloads with `nodemon`
- ✅ Frontend auto-reloads on file save
- No need to restart manually!

### 5. Browser DevTools
- Press F12 to open console
- Check Network tab for API calls
- Check Console for errors

---

## 📊 Development Process

```
┌──────────────────────────────────────┐
│  1. Start Servers (START_ALL.bat)   │
└──────────────┬───────────────────────┘
               │
        Backend + Frontend
               │
┌──────────────┴───────────────────────┐
│  2. Wait for "Compiled successfully" │
└──────────────┬───────────────────────┘
               │
┌──────────────┴───────────────────────┐
│  3. Browser opens automatically      │
└──────────────┬───────────────────────┘
               │
┌──────────────┴───────────────────────┐
│  4. Start coding!                    │
│     - Edit files                     │
│     - Save changes                   │
│     - Auto-reload happens            │
└──────────────┬───────────────────────┘
               │
┌──────────────┴───────────────────────┐
│  5. Test in browser                  │
│     - Check UI                       │
│     - Test features                  │
│     - Debug if needed                │
└──────────────────────────────────────┘
```

---

## 🎯 Recommended Setup

**For Daily Development:**
```
1. Double-click START_ALL.bat
2. Wait for both servers
3. Code in VS Code or your IDE
4. Save files (auto-reload works!)
5. Test in browser
```

**When done for the day:**
```
1. Close terminal windows
2. Or press Ctrl+C in each
```

---

## 🚀 Next Steps After Starting

Once both servers are running:

1. **Backend Development:**
   - Create database models in `backend/models/`
   - Add API routes in `backend/routes/`
   - Add controllers in `backend/controllers/`

2. **Frontend Development:**
   - Create components in `frontend/src/components/`
   - Create pages in `frontend/src/pages/`
   - Update styles in CSS files

3. **Testing:**
   - Backend: Use Postman or curl
   - Frontend: Use browser + DevTools
   - Both: Check terminal logs

---

## ✅ Quick Reference Card

```
┌─────────────────────────────────────────────┐
│  PAKISTAN LEGAL NEXUS - QUICK REFERENCE     │
├─────────────────────────────────────────────┤
│                                             │
│  START EVERYTHING:                          │
│  ► Double-click: START_ALL.bat              │
│                                             │
│  BACKEND ONLY:                              │
│  ► cd backend && npm run dev                │
│  ► URL: http://localhost:5000               │
│                                             │
│  FRONTEND ONLY:                             │
│  ► cd frontend && npm start                 │
│  ► URL: http://localhost:3000               │
│                                             │
│  STOP SERVERS:                              │
│  ► Close terminal windows                   │
│  ► OR press Ctrl+C                          │
│                                             │
│  DATABASE:                                  │
│  ► MongoDB Atlas (Cloud)                    │
│  ► No local setup needed!                   │
│                                             │
└─────────────────────────────────────────────┘
```

---

**You're all set! Just double-click `START_ALL.bat` and start coding! 🚀**
