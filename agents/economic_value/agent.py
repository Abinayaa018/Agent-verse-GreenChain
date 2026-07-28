"""Economic Value Agent — prices waste materials and values reuse opportunities."""

from uagents import Agent, Context, Model


class EconomicValueAgent(Agent):
    """Agent responsible for pricing and valuation of waste materials."""

    def __init__(self, name: str = "economic_value", seed: str = None, endpoint: str = None):
        super().__init__(name=name, seed=seed, endpoint=endpoint)
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=Model)
        async def handle_message(ctx: Context, sender: str, msg: Model):
            ctx.logger.info(f"Received message from {sender}: {msg}")


if __name__ == "__main__":
    agent = EconomicValueAgent()
    agent.run()

