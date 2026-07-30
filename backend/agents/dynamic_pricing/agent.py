"""uAgents micro-agent implementation for Dynamic Pricing Agent."""

import logging
from uagents import Agent, Context
from .models import PricingRecommendationResponse
from .rules import DynamicPricingEngine

logger = logging.getLogger("dynamic_pricing.uagent")

class DynamicPricingAgent(Agent):
    """Micro-agent representing the pricing analytical engine."""

    def __init__(
        self,
        name: str = "dynamic_pricing",
        seed: str = "dynamic_pricing_seed_phrase",
        port: int = 8011,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8011/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = DynamicPricingEngine()
        self._register_handlers()

    def _register_handlers(self):
        # We define a basic handler for rule queries
        pass

dynamic_pricing_agent = DynamicPricingAgent()

if __name__ == "__main__":
    dynamic_pricing_agent.run()
