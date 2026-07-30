"""uAgents micro-agent implementation for ESG Benchmarking Agent."""

import logging
from uagents import Agent, Context
from .rules import ESGBenchmarkingEngine

logger = logging.getLogger("esg_benchmarking.uagent")

class ESGBenchmarkingAgent(Agent):
    """Autonomous ESG benchmarking micro-agent."""

    def __init__(
        self,
        name: str = "esg_benchmarking",
        seed: str = "esg_benchmarking_seed_phrase",
        port: int = 8020,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8020/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = ESGBenchmarkingEngine()
        self._register_handlers()

    def _register_handlers(self):
        pass

esg_benchmarking_agent = ESGBenchmarkingAgent()

if __name__ == "__main__":
    esg_benchmarking_agent.run()
