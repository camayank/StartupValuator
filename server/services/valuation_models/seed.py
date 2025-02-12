from typing import Dict, Any, Tuple
from .base import BaseValuationModel, ValuationResult

class SeedModel(BaseValuationModel):
    def __init__(self):
        super().__init__()
        self.default_multiple = 12  # Default annual multiple for MRR

    def get_required_fields(self) -> Dict[str, Dict[str, Any]]:
        """Define required fields and their validation rules"""
        return {
            'mrr': {
                'type': float,
                'min': 10000,  # Minimum $10K MRR
                'description': 'Monthly Recurring Revenue in USD'
            },
            'mom_growth': {
                'type': float,
                'min': 0,
                'max': 1,
                'description': 'Month over Month growth rate (as decimal)'
            },
            'churn': {
                'type': float,
                'min': 0.01,
                'max': 1,
                'description': 'Monthly churn rate (as decimal)'
            },
            'cac': {
                'type': float,
                'min': 0,
                'description': 'Customer Acquisition Cost in USD'
            },
            'ltv': {
                'type': float,
                'min': 0,
                'description': 'Customer Lifetime Value in USD'
            }
        }

    def bottom_up_dcf(self, mrr: float, mom_growth: float, churn: float) -> float:
        """
        Calculate valuation using bottom-up DCF method
        mrr: Monthly Recurring Revenue
        mom_growth: Month over Month growth rate (as decimal)
        churn: Monthly churn rate (as decimal)
        """
        if churn <= 0:
            raise ValueError("Churn rate must be greater than 0")

        # Project annual revenue using compound growth
        annual_revenue = mrr * (1 + mom_growth) ** 12

        # Apply multiple based on growth and churn
        multiple = self.default_multiple * (1 + mom_growth) / churn

        return annual_revenue * multiple

    def cac_ratio_alert(self, cac: float, ltv: float) -> Tuple[bool, str]:
        """
        Check if CAC/LTV ratio is within acceptable range
        Returns: (warning_flag, message)
        """
        ratio = cac / ltv if ltv > 0 else float('inf')
        if ratio > 0.3:
            return True, f"Warning: CAC/LTV ratio of {ratio:.2f} exceeds recommended maximum of 0.3"
        return False, f"Healthy CAC/LTV ratio of {ratio:.2f}"

    def validate_inputs(self, inputs: Dict[str, Any]) -> bool:
        """Enhanced input validation with detailed checks"""
        required_fields = self.get_required_fields()

        for field, rules in required_fields.items():
            if field not in inputs:
                return False

            value = inputs[field]
            if not isinstance(value, rules['type']):
                return False

            if 'min' in rules and value < rules['min']:
                return False

            if 'max' in rules and value > rules['max']:
                return False

        return True

    def calculate(self, inputs: Dict[str, Any]) -> ValuationResult:
        """Calculate valuation with enhanced validation and risk assessment"""
        if not self.validate_inputs(inputs):
            raise ValueError(f"Invalid inputs. Required fields: {list(self.get_required_fields().keys())}")

        mrr = float(inputs['mrr'])
        mom_growth = float(inputs['mom_growth'])
        churn = float(inputs['churn'])
        cac = float(inputs['cac'])
        ltv = float(inputs['ltv'])

        # Calculate base valuation
        valuation = self.bottom_up_dcf(mrr, mom_growth, churn)

        # Check CAC/LTV ratio
        cac_warning, cac_message = self.cac_ratio_alert(cac, ltv)

        # Calculate risk factors
        risk_factors = {
            'churn_risk': min(1, churn * 12),  # Annualized churn risk
            'growth_sustainability': 1 / (1 + mom_growth),  # Higher growth = lower risk
            'unit_economics': cac / ltv if ltv > 0 else 1  # Higher ratio = higher risk
        }

        # Calculate confidence based on risk factors and CAC warning
        base_confidence = 0.8  # Start with base confidence
        if cac_warning:
            base_confidence *= 0.8  # Reduce confidence if CAC/LTV ratio is concerning

        confidence = base_confidence * (1 - sum(risk_factors.values()) / len(risk_factors))

        return ValuationResult(
            value=valuation,
            confidence=confidence,
            methodology="Seed Bottom-up DCF",
            risk_factors=risk_factors
        )