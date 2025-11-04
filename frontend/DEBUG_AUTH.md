# DEBUG: Frontend Auth Issues

## Check 1: Is user logged in?
Open browser console and run:
```javascript
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('User:', localStorage.getItem('user'));
```

## Check 2: Check network tab
1. Open Chrome DevTools → Network tab
2. Try to create a contact
3. Click on the failed request
4. Check "Headers" section
5. Look for: **Authorization: Bearer xxxxx**

## Check 3: Test backend directly
```bash
# Get your token from browser console first
TOKEN="your-token-here"

# Test contact creation
curl -X POST http://localhost:3001/api/v1/crm/contacts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "status": "active"
  }'
```

## Check 4: Backend expects
The backend JWT guard needs:
- Header: `Authorization: Bearer <token>`
- Token must be valid JWT
- Token must not be expired

## Common Issues:
1. **No token** - User not logged in
2. **Wrong token format** - Backend expects different format
3. **Expired token** - Token expired, needs refresh
4. **CORS** - Backend blocking frontend origin
5. **Tenant issue** - Token missing tenantId

## Quick Fix:
1. Log out and log back in
2. Check browser console for token
3. If no token → login is broken
4. If token exists → backend auth guard issue
