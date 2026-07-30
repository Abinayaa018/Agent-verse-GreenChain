"""uAgents micro-agent implementation for Carbon Credit Tokenization Agent."""

import logging
from uagents import Agent, Context
from .models import TokenizeRequest, CarbonCertificate
from .rules import CarbonTokenizationEngine

logger = logging.getLogger("carbon_credit.uagent")

class CarbonCreditAgent(Agent):
    """Micro-agent tracking circular economy decarbonization assets."""

    def __init__(
        self,
        name: str = "carbon_credit",
        seed: str = "carbon_credit_seed_phrase",
        port: int = 8012,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8012/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = CarbonTokenizationEngine()
        self._register_handlers()

    def _register_handlers(self):
        pass

carbon_credit_agent = CarbonCreditAgent()

if __name__ == "__main__":
    carbon_credit_agent.run()
