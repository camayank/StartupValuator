```python
from typing import Dict, Any
from .base import BaseValuationModel, ValuationResult

class SeriesAModel(BaseValuationModel):
    def __init__(self):
        super().__init__()
        self.dcf_weight = 0.6
        self.comparable_weight = 0.4
    
    def hybrid_valuation(self, dcf_value: float, comparable_value: float) -> float:
        """
        Calculate weighted average of DCF and comparable valuations
        """
        return (dcf_value * self.dcf_weight) + (comparable_value * self.comparable_weight)
    
    def wacc_calculator(self, 
                       equity_ratio: float,
                       debt_ratio: float,
                       cost_of_equity: float,
                       cost_of_debt: float,
                       tax_rate: float) -> float:
        """
        Calculate Weighted Average Cost of Capital
        E/V: Equity ratio
        D/V: Debt ratio
        Re: Cost of equity
        Rd: Cost of debt
        Tc: Tax rate
        """
        return (equity_ratio * cost_of_equity) + (debt_ratio * cost_of_debt * (1 - tax_rate))
    
    def calculate(self, inputs: Dict[str, Any]) -> ValuationResult:
        required_fields = [
            'dcf_value', 'comparable_value',
            'equity_ratio', 'debt_ratio',
            'cost_of_equity', 'cost_of_debt',
            'tax_rate'
        ]
        if not self.validate_inputs(inputs, required_fields):
            raise ValueError(f"Missing required fields. Need: {required_fields}")
        
        # Extract inputs
        dcf_value = float(inputs['dcf_value'])
        comparable_value = float(inputs['comparable_value'])
        equity_ratio = float(inputs['equity_ratio'])
        debt_ratio = float(inputs['debt_ratio'])
        cost_of_equity = float(inputs['cost_of_equity'])
        cost_of_debt = float(inputs['cost_of_debt'])
        tax_rate = float(inputs['tax_rate'])
        
        # Calculate WACC
        wacc = self.wacc_calculator(
            equity_ratio, debt_ratio,
            cost_of_equity, cost_of_debt,
            tax_rate
        )
        
        # Calculate hybrid valuation
        valuation = self.hybrid_valuation(dcf_value, comparable_value)
        
        # Calculate risk factors
        risk_factors = {
            'capital_structure_risk': debt_ratio,  # Higher debt ratio = higher risk
            'cost_of_capital_risk': wacc / 0.15,  # Normalize WACC risk (assuming 15% is high)
            'valuation_divergence': abs(dcf_value - comparable_value) / max(dcf_value, comparable_value)
        }
        
        # Calculate confidence score
        confidence = 0.9 * (1 - sum(risk_factors.values()) / len(risk_factors))
        
        return ValuationResult(
            value=valuation,
            confidence=confidence,
            methodology="Series A Hybrid",
            risk_factors=risk_factors
        )
```
