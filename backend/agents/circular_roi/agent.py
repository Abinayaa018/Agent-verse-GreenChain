"""uAgents micro-agent implementation for Circular ROI Agent."""

import logging
from uagents import Agent, Context
from .models import ROIRequest, ROIResponse
from .rules import CircularROIEngine

logger = logging.getLogger("circular_roi.uagent")

class CircularROIAgent(Agent):
    """Autonomous financial return simulation uAgent."""

    def __init__(
        self,
        name: str = "circular_roi",
        seed: str = "circular_roi_seed_phrase",
        port: int = 8025,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8025/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = CircularROIEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=ROIRequest)
        async def handle_roi_query(ctx: Context, sender: str, msg: ROIRequest):
            ctx.logger.info(f"Simulating circular ROI pathways for outlay: {msg.investment}")
            try:
                res = self.engine.calculate_project_roi(msg)
                await ctx.send(sender, ROIResponse(**res))
                ctx.logger.info("Successfully completed Monte Carlo cash projections.")
            except Exception as e:
                ctx.logger.error(f"Error computing project ROI: {e}")

circular_roi_agent = CircularROIAgent()

if __name__ == "__main__":
    circular_roi_agent.run()
