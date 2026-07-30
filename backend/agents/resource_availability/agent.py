"""uAgents micro-agent implementation for Resource Availability Agent."""

import logging
from uagents import Agent, Context
from .models import ResourceAvailabilityResponse
from .rules import ResourceAvailabilityEngine

logger = logging.getLogger("resource_availability.uagent")

class ResourceAvailabilityAgent(Agent):
    """Autonomous regional resource availability tracker uAgent."""

    def __init__(
        self,
        name: str = "resource_availability",
        seed: str = "resource_availability_seed_phrase",
        port: int = 8035,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8035/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = ResourceAvailabilityEngine()
        self._register_handlers()

    def _register_handlers(self):
        pass

resource_availability_agent = ResourceAvailabilityAgent()

if __name__ == "__main__":
    resource_availability_agent.run()
