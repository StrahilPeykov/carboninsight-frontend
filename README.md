# CarbonInsight Frontend

**A web-based Product Carbon Footprint Calculator and Digital Product Passport Generator for SMEs**

CarbonInsight helps manufacturing Small and Medium-sized Enterprises (SMEs) calculate their Product Carbon Footprint (PCF) and generate standards-compliant Digital Product Passports (DPPs) without requiring technical expertise.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.3-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38b2ac.svg)](https://tailwindcss.com/)

## 🎯 Project Overview

CarbonInsight enables manufacturing SMEs to:
- Calculate comprehensive Product Carbon Footprints using standardized methodologies
- Generate compliant Digital Product Passports in Asset Administration Shell (AAS) format
- Manage supply chain carbon data and facilitate data sharing between partners
- Export results in multiple formats (AASX, XML, JSON, CSV, XLSX, PDF)
- Receive AI-powered recommendations for carbon footprint reduction

## ✨ Key Features

### 🏢 Company & User Management
- Multi-company support with role-based access control
- User authentication with JWT tokens and automatic refresh
- Secure company data isolation and user authorization

### 📦 Product Management
- Comprehensive product catalog with manufacturer details
- Multi-step product creation wizard with progress tracking
- Bill of Materials (BoM) management with supplier integration
- Product status tracking (Imported, Estimated, Pending)

### 🌱 Carbon Footprint Calculation
- **Material Emissions**: Raw materials and components
- **Production Energy**: Manufacturing energy consumption
- **Transportation**: Logistics and supply chain transport
- **User Energy**: Product usage phase energy
- **End-of-Life**: Disposal and recycling considerations

### 📊 Digital Product Passports
- Standards-compliant DPP generation (ISO/IEC 15459-2-2015)
- Asset Administration Shell (AAS) package format (.aasx)
- Smart Connected Supplier Network (SCSN) compatibility
- Detailed emission breakdowns with methodology disclosure

### 🤖 AI-Powered Insights
- Intelligent carbon reduction recommendations
- Supply chain optimization suggestions
- Customizable analysis prompts for specific business needs

### 🔄 Data Sharing & Integration
- Secure supplier data sharing with approval workflows
- Multi-format export capabilities for audit and compliance
- API endpoints for enterprise system integration

### ♿ Accessibility & Usability
- WCAG 2.1 AA compliance for inclusive design
- Responsive design supporting all device sizes
- Keyboard navigation and screen reader support
- Dark/light mode with high contrast options

## 🛠 Tech Stack

### Core Framework
- **Next.js 15.3.1** - React framework with App Router
- **React 19.1.0** - Component library with latest features
- **TypeScript 5** - Type-safe development

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Headless UI 2.2** - Unstyled, accessible UI components
- **Radix UI** - Low-level UI primitives
- **Lucide React** - Beautiful, customizable icons

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **GitLab CI/CD** - Automated testing and deployment

### Authentication & API
- **JWT** - Secure authentication with refresh tokens
- **Custom API Client** - Type-safe HTTP client with error handling
- **React Context** - Global state management for authentication

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.17+ or 20.3+
- **npm**, **yarn**, **pnpm**, or **bun**
- Access to the CarbonInsight backend API

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd carboninsight-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Configure your environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
# Add other environment variables as needed
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── components/              # Reusable UI components
│   │   ├── layout/             # Layout components (Navbar, Footer)
│   │   └── ui/                 # Base UI components (Button, Card, Modal)
│   ├── context/                # React Context providers
│   │   └── AuthContext.tsx     # Authentication state management
│   ├── [page-directories]/     # Route-based page components
│   │   ├── page.tsx           # Page component
│   │   └── loading.tsx        # Loading UI
│   ├── globals.css            # Global styles and Tailwind imports
│   └── layout.tsx             # Root layout component
├── lib/                        # Utility libraries
│   ├── api/                   # API client and service modules
│   │   ├── apiClient.ts       # Core HTTP client
│   │   ├── authApi.ts         # Authentication endpoints
│   │   ├── companyApi.ts      # Company management
│   │   ├── productApi.ts      # Product operations
│   │   └── ...               # Other API modules
│   └── types/                # TypeScript type definitions
└── utils/                     # Utility functions
    └── backendExportUtils.ts  # Export functionality
```

### Key Components

- **`AuthContext`** - Manages user authentication state and token refresh
- **`Navbar`** - Navigation with company selection and user menu
- **`Card`** - Consistent container component with accessibility features
- **`Button`** - Accessible button component with multiple variants
- **`Modal`** - Accessible modal dialogs with focus management
- **`ExportModal`** - Specialized modal for product data export

## 🔗 API Integration

The frontend integrates with the CarbonInsight backend API using a custom type-safe client:

```typescript
// Example API usage
import { companyApi, productApi } from '@/lib/api';

// List user's companies
const companies = await companyApi.listCompanies();

// Create a new product
const product = await productApi.createProduct(companyId, {
  product_name: "Example Product",
  sku: "EX-001",
  description: "Product description"
});
```

### Authentication Flow

1. User logs in with email/password
2. Backend returns JWT access + refresh tokens
3. Tokens stored in localStorage
4. Automatic token refresh on API calls
5. Redirect to login on authentication failure

## 🏗 Building for Production

### Static Export Configuration

The application is configured for static export:

```bash
npm run build
```

This generates a static site in the `out/` directory, suitable for deployment on static hosting services.

### Environment Variables

Ensure production environment variables are set:
- `NEXT_PUBLIC_API_URL` - Backend API endpoint
- Other configuration as needed

## 🧪 Testing

The application includes comprehensive error handling and loading states:

- **Error Boundaries** - Graceful error handling
- **Loading Skeletons** - Improved perceived performance
- **Form Validation** - Client-side validation with server-side fallback
- **Accessibility Testing** - WCAG 2.1 AA compliance verification

## 🎨 Design System

### Color Palette
- **Primary Red**: `#c20016` (Brand color)
- **Success Green**: `#10b981`
- **Warning Orange**: `#f59e0b`
- **Error Red**: `#ef4444`
- **Gray Scale**: Tailwind's gray palette

### Typography
- **Font Family**: Kievit (custom font with fallbacks)
- **Font Weights**: 400 (Regular), 500 (Medium), 700 (Bold), 800 (Extra Bold), 900 (Black)

### Accessibility Features
- High contrast color ratios (4.5:1 minimum)
- Focus indicators for keyboard navigation
- Screen reader announcements
- Semantic HTML structure
- ARIA labels and descriptions

## 🚀 Deployment

### Static Export
```bash
npm run build
```

The application builds to a static export in the `out/` directory.

### GitLab CI/CD

The project includes GitLab CI configuration:

```yaml
# .gitlab-ci.yml
test-can-build:
  stage: build
  script:
    - npm install
    - npm run build
```

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - Use TypeScript for all new code
   - Follow ESLint and Prettier configurations
   - Write semantic, accessible HTML

2. **Component Guidelines**
   - Use React functional components with hooks
   - Implement proper prop types with TypeScript
   - Follow accessibility best practices (WCAG 2.1 AA)

3. **API Integration**
   - Use the existing API client pattern
   - Handle loading and error states appropriately
   - Implement proper TypeScript types for responses

4. **Testing**
   - Test user interactions and accessibility
   - Verify responsive design across device sizes
   - Validate form inputs and error handling

### Commit Guidelines

- Use clear, descriptive commit messages
- Follow conventional commit format where applicable
- Reference issue numbers in commits

## 📚 Standards Compliance

CarbonInsight adheres to:

- **ISO 14067** - Carbon footprint of products
- **ISO/IEC 15459-2-2015** - Digital Product Passport standards
- **Asset Administration Shell (AAS)** - Industrie 4.0 digital twin standards
- **SCSN Specifications** - Smart Connected Supplier Network compatibility
- **WCAG 2.1 AA** - Web Content Accessibility Guidelines

## 📞 Support

### Technical Support
- **Email**: [support@carboninsight.win.tue.nl](mailto:support@carboninsight.win.tue.nl)
- **Response Time**: 24-48 hours

### Accessibility Support
- **Email**: [accessibility@carboninsight.win.tue.nl](mailto:accessibility@carboninsight.win.tue.nl)
- **Priority**: High priority for accessibility issues

### Documentation
- **User Guide**: Available within the application
- **API Documentation**: Available at `/api/docs` (backend)
- **Accessibility Statement**: Available at `/accessibility`

## 📄 License

This project is developed for the European Union research program. Views and opinions expressed are those of the authors only and do not necessarily reflect those of the European Union or Health and Digital Executive Agency (HaDEA).

---

**CarbonInsight** - Empowering SMEs with sustainable carbon footprint management.

*Built with ❤️ for a sustainable future*