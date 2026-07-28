"""Resource Matching Agent — orchestrates resource compatibility and pathway checking."""

from uagents import Agent, Context
from .models import ResourceMatchRequest, ResourceMatchResponse
from .rules import check_resource_matching


class ResourceMatchingAgent(Agent):
    """Agent responsible for resource matching verification."""

    def __init__(self, name: str = "resource_matching", seed: str = None, endpoint: str = None):
        super().__init__(name=name, seed=seed, endpoint=endpoint)
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=ResourceMatchRequest)
        async def handle_match_request(ctx: Context, sender: str, msg: ResourceMatchRequest):
            ctx.logger.info(f"Resource match request from {sender} for: {msg.profile.material_name}")
            try:
                response = check_resource_matching(msg.profile)
                await ctx.send(sender, response)
            except Exception as e:
                ctx.logger.error(f"Error processing resource matching: {e}")


if __name__ == "__main__":
    agent = ResourceMatchingAgent()
    agent.run()
