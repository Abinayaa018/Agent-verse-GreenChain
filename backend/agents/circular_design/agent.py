"""uAgents micro-agent implementation for Circular Design Agent."""

import logging
from uagents import Agent, Context
from .models import CircularDesignRequest, CircularDesignResponse
from .rules import CircularDesignEngine

logger = logging.getLogger("circular_design.uagent")

class CircularDesignAgent(Agent):
    """Autonomous circular design recommendation uAgent."""

    def __init__(
        self,
        name: str = "circular_design",
        seed: str = "circular_design_seed_phrase",
        port: int = 8038,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8038/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = CircularDesignEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=CircularDesignRequest)
        async def handle_design_recommendation(ctx: Context, sender: str, msg: CircularDesignRequest):
            ctx.logger.info(f"Circular redesign query received for product: {msg.product_type}")
            try:
                res = self.engine.recommend_circular_design(msg)
                await ctx.send(sender, CircularDesignResponse(**res))
                ctx.logger.info("Successfully returned circular design feedback.")
            except Exception as e:
                ctx.logger.error(f"Error executing circular design checks: {e}")

circular_design_agent = CircularDesignAgent()

if __name__ == "__main__":
    circular_design_agent.run()
