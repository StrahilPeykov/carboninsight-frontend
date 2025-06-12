# CarbonInsight Frontend

A comprehensive web application for calculating product carbon footprints and generating Digital Product Passports, developed as a Bachelor's End Project for Brainport Industries. This application enables companies to track, analyze, and optimize their environmental impact across the entire product lifecycle.

## Project Overview

CarbonInsight is designed to help manufacturers and suppliers meet emerging EU sustainability regulations by providing accurate carbon footprint calculations and industry-compliant Digital Product Passports. The platform supports the full product lifecycle assessment from raw materials to end-of-life, with integrated supply chain collaboration features.

## Key Features

### Carbon Footprint Management
- **Complete Lifecycle Assessment**: Track emissions across A1-A3 (production), A4-A5 (transport), B1-B7 (use phase), and C1-C4 (end-of-life) stages
- **Multi-Product Support**: Manage extensive product portfolios with detailed emission breakdowns
- **Bill of Materials Integration**: Hierarchical component tracking with quantity-based calculations
- **Real-time Calculations**: Dynamic PCF updates based on input data changes

### Regulatory Compliance & Standards
- **Asset Administration Shell (AAS)** standard compliance for Digital Product Passports
- **Smart Connected Supplier Network (SCSN)** format support
- **ISO 14040/14044** methodology implementation
- **EU Digital Product Passport** regulation readiness

### Data Export & Interoperability
- **AASX packages** (primary DPP format)
- **XML/JSON exports** for system integration
- **CSV/Excel exports** for data analysis
- **PDF reports** for stakeholder communication

### Supply Chain Collaboration
- **Data sharing requests** between companies
- **Approval workflows** for sensitive information
- **Company-to-company authentication** and authorization
- **Audit logging** for compliance tracking

### Enterprise Features
- **Multi-company management** with role-based access control
- **User authentication** with JWT tokens
- **Comprehensive audit trails** for all actions
- **AI-powered recommendations** for emission reduction strategies

## Technology Stack

### Core Framework
- **Next.js 15.3.1** - React framework with SSR/SSG capabilities
- **React 19.1.0** - Component library with latest features
- **TypeScript 5** - Type-safe development environment

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Headless UI 2.2.4** - Accessible component primitives
- **Radix UI** - Low-level UI components for complex interactions
- **Lucide React 0.507.0** - Modern icon library

### State Management & Data
- **React Context API** - Global state management for authentication and themes
- **JWT Decode 4.0.0** - Token management and validation
- **Custom API client** - Type-safe HTTP client with error handling

### Developer Experience
- **ESLint 8.57.1** - Code linting with Next.js, TypeScript, and React configurations
- **Prettier 3.5.3** - Code formatting with custom rules
- **TypeScript ESLint 8.33.1** - TypeScript-specific linting rules

### Additional Libraries
- **React Markdown 10.1.0** - Markdown rendering for dynamic content
- **Floating UI React 0.27.8** - Tooltip and popover positioning

## Architecture & Design Patterns

### Component Architecture
- **Atomic Design Pattern**: Reusable UI components with consistent styling
- **Compound Components**: Complex form interfaces with multiple interconnected parts
- **Render Props**: Flexible component composition for data tables and forms

### API Integration
- **Type-safe API client** with centralized error handling
- **Automatic token refresh** for seamless user experience
- **Request/response interceptors** for logging and monitoring

### Accessibility (WCAG 2.1 AA Compliance)
- **Screen reader support** with proper ARIA labels and semantic HTML
- **Keyboard navigation** with custom shortcuts and focus management
- **High contrast mode** support and color-blind friendly design
- **Skip links** and focus indicators for enhanced usability

### Performance Optimization
- **Static site generation** for improved loading times
- **Dynamic imports** for code splitting and reduced bundle size
- **Image optimization** with Next.js built-in features
- **Client-side caching** strategies for API responses

## Environmental Impact & Sustainability Focus

This project directly addresses **ESG (Environmental, Social, Governance) reporting requirements** and sustainability metrics that are increasingly critical for enterprise applications:

### Carbon Footprint Monitoring
- **Real-time emission calculations** across complete product lifecycles
- **Automated data collection** from multiple sources and formats
- **Trend analysis** and reduction target tracking
- **Supply chain transparency** with upstream/downstream impact visibility

### Resource Optimization
- **Efficient data processing** to minimize computational overhead
- **Optimized bundle sizes** reducing bandwidth and energy consumption
- **Static generation** minimizing server resource usage
- **Caching strategies** reducing redundant API calls and processing

### Compliance & Reporting
- **Automated report generation** reducing manual effort and errors
- **Standardized data formats** enabling seamless integration with enterprise systems
- **Audit trails** for regulatory compliance and verification
- **Multi-format exports** supporting various stakeholder requirements

## CI/CD & Deployment Considerations

### Build Configuration
- **Next.js static export** for CDN deployment and reduced server costs
- **TypeScript compilation** with strict type checking
- **ESLint integration** in build pipeline for code quality
- **Automated testing** setup for continuous integration

### Environment Management
- **Environment-specific configurations** for development, staging, and production
- **API URL management** through environment variables
- **Security token handling** with proper storage and rotation

### Monitoring & Analytics
- **Performance monitoring** capabilities built into the application
- **Error tracking** and logging for production environments
- **User analytics** for feature usage and optimization insights

## Cost Management Features

The application includes several features that align with cloud cost optimization:

### Efficient Data Processing
- **Paginated API responses** to reduce bandwidth costs
- **Lazy loading** for large datasets and images
- **Optimized queries** with selective field retrieval
- **Client-side filtering** to minimize server requests

### Resource Optimization
- **Bundle size analysis** tools and optimization
- **Image compression** and format optimization
- **Static asset caching** strategies
- **Database query optimization** through efficient API design

### Scalability Considerations
- **Stateless component design** for horizontal scaling
- **API rate limiting** awareness and handling
- **Efficient state management** to minimize memory usage
- **Progressive enhancement** for varying device capabilities

## Development Setup

### Prerequisites
- Node.js 18+ or compatible JavaScript runtime
- npm, yarn, or pnpm package manager
- Git for version control

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd carboninsight-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure API_URL and other required variables

# Start development server
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix linting issues automatically
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── components/         # Reusable UI components
│   │   ├── layout/        # Navigation, header, footer
│   │   └── ui/            # Base UI components
│   ├── context/           # React context providers
│   ├── product-list/      # Product management pages
│   └── [other-pages]/     # Feature-specific pages
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
│   └── api/              # API client and type definitions
└── utils/                # Helper functions and utilities
```

## Contributing

This project follows industry best practices for maintainable, scalable frontend development:

### Code Quality
- **TypeScript strict mode** for type safety
- **ESLint configuration** for code consistency
- **Prettier formatting** for code style
- **Component documentation** with clear prop interfaces

### Testing Strategy
- **Component testing** with React Testing Library
- **API integration testing** with mock services
- **Accessibility testing** with automated tools
- **Performance testing** for optimization validation

## Academic Context

This application was developed as a Bachelor's End Project, demonstrating:

### Technical Competencies
- **Full-stack development** with modern web technologies
- **API design and integration** following REST principles
- **User experience design** with accessibility considerations
- **Performance optimization** and scalability planning

### Business Understanding
- **Regulatory compliance** with emerging EU sustainability laws
- **Enterprise software requirements** and stakeholder management
- **Supply chain management** and B2B collaboration workflows
- **Data privacy and security** in business applications

### Research & Innovation
- **Sustainability metrics** implementation and visualization
- **Industry standard compliance** (AAS, SCSN, ISO) research and implementation
- **AI integration** for intelligent recommendations and insights
- **Modern web technologies** evaluation and adoption

This project showcases the intersection of environmental responsibility, technical excellence, and business value creation that characterizes modern sustainable technology solutions.