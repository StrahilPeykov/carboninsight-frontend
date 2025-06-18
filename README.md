# CarbonInsight Frontend

A modern, responsive web application for tracking and analyzing carbon emissions across supply chains. Built with Next.js and designed for SMEs to easily manage Product Carbon Footprint (PCF) calculations and Digital Product Passports (DPP).

🌐 **Live Demo**: [https://www.carboninsight.strahilpeykov.com/](https://www.carboninsight.strahilpeykov.com/)

## Overview

CarbonInsight provides an intuitive interface for companies to track their carbon footprint, manage supply chain emissions, and export data in standardized formats like Asset Administration Shell (AAS) and SCSN XML.

## Features

- **Dashboard Analytics**: Real-time carbon footprint visualization and insights
- **Product Management**: Create and manage products with detailed emission tracking
- **Bill of Materials**: Visual supply chain mapping with emission calculations
- **Standards Export**: Export to AAS (AASX, XML, JSON) and SCSN formats
- **Data Import**: Bulk import from CSV, XLSX, and AAS packages
- **Supplier Collaboration**: Request and share emission data across supply chains
- **AI Recommendations**: Smart suggestions for emission reduction
- **Multi-tenant**: Company-based access control and data isolation
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context + Custom hooks
- **Charts**: Recharts for data visualization
- **Authentication**: JWT-based with refresh tokens
- **Type Safety**: TypeScript throughout
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to CarbonInsight Backend API

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/StrahilPeykov/carboninsight-frontend.git
   cd carboninsight-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   # For production: NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # ESLint checking
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main application pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── charts/           # Chart components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## Key Features

### Dashboard
- Real-time carbon footprint metrics
- Emission breakdown by category and lifecycle stage
- Product performance comparisons
- Supply chain visualization

### Product Management
- Create products with detailed specifications
- Track emissions across transport, production, and user phases
- Manage Bill of Materials relationships
- Generate carbon footprint reports

### Data Export & Import
```javascript
// Available export formats
const formats = [
  'pdf',        // Carbon Footprint Report
  'aasx',       // AAS Package (primary format)
  'aas_xml',    // AAS XML
  'aas_json',   // AAS JSON
  'scsn_full_xml', // SCSN Complete XML
  'csv',        // Spreadsheet format
  'xlsx',       // Excel format
  'zip'         // Complete package
];
```

### Import System
- **AAS Packages** (AASX files)
- **CSV/XLSX** files for bulk product import
- **JSON** files for structured data

## API Integration

The frontend integrates with the CarbonInsight Backend API:

```typescript
// Example API usage
const api = new CarbonInsightAPI(process.env.NEXT_PUBLIC_API_URL);

// Authentication
await api.login(email, password);

// Get products
const products = await api.getProducts(companyId);

// Export product
await api.exportProduct(companyId, productId, 'aasx');
```

## Deployment

### Vercel (Current)

The application is deployed on Vercel with automatic deployments from the main branch.

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
EXPOSE 3000
CMD ["npm", "start"]
```

## Testing

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

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes**: Follow the coding standards
4. **Add tests**: Ensure adequate test coverage
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for type safety
- Follow the existing component structure
- Write tests for new features
- Use semantic commit messages
- Ensure accessibility compliance

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Lighthouse Score**: 95+ Performance
- **Core Web Vitals**: All metrics in green
- **Bundle Size**: Optimized with Next.js automatic splitting
- **Caching**: Efficient API caching and static generation

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | http://localhost:8000/api |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built in collaboration with Brainport Industries & TU Eindhoven
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)

## Contact

- **Author**: Strahil Peykov
- **Live Demo**: [https://www.carboninsight.strahilpeykov.com/](https://www.carboninsight.strahilpeykov.com/)
- **Backend Repository**: [carboninsight-backend](https://github.com/StrahilPeykov/carboninsight-backend)
- **Issues**: [GitHub Issues](https://github.com/StrahilPeykov/carboninsight-frontend/issues)

---

**Making carbon footprint tracking accessible and actionable for SMEs worldwide.**