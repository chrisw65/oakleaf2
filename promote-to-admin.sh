#!/bin/bash

echo "🔑 Promote User to Admin"
echo "========================="
echo ""
echo "This script will promote a user to admin role."
echo ""

# Check if email is provided
if [ -z "$1" ]; then
  echo "Usage: ./promote-to-admin.sh <email>"
  echo "Example: ./promote-to-admin.sh user@example.com"
  exit 1
fi

EMAIL="$1"

echo "Checking if user exists..."
echo ""

# Try to connect to PostgreSQL and promote user
docker exec -it oakleaf2-postgres-1 psql -U postgres -d oakleaf2 -c "
SELECT 'User found: ' || email || ' (current role: ' || role || ')'
FROM users
WHERE email = '${EMAIL}';
"

echo ""
echo "Promoting user to admin..."
echo ""

docker exec -it oakleaf2-postgres-1 psql -U postgres -d oakleaf2 -c "
UPDATE users SET role = 'admin' WHERE email = '${EMAIL}';
SELECT 'SUCCESS! User ' || email || ' is now an admin!'
FROM users
WHERE email = '${EMAIL}';
"

echo ""
echo "✅ Done! You can now login and access /admin"
echo ""
