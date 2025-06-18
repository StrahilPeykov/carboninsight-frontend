# CarbonInsight Frontend

A comprehensive React/Next.js frontend for tracking and analyzing carbon emissions across supply chains, with support for Asset Administration Shell (AAS) standards and digital product passports.

## Features

### Multi-Tenant Company Management
- **Company Creation & Management**: Create and manage multiple companies with full CRUD operations
- **User Access Control**: Invite and manage authorized users per company
- **Company Switching**: Seamless switching between companies with persistent state

### Product Lifecycle Management
- **Product Creation**: Add products with detailed specifications and metadata
- **Bill of Materials (BoM)**: Build complex product hierarchies with supplier relationships
- **Emission Tracking**: Track transport, production energy, and user energy emissions
- **AI Recommendations**: OpenAI-powered suggestions for emission reduction

### Supply Chain Collaboration
- **Data Sharing Requests**: Request and approve access to supplier emission data
- **Secure Data Exchange**: Controlled sharing of carbon footprint information
- **Supply Chain Transparency**: Complete visibility across product lifecycles

### Standards Compliance & Export
- **Multiple Export Formats**: AAS (AASX, XML, JSON), SCSN, CSV, XLSX, PDF
- **Digital Product Passports**: Generate compliant Carbon Footprint Reports
- **Lifecycle Stage Analysis**: EN 15804 compliant categorization (A1-A5, B1-B7, C1-C4, D)
- **Import/Export**: Bulk import from various formats including AAS packages

### User Experience
- **Interactive Tours**: Comprehensive onboarding with guided tours
- **Responsive Design**: Mobile-first design with accessibility compliance (WCAG 2.1 AA)
- **Dark Mode**: Full dark mode support with system preference detection
- **Keyboard Navigation**: Complete keyboard accessibility with shortcuts
- **Real-time Updates**: Live data synchronization across components

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 with custom design system
- **TypeScript**: Full type safety throughout the application
- **State Management**: React Context with hooks-based architecture
- **Authentication**: JWT-based with refresh tokens and session management

### Key Components

#### Authentication & Authorization
- **AuthContext**: Centralized authentication state management
- **JWT Token Management**: Automatic refresh with expiration handling
- **Route Protection**: Page-level authentication requirements
- **Account Lockout**: Integration with django-axes for security

#### Company & Product Management
- **CompanySelector**: Advanced dropdown with search and quick actions
- **Product Management**: Full CRUD with emission calculations
- **BoM Management**: Interactive bill of materials editor
- **Audit Logging**: Complete change tracking and history

#### Data Import/Export
- **Multi-format Support**: AAS, SCSN, CSV, XLSX, PDF generation
- **File Upload**: Drag-and-drop with validation and progress tracking
- **Export Options**: Context-aware export with format selection

#### Tours & Onboarding
- **TourProvider**: Multi-page guided tours with state persistence
- **Interactive Elements**: Spotlight highlighting with keyboard navigation
- **Progress Tracking**: User-specific tour completion tracking

### Component Structure
```
src/
├── app/                          # Next.js app directory
│   ├── components/              # Reusable UI components
│   │   ├── layout/             # Navigation and layout components
│   │   ├── ui/                 # Base UI components (Button, Card, etc.)
│   │   ├── OnboardingTour.tsx  # Interactive tour system
│   │   └── TourProvider.tsx    # Tour state management
│   ├── context/                # React contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ThemeContext.tsx    # Theme management
│   ├── (pages)/                # Application pages
│   └── globals.css             # Global styles and theme
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities and API clients
│   ├── api/                    # Type-safe API client
│   └── utils.ts               # Helper functions
└── components/                 # Shared components
    └── ui/                     # shadcn/ui components
```

## Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm, yarn, or pnpm
- Backend API running (see backend README)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd carboninsight-frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Environment Setup

Create a `.env.local` file:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional: For production deployments
NEXT_PUBLIC_FRONTEND_DOMAIN=your-domain.com
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
# Build the application
npm run build
npm start

# Or for static export
npm run build
# Files will be in the `out` directory
```

## API Integration

### Type-Safe API Client
The frontend uses a comprehensive type-safe API client located in `src/lib/api/`:

```typescript
// Example usage
import { productApi } from '@/lib/api/productApi';

const products = await productApi.listProducts(companyId);
const product = await productApi.getProduct(companyId, productId);
```

### Available API Modules
- `authApi` - Authentication and user management
- `companyApi` - Company CRUD and user management
- `productApi` - Product management and emission tracking
- `bomApi` - Bill of Materials management
- `emissionApi` - Transport, production, and user energy emissions
- `auditLogApi` - Audit trail and change tracking

### Error Handling
```typescript
try {
  const result = await productApi.createProduct(companyId, productData);
} catch (error) {
  if (error instanceof ApiError) {
    // Handle structured API errors
    console.error(`API Error: ${error.status}`, error.data);
  }
}
```

## Key Features Deep Dive

### Interactive Tours
The application includes comprehensive guided tours:

```typescript
import { useTour } from '@/app/components/TourProvider';

const { startTour, completeTour, isTourCompleted } = useTour();

// Start the main onboarding tour
startTour('main-onboarding');

// Check completion status
if (isTourCompleted('product-list-tour')) {
  // User has completed the product tour
}
```

### Theme System
Full dark/light mode support with system preference detection:

```typescript
import { useTheme } from '@/app/context/ThemeContext';

const { theme, setTheme, effectiveTheme } = useTheme();

// Set theme
setTheme('dark');    // 'light', 'dark', or 'system'
```

### Accessibility Features
- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Keyboard Navigation**: Complete keyboard access with shortcuts
- **Screen Reader Support**: Proper ARIA labels and live regions
- **High Contrast**: Support for high contrast modes
- **Focus Management**: Logical focus flow and trap management

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Dedicated tablet layouts
- **Desktop Enhancement**: Advanced features for larger screens

## Export & Import System

### Export Formats
```typescript
import { exportProduct, ExportFormat } from '@/utils/backendExportUtils';

// Available formats
const formats: ExportFormat[] = [
  'pdf',        // Carbon Footprint Report
  'aasx',       // AAS Package (primary format)
  'aas_xml',    // AAS XML
  'aas_json',   // AAS JSON
  'scsn_full_xml', // SCSN Complete XML
  'csv',        // Spreadsheet format
  'xlsx',       // Excel format
  'zip'         // Complete package
];

// Export a product
await exportProduct(companyId, productId, 'aasx', productName);
```

### Import System
The application supports importing data from:
- **AAS Packages** (AASX files)
- **CSV/XLSX** files for bulk product import
- **JSON** files for structured data

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration testing
- **E2E Tests**: User workflow testing

## Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npx vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Static Export
```bash
# For static hosting
npm run build
# Upload the `out` directory to your static host
```

## Configuration

### Tailwind CSS
The project uses Tailwind CSS v4 with a custom design system:

```css
/* Custom color palette */
:root {
  --color-red: #c20016;        /* Brand primary */
  --color-success: #047857;    /* Success states */
  --color-warning: #d97706;    /* Warning states */
  --color-error: #dc2626;      /* Error states */
}
```

### TypeScript Configuration
Strict TypeScript configuration with path mapping:

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

## Development Guidelines

### Code Style
- **ESLint + Prettier**: Automated code formatting
- **Type Safety**: Strict TypeScript throughout
- **Component Structure**: Functional components with hooks
- **Naming Conventions**: PascalCase for components, camelCase for functions

### State Management
```typescript
// Use React Context for global state
const AuthContext = createContext<AuthContextType>();

// Use hooks for local state
const [loading, setLoading] = useState(false);

// Use custom hooks for complex logic
const { user, login, logout } = useAuth();
```

### API Integration
```typescript
// Type-safe API calls
const products = await productApi.listProducts(companyId);

// Error handling
try {
  const result = await api.call();
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
  }
}
```

## Performance Optimization

### Code Splitting
- **Dynamic Imports**: Lazy loading for heavy components
- **Route-based Splitting**: Automatic page-level code splitting
- **Bundle Analysis**: Built-in bundle analyzer

### Caching Strategy
- **API Caching**: Intelligent caching of API responses
- **Static Assets**: Optimized asset caching
- **Service Workers**: Optional PWA capabilities

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow the coding standards
4. **Add tests**: Ensure adequate test coverage
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Lint and format
npm run lint
npm run format
```

## Troubleshooting

### Common Issues

**API Connection Issues**
```bash
# Check if backend is running
curl http://localhost:8000/api/

# Verify environment variables
echo $NEXT_PUBLIC_API_URL
```

**Build Issues**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Issues**
```bash
# Check types
npm run type-check

# Restart TypeScript server in IDE
# VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

## Related Documentation

- **Backend API**: See `backend/README.md` for API documentation
- **Design System**: Component documentation in Storybook
- **Deployment Guide**: Detailed deployment instructions
- **Architecture Decision Records**: In `docs/adr/`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Documentation**: [Project Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Email**: support@carboninsight.win.tue.nl

---

**Built for sustainable supply chains by Brainport Industries & TU Eindhoven**