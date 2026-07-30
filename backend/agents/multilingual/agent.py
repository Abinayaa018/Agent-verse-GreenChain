"""uAgents micro-agent implementation for Multilingual Agent."""

import logging
from uagents import Agent, Context
from .models import TranslateRequest, TranslateResponse
from .rules import TranslationEngine

logger = logging.getLogger("multilingual.uagent")

class MultilingualAgent(Agent):
    """Micro-agent representing the language localization service."""

    def __init__(
        self,
        name: str = "multilingual",
        seed: str = "multilingual_seed_phrase",
        port: int = 8013,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8013/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = TranslationEngine()
        self._register_handlers()

    def _register_handlers(self):
        pass

multilingual_agent = MultilingualAgent()

if __name__ == "__main__":
    multilingual_agent.run()
