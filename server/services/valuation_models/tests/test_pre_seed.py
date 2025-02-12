import pytest
from server.services.valuation_models.pre_seed import PreSeedModel

def test_pre_seed_valuation():
    """Test pre-seed valuation with TAM=$5M and Team Score=0.8"""
    model = PreSeedModel()

    # Test inputs
    inputs = {
        'tam': 5_000_000,  # $5M TAM
        'team_score': 0.8,  # Team score of 0.8
        'current_traction': 100_000  # Some traction
    }

    # Calculate valuation
    result = model.calculate(inputs)

    # Expected: $5M * 0.4 + 0.8 * $1M * 0.6 = $2.48M
    expected_valuation = 5_000_000 * 0.4 + 0.8 * 1_000_000 * 0.6

    # Assert the calculation is correct
    assert abs(result.value - expected_valuation) < 0.01, \
        f"Expected valuation of ${expected_valuation:,.2f}, but got ${result.value:,.2f}"

    # Assert confidence is between 0 and 1
    assert 0 <= result.confidence <= 1, \
        f"Confidence should be between 0 and 1, got {result.confidence}"

    # Assert methodology is correct
    assert result.methodology == "Pre-Seed Scorecard", \
        f"Expected methodology 'Pre-Seed Scorecard', got '{result.methodology}'"

    # Assert risk factors are present and valid
    assert 'market_risk' in result.risk_factors
    assert 'execution_risk' in result.risk_factors
    assert all(0 <= risk <= 1 for risk in result.risk_factors.values()), \
        "All risk factors should be between 0 and 1"