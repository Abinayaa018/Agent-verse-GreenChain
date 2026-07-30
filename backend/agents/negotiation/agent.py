"""uAgents micro-agent implementation for Negotiation Agent."""

import logging
from uagents import Agent, Context
from .models import NegotiateRequest, NegotiateResponse
from .rules import NegotiationEngine

logger = logging.getLogger("negotiation.uagent")

class NegotiationAgent(Agent):
    """Autonomous negotiation micro-agent."""

    def __init__(
        self,
        name: str = "negotiation",
        seed: str = "negotiation_seed_phrase",
        port: int = 8022,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8022/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = NegotiationEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=NegotiateRequest)
        async def handle_negotiation(ctx: Context, sender: str, msg: NegotiateRequest):
            ctx.logger.info(f"Negotiation request between {msg.buyer} and {msg.seller}")
            try:
                res = self.engine.run_negotiation(msg)
                await ctx.send(sender, NegotiateResponse(**res))
                ctx.logger.info("Successfully returned negotiated offer outcomes.")
            except Exception as e:
                ctx.logger.error(f"Error executing deal negotiation: {e}")

negotiation_agent = NegotiationAgent()

if __name__ == "__main__":
    negotiation_agent.run()
