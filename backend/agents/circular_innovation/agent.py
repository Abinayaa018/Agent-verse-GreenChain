"""uAgents micro-agent implementation for Circular Innovation Agent."""

import logging
from uagents import Agent, Context
from .models import CircularInnovationRequest, CircularInnovationResponse
from .rules import CircularInnovationEngine

logger = logging.getLogger("circular_innovation.uagent")


class CircularInnovationAgent(Agent):
    """Autonomous micro-agent for discovering novel research-backed circular economy reuse pathways."""

    def __init__(
        self,
        name: str = "circular_innovation",
        seed: str = "circular_innovation_seed_phrase",
        port: int = 8004,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8004/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = CircularInnovationEngine()
        self._register_handlers()

    def _register_handlers(self):

        @self.on_message(model=CircularInnovationRequest)
        async def handle_innovation_request(ctx: Context, sender: str, msg: CircularInnovationRequest):
            ctx.logger.info(f"Circular Innovation request received from {sender} for material: {msg.profile.material_name}")
            try:
                response = self.engine.discover_innovations(msg)
                await ctx.send(sender, response)
                ctx.logger.info(f"Successfully sent {response.total_discoveries} innovation discoveries to {sender}")
            except Exception as e:
                ctx.logger.error(f"Error processing circular innovation request: {e}")


circular_innovation_agent = CircularInnovationAgent()

if __name__ == "__main__":
    circular_innovation_agent.run()
