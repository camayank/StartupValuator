```python
from typing import Dict, Any
from .base import BaseValuationModel, ValuationResult

class PreSeedModel(BaseValuationModel):
    def __init__(self):
        super().__init__()
        self.weights = {
            'tam': 0.4,
            'team': 0.6
        }
    
    def scorecard_valuation(self, tam: float, team_score: float) -> float:
        """
        Calculate valuation using scorecard method
        tam: Total Addressable Market in dollars
        team_score: Team score on scale of 0-1
        """
        return (tam * self.weights['tam']) + (team_score * 1e6 * self.weights['team'])
    
    def market_risk(self, current_traction: float, tam: float) -> float:
        """
        Calculate market risk score
        current_traction: Current revenue/users
        tam: Total Addressable Market
        """
        return 1 - min(1, (current_traction / tam if tam > 0 else 0))
    
    def calculate(self, inputs: Dict[str, Any]) -> ValuationResult:
        required_fields = ['tam', 'team_score', 'current_traction']
        if not self.validate_inputs(inputs, required_fields):
            raise ValueError(f"Missing required fields. Need: {required_fields}")
        
        tam = float(inputs['tam'])
        team_score = float(inputs['team_score'])
        current_traction = float(inputs.get('current_traction', 0))
        
        # Calculate base valuation using scorecard method
        valuation = self.scorecard_valuation(tam, team_score)
        
        # Calculate risk factors
        market_risk_score = self.market_risk(current_traction, tam)
        
        risk_factors = {
            'market_risk': market_risk_score,
            'execution_risk': 1 - team_score  # Higher team score = lower execution risk
        }
        
        # Adjust confidence based on risk factors
        confidence = 0.7 * (1 - market_risk_score) + 0.3 * team_score
        
        return ValuationResult(
            value=valuation,
            confidence=confidence,
            methodology="Pre-Seed Scorecard",
            risk_factors=risk_factors
        )
```
