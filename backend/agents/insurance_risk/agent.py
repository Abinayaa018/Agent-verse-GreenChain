"""uAgents micro-agent implementation for Insurance Risk Agent."""

import logging
from uagents import Agent, Context
from .models import RiskAssessmentRequest, RiskAssessmentResponse
from .rules import InsuranceRiskEngine

logger = logging.getLogger("insurance_risk.uagent")

class InsuranceRiskAgent(Agent):
    """Autonomous logistics transit risk profiling uAgent."""

    def __init__(
        self,
        name: str = "insurance_risk",
        seed: str = "insurance_risk_seed_phrase",
        port: int = 8024,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8024/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = InsuranceRiskEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=RiskAssessmentRequest)
        async def handle_risk_query(ctx: Context, sender: str, msg: RiskAssessmentRequest):
            ctx.logger.info(f"Assessing logistics transit risks for material: {msg.material_type}")
            try:
                res = self.engine.assess_shipment_risk(msg)
                await ctx.send(sender, RiskAssessmentResponse(**res))
                ctx.logger.info("Successfully returned risk profile checks.")
            except Exception as e:
                ctx.logger.error(f"Error checking transport risk: {e}")

insurance_risk_agent = InsuranceRiskAgent()

if __name__ == "__main__":
    insurance_risk_agent.run()
