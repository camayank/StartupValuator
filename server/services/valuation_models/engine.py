from typing import Dict, Any, Optional
from .pre_seed import PreSeedModel
from .seed import SeedModel
from .series_a import SeriesAModel
from .base import ValuationResult

class ValuationEngine:
    def __init__(self):
        self.models = {
            'pre_seed': PreSeedModel(),
            'seed': SeedModel(),
            'series_a': SeriesAModel(),
        }
        
    def calculate_valuation(
        self,
        stage: str,
        inputs: Dict[str, Any]
    ) -> Optional[ValuationResult]:
        """
        Calculate valuation using the appropriate model based on stage
        
        Args:
            stage: Company stage ('pre_seed', 'seed', 'series_a')
            inputs: Dictionary containing valuation inputs
            
        Returns:
            ValuationResult object containing valuation details
        """
        if stage not in self.models:
            raise ValueError(f"Unsupported stage: {stage}")
            
        model = self.models[stage]
        return model.calculate(inputs)
        
    def validate_inputs(self, stage: str, inputs: Dict[str, Any]) -> bool:
        """
        Validate inputs for the specified stage
        
        Args:
            stage: Company stage
            inputs: Dictionary of inputs to validate
            
        Returns:
            bool indicating if inputs are valid
        """
        if stage not in self.models:
            return False
            
        return self.models[stage].validate_inputs(inputs)
        
    def get_required_fields(self, stage: str) -> Dict[str, Any]:
        """
        Get required fields for the specified stage
        
        Args:
            stage: Company stage
            
        Returns:
            Dictionary containing required field definitions
        """
        model = self.models.get(stage)
        if not model:
            raise ValueError(f"Unsupported stage: {stage}")
            
        # Each model should implement get_required_fields
        return model.get_required_fields()
