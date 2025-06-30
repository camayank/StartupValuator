# Startup Valuation Platform

## Overview

This is a comprehensive startup valuation platform built using React/TypeScript frontend with a Node.js/Express backend. The application provides AI-powered valuation analysis, real-time calculations, and professional report generation for startups, investors, and consultants. The system features dynamic industry-specific validation, multi-method valuation approaches, and a modern user interface with accessibility features.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and hot module replacement
- **Styling**: Tailwind CSS with custom theme configuration
- **UI Components**: Radix UI components for accessibility and consistency
- **State Management**: React hooks and context for local state management
- **Routing**: Client-side routing for multi-step workflows
- **Charts**: Recharts for financial visualizations

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints for valuation calculations
- **Validation**: Zod schema validation with industry-specific rules
- **Error Handling**: Centralized error handling with structured responses

### Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configurable via DATABASE_URL)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon Database serverless driver for cloud deployment

## Key Components

### 1. Valuation Engine
- **Multi-Method Support**: DCF, Market Multiples, Precedent Transactions
- **Industry-Specific Logic**: Sector-based validation and benchmarking
- **AI Integration**: Anthropic Claude SDK for market analysis and insights
- **Real-Time Calculations**: Dynamic updates as users input data

### 2. Form System
- **Multi-Step Wizard**: Progressive disclosure of information collection
- **Dynamic Validation**: Industry-specific field validation and cross-field dependencies
- **Smart Inputs**: Auto-complete and suggestion systems
- **Data Persistence**: Session storage for multi-step form completion

### 3. Reporting System
- **Professional Reports**: PDF generation with customizable branding
- **Interactive Dashboards**: Real-time metrics and visualizations
- **Scenario Analysis**: Best/base/worst case projections
- **Compliance Notes**: Region-specific regulatory compliance

### 4. User Interface
- **Accessibility**: High contrast mode and keyboard navigation
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Theme System**: Custom CSS variables with professional color palette
- **Component Library**: Reusable UI components with consistent styling

## Data Flow

### 1. User Input Collection
1. User selects industry and business stage
2. Dynamic form fields are generated based on industry rules
3. Real-time validation occurs as user types
4. AI suggestions are fetched for missing or inconsistent data

### 2. Validation Pipeline
1. Frontend validation using Zod schemas
2. Backend validation with industry-specific business rules
3. Cross-method consistency checking (70% threshold)
4. AI-powered data quality assessment

### 3. Calculation Process
1. Financial data normalization and cleaning
2. Industry benchmark integration
3. Multiple valuation method application
4. Sensitivity and scenario analysis
5. Risk adjustment calculations

### 4. Report Generation
1. Data aggregation from multiple sources
2. Chart and visualization creation
3. PDF compilation with professional formatting
4. Compliance note integration based on jurisdiction

## External Dependencies

### AI Services
- **Anthropic Claude**: Market analysis and data validation
- **OpenAI Integration**: Ready for GPT-4 integration (infrastructure present)

### Data Sources
- **Financial APIs**: Industry benchmarks and market data
- **Currency APIs**: Real-time exchange rates
- **Economic Indicators**: Regional risk-free rates and inflation data

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Floating UI**: Advanced positioning for tooltips and dropdowns
- **DND Kit**: Drag and drop functionality for advanced forms
- **React Hook Form**: Form state management with validation

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast bundling for production builds
- **Jest**: Testing framework with TypeScript support
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Platform**: Replit for collaborative development
- **Hot Reload**: Vite dev server with instant updates
- **Database**: Neon serverless PostgreSQL
- **Environment Variables**: Secure configuration management

### Production Build
- **Frontend**: Static build optimized for CDN deployment
- **Backend**: Node.js server bundle with external dependencies
- **Database**: Production PostgreSQL with connection pooling
- **Assets**: Optimized fonts and static resources

### Scalability Considerations
- **Serverless-Ready**: Compatible with serverless deployment platforms
- **Database Scaling**: Connection pooling and query optimization
- **API Rate Limiting**: Built-in support for external API management
- **Caching Strategy**: Redis-ready for performance optimization

## Changelog

- June 30, 2025: Initial setup and professional UI/UX redesign completed
  - Implemented enterprise-grade visual design with professional color scheme
  - Created branded navigation with enhanced user experience
  - Redesigned valuation wizard with step-by-step progress indicators
  - Built comprehensive results display with methodology breakdown
  - Added professional styling with confidence indicators and risk assessment
  - Integrated custom theme system with consistent design language

## User Preferences

Preferred communication style: Simple, everyday language.
Focus: Complete UI/UX alignment with professional startup valuation platform vision.