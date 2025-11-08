# UX Improvement Roadmap
**Platform**: Indian Startup Valuation Platform
**Timeline**: 4 Weeks
**Goal**: Increase wizard completion rate from 30% to 75%

---

## Week 1: Critical Fixes (Must-Have) 🚨

### Task 1.1: Add Indian Compliance Fields to Business Info Form
**File**: `client/src/components/wizard-steps/BusinessInfoStep.tsx`
**Priority**: CRITICAL
**Effort**: 4 hours

**Changes Needed:**
```typescript
// Add to schema
const businessInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),

  // ADD THESE INDIAN FIELDS
  cin: z.string().optional(),
  gstNumber: z.string().optional(),
  panNumber: z.string().optional(),
  dpiitRecognitionNumber: z.string().optional(),

  revenueModel: z.string().default('SaaS'),
  annualRevenue: z.number().min(0, "Revenue cannot be negative"),
  employeeCount: z.number().min(0, "Employee count cannot be negative"),

  // ADD THESE
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
  fundingStage: z.enum(['pre_seed', 'seed', 'series_a', 'series_b', 'series_c']).optional(),
});
```

**Add Form Fields:**
```typescript
<FormField
  control={form.control}
  name="cin"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        CIN (Corporate Identification Number)
        <InfoTooltip content="21-character unique identifier for Indian companies. Example: U72900KA2015PTC123456" />
      </FormLabel>
      <FormControl>
        <Input {...field} placeholder="U72900KA2015PTC123456" maxLength={21} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

### Task 1.2: Expand Industry Dropdown
**File**: `client/src/components/wizard-steps/BusinessInfoStep.tsx`
**Priority**: CRITICAL
**Effort**: 2 hours

**Import from Backend:**
```typescript
import { INDIAN_SECTORS } from '@/lib/constants';

// In SelectContent
{INDIAN_SECTORS.map(sector => (
  <SelectItem key={sector.value} value={sector.value}>
    <div className="flex items-center gap-2">
      {sector.icon}
      {sector.label}
    </div>
  </SelectItem>
))}
```

**Create Constants File:**
```typescript
// client/src/lib/constants.ts
export const INDIAN_SECTORS = [
  { value: 'saas', label: 'SaaS', icon: '💻' },
  { value: 'fintech', label: 'Fintech', icon: '💰' },
  { value: 'edtech', label: 'Edtech', icon: '📚' },
  { value: 'healthtech', label: 'Healthtech', icon: '🏥' },
  { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { value: 'd2c', label: 'D2C/Consumer Brands', icon: '🏪' },
  { value: 'agritech', label: 'AgriTech', icon: '🌾' },
  { value: 'logistics', label: 'Logistics', icon: '🚚' },
  { value: 'mobility', label: 'Mobility/Transportation', icon: '🚗' },
  { value: 'proptech', label: 'PropTech/Real Estate', icon: '🏢' },
  { value: 'hrtech', label: 'HRTech', icon: '👥' },
  { value: 'legaltech', label: 'LegalTech', icon: '⚖️' },
  { value: 'insurtech', label: 'InsurTech', icon: '🛡️' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'media', label: 'Media/Entertainment', icon: '🎬' },
  { value: 'foodtech', label: 'FoodTech', icon: '🍔' },
  { value: 'travel', label: 'Travel/Hospitality', icon: '✈️' },
  { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { value: 'cleantech', label: 'CleanTech/Sustainability', icon: '🌱' },
  { value: 'other', label: 'Other', icon: '📦' },
];
```

---

### Task 1.3: Fix Currency Display (INR by Default)
**Files**: Multiple
**Priority**: CRITICAL
**Effort**: 3 hours

**Step 1: Add Currency Selector to BusinessInfoStep**
```typescript
<FormField
  control={form.control}
  name="currency"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Reporting Currency</FormLabel>
      <Select value={field.value} onValueChange={field.onChange}>
        <FormControl>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="INR">🇮🇳 Indian Rupee (₹)</SelectItem>
          <SelectItem value="USD">🇺🇸 US Dollar ($)</SelectItem>
          <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
          <SelectItem value="GBP">🇬🇧 British Pound (£)</SelectItem>
        </SelectContent>
      </Select>
    </FormItem>
  )}
/>
```

**Step 2: Update Revenue Input**
```typescript
// Get currency symbol based on selection
const currencySymbol = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
}[form.watch('currency') || 'INR'];

<FormField
  control={form.control}
  name="annualRevenue"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Annual Revenue</FormLabel>
      <FormControl>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            {currencySymbol}
          </span>
          <Input
            {...field}
            type="text"
            value={formatCurrency(field.value, form.watch('currency'))}
            onChange={(e) => {
              const value = parseCurrencyInput(e.target.value);
              field.onChange(value);
            }}
            className="pl-8"
            placeholder="0.00"
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Step 3: Create INR Formatter**
```typescript
// client/src/lib/formatters.ts
export function formatINR(amount: number, short: boolean = false): string {
  if (short) {
    // Use lakhs/crores
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';

    if (absAmount >= 10000000) {
      return `${sign}₹${(absAmount / 10000000).toFixed(2)}Cr`;
    } else if (absAmount >= 100000) {
      return `${sign}₹${(absAmount / 100000).toFixed(2)}L`;
    } else if (absAmount >= 1000) {
      return `${sign}₹${(absAmount / 1000).toFixed(2)}K`;
    }
    return `${sign}₹${absAmount.toFixed(2)}`;
  }

  // Full format with Indian number system
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}
```

---

### Task 1.4: Add Save & Resume Functionality
**File**: `client/src/components/ValuationWizard.tsx`
**Priority**: HIGH
**Effort**: 6 hours

**Add Auto-Save:**
```typescript
// Add to ValuationWizard component
const [draftId, setDraftId] = useState<string | null>(null);

useEffect(() => {
  // Auto-save every 30 seconds
  const interval = setInterval(async () => {
    const draft = {
      formData,
      currentStep,
      lastSaved: new Date().toISOString(),
      draftId: draftId || crypto.randomUUID(),
    };

    localStorage.setItem('wizardDraft', JSON.stringify(draft));

    // Optionally save to backend
    try {
      await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
    } catch (err) {
      console.warn('Failed to save draft to server');
    }
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [formData, currentStep, draftId]);

// Load draft on mount
useEffect(() => {
  const savedDraft = localStorage.getItem('wizardDraft');
  if (savedDraft) {
    try {
      const draft = JSON.parse(savedDraft);
      const savedDate = new Date(draft.lastSaved);
      const hoursSince = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60);

      if (hoursSince < 24) {
        // Show resume dialog
        setShowResumeDialog(true);
        setPendingDraft(draft);
      }
    } catch (err) {
      console.error('Failed to load draft');
    }
  }
}, []);
```

**Add Resume Dialog:**
```typescript
<Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Resume Your Valuation?</DialogTitle>
      <DialogDescription>
        You have an incomplete valuation from {formatRelativeTime(pendingDraft?.lastSaved)}.
        Would you like to continue where you left off?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => {
        localStorage.removeItem('wizardDraft');
        setShowResumeDialog(false);
      }}>
        Start Fresh
      </Button>
      <Button onClick={() => {
        setFormData(pendingDraft.formData);
        setCurrentStep(pendingDraft.currentStep);
        setDraftId(pendingDraft.draftId);
        setShowResumeDialog(false);
      }}>
        Resume
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Task 1.5: Improve Validation Error Messages
**File**: `client/src/components/ValuationWizard.tsx`
**Priority**: HIGH
**Effort**: 3 hours

**Enhanced Validation:**
```typescript
const validateStep = (stepIndex: number, data: any): boolean => {
  const requiredFields = steps[stepIndex].validation;
  const errors: string[] = [];

  requiredFields.forEach(field => {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      const fieldLabel = steps[stepIndex].fieldLabels?.[field] || field;
      errors.push(`${fieldLabel} is required`);
    }
  });

  if (errors.length > 0) {
    toast({
      title: "Please complete the following fields:",
      description: (
        <ul className="list-disc pl-4 mt-2">
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      ),
      variant: "destructive",
      duration: 5000,
    });

    // Scroll to first invalid field
    const firstErrorField = document.querySelector('[aria-invalid="true"]');
    firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    return false;
  }

  return true;
};
```

---

## Week 2: Enhanced Guidance (Should-Have) 💡

### Task 2.1: Add Contextual Help Tooltips
**Files**: All wizard step files
**Priority**: HIGH
**Effort**: 8 hours

**Create Reusable Tooltip Component:**
```typescript
// client/src/components/ui/info-tooltip.tsx
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface InfoTooltipProps {
  content: string;
  example?: string;
}

export function InfoTooltip({ content, example }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="inline h-4 w-4 ml-1 text-muted-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
          {example && (
            <p className="text-xs text-muted-foreground mt-2">
              <strong>Example:</strong> {example}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

**Usage in Forms:**
```typescript
<FormLabel>
  Annual Revenue
  <InfoTooltip
    content="Your company's total income for the last 12 months before expenses"
    example="₹1,50,00,000 (₹1.5 Crore)"
  />
</FormLabel>
```

---

### Task 2.2: Add Progressive Disclosure
**File**: `client/src/components/wizard-steps/BusinessInfoStep.tsx`
**Priority**: MEDIUM
**Effort**: 4 hours

```typescript
const [showAdvanced, setShowAdvanced] = useState(false);

// Essential fields (always shown)
<div className="space-y-6">
  <FormField name="companyName" ... />
  <FormField name="industry" ... />
  <FormField name="fundingStage" ... />
  <FormField name="annualRevenue" ... />
</div>

{/* Advanced fields (collapsible) */}
<Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
  <CollapsibleTrigger asChild>
    <Button variant="ghost" className="w-full mt-4">
      <ChevronDown className={cn("h-4 w-4 mr-2 transition-transform", showAdvanced && "rotate-180")} />
      {showAdvanced ? 'Hide' : 'Show'} Advanced Options
    </Button>
  </CollapsibleTrigger>
  <CollapsibleContent className="space-y-6 mt-6">
    <FormField name="cin" ... />
    <FormField name="gstNumber" ... />
    <FormField name="panNumber" ... />
    <FormField name="dpiitRecognitionNumber" ... />
  </CollapsibleContent>
</Collapsible>
```

---

### Task 2.3: Add Onboarding Tour
**File**: `client/src/components/TourGuide.tsx` (already exists, needs implementation)
**Priority**: MEDIUM
**Effort**: 6 hours

**Install shepherd.js:**
```bash
npm install shepherd.js
```

**Implement Tour:**
```typescript
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export function useValuationTour() {
  const startTour = () => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shadow-md bg-purple-dark',
        scrollTo: true,
      },
    });

    tour.addStep({
      id: 'welcome',
      text: 'Welcome! Let\'s walk through the valuation process in 60 seconds.',
      buttons: [
        {
          text: 'Skip',
          action: tour.cancel,
          secondary: true,
        },
        {
          text: 'Start Tour',
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      id: 'step-1',
      text: 'Enter your basic business information here. We\'ll guide you through each field.',
      attachTo: { element: '#business-info-form', on: 'bottom' },
      buttons: [
        {
          text: 'Back',
          action: tour.back,
        },
        {
          text: 'Next',
          action: tour.next,
        },
      ],
    });

    // Add more steps...

    tour.start();
  };

  return { startTour };
}
```

---

## Week 3: Indian Market Features (Nice-to-Have) 🇮🇳

### Task 3.1: Government Schemes Matching UI
**File**: `client/src/components/GovernmentSchemes.tsx` (NEW)
**Priority**: MEDIUM
**Effort**: 10 hours

```typescript
interface GovernmentSchemesProps {
  companyData: {
    industry: string;
    revenue: number;
    stage: string;
    state: string;
  };
}

export function GovernmentSchemes({ companyData }: GovernmentSchemesProps) {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/government-schemes/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyData),
    })
      .then(res => res.json())
      .then(data => {
        setSchemes(data.matches);
        setLoading(false);
      });
  }, [companyData]);

  if (loading) return <LoadingSkeleton />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eligible Government Schemes</CardTitle>
        <CardDescription>
          Based on your profile, you may qualify for these schemes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schemes.map(scheme => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SchemeCard({ scheme }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{scheme.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {scheme.description}
          </p>
          <div className="flex gap-2 mt-3">
            <Badge>{scheme.type}</Badge>
            <Badge variant="outline">Funding: {scheme.maxFunding}</Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={scheme.applicationUrl} target="_blank">
            Apply
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}
```

---

### Task 3.2: Add Regional Benchmarks
**File**: `client/src/components/ValuationResults.tsx`
**Priority**: LOW
**Effort**: 6 hours

```typescript
<Card>
  <CardHeader>
    <CardTitle>Market Position</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm">Your Valuation</span>
          <span className="font-semibold">₹{formatINR(valuation, true)}</span>
        </div>
        <Progress value={percentile} />
        <p className="text-xs text-muted-foreground mt-1">
          Top {100 - percentile}% in {industry} sector (India)
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Median Valuation</p>
          <p className="font-semibold">₹{formatINR(medianValuation, true)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Top 10% Valuation</p>
          <p className="font-semibold">₹{formatINR(top10Valuation, true)}</p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Week 4: Professional Features (Polish) ✨

### Task 4.1: Valuation Method Selector
**File**: `client/src/components/MethodSelector.tsx` (NEW)
**Priority**: MEDIUM
**Effort**: 8 hours

```typescript
const VALUATION_METHODS = [
  {
    id: 'dcf',
    name: 'Discounted Cash Flow (DCF)',
    description: 'Best for revenue-generating startups with predictable cash flows',
    suitableFor: ['seed', 'series_a', 'series_b'],
    pros: ['Detailed financial analysis', 'Industry standard'],
    cons: ['Requires historical data', 'Complex assumptions'],
    icon: TrendingUp,
  },
  {
    id: 'berkus',
    name: 'Berkus Method',
    description: 'Ideal for pre-revenue startups with strong potential',
    suitableFor: ['pre_seed', 'mvp'],
    pros: ['No revenue needed', 'Quick calculation'],
    cons: ['Subjective factors', 'Limited accuracy'],
    icon: Lightbulb,
  },
  // ... more methods
];

export function MethodSelector({ stage, onSelect }) {
  const recommendedMethods = VALUATION_METHODS.filter(m =>
    m.suitableFor.includes(stage)
  );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {VALUATION_METHODS.map(method => {
        const isRecommended = recommendedMethods.includes(method);

        return (
          <Card
            key={method.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              isRecommended && "border-primary"
            )}
            onClick={() => onSelect(method.id)}
          >
            {isRecommended && (
              <Badge className="absolute -top-2 -right-2">Recommended</Badge>
            )}
            <CardHeader>
              <method.icon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>{method.name}</CardTitle>
              <CardDescription>{method.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold mb-1">Pros:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {method.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <Check className="h-3 w-3 text-green-500 mt-0.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1">Cons:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {method.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <X className="h-3 w-3 text-red-500 mt-0.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

---

### Task 4.2: Enhanced Results Dashboard
**File**: `client/src/components/ValuationResults.tsx`
**Priority**: MEDIUM
**Effort**: 10 hours

```typescript
export function ValuationResults({ results }) {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Your Estimated Valuation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2">
              {formatINR(results.valuationRange.mid, true)}
            </div>
            <div className="text-sm text-muted-foreground">
              Range: {formatINR(results.valuationRange.low, true)} - {formatINR(results.valuationRange.high, true)}
            </div>
            <div className="mt-4">
              <Badge variant={results.confidence > 80 ? 'success' : 'warning'}>
                {results.confidence}% Confidence
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Valuation Methods Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.methodResults.map(method => (
              <div key={method.name} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{method.name}</div>
                <div className="flex-1">
                  <div className="relative h-8 bg-muted rounded">
                    <div
                      className="absolute h-full bg-primary rounded"
                      style={{ width: `${(method.value / results.valuationRange.high) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-32 text-right text-sm font-semibold">
                  {formatINR(method.value, true)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Waterfall Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Value Build-Up</CardTitle>
        </CardHeader>
        <CardContent>
          <WaterfallChart data={results.valueBreakdown} />
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {results.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium">{rec.title}</p>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Implementation Checklist

### Week 1: Critical Fixes ✅
- [ ] Add Indian compliance fields (CIN, GST, PAN, DPIIT)
- [ ] Expand industry dropdown to 20+ options
- [ ] Fix currency display (₹ default, lakhs/crores)
- [ ] Add save & resume functionality
- [ ] Improve validation error messages
- [ ] Add currency selector to form

### Week 2: Enhanced Guidance ✅
- [ ] Create InfoTooltip component
- [ ] Add tooltips to all form fields
- [ ] Implement progressive disclosure
- [ ] Add onboarding tour (Shepherd.js)
- [ ] Add progress time estimates
- [ ] Improve loading states

### Week 3: Indian Market Features ✅
- [ ] Create Government Schemes component
- [ ] Build backend API for scheme matching
- [ ] Add regional benchmarks display
- [ ] Implement state/city selection
- [ ] Add Hindi language support (optional)

### Week 4: Professional Features ✅
- [ ] Build method selector component
- [ ] Create enhanced results dashboard
- [ ] Add waterfall chart
- [ ] Implement PDF export
- [ ] Add share functionality
- [ ] Create investor-ready report template

---

## Success Metrics

### Track These KPIs:

1. **Completion Rate**
   - Before: 30%
   - Target: 75%
   - Measurement: Google Analytics funnel

2. **Time to Complete**
   - Before: 15-20 minutes
   - Target: 8-10 minutes
   - Measurement: Session duration

3. **Drop-off Points**
   - Before: Step 2-3 (60% drop)
   - Target: <20% drop before final step
   - Measurement: Step-level analytics

4. **User Satisfaction**
   - Target: 4.5/5 stars
   - Measurement: Post-completion survey

5. **Support Tickets**
   - Before: High (field confusion)
   - Target: 50% reduction
   - Measurement: Help desk metrics

---

## Testing Plan

### Phase 1: Internal Testing (Week 1)
- [ ] Test all form validations
- [ ] Verify save & resume works
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile (iOS, Android)
- [ ] Accessibility audit (WAVE)

### Phase 2: Beta Testing (Week 2-3)
- [ ] 10 Indian startup founders
- [ ] 5 investors/CAs
- [ ] Collect feedback via survey
- [ ] Fix critical issues

### Phase 3: A/B Testing (Week 4)
- [ ] 50% see new experience
- [ ] 50% see old experience
- [ ] Compare completion rates
- [ ] Roll out winner to 100%

---

## Dependencies

### NPM Packages to Install:
```bash
npm install shepherd.js          # Onboarding tour
npm install @radix-ui/react-tooltip  # Tooltips (might be installed)
npm install recharts            # Charts (likely installed)
npm install react-pdf @react-pdf/renderer  # PDF export
```

### Backend API Endpoints Needed:
- `POST /api/drafts` - Save wizard draft
- `GET /api/drafts/:id` - Load draft
- `POST /api/government-schemes/match` - Match schemes
- `GET /api/benchmarks/:industry/:region` - Get benchmarks
- `POST /api/valuations/generate-report` - PDF export

---

## Risk Mitigation

### Risk 1: Backend Not Ready
**Solution**: Use mock data initially, swap with real API later

### Risk 2: Too Many Changes at Once
**Solution**: Implement incrementally, one week at a time

### Risk 3: User Confusion with New Features
**Solution**: Add "What's New" tour for existing users

### Risk 4: Performance Impact
**Solution**: Lazy load heavy components, optimize bundle size

---

## Post-Launch Plan

### Week 5: Monitor & Iterate
- [ ] Track all success metrics daily
- [ ] Review user feedback
- [ ] Fix bugs within 24 hours
- [ ] Plan next improvements

### Month 2: Advanced Features
- [ ] AI-powered field suggestions
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] White-label reports

---

**Next Action**: Begin Week 1 implementation with Task 1.1
**Owner**: Development Team
**Review**: End of each week
**Ship**: Rolling deployment, feature flags enabled
