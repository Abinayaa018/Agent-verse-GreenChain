"""uAgents micro-agent implementation for Circular Policy Advisor Agent."""

import logging
from uagents import Agent, Context
from .models import PolicyRequest, PolicyResponse
from .rules import CircularPolicyEngine

logger = logging.getLogger("circular_policy.uagent")

class CircularPolicyAgent(Agent):
    """Autonomous regulatory compliance advisory uAgent."""

    def __init__(
        self,
        name: str = "circular_policy",
        seed: str = "circular_policy_seed_phrase",
        port: int = 8041,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8041/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = CircularPolicyEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=PolicyRequest)
        async def handle_policy_query(ctx: Context, sender: str, msg: PolicyRequest):
            ctx.logger.info(f"Circular policy query received for industry: {msg.industry}")
            try:
                res = self.engine.get_policy_advisory(msg)
                await ctx.send(sender, PolicyResponse(**res))
                ctx.logger.info("Successfully returned circular policy advisory feedback.")
            except Exception as e:
                ctx.logger.error(f"Error executing policy checks: {e}")

circular_policy_agent = CircularPolicyAgent()

if __name__ == "__main__":
    circular_policy_agent.run()
