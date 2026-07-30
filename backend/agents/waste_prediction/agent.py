"""uAgents micro-agent implementation for Waste Prediction Agent."""

import logging
from uagents import Agent, Context
from .models import WastePredictionRequest, WastePredictionResponse
from .rules import WastePredictionEngine

logger = logging.getLogger("waste_prediction.uagent")

class WastePredictionAgent(Agent):
    """Autonomous waste prediction uAgent."""

    def __init__(
        self,
        name: str = "waste_prediction",
        seed: str = "waste_prediction_seed_phrase",
        port: int = 8015,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8015/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = WastePredictionEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=WastePredictionRequest)
        async def handle_prediction_request(ctx: Context, sender: str, msg: WastePredictionRequest):
            ctx.logger.info(f"Waste prediction request received for company: {msg.company}")
            try:
                res = self.engine.predict_future_waste(msg.company, msg.industry, msg.production_volume)
                await ctx.send(sender, WastePredictionResponse(**res))
                ctx.logger.info("Successfully returned Random Forest prediction output.")
            except Exception as e:
                ctx.logger.error(f"Error calculating waste prediction: {e}")

waste_prediction_agent = WastePredictionAgent()

if __name__ == "__main__":
    waste_prediction_agent.run()
