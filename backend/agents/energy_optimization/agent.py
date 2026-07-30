"""uAgents micro-agent implementation for Energy Optimization Agent."""

import logging
from uagents import Agent, Context
from .models import EnergyOptimizationResponse
from .rules import EnergyOptimizationEngine

logger = logging.getLogger("energy_optimization.uagent")

class EnergyOptimizationAgent(Agent):
    """Autonomous energy usage scheduler uAgent."""

    def __init__(
        self,
        name: str = "energy_optimization",
        seed: str = "energy_optimization_seed_phrase",
        port: int = 8033,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8033/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = EnergyOptimizationEngine()
        self._register_handlers()

    def _register_handlers(self):
        pass

energy_optimization_agent = EnergyOptimizationAgent()

if __name__ == "__main__":
    energy_optimization_agent.run()
