# Documentation Technique - DataShare

## Structure des dossiers
```sh
.
├── backend/                                    # NestJS backend root – contains the entire REST API project
│   ├── src/                                    # Main source code (all business logic)
│   │   ├── auth/                               # Complete module for authentication (US03 Account creation + US04 Login)
│   │   │   ├── decorators/
│   │   │   │   └── get-user.decorator.ts       # To inject the authenticated user (req.user) into the controllers – used for ownership checks (e.g., history/delete US05/US06)
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts                # DTO validation of login input (email + password) with class-validator – specs US04 input controls
│   │   │   │   └── register.dto.ts             # DTO validation register entry (unique email, password >=8) – US03 specs
│   │   │   ├── auth.controller.spec.ts         # [🔎] Test
│   │   │   ├── auth.controller.ts              # Endpoints /api/auth/register and /api/auth/login – handle HTTP auth requests
│   │   │   ├── auth.module.ts                  # NestJS module that assembles controller, service, JWT, Passport – imports TypeOrm User
│   │   │   ├── auth.service.spec.ts            # [🔎] Test
│   │   │   ├── auth.service.ts                 # Auth business logic: bcrypt hash, JWT sign, credentials verification – password security specs
│   │   │   ├── jwt-auth.guard.ts               # Guard @UseGuards(JwtAuthGuard) to protect authenticated routes
│   │   │   ├── jwt.strategy.spec.ts            # [🔎] Test
│   │   │   └── jwt.strategy.ts                 # JWT Passport Strategy: Validates token, extracts payload, finds user in database
│   │   ├── entities/                           # DB TypeORM Models
│   │   │   ├── file.entity.ts                  # Entity File: fields (token, password hash, tags, expiration, user relationship) – covers US01/US02/US05-10
│   │   │   └── user.entity.ts                  # Entity User: id, unique email, password hash – US03/US04
│   │   ├── files/                              # Main file module
│   │   │   ├── dto/
│   │   │   │   ├── download.dto.ts             # DTO for download with password – US02/US09
│   │   │   │   ├── update-expiration.dto.ts    # DTO update expiration post-upload – US10
│   │   │   │   ├── update-password.dto.ts      # DTO update password post-upload – US09
│   │   │   │   ├── update-tags.dto.ts          # DTO update tags – US08
│   │   │   │   ├── upload-options.dto.ts       # DTO body upload (password, expirationDays, tags) – US01/US09/US10
│   │   │   │   └── upload.dto.ts               # DTO upload (Main)
│   │   │   ├── guards/
│   │   │   │   └── optional-auth.guard.ts     # Guard custom for anonymous upload (US07)
│   │   │   ├── files.controller.spec.ts       # [🔎] Test
│   │   │   ├── files.controller.ts            # All file endpoints: upload (auth/anonymous), metadata, download, history, delete, update tags/password/expiration
│   │   │   ├── files.module.ts                # Assemble controller, service, tasks, Multer config (disk storage + 1GB limit), Schedule for cron
│   │   │   ├── files.service.spec.ts          # [🔎] Test
│   │   │   ├── files.service.ts               # Heavyweight logic: upload validation (size/extensions), token UUID, password hash, ownership checks, format response with downloadUrl
│   │   │   ├── tasks.service.spec.ts          # [🔎] Test
│   │   │   └── tasks.service.ts               # Daily cron service @Cron for purging expired files + physical deletion – US10
│   │   ├── health/
│   │   │   ├── health.controller.spec.ts      # [🔎] Test
│   │   │   └── health.controller.ts           # Simple endpoint /api/health – for Docker healthcheck + monitoring
│   │   ├── users/
│   │   │   ├── users.controller.spec.ts       # [🔎] Test
│   │   │   ├── users.controller.ts            # Endpoints /me
│   │   │   ├── users.module.ts                # NestJS module
│   │   │   ├── users.service.spec.ts          # [🔎] Test
│   │   │   └── users.service.ts               # getProfile, updateProfile
│   │   ├── app.module.ts                      # Root module: imports Config, TypeOrm async, Schedule, AuthModule, FilesModule, HealthController
│   │   └── main.ts                            # Bootstrap app: NestFactory, global prefix /api, CORS, ValidationPipe, listen port
│   │
│   ├── test/                                  # End-to-end (e2e) testing
│   │   ├── app.e2e-spec.ts                    # 
│   │   └── jest-e2e.json                      # Config Jest e2e
│   │
│   ├── Dockerfile.dev                         # DEV ONLY
│   ├── eslint.config.mjs                      # Config linting code (ESLint)
│   ├── nest-cli.json                          # NestCLI configuration (module generation, etc.)
│   ├── package-lock.json                      # Lock npm dependencies
│   ├── package.json                           # Dependencies (@nestjs/*, typeorm, pg, multer, uuid, bcrypt, etc.) + scripts
│   ├── tsconfig.build.json                    # Config TS build (excludes tests)
│   └── tsconfig.json                          # General TypeScript configuration
│
├── frontend/                                  # NextJS frontend root – contains the entire Frontend Project
│   ├── public/                                # Static
│   │   ├── favicons/                          
│   │   └── images/
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   ├── (errors)/                 
│   │   │   │   │   └── server-error/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── (private)/                          # 🔴 PRIVATE ROADS (AuthGuard)
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx                    # US05 - File History
│   │   │   │   │   ├── DashboardLayoutClient.tsx
│   │   │   │   │   └── layout.tsx                      # Private Layout
│   │   │   │   │
│   │   │   │   ├── (public)/                           # 🟢 PUBLIC ROADS
│   │   │   │   │   ├── (auth)/                     
│   │   │   │   │   │   ├── login/                      # US04 - Login
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── logout/                     # US04 - Logout
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   └── register/                   # US03 - Registration
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── download/                       # US02 - Download
│   │   │   │   │   │   └── [token]/
│   │   │   │   │   │       ├── DownloadPageClient.tsx
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── layout.tsx                      # Public Layout
│   │   │   │   │   └── page.tsx                        # Public Homepage
│   │   │   │   │
│   │   │   │   ├── [...rest]/                          # Catch-all pour 404
│   │   │   │   │   └── page.tsx
│   │   │   │   │
│   │   │   │   ├── error.tsx                           # Error boundary
│   │   │   │   ├── layout.tsx                          # Root Layout (fonts, providers)
│   │   │   │   └── not-found.tsx                       # 404
│   │   │   │
│   │   │   ├── styles/                                 # 🎨 STYLES
│   │   │   │   ├── base/                               # 🔒 Common style
│   │   │   │   │   ├── tokens.css                      # 🔒 Common variables
│   │   │   │   │   ├── typography.css                  # 🔒 Typographic configuration
│   │   │   │   │   └── utilities.css                   # 🔒 Utility classes
│   │   │   │   └── themes/
│   │   │   │       └── datashare.css                   # 🎨 DataShare Theme
│   │   │   │
│   │   │   └── globals.css                             # CSS entry point
│   │   │
│   │   ├── components/
│   │   │   ├── common/                                 # Shared Components
│   │   │   │   └── ConfirmDialog.tsx                   # Confirmation method (US06)
│   │   │   │
│   │   │   ├── features/                               # Business components
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginForm.tsx                   # US04 - Login
│   │   │   │   │   └── RegisterForm.tsx                # US03 - Account
│   │   │   │   │
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── EditTagsDialog.tsx              # US08 - Tags
│   │   │   │   │   ├── FileFilters.tsx                 # US05 - File History
│   │   │   │   │   ├── FileItem.tsx                    # US05 - File History
│   │   │   │   │   ├── FileList.tsx                    # US05 - File History
│   │   │   │   │   ├── TagInput.tsx                    # US08 - Tags
│   │   │   │   │   └── TagList.tsx                     # US08 - Tags
│   │   │   │   │
│   │   │   │   ├── download/                           # US02
│   │   │   │   │   └── DownloadCard.tsx
│   │   │   │   │
│   │   │   │   └── upload/                             # US01, US07, US09, US10
│   │   │   │       ├── FileUploadForm.tsx              # Complete form
│   │   │   │       ├── UploadHero.tsx                  # Decorative circles
│   │   │   │       └── UploadSheet.tsx                 # Modal/Sheet responsive
│   │   │   │       
│   │   │   ├── layout/                                 # Layout components
│   │   │   │   ├── DashboardHeader.tsx                 # Connected desktop header
│   │   │   │   ├── DashboardSidebar.tsx                # Sidebar desktop
│   │   │   │   ├── Footer.tsx                          # Footer (Public & Private)
│   │   │   │   ├── MobileDrawer.tsx                    # Mobile Navigation
│   │   │   │   ├── PrivateHeader.tsx                   # Connected mobile header
│   │   │   │   ├── PublicHeader.tsx                    # Public header (logo + login)
│   │   │   │   └── PublicHeaderWrapper.tsx             # Public header wrapper (PublicHeader <> PrivateHeader)
│   │   │   │
│   │   │   ├── providers/
│   │   │   │   ├── StoreProvider.tsx                   # Redux provider
│   │   │   │   └── ToastProvider.tsx                   # Sonner provider
│   │   │   │
│   │   │   └── ui/                                     # Shadcn/ui components
│   │   ├── config/
│   │   │   ├── env.ts                                  # Environmental variables
│   │   │   ├── i18n.ts                                 # Supported locales (fr, en), ISO configuration
│   │   │   ├── site.ts                                 # Site URL, OG image, themeColor
│   │   │   └── upload.ts                               # Config upload (max size, types)
│   │   │
│   │   ├── i18n/
│   │   │   ├── routing.ts                              # i18n routes
│   │   │   ├── requests.ts                             # Loading translations
│   │   │   └── locales/
│   │   │       ├── en/
│   │   │       │   ├── account.json
│   │   │       │   ├── auth.json
│   │   │       │   ├── common.json
│   │   │       │   ├── dashboard.json
│   │   │       │   ├── download.json
│   │   │       │   ├── error.json
│   │   │       │   ├── security.json
│   │   │       │   ├── seo.json
│   │   │       │   └── upload.json
│   │   │       └── fr/
│   │   │           └── ...
│   │   │
│   │   ├── lib/
│   │   │   ├── store/
│   │   │   │   ├── api/
│   │   │   │   │   └── apiSlice.ts
│   │   │   │   ├── features/
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── authApi.ts  
│   │   │   │   │   │   └── authSlice.ts
│   │   │   │   │   ├── files/
│   │   │   │   │   │   ├── filesApi.ts
│   │   │   │   │   │   └── filesSlice.ts
│   │   │   │   │   ├── tags/
│   │   │   │   │   │   └── tagsApi.ts
│   │   │   │   │   ├── ui/
│   │   │   │   │   │   └── uiSlice.ts
│   │   │   │   │   └── user/
│   │   │   │   │       └── userApi.ts
│   │   │   │   ├── middleware/
│   │   │   │   │   └── errorLogger.ts
│   │   │   │   ├── hooks.ts
│   │   │   │   └── store.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── schemas/
│   │   │   ├── download.schema.ts
│   │   │   ├── identity.schema.ts 
│   │   │   └── upload.schema.ts
│   │   │
│   │   ├── types/
│   │   │   ├── file.ts
│   │   │   └── user.ts
│   │   │
│   │   └── proxy.ts
│   │
│   ├── cypress/
│   │   ├── e2e/
│   │   │   ├── dashboard.cy.ts
│   │   │   ├── download.cy.ts
│   │   │   └── upload.cy.ts
│   │   ├── fixtures/
│   │   │   └── test-image.jpg
│   │   ├── support/
│   │   │   ├── commands.ts
│   │   │   └── e2e.ts
│   ├── cypress.config.ts


││
│├── .gitignore
│├── components.json                        # Shadcn config
│├── Dockerfile
│├── next.config.js
│├── package.json
│├── postcss.config.mjs
│├── tailwind.config.ts                     # 
│└── tsconfig.json









├── volumes/                            # Volumes persistants
│   ├── postgresql/                     # Data DB
│   ├── redis/                          # Data Redis (optionnel)
│   └── uploads/                        # Fichiers uploadés (remplace media)
├── .env                                # Variables (POSTGRES_USER, etc.)
├── docker-compose.yml                  # Modifié (voir ci-dessous)
├── TESTING.md                          # À remplir à la fin (tests unit/end-to-end avec Jest/Supertest pour Nest, Cypress pour front)
├── SECURITY.md                         # Scan deps (npm audit), decisions
├── PERF.md                             # Tests avec k6 sur endpoints, bundle size
└── MAINTENANCE.md                      # Update deps, risques
```