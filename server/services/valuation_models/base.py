```python
from typing import Dict, Any, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass
class ValuationResult:
    value: float
    confidence: float
    methodology: str
    risk_factors: Dict[str, float]

class BaseValuationModel(ABC):
    def __init__(self):
        self.risk_free_rate = 0.03  # 3% risk-free rate
        self.market_risk_premium = 0.055  # 5.5% market risk premium
    
    @abstractmethod
    def calculate(self, inputs: Dict[str, Any]) -> ValuationResult:
        """Calculate valuation using model-specific methodology"""
        pass
    
    def validate_inputs(self, inputs: Dict[str, Any], required_fields: list) -> bool:
        """Validate that all required fields are present in inputs"""
        return all(field in inputs for field in required_fields)
    
    def _format_currency(self, amount: float) -> str:
        """Format amount as currency string"""
        return f"${amount:,.2f}"
```
