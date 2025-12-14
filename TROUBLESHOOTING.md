# 🛠️ Troubleshooting Guide

## ⚠️ Common Errors & Solutions

### ❌ Error: "EADDRINUSE: address already in use :::5000"

**What it means:** Port 5000 is already being used by another process (usually a previous instance of your backend server that didn't close properly).

**Quick Fix:**
```bash
# Option 1: Use the cleanup script
Double-click: CLEANUP_PORTS.bat

# Option 2: Manual command
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

**Permanent Fix:**
- Updated `START_ALL.bat` now automatically cleans ports before starting!
- Just restart `START_ALL.bat`

---

### ❌ Error: "EADDRINUSE: address already in use :::3000"

**What it means:** Port 3000 is already being used (usually React dev server).

**Quick Fix:**
```bash
# Option 1: Use the cleanup script
Double-click: CLEANUP_PORTS.bat

# Option 2: React will ask if you want to use port 3001
Press Y to use alternate port
```

---

### 🔧 Port Cleanup Utilities

I've created 3 helper scripts for you:

| Script | Purpose |
|--------|---------|
| `CLEANUP_PORTS.bat` ⭐ | Cleans both ports 5000 & 3000 |
| `KILL_PORT_5000.bat` | Cleans only port 5000 |
| `KILL_PORT_3000.bat` | Cleans only port 3000 |

**When to use:**
- Before starting servers manually
- When you see "EADDRINUSE" errors
- After servers crash or hang

---

### ❌ Error: "MongoDB connection failed"

**Possible Causes:**

1. **No Internet Connection**
   ```
   Solution: Check your internet - MongoDB Atlas needs it
   ```

2. **Wrong Credentials**
   ```
   Solution: Check backend/.env file
   Verify: MONGODB_URI is correct
   ```

3. **IP Not Whitelisted**
   ```
   Solution: 
   1. Go to cloud.mongodb.com
   2. Network Access → Add IP Address
   3. Add your IP or use 0.0.0.0/0 (testing only!)
   ```

---

### ❌ Error: "npm: command not found"

**Solution:**
```bash
# Node.js is not installed or not in PATH
1. Download from: https://nodejs.org/
2. Install Node.js
3. Restart terminal/computer
4. Test: node --version
```

---

### ❌ Error: "Cannot find module 'express'"

**Solution:**
```bash
# Dependencies not installed
cd backend
npm install

# Or reinstall everything
cd backend
rm -rf node_modules
npm install
```

---

### ❌ Error: PowerShell Execution Policy

**You see:**
```
npm.ps1 cannot be loaded because running scripts is disabled
```

**Solution:**
```bash
# Use the .bat files instead (they bypass this)
Double-click START_ALL.bat

# Or use cmd instead
cmd /c npm run dev
```

---

### ❌ Frontend Shows Blank Page

**Solutions:**

1. **Check Console**
   ```
   Press F12 → Console tab
   Look for error messages
   ```

2. **Check If Backend is Running**
   ```
   Visit: http://localhost:5000/api/health
   Should return JSON response
   ```

3. **Clear Browser Cache**
   ```
   Press Ctrl+Shift+R (hard reload)
   Or Ctrl+Shift+Delete → Clear cache
   ```

4. **Rebuild**
   ```
   cd frontend
   rm -rf node_modules
   npm install
   npm start
   ```

---

### ❌ CORS Errors in Browser Console

**You see:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
```bash
# Check backend/.env
CLIENT_URL=http://localhost:3000

# Make sure backend is running
# Restart backend server
```

---

### ❌ "Compilation Failed" in Frontend

**Solutions:**

1. **Check for Syntax Errors**
   ```
   Terminal shows which file has the error
   Fix the syntax error
   Save file (auto-reloads)
   ```

2. **Missing Dependencies**
   ```
   cd frontend
   npm install
   ```

3. **Node Modules Corrupted**
   ```
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### ❌ Backend Crashes on Startup

**Check:**

1. **Environment Variables**
   ```
   Make sure backend/.env exists
   Copy from .env.example if missing
   ```

2. **MongoDB Connection**
   ```
   Check internet connection
   Check MONGODB_URI in .env
   ```

3. **Port Already in Use**
   ```
   Run: CLEANUP_PORTS.bat
   Then restart backend
   ```

---

### ❌ Changes Not Showing Up

**Frontend Changes:**
```bash
# Hard reload browser
Ctrl+Shift+R

# Or clear cache
Ctrl+Shift+Delete
```

**Backend Changes:**
```bash
# Nodemon should auto-reload
# If not, check terminal for errors
# Restart manually if needed
```

---

## 🚀 Quick Fixes Checklist

When things go wrong, try these in order:

- [ ] **Step 1:** Close all terminal windows
- [ ] **Step 2:** Run `CLEANUP_PORTS.bat`
- [ ] **Step 3:** Run `START_ALL.bat` again
- [ ] **Step 4:** Wait for "Compiled successfully"
- [ ] **Step 5:** Hard reload browser (Ctrl+Shift+R)

**Still broken?**

- [ ] **Step 6:** Check internet connection
- [ ] **Step 7:** Verify backend/.env exists
- [ ] **Step 8:** Check MongoDB Atlas dashboard
- [ ] **Step 9:** Reinstall dependencies:
  ```bash
  cd backend && npm install
  cd frontend && npm install
  ```

---

## 📞 How to Check If Things Are Running

### Check Backend:
```bash
# Visit this URL in browser:
http://localhost:5000/api/health

# Should return:
{"success": true, "message": "..."}
```

### Check Frontend:
```bash
# Visit this URL in browser:
http://localhost:3000

# Should see: Beautiful gradient homepage
```

### Check MongoDB:
```bash
# Backend terminal should show:
✅ MongoDB Connected: ac-c00lfc8-shard-00-02.wfdehtp.mongodb.net
📊 Database: test
```

### Check Ports:
```bash
# Run this command:
netstat -ano | findstr "5000 3000"

# Should show:
#   Port 5000 LISTENING (backend)
#   Port 3000 LISTENING (frontend)
```

---

## 🔍 Debugging Tips

### 1. Always Check Terminal Output
- Backend errors appear in backend terminal
- Frontend errors appear in frontend terminal
- Read the error messages!

### 2. Use Browser DevTools
```
Press F12
- Console: JavaScript errors
- Network: API call failures
- Elements: HTML/CSS issues
```

### 3. Check File Paths
```
Make sure you're in the right directory
cd backend  (for backend commands)
cd frontend (for frontend commands)
```

### 4. Restart Everything
```
When in doubt:
1. Close all terminals
2. Run CLEANUP_PORTS.bat
3. Run START_ALL.bat
4. Wait for both to start
```

---

## 🆘 Emergency Reset

If everything is broken:

```bash
# 1. Kill all node processes
taskkill /IM node.exe /F

# 2. Clean ports
Double-click CLEANUP_PORTS.bat

# 3. Reinstall dependencies (if needed)
cd backend
rm -rf node_modules
npm install

cd frontend
rm -rf node_modules
npm install

# 4. Start fresh
Double-click START_ALL.bat
```

---

## ✅ Prevention Tips

### Do:
✅ Use `START_ALL.bat` to start servers  
✅ Close terminals properly (Ctrl+C then close)  
✅ Check terminal for errors before debugging  
✅ Keep backend and frontend terminals separate  
✅ Use `CLEANUP_PORTS.bat` if servers hang  

### Don't:
❌ Force-close terminals without Ctrl+C  
❌ Run multiple instances of backend/frontend  
❌ Ignore error messages in terminal  
❌ Edit .env without restarting backend  
❌ Work offline with MongoDB Atlas  

---

**Most Common Issue:** Port already in use  
**Easiest Fix:** Run `CLEANUP_PORTS.bat` then `START_ALL.bat`  

**Still having issues?** Check the error message in terminal - it usually tells you exactly what's wrong!
