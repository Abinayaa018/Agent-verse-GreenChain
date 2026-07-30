"""uAgents micro-agent implementation for Circular Investment Agent."""

import logging
from uagents import Agent, Context
from .models import InvestmentRequest, InvestmentResponse
from .rules import CircularInvestmentEngine

logger = logging.getLogger("circular_investment.uagent")

class CircularInvestmentAgent(Agent):
    """Autonomous capital investment prioritization uAgent."""

    def __init__(
        self,
        name: str = "circular_investment",
        seed: str = "circular_investment_seed_phrase",
        port: int = 8031,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8031/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = CircularInvestmentEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=InvestmentRequest)
        async def handle_investment_query(ctx: Context, sender: str, msg: InvestmentRequest):
            ctx.logger.info(f"Analyzing equipment options for company: {msg.company_name}")
            try:
                res = self.engine.get_investment_recommendation(msg)
                await ctx.send(sender, InvestmentResponse(**res))
                ctx.logger.info("Successfully returned investment priority checks.")
            except Exception as e:
                ctx.logger.error(f"Error checking investment recommendation: {e}")

circular_investment_agent = CircularInvestmentAgent()

if __name__ == "__main__":
    circular_investment_agent.run()
