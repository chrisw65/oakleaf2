# How to Promote Your User to Admin

## Method 1: Direct Database Update (EASIEST)

### Step 1: Connect to PostgreSQL
```bash
# Using Docker
docker exec -it oakleaf2-postgres-1 psql -U postgres -d oakleaf2

# Or if PostgreSQL is running locally
psql -U postgres -d oakleaf2
```

### Step 2: Find Your User
```sql
SELECT id, email, role FROM users;
```

### Step 3: Promote to Admin
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### Step 4: Verify
```sql
SELECT id, email, role FROM users WHERE email = 'your@email.com';
```

You should see `role | admin`

---

## Method 2: Add Temporary Promote Endpoint

### Step 1: Create Promote Script
Create a file: `backend/src/scripts/promote-admin.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepository } from 'typeorm';
import { User, UserRole } from '../modules/user/user.entity';

async function promoteToAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npm run promote <email>');
    process.exit(1);
  }

  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { email } });
  
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  user.role = UserRole.ADMIN;
  await userRepository.save(user);
  
  console.log(`✅ User ${email} promoted to admin!`);
  process.exit(0);
}

promoteToAdmin();
```

### Step 2: Add npm script to package.json
```json
{
  "scripts": {
    "promote": "ts-node src/scripts/promote-admin.ts"
  }
}
```

### Step 3: Run it
```bash
npm run promote your@email.com
```

---

## Method 3: Add One-Time API Endpoint

### Step 1: Add to AuthController
Open `backend/src/modules/auth/auth.controller.ts` and add:

```typescript
import { Public } from '../../common/decorators/public.decorator';

@Post('promote-first-admin')
@Public()
async promoteFirstAdmin(@Body() body: { email: string; secret: string }) {
  // Security: require a secret passphrase
  if (body.secret !== 'MAKE_ME_ADMIN_PLEASE_12345') {
    throw new BadRequestException('Invalid secret');
  }

  const user = await this.authService.findUserByEmail(body.email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Only allow if no admins exist yet
  const adminCount = await this.userService.countAdmins();
  if (adminCount > 0) {
    throw new BadRequestException('Admin already exists');
  }

  user.role = UserRole.ADMIN;
  await this.userService.save(user);

  return { message: `User ${body.email} promoted to admin` };
}
```

### Step 2: Call the endpoint
```bash
curl -X POST http://localhost:3000/api/v1/auth/promote-first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "secret": "MAKE_ME_ADMIN_PLEASE_12345"
  }'
```

### Step 3: Remove the endpoint after use!
Delete the endpoint after you've promoted yourself for security.

---

## Which Method Should You Use?

- **Method 1 (Database)**: Fastest, most reliable ⭐
- **Method 2 (Script)**: Good for scripts/automation
- **Method 3 (API)**: Good if you can't access database

**Recommendation: Use Method 1** (direct database update)
