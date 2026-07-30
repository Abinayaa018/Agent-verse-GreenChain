"""uAgents micro-agent implementation for Sustainability Recommendation Agent."""

import logging
from uagents import Agent, Context
from .models import SustainabilityAdvisorRequest, SustainabilityAdvisorResponse
from .rules import SustainabilityRecommendationEngine

logger = logging.getLogger("sustainability_recommendation.uagent")

class SustainabilityAdvisorAgent(Agent):
    """Autonomous Gemini-based ESG recommendation uAgent."""

    def __init__(
        self,
        name: str = "sustainability_advisor",
        seed: str = "sustainability_advisor_seed_phrase",
        port: int = 8021,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8021/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = SustainabilityRecommendationEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=SustainabilityAdvisorRequest)
        async def handle_recommendation_request(ctx: Context, sender: str, msg: SustainabilityAdvisorRequest):
            ctx.logger.info(f"LLM advisor query received for company: {msg.company_name}")
            try:
                res = self.engine.generate_sustainability_recommendations(msg.company_name)
                await ctx.send(sender, SustainabilityAdvisorResponse(**res))
                ctx.logger.info("Successfully returned LLM reasoning advisor results.")
            except Exception as e:
                ctx.logger.error(f"Error executing LLM recommendation advisor: {e}")

sustainability_advisor_agent = SustainabilityAdvisorAgent()

if __name__ == "__main__":
    sustainability_advisor_agent.run()
