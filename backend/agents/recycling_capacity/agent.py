"""uAgents micro-agent implementation for Recycling Capacity Agent."""

import logging
from uagents import Agent, Context
from .models import AlternativeFacility, RecyclingCapacityResponse
from .rules import RecyclingCapacityEngine

logger = logging.getLogger("recycling_capacity.uagent")

class RecyclingCapacityAgent(Agent):
    """Autonomous capacity checking micro-agent."""

    def __init__(
        self,
        name: str = "recycling_capacity",
        seed: str = "recycling_capacity_seed_phrase",
        port: int = 8017,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8017/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = RecyclingCapacityEngine()
        self._register_handlers()

    def _register_handlers(self):
        # basic uAgents message handler can be added here if needed
        pass

recycling_capacity_agent = RecyclingCapacityAgent()

if __name__ == "__main__":
    recycling_capacity_agent.run()
