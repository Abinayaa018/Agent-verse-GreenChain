"""uAgents micro-agent implementation for Hazard Classification Agent."""

import logging
from uagents import Agent, Context
from .models import HazardClassificationRequest, HazardClassificationResponse
from .rules import HazardClassificationEngine

logger = logging.getLogger("hazard_classification.uagent")

class HazardClassificationAgent(Agent):
    """Autonomous MSDS hazard classification uAgent."""

    def __init__(
        self,
        name: str = "hazard_classification",
        seed: str = "hazard_classification_seed_phrase",
        port: int = 8039,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8039/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = HazardClassificationEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=HazardClassificationRequest)
        async def handle_hazard_query(ctx: Context, sender: str, msg: HazardClassificationRequest):
            ctx.logger.info(f"Hazard classification query received for material: {msg.material}")
            try:
                res = self.engine.classify_waste_hazard(msg)
                await ctx.send(sender, HazardClassificationResponse(**res))
                ctx.logger.info("Successfully returned hazard safety feedback.")
            except Exception as e:
                ctx.logger.error(f"Error executing hazard classification: {e}")

circular_design_agent = HazardClassificationAgent()

if __name__ == "__main__":
    circular_design_agent.run()
