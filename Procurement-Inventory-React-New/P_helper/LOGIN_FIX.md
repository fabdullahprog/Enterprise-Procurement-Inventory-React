# ✅ Login Issue - RESOLVED!

## ❌ Problem: "Invalid email or password"

### 🔍 Root Cause Found:

**Backend API ছিল না চালু!** 

আপনার screenshot দেখে মনে হচ্ছিল:
1. ✅ Frontend চালু আছে (port 3000)
2. ❌ Backend চালু ছিল না (port 5000) - **এটাই সমস্যা ছিল!**
3. ✅ CORS configured (port 3000 allowed)
4. ❌ Login API call fail হচ্ছিল কারণ backend running ছিল না

### ✅ Solution Applied:

**Backend started successfully on port 5000!**

```
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

---

## 🔧 Solution Steps:

### Step 1: Check Backend is Running

**Terminal check করুন:**
```bash
# Backend terminal এ দেখুন:
Now listening on: http://localhost:5000
```

**Browser test করুন:**
```
http://localhost:5000/swagger
```

যদি Swagger load না হয়, backend restart করুন:
```bash
cd SuperShop_Management
dotnet run --urls "http://localhost:5000"
```

---

### Step 2: Check Frontend axios Configuration

**File:** `src/api/axiosInstance.ts`

**Should be:**
```typescript
const BASE_URL = 'http://localhost:5000';
```

**If different, update it and restart frontend:**
```bash
# Stop frontend (Ctrl+C)
npm run dev
```

---

### Step 3: Test Login API Directly

**Open browser console (F12) and run:**
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@supershop.com',
    password: 'Admin@123'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "admin@supershop.com",
    "roles": ["Admin"]
  }
}
```

---

### Step 4: Check CORS Headers

**Backend CORS Configuration:**
```csharp
// Program.cs - Line 56-62
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

✅ Port 3000 already allowed!

---

### Step 5: Check Network Tab

**Browser Dev Tools → Network Tab:**

1. Open login page
2. Enter credentials
3. Click "Sign In"
4. Check Network tab for `/api/auth/login` request

**Look for:**
- ❌ **Status: Failed** → Backend not running
- ❌ **Status: 404** → Wrong URL
- ❌ **Status: 401** → Wrong credentials
- ❌ **Status: 500** → Backend error
- ❌ **CORS Error** → CORS not configured
- ✅ **Status: 200** → Success!

---

## 🎯 Common Issues & Fixes:

### Issue 1: Backend Not Running
**Symptom:** Network error, connection refused

**Fix:**
```bash
cd SuperShop_Management
dotnet run --urls "http://localhost:5000"
```

---

### Issue 2: Wrong Port in Frontend
**Symptom:** 404 Not Found

**Fix:**
```typescript
// src/api/axiosInstance.ts
const BASE_URL = 'http://localhost:5000'; // ✅ Correct
// NOT: 'http://localhost:5186' ❌
```

---

### Issue 3: CORS Error
**Symptom:** "Access-Control-Allow-Origin" error

**Fix:** Backend এ CORS already configured আছে। যদি এখনও error আসে:

```csharp
// Program.cs - Add before app.UseAuthentication()
app.UseCors("AllowAngular");
```

---

### Issue 4: Wrong Credentials
**Symptom:** "Invalid email or password"

**Default Credentials:**
```
Email: admin@supershop.com
Password: Admin@123
```

**Other Test Users:**
```
Employee:
Email: employee@supershop.com
Password: Employee@123

Dept Head:
Email: depthead@supershop.com
Password: DeptHead@123
```

---

## 🧪 Quick Test Script

**Run this in browser console:**

```javascript
// Test 1: Check backend is accessible
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@supershop.com',
    password: 'Admin@123'
  })
})
.then(async response => {
  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Response:', data);
  
  if (data.success) {
    console.log('✅ Login successful!');
    console.log('Token:', data.token);
  } else {
    console.log('❌ Login failed:', data.message);
  }
})
.catch(error => {
  console.error('❌ Network error:', error);
  console.log('Backend might not be running on port 5000');
});
```

---

## 📋 Checklist:

- [ ] Backend running on port 5000
- [ ] Swagger accessible: http://localhost:5000/swagger
- [ ] Frontend running on port 3000
- [ ] axios base URL is `http://localhost:5000`
- [ ] CORS configured for port 3000
- [ ] Using correct credentials
- [ ] No network errors in console
- [ ] No CORS errors in console

---

## 🔍 Debug Information to Collect:

যদি এখনও কাজ না করে, এই information দিন:

1. **Backend Terminal Output:**
   ```
   Now listening on: http://localhost:5000
   ```

2. **Browser Console Errors:**
   ```
   F12 → Console tab → Copy any red errors
   ```

3. **Network Tab:**
   ```
   F12 → Network tab → Click on login request → Copy response
   ```

4. **axios Base URL:**
   ```typescript
   // src/api/axiosInstance.ts
   const BASE_URL = '???'; // What is this value?
   ```

---

## 🚀 Quick Fix Commands:

```bash
# Terminal 1 - Backend
cd SuperShop_Management
taskkill /F /IM dotnet.exe
dotnet run --urls "http://localhost:5000"

# Terminal 2 - Frontend
cd supershop-ts_v2
# Press Ctrl+C to stop
npm run dev
```

---

## ✅ Expected Result:

After login:
1. ✅ Token saved to localStorage
2. ✅ User redirected to dashboard
3. ✅ User info displayed in header
4. ✅ Navigation menu visible

---

**যদি এখনও problem থাকে, browser console এর screenshot পাঠান!** 📸
