"""Compliance Agent — checks regulatory compliance for waste handling."""

from uagents import Agent, Context, Model


class ComplianceAgent(Agent):
    """Agent responsible for regulatory compliance verification."""

    def __init__(self, name: str = "compliance", seed: str = None, endpoint: str = None):
        super().__init__(name=name, seed=seed, endpoint=endpoint)
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=Model)
        async def handle_message(ctx: Context, sender: str, msg: Model):
            ctx.logger.info(f"Received message from {sender}: {msg}")


if __name__ == "__main__":
    agent = ComplianceAgent()
    agent.run()

