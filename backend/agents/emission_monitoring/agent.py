"""uAgents micro-agent implementation for Emission Monitoring Agent."""

import logging
from uagents import Agent, Context
from .models import EmissionsResponse
from .rules import EmissionMonitoringEngine

logger = logging.getLogger("emission_monitoring.uagent")

class EmissionMonitoringAgent(Agent):
    """Autonomous emissions audit and anomaly notifier uAgent."""

    def __init__(
        self,
        name: str = "emission_monitoring",
        seed: str = "emission_monitoring_seed_phrase",
        port: int = 8034,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8034/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = EmissionMonitoringEngine()
        self._register_handlers()

    def _register_handlers(self):
        pass

emission_monitoring_agent = EmissionMonitoringAgent()

if __name__ == "__main__":
    emission_monitoring_agent.run()
