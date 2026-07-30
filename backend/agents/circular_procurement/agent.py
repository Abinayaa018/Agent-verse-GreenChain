"""uAgents micro-agent implementation for Circular Procurement Agent."""

import logging
from uagents import Agent, Context
from .models import ProcurementRequest, ProcurementResponse
from .rules import CircularProcurementEngine

logger = logging.getLogger("circular_procurement.uagent")

class CircularProcurementAgent(Agent):
    """Autonomous circular procurement sourcing uAgent."""

    def __init__(
        self,
        name: str = "circular_procurement",
        seed: str = "circular_procurement_seed_phrase",
        port: int = 8040,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8040/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = CircularProcurementEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=ProcurementRequest)
        async def handle_procurement_query(ctx: Context, sender: str, msg: ProcurementRequest):
            ctx.logger.info(f"Circular procurement query received for material: {msg.required_material}")
            try:
                res = self.engine.recommend_circular_procurement(msg)
                await ctx.send(sender, ProcurementResponse(**res))
                ctx.logger.info("Successfully returned circular procurement feedback.")
            except Exception as e:
                ctx.logger.error(f"Error executing circular procurement: {e}")

circular_procurement_agent = CircularProcurementAgent()

if __name__ == "__main__":
    circular_procurement_agent.run()
