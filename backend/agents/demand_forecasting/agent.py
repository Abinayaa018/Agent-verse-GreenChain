"""uAgents micro-agent implementation for Demand Forecasting Agent."""

import logging
from uagents import Agent, Context
from .models import DemandForecastRequest, DemandForecastResponse
from .rules import DemandForecastingEngine

logger = logging.getLogger("demand_forecasting.uagent")

class DemandForecastingAgent(Agent):
    """Autonomous predictive uAgent forecasting material demands."""

    def __init__(
        self,
        name: str = "demand_forecasting",
        seed: str = "demand_forecasting_seed_phrase",
        port: int = 8014,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8014/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = DemandForecastingEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=DemandForecastRequest)
        async def handle_forecast_request(ctx: Context, sender: str, msg: DemandForecastRequest):
            ctx.logger.info(f"Forecast request received for material: {msg.material}, industry: {msg.industry}")
            try:
                res = self.engine.get_forecast(msg.material, msg.industry)
                await ctx.send(sender, DemandForecastResponse(**res))
                ctx.logger.info("Successfully calculated and returned demand forecast metrics.")
            except Exception as e:
                ctx.logger.error(f"Error calculating demand forecast: {e}")

demand_forecasting_agent = DemandForecastingAgent()

if __name__ == "__main__":
    demand_forecasting_agent.run()
