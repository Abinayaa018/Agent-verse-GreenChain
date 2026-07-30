"""uAgents micro-agent implementation for Material Quality Prediction."""

import logging
from uagents import Agent, Context
from .models import MaterialQualityRequest, MaterialQualityResponse
from .rules import MaterialQualityEngine

logger = logging.getLogger("material_quality.uagent")

class MaterialQualityAgent(Agent):
    """Autonomous quality monitoring and quality prediction uAgent."""

    def __init__(
        self,
        name: str = "material_quality",
        seed: str = "material_quality_seed_phrase",
        port: int = 8018,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8018/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = MaterialQualityEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=MaterialQualityRequest)
        async def handle_quality_request(ctx: Context, sender: str, msg: MaterialQualityRequest):
            ctx.logger.info(f"Quality check request received for type: {msg.material_type}")
            try:
                res = self.engine.predict_material_quality(
                    msg.material_type,
                    msg.industry,
                    msg.storage_days,
                    msg.humidity,
                    msg.transport_distance
                )
                await ctx.send(sender, MaterialQualityResponse(**res))
                ctx.logger.info("Successfully returned material quality metrics.")
            except Exception as e:
                ctx.logger.error(f"Error calculating quality prediction: {e}")

material_quality_agent = MaterialQualityAgent()

if __name__ == "__main__":
    material_quality_agent.run()
