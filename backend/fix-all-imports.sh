#!/bin/bash

# Fix analytics controller
sed -i "s|import { AnalyticsService, TrackEventDto } from './analytics.service';|import { AnalyticsService } from './analytics.service';\nimport type { TrackEventDto } from './analytics.service';|" src/modules/analytics/analytics.controller.ts

# Fix api-key controller
sed -i "s|import { ApiKeyService, CreateApiKeyDto, UpdateApiKeyDto } from './api-key.service';|import { ApiKeyService } from './api-key.service';\nimport type { CreateApiKeyDto, UpdateApiKeyDto } from './api-key.service';|" src/modules/api-key/api-key.controller.ts

# Fix custom-domain controller
sed -i "/^import {$/,/^} from '.\/custom-domain.service';$/{
  s|^import {$|import { CustomDomainService } from './custom-domain.service';\nimport type {|
  s|  CustomDomainService,||
  s|^} from '.\/custom-domain.service';$|} from './custom-domain.service';|
}" src/modules/custom-domain/custom-domain.controller.ts

# Fix email-automation controller
sed -i "/^import {$/,/^} from '.\/email-automation.service';$/{
  s|^import {$|import { EmailAutomationService } from './email-automation.service';\nimport type {|
  s|  EmailAutomationService,||
  s|^} from '.\/email-automation.service';$|} from './email-automation.service';|
}" src/modules/email-automation/email-automation.controller.ts

# Fix email-template controller
sed -i "/^import {$/,/^} from '.\/email-template.service';$/{
  s|^import {$|import { EmailTemplateService } from './email-template.service';\nimport type {|
  s|  EmailTemplateService,||
  s|^} from '.\/email-template.service';$|} from './email-template.service';|
}" src/modules/email-template/email-template.controller.ts

# Fix file-upload controller
sed -i "s|import { FileUploadService, GeneratePresignedUrlDto } from './file-upload.service';|import { FileUploadService } from './file-upload.service';\nimport type { GeneratePresignedUrlDto } from './file-upload.service';|" src/modules/file-upload/file-upload.controller.ts

# Fix payment controller
sed -i "s|import { StripeService, CreatePaymentIntentDto, CreateSubscriptionDto } from './stripe.service';|import { StripeService } from './stripe.service';\nimport type { CreatePaymentIntentDto, CreateSubscriptionDto } from './stripe.service';|" src/modules/payment/payment.controller.ts

# Fix RawBodyRequest import in payment controller
sed -i "/^import {$/,/^} from '\@nestjs\/platform-express';$/{
  s|^import {$|import type {|
}" src/modules/payment/payment.controller.ts

# Fix permission controller
sed -i "/^import {$/,/^} from '.\/permission.service';$/{
  s|^import {$|import { PermissionService } from './permission.service';\nimport type {|
  s|  PermissionService,||
  s|^} from '.\/permission.service';$|} from './permission.service';|
}" src/modules/rbac/permission.controller.ts

# Fix role controller
sed -i "s|import { RoleService, CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './role.service';|import { RoleService } from './role.service';\nimport type { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './role.service';|" src/modules/rbac/role.controller.ts

# Fix two-factor controller
sed -i "s|import { TwoFactorService, Setup2FADto, Enable2FADto } from './two-factor.service';|import { TwoFactorService } from './two-factor.service';\nimport type { Setup2FADto, Enable2FADto } from './two-factor.service';|" src/modules/two-factor/two-factor.controller.ts

echo "All DTO imports fixed!"
