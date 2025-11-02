# Troubleshooting Guide - Login/Register 404 Error

## Problem Identified

When trying to register or login, the browser console shows:
```
POST http://localhost:3001/api/auth/register 404 (Not Found)
```

**Root Cause**: The backend container is running outdated/cached code and hasn't properly registered the authentication routes.

---

## Solution: Rebuild Backend Container

### Quick Fix (Automated Script)

**Run the restart script:**
```bash
cd /home/user/oakleaf2
./restart-backend.sh
```

This script will:
1. Stop the backend container
2. Remove the old container
3. Rebuild with fresh code (no cache)
4. Start all services
5. Display backend logs

---

### Manual Fix (If Script Doesn't Work)

**Step 1: Stop and remove old container**
```bash
cd /home/user/oakleaf2
docker-compose stop backend
docker-compose rm -f backend
```

**Step 2: Rebuild backend (no cache)**
```bash
docker-compose build --no-cache backend
```

**Step 3: Start all services**
```bash
docker-compose up -d
```

**Step 4: Wait and check logs**
```bash
# Wait 15 seconds for startup
sleep 15

# Check logs for errors
docker-compose logs backend --tail=50
```

---

## Verification Steps

### 1. Check Backend API Documentation

**Open in browser:**
```
http://localhost:3001/api/docs
```

**Expected**: Swagger API documentation page loads

**If you see this**: ✅ Backend is running correctly

**If you get error**: ❌ Backend has startup issues - check logs below

### 2. Check Backend Logs

```bash
docker-compose logs backend --tail=100
```

**Look for these SUCCESS indicators:**
```
🚀 Funnel & Affiliate Platform API
Application is running on: http://localhost:3001
API Documentation: http://localhost:3001/api/docs
```

**Look for these ERROR indicators:**
- Database connection errors
- TypeORM errors
- Module initialization errors
- Missing dependencies

### 3. Test Registration Endpoint Directly

**Using curl:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected response (success):**
```json
{
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

**Expected response (if email exists):**
```json
{
  "statusCode": 400,
  "message": "Email already exists"
}
```

### 4. Test Frontend Registration

1. Open: http://localhost:3002
2. Click "Register now"
3. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: newuser@test.com
   - Password: password123
   - Confirm Password: password123
4. Click "Create Account"

**Expected**:
- Green success message: "Registration successful!"
- Redirect to dashboard
- Browser localStorage contains: accessToken, refreshToken, user

**If you get 404**:
- Backend didn't rebuild properly - try manual rebuild
- Check backend logs for startup errors

---

## Common Issues and Fixes

### Issue 1: Database Connection Error

**Symptoms**: Backend logs show database connection errors

**Fix:**
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Wait 10 seconds
sleep 10

# Restart backend
docker-compose restart backend
```

### Issue 2: Port Already in Use

**Symptoms**:
```
Error: bind: address already in use
```

**Fix:**
```bash
# Find process using port 3001
lsof -i :3001

# Kill the process (replace PID with actual number)
kill -9 <PID>

# Or restart all containers
docker-compose down
docker-compose up -d
```

### Issue 3: Missing Dependencies

**Symptoms**: Backend logs show "Cannot find module" errors

**Fix:**
```bash
# Full rebuild with dependency installation
docker-compose down
docker-compose build --no-cache backend
docker-compose up -d
```

### Issue 4: CORS Errors (Already Fixed)

**Symptoms**: Browser console shows CORS policy errors

**Status**: ✅ Fixed in commit `2c713d2`

**Verification**: Check backend/src/main.ts line 25 includes:
```typescript
'http://localhost:3002',
```

---

## Still Not Working?

### Debug Checklist:

- [ ] Backend container is running: `docker ps | grep backend`
- [ ] Backend API docs load: http://localhost:3001/api/docs
- [ ] No errors in backend logs: `docker-compose logs backend`
- [ ] Frontend is running on port 3002: http://localhost:3002
- [ ] Browser console shows no CORS errors
- [ ] Backend was rebuilt after CORS fix

### Get More Help:

**Share the following information:**

1. **Backend logs:**
   ```bash
   docker-compose logs backend --tail=100 > backend-logs.txt
   ```

2. **Browser console errors:**
   - Press F12 → Console tab
   - Copy all red error messages

3. **Network request details:**
   - Press F12 → Network tab
   - Try to register
   - Click on the failed request
   - Copy the Response tab content

4. **Docker container status:**
   ```bash
   docker ps
   ```

---

## Success Indicators

✅ **All systems working when you see:**

1. **Backend logs show:**
   ```
   🚀 Funnel & Affiliate Platform API
   Application is running on: http://localhost:3001
   ```

2. **Swagger docs load:**
   - http://localhost:3001/api/docs shows API documentation

3. **Registration works:**
   - Form submission shows "Registration successful!"
   - Redirects to /dashboard
   - localStorage has tokens

4. **Login works:**
   - Form submission shows "Login successful!"
   - Redirects to /dashboard
   - User is authenticated

---

## Prevention

**To avoid this issue in the future:**

1. **After code changes to backend**, always rebuild:
   ```bash
   docker-compose build backend
   docker-compose up -d
   ```

2. **When pulling new code**, rebuild all:
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

3. **If unsure**, use the restart script:
   ```bash
   ./restart-backend.sh
   ```
