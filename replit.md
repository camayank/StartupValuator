# Startup Valuation Platform

## Overview
This project is a comprehensive startup valuation platform utilizing a React/TypeScript frontend and a Node.js/Express backend. Its core purpose is to provide AI-powered valuation analysis, real-time calculations, and professional report generation for various stakeholders in the startup ecosystem. The platform offers dynamic industry-specific validation, supports multiple valuation methodologies, and boasts a modern, accessible user interface. The business vision is to deliver product-grade accurate valuations, leveraging India-first benchmarks and transparent methodologies to cater to the Indian startup ecosystem and global markets.

## User Preferences
Preferred communication style: Simple, everyday language.
Focus: Complete UI/UX alignment with professional startup valuation platform vision.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite for fast development.
- **Styling**: Tailwind CSS with custom themes and Radix UI components for accessibility.
- **State Management**: React hooks and context.
- **Routing**: Client-side routing for multi-step workflows.
- **Charts**: Recharts for financial visualizations.

### Backend Architecture
- **Runtime**: Node.js with Express, written in TypeScript.
- **API Design**: RESTful endpoints for valuation calculations.
- **Validation**: Zod schema validation with industry-specific rules.
- **Error Handling**: Centralized error handling.

### Database Architecture
- **ORM**: Drizzle ORM for type-safe operations.
- **Database**: PostgreSQL, with Neon Database serverless driver for cloud deployment.
- **Migrations**: Drizzle Kit for schema management.

### Key Features and Implementations
- **Valuation Engine**: Supports DCF, Market Multiples, Precedent Transactions with industry-specific logic and AI integration via Anthropic Claude SDK for market analysis. Features real-time calculations and a confidence scoring system.
- **Form System**: Multi-step wizard with dynamic validation, smart inputs, and session-based data persistence.
- **Reporting System**: Generates professional PDF reports with customizable branding, interactive dashboards, and scenario analysis.
- **User Interface**: Designed for accessibility (high contrast, keyboard navigation), responsiveness (mobile-first), and a custom theme system.
- **UI/UX Decisions**: Enterprise-grade visual design, professional color schemes, branded navigation, step-by-step progress indicators for the valuation wizard, and comprehensive results display with confidence indicators. Includes an Executive Dashboard, Advanced Charts (waterfall, sensitivity, Monte Carlo), Smart Form Validation, and a Professional Report Generator.
- **Architectural Improvements**: Introduction of new component directories (dashboards, charts, forms, reports, progressive-disclosure), enhanced routing, advanced charting integration, and a comprehensive validation framework.
- **Viral Growth Features**: SEO optimization (meta tags, Open Graph, Twitter Cards), multi-platform social sharing, Google Analytics integration, and a referral system with unique codes and reward tracking.

## External Dependencies

### AI Services
- **Anthropic Claude**: Used for market analysis and data validation.
- **OpenAI Integration**: Infrastructure is present for potential GPT-4 integration.

### Data Sources
- **Financial APIs**: For industry benchmarks and market data.
- **Currency APIs**: For real-time exchange rates.
- **Economic Indicators**: For regional risk-free rates and inflation data.

### UI/UX Libraries
- **Radix UI**: Accessible component primitives.
- **Floating UI**: For advanced positioning.
- **DND Kit**: For drag and drop functionality.
- **React Hook Form**: For form state management and validation.

### Development Tools
- **TypeScript**: For type safety across the stack.
- **ESBuild**: For fast bundling.
- **Jest**: For testing.
- **Drizzle Kit**: For database schema management and migrations.