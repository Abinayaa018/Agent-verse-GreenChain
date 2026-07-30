"""uAgents micro-agent implementation for Supplier Reliability Agent."""

import logging
from uagents import Agent, Context
from .models import SupplierReliabilityResponse
from .rules import SupplierReliabilityEngine

logger = logging.getLogger("supplier_reliability.uagent")

class SupplierReliabilityAgent(Agent):
    """Autonomous supplier risk classification uAgent."""

    def __init__(
        self,
        name: str = "supplier_reliability",
        seed: str = "supplier_reliability_seed_phrase",
        port: int = 8032,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8032/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = SupplierReliabilityEngine()
        self._register_handlers()

    def _register_handlers(self):
        pass

supplier_reliability_agent = SupplierReliabilityAgent()

if __name__ == "__main__":
    supplier_reliability_agent.run()
