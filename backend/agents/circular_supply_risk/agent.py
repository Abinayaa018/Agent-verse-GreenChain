"""uAgents micro-agent implementation for Circular Supply Risk Agent."""

import logging
from uagents import Agent, Context
from .models import SupplyRiskRequest, SupplyRiskResponse
from .rules import CircularSupplyRiskEngine

logger = logging.getLogger("circular_supply_risk.uagent")

class CircularSupplyRiskAgent(Agent):
    """Autonomous material supply risk prediction uAgent."""

    def __init__(
        self,
        name: str = "circular_supply_risk",
        seed: str = "circular_supply_risk_seed_phrase",
        port: int = 8029,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8029/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = CircularSupplyRiskEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=SupplyRiskRequest)
        async def handle_supply_risk(ctx: Context, sender: str, msg: SupplyRiskRequest):
            ctx.logger.info(f"Predicting supply shortages and volatility for material: {msg.material}")
            try:
                res = self.engine.predict_supply_risk(msg.material)
                await ctx.send(sender, SupplyRiskResponse(**res))
                ctx.logger.info("Successfully returned forecasted supply risk parameters.")
            except Exception as e:
                ctx.logger.error(f"Error forecasting supply shortages: {e}")

circular_supply_risk_agent = CircularSupplyRiskAgent()

if __name__ == "__main__":
    circular_supply_risk_agent.run()
