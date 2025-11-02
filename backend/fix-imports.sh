#!/bin/bash

# Fix guard and decorator imports across all modules
find src/modules -name "*.ts" -type f -exec sed -i.bak \
  -e "s|from '../auth/jwt-auth.guard'|from '../../common/guards/jwt-auth.guard'|g" \
  -e "s|from '../auth/get-tenant.decorator'|from '../../common/decorators/get-tenant.decorator'|g" \
  -e "s|from '../auth/get-user.decorator'|from '../../common/decorators/get-user.decorator'|g" \
  -e "s|from '../rbac/permissions.decorator'|from '../../common/decorators/permissions.decorator'|g" \
  -e "s|from '../rbac/permissions.guard'|from '../../common/guards/permissions.guard'|g" \
  {} \;

# Remove backup files
find src/modules -name "*.bak" -delete

echo "Import paths fixed!"
