"""uAgents micro-agent implementation for Traceability Agent."""

import logging
from uagents import Agent, Context
from .models import TraceabilityRequest, TraceabilityResponse
from .rules import TraceabilityEngine

logger = logging.getLogger("waste_origin_traceability.uagent")

class TraceabilityAgent(Agent):
    """Autonomous waste shipment traceability tracking uAgent."""

    def __init__(
        self,
        name: str = "waste_origin_traceability",
        seed: str = "waste_origin_traceability_seed_phrase",
        port: int = 8030,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8030/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = TraceabilityEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=TraceabilityRequest)
        async def handle_traceability_query(ctx: Context, sender: str, msg: TraceabilityRequest):
            ctx.logger.info(f"Querying passport checkpoint ledger for ID: {msg.passport_id}")
            try:
                res = self.engine.get_passport_timeline(msg.passport_id)
                await ctx.send(sender, TraceabilityResponse(**res))
                ctx.logger.info("Successfully returned verified blockchain timeline registry.")
            except Exception as e:
                ctx.logger.error(f"Error querying material passport timeline: {e}")

traceability_agent = TraceabilityAgent()

if __name__ == "__main__":
    traceability_agent.run()
