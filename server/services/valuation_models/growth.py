```python
import json
from typing import Dict, Any
from pathlib import Path
from .base import BaseValuationModel, ValuationResult

class GrowthModel(BaseValuationModel):
    def __init__(self):
        super().__init__()
        self.region_risk_data = self._load_region_risk_data()
    
    def _load_region_risk_data(self) -> Dict[str, float]:
        """Load region risk multipliers from JSON file"""
        try:
            risk_file = Path(__file__).parent / "data" / "region_risk.json"
            with open(risk_file) as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            # Fallback to default risk multipliers if file is missing or invalid
            return {
                "north_america": 1.0,
                "europe": 0.9,
                "asia_pacific": 0.85,
                "latin_america": 0.8,
                "africa": 0.75
            }
    
    def terminal_value(self, fcf: float, growth_rate: float, wacc: float) -> float:
        """
        Calculate terminal value using perpetual growth method
        fcf: Free Cash Flow
        growth_rate: Long-term growth rate
        wacc: Weighted Average Cost of Capital
        """
        if wacc <= growth_rate:
            raise ValueError("WACC must be greater than growth rate")
        
        return (fcf * (1 + growth_rate)) / (wacc - growth_rate)
    
    def region_risk_adjustment(self, value: float, region: str) -> float:
        """Apply regional risk multiplier to valuation"""
        multiplier = self.region_risk_data.get(region.lower(), 0.8)  # Default to 0.8 if region unknown
        return value * multiplier
    
    def calculate(self, inputs: Dict[str, Any]) -> ValuationResult:
        required_fields = ['fcf', 'growth_rate', 'wacc', 'region']
        if not self.validate_inputs(inputs, required_fields):
            raise ValueError(f"Missing required fields. Need: {required_fields}")
        
        fcf = float(inputs['fcf'])
        growth_rate = float(inputs['growth_rate'])
        wacc = float(inputs['wacc'])
        region = str(inputs['region']).lower()
        
        # Calculate terminal value
        base_value = self.terminal_value(fcf, growth_rate, wacc)
        
        # Apply regional risk adjustment
        adjusted_value = self.region_risk_adjustment(base_value, region)
        
        # Calculate risk factors
        risk_factors = {
            'growth_risk': growth_rate / wacc,  # Higher ratio indicates higher risk
            'region_risk': 1 - self.region_risk_data.get(region, 0.8),
            'scale_risk': 1 / (1 + fcf/1e6)  # Decreasing risk with scale
        }
        
        # Calculate confidence based on risk factors
        confidence = 0.85 * (1 - sum(risk_factors.values()) / len(risk_factors))
        
        return ValuationResult(
            value=adjusted_value,
            confidence=confidence,
            methodology="Growth Terminal Value",
            risk_factors=risk_factors
        )
```
