# Legacy Code Archive

This directory contains legacy code that is **not imported or used** by the current active application.

## Why these files are here

After a comprehensive dependency analysis (2025-11-08), we discovered that the active application uses a minimal, clean architecture:
- LandingPage.tsx → UI components only
- ValuationWizardContainer.tsx
  - SimpleValuationForm.tsx (uses Zod + react-hook-form)
  - ValuationResults.tsx (UI components only)

None of the files in this `_legacy` directory are imported by these active pages.

## Contents

### `/lib/` - Unused Library Files
- `financialModels.ts` (54 TS errors) - Industry-specific financial calculations, not used
- `reportGenerator.ts` (14 TS errors) - PDF report generation, not used
- `industry-validation.ts` (7 TS errors) - Industry-specific validation rules, not used
- `fundingReadiness.ts` (2 TS errors) - Funding readiness scoring, not used

### `/validation/` - Unused Validation Files
- `businessRules.ts` (94 TS errors) - Complex business rule validations, not used
- `aiValidation.ts` (22 TS errors) - AI-powered validation, not used
- `financialValidation.ts` (20 TS errors) - Financial data validation, not used
- `sectorMetrics.ts` (3 TS errors) - Sector-specific metrics, not used

### `/services/` - Unused Service Files
- `reportGenerator.ts` (21 TS errors) - Report generation service, not used
- `ReportGenerator.ts` (duplicate, not used)
- `aiValidation.ts` - AI validation service wrapper, not used

### Other
- `export-button.tsx` - Export functionality UI component, not used
- `runTests.ts` (Session 2) - Test file for valuation report generation, not used

## Total TypeScript Errors in Legacy Code

**~200 errors** - All contained within this legacy directory

These errors do not affect the running application.

## Files Added in Session 2 (2025-11-08)

- `runTests.ts` - Imports from ReportGenerator which was moved to _legacy, not used in active app

## What to do with these files

**Options:**
1. **Keep as-is** - Archived for historical reference and potential future use
2. **Delete** - If you're certain they won't be needed
3. **Refactor later** - Update types and fix errors if you plan to reintegrate them

## Active Code Status

All code **outside** this `_legacy` directory has been reviewed and fixed:
- ✅ ValidationContext - 4 errors fixed
- ✅ Hooks (use-field-validation, use-form-validation, use-smart-validation) - 11 errors fixed
- ✅ lib/api.ts - 10 errors fixed
- ✅ lib/business-rules-engine.ts - 3 errors fixed
- ✅ lib/enhanced-user-flow.ts - 4 errors fixed

**Total fixed in active code: 49 critical errors**

See `/FIX_SUMMARY.md` for complete details.
