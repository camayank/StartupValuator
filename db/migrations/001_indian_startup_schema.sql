-- Indian Startup Valuation Platform - Initial Schema Migration
-- Version: 1.0.0
-- Date: 2025-11-08

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE legal_entity_type AS ENUM (
  'pvt_ltd', 'llp', 'partnership', 'proprietorship', 'opc'
);

CREATE TYPE current_stage AS ENUM (
  'ideation', 'mvp', 'pre_revenue', 'revenue', 'growth', 'expansion'
);

CREATE TYPE funding_stage AS ENUM (
  'bootstrap', 'pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'later'
);

CREATE TYPE valuation_method AS ENUM (
  'dcf', 'berkus', 'scorecard', 'risk_summation', 'comparable', 'hybrid'
);

CREATE TYPE shareholder_type AS ENUM (
  'founder', 'angel', 'vc', 'employee', 'other'
);

CREATE TYPE scheme_type AS ENUM (
  'grant', 'loan', 'subsidy', 'equity', 'tax_benefit', 'other'
);

CREATE TYPE eligibility_status AS ENUM (
  'eligible', 'partially_eligible', 'not_eligible'
);

CREATE TYPE investor_readiness AS ENUM (
  'not_ready', 'needs_improvement', 'moderate', 'ready', 'highly_ready'
);

-- Companies Table
CREATE TABLE companies (
  company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER NOT NULL REFERENCES users(id),
  company_name VARCHAR(255) NOT NULL,
  legal_entity_type legal_entity_type NOT NULL,
  cin VARCHAR(21) UNIQUE,
  incorporation_date DATE NOT NULL,
  dpiit_recognition_number VARCHAR(50),
  dpiit_recognition_date DATE,
  registered_address TEXT NOT NULL,
  state VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  website VARCHAR(255),
  industry_sector VARCHAR(100) NOT NULL,
  sub_sector VARCHAR(100),
  business_description TEXT,
  current_stage current_stage NOT NULL,
  funding_stage funding_stage DEFAULT 'bootstrap' NOT NULL,
  employee_count INTEGER,
  gst_number VARCHAR(15),
  pan_number VARCHAR(10),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_cin ON companies(cin);
CREATE INDEX idx_companies_sector ON companies(industry_sector);

-- Founders Table
CREATE TABLE founders (
  founder_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  founder_name VARCHAR(255) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  equity_percentage DECIMAL(5,2) NOT NULL,
  linkedin_url VARCHAR(255),
  education_background TEXT,
  previous_experience TEXT,
  domain_expertise TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_founders_company_id ON founders(company_id);

-- Financial Data Table
CREATE TABLE financial_data (
  financial_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  financial_year VARCHAR(7) NOT NULL,
  is_actual BOOLEAN DEFAULT true NOT NULL,
  revenue DECIMAL(15,2) DEFAULT 0,
  cogs DECIMAL(15,2) DEFAULT 0,
  gross_profit DECIMAL(15,2) DEFAULT 0,
  operating_expenses DECIMAL(15,2) DEFAULT 0,
  ebitda DECIMAL(15,2) DEFAULT 0,
  interest DECIMAL(15,2) DEFAULT 0,
  tax DECIMAL(15,2) DEFAULT 0,
  net_profit DECIMAL(15,2) DEFAULT 0,
  total_assets DECIMAL(15,2) DEFAULT 0,
  total_liabilities DECIMAL(15,2) DEFAULT 0,
  shareholders_equity DECIMAL(15,2) DEFAULT 0,
  cash_flow_operations DECIMAL(15,2) DEFAULT 0,
  cash_flow_investing DECIMAL(15,2) DEFAULT 0,
  cash_flow_financing DECIMAL(15,2) DEFAULT 0,
  monthly_burn_rate DECIMAL(15,2) DEFAULT 0,
  cash_in_bank DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(company_id, financial_year, is_actual)
);

CREATE INDEX idx_financial_data_company_id ON financial_data(company_id);
CREATE INDEX idx_financial_data_year ON financial_data(financial_year);

-- Operational Metrics Table
CREATE TABLE operational_metrics (
  metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_customers INTEGER DEFAULT 0,
  active_customers INTEGER DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  churned_customers INTEGER DEFAULT 0,
  monthly_active_users INTEGER DEFAULT 0,
  customer_acquisition_cost DECIMAL(12,2),
  lifetime_value DECIMAL(12,2),
  average_revenue_per_user DECIMAL(12,2),
  gross_margin_percentage DECIMAL(5,2),
  net_promoter_score INTEGER,
  customer_retention_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(company_id, metric_date)
);

CREATE INDEX idx_operational_metrics_company_id ON operational_metrics(company_id);
CREATE INDEX idx_operational_metrics_date ON operational_metrics(metric_date);

-- Funding Rounds Table
CREATE TABLE funding_rounds (
  funding_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  round_name VARCHAR(100) NOT NULL,
  round_type funding_stage NOT NULL,
  amount_raised DECIMAL(15,2) NOT NULL,
  pre_money_valuation DECIMAL(15,2),
  post_money_valuation DECIMAL(15,2),
  funding_date DATE NOT NULL,
  lead_investor VARCHAR(255),
  investor_names TEXT,
  equity_dilution DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_funding_rounds_company_id ON funding_rounds(company_id);
CREATE INDEX idx_funding_rounds_date ON funding_rounds(funding_date);

-- Cap Table
CREATE TABLE cap_table (
  entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  shareholder_name VARCHAR(255) NOT NULL,
  shareholder_type shareholder_type NOT NULL,
  shares_held BIGINT NOT NULL,
  share_class VARCHAR(50) DEFAULT 'common',
  equity_percentage DECIMAL(5,2) NOT NULL,
  investment_amount DECIMAL(15,2),
  investment_date DATE,
  vesting_schedule TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_cap_table_company_id ON cap_table(company_id);

-- Valuations Table
CREATE TABLE valuations (
  valuation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  valuation_date DATE NOT NULL,
  valuation_method valuation_method NOT NULL,
  conservative_value DECIMAL(15,2) NOT NULL,
  base_value DECIMAL(15,2) NOT NULL,
  optimistic_value DECIMAL(15,2) NOT NULL,
  recommended_value DECIMAL(15,2) NOT NULL,
  discount_rate DECIMAL(5,2),
  growth_rate DECIMAL(5,2),
  calculation_inputs JSONB,
  calculation_outputs JSONB,
  comparable_companies JSONB,
  methodology_notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_valuations_company_id ON valuations(company_id);
CREATE INDEX idx_valuations_date ON valuations(valuation_date);

-- Investment Readiness Scores Table
CREATE TABLE investment_readiness_scores (
  score_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  financial_health_score INTEGER NOT NULL CHECK (financial_health_score >= 0 AND financial_health_score <= 25),
  market_opportunity_score INTEGER NOT NULL CHECK (market_opportunity_score >= 0 AND market_opportunity_score <= 20),
  team_strength_score INTEGER NOT NULL CHECK (team_strength_score >= 0 AND team_strength_score <= 20),
  traction_execution_score INTEGER NOT NULL CHECK (traction_execution_score >= 0 AND traction_execution_score <= 20),
  governance_compliance_score INTEGER NOT NULL CHECK (governance_compliance_score >= 0 AND governance_compliance_score <= 15),
  detailed_scoring JSONB,
  red_flags JSONB,
  recommendations JSONB,
  investor_readiness investor_readiness,
  estimated_time_to_ready VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_investment_readiness_company_id ON investment_readiness_scores(company_id);
CREATE INDEX idx_investment_readiness_score ON investment_readiness_scores(overall_score);

-- Government Schemes Table
CREATE TABLE government_schemes (
  scheme_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scheme_name VARCHAR(255) NOT NULL,
  scheme_code VARCHAR(50) UNIQUE NOT NULL,
  administering_body VARCHAR(255) NOT NULL,
  scheme_type scheme_type NOT NULL,
  scheme_category VARCHAR(100),
  description TEXT NOT NULL,
  eligibility_criteria JSONB NOT NULL,
  funding_range_min DECIMAL(15,2),
  funding_range_max DECIMAL(15,2),
  interest_rate DECIMAL(5,2),
  application_process TEXT,
  required_documents JSONB,
  application_deadline DATE,
  scheme_url VARCHAR(255),
  state_specific VARCHAR(100),
  sector_specific VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_government_schemes_type ON government_schemes(scheme_type);
CREATE INDEX idx_government_schemes_active ON government_schemes(is_active);
CREATE INDEX idx_government_schemes_state ON government_schemes(state_specific);

-- Scheme Matches Table
CREATE TABLE scheme_matches (
  match_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES government_schemes(scheme_id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  eligibility_status eligibility_status NOT NULL,
  met_criteria JSONB,
  unmet_criteria JSONB,
  recommendations TEXT,
  match_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(company_id, scheme_id, match_date)
);

CREATE INDEX idx_scheme_matches_company_id ON scheme_matches(company_id);
CREATE INDEX idx_scheme_matches_scheme_id ON scheme_matches(scheme_id);
CREATE INDEX idx_scheme_matches_status ON scheme_matches(eligibility_status);

-- Documents Table
CREATE TABLE documents (
  document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  upload_date TIMESTAMP DEFAULT NOW() NOT NULL,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT false,
  verified_by INTEGER REFERENCES users(id),
  verification_date TIMESTAMP,
  extracted_data JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_type ON documents(document_type);

-- Audit Logs Table
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id INTEGER REFERENCES users(id),
  company_id UUID REFERENCES companies(company_id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_date ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_data_updated_at BEFORE UPDATE ON financial_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cap_table_updated_at BEFORE UPDATE ON cap_table
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_government_schemes_updated_at BEFORE UPDATE ON government_schemes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE companies IS 'Core company information with Indian regulatory compliance fields';
COMMENT ON TABLE financial_data IS 'Multi-year financial records with actuals and projections';
COMMENT ON TABLE operational_metrics IS 'Customer and business metrics for traction analysis';
COMMENT ON TABLE valuations IS 'Valuation calculations using multiple methodologies';
COMMENT ON TABLE investment_readiness_scores IS 'Investment readiness assessment across 5 dimensions';
COMMENT ON TABLE government_schemes IS 'Indian government schemes database for startups';
COMMENT ON TABLE scheme_matches IS 'Automated matching of companies to eligible schemes';

COMMENT ON COLUMN companies.dpiit_recognition_number IS 'DPIIT (Department for Promotion of Industry and Internal Trade) recognition number';
COMMENT ON COLUMN companies.cin IS 'Corporate Identification Number - unique identifier for companies';
COMMENT ON COLUMN companies.gst_number IS 'Goods and Services Tax registration number';
COMMENT ON COLUMN companies.pan_number IS 'Permanent Account Number for tax purposes';

-- Migration complete
