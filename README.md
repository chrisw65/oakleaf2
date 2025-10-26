# Sales Funnel & Affiliate Platform

> A next-generation, all-in-one platform combining advanced sales funnel building with integrated affiliate management, CRM, and marketing automation.

![Platform Overview](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### Core Capabilities
- **🎨 Advanced Funnel Builder**: Drag-and-drop interface with 100+ conversion-optimized templates
- **💰 Affiliate Management**: Multi-tier commission tracking, real-time dashboards, automated payouts
- **📊 Full CRM**: Contact management, pipeline tracking, segmentation
- **⚡ Marketing Automation**: Email, SMS, voice campaigns with visual workflow builder
- **💳 Payment Processing**: Stripe & PayPal integration with one-click upsells
- **📈 Analytics & Reporting**: Real-time funnel performance, affiliate metrics, revenue tracking
- **🎓 Membership Sites**: Course delivery, drip content, progress tracking
- **🏢 White-Label**: Multi-tenant support for agencies with custom branding

## 📋 Documentation

- [Project Overview](./PROJECT_OVERVIEW.md)
- [Technical Architecture](./ARCHITECTURE.md)
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)
- [API Documentation](./docs/API.md) *(Coming soon)*
- [User Guide](./docs/USER_GUIDE.md) *(Coming soon)*

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Redux Toolkit
- Tailwind CSS + Shadcn/ui
- GrapeJS (Page Builder)
- Socket.io (Real-time)

### Backend
- Node.js + NestJS
- PostgreSQL 15
- Redis
- Bull Queue
- TypeORM

### Infrastructure
- Docker + Docker Compose
- MinIO (S3-compatible storage)
- Nginx (Load balancing)
- GitHub Actions (CI/CD)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/oakleaf2.git
cd oakleaf2
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the development environment**
```bash
docker-compose up -d
```

4. **Access the platform**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs
- Adminer (DB): http://localhost:8080
- MinIO Console: http://localhost:9001

### Manual Setup (Without Docker)

#### Backend
```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 📁 Project Structure

```
oakleaf2/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/
│   │   │   ├── funnel/
│   │   │   ├── affiliate/
│   │   │   ├── crm/
│   │   │   ├── automation/
│   │   │   └── ...
│   │   ├── common/         # Shared utilities
│   │   ├── config/         # Configuration
│   │   └── main.ts
│   ├── test/
│   └── package.json
├── frontend/               # React Application
│   ├── src/
│   │   ├── features/      # Feature modules
│   │   ├── components/    # Shared components
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── .github/              # CI/CD workflows
├── docker-compose.yml
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e         # Integration tests
npm run test:cov         # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm run test             # Unit tests
npm run test:e2e         # E2E tests (Cypress)
```

## 📦 Building for Production

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend
```bash
cd frontend
npm run build
```

### Docker Production Build
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Development

### Code Quality
- ESLint + Prettier configured
- Pre-commit hooks with Husky
- TypeScript strict mode

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## 🔐 Security

- JWT authentication with refresh tokens
- Password hashing (Argon2)
- Rate limiting
- CORS configured
- SQL injection protection (parameterized queries)
- XSS protection
- CSRF protection
- Encrypted environment variables

## 📊 Database Migrations

```bash
cd backend

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by ClickFunnels and GoHighLevel
- Built with modern web technologies
- Community-driven development

## 📞 Support

- Documentation: [docs/](./docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/oakleaf2/issues)
- Email: support@yourplatform.com

## 🗺️ Roadmap

See [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) for detailed development phases.

### Current Phase: Foundation ✅
- [x] Project setup and documentation
- [ ] Backend API initialization
- [ ] Frontend setup
- [ ] Authentication system
- [ ] Multi-tenancy

### Next Phase: Funnel Builder 🚧
- [ ] Page builder interface
- [ ] Template system
- [ ] Analytics tracking

### Future Phases 📅
- Phase 3: Affiliate Management
- Phase 4: CRM & Contacts
- Phase 5: Marketing Automation
- Phase 6: Payment Integration
- Phase 7: Analytics & Reporting
- Phase 8: Membership Sites
- Phase 9: Advanced Features
- Phase 10: White-Label & Agency

## 📈 Status

- **Version**: 1.0.0-alpha
- **Status**: Active Development
- **Last Updated**: October 2025

---

Made with ❤️ by the Funnel Platform Team
