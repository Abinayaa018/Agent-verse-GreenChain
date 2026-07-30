"""uAgents micro-agent implementation for Collection Scheduler Agent."""

import logging
from uagents import Agent, Context
from .models import SchedulePickupRequest, SchedulePickupResponse
from .rules import CollectionSchedulingEngine

logger = logging.getLogger("collection_scheduler.uagent")

class CollectionSchedulerAgent(Agent):
    """Autonomous logistics collection scheduling uAgent."""

    def __init__(
        self,
        name: str = "collection_scheduler",
        seed: str = "collection_scheduler_seed_phrase",
        port: int = 8016,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8016/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = CollectionSchedulingEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=SchedulePickupRequest)
        async def handle_scheduling_request(ctx: Context, sender: str, msg: SchedulePickupRequest):
            ctx.logger.info(f"Scheduling request received for material: {msg.material}, quantity: {msg.quantity}kg")
            try:
                res = self.engine.schedule_pickup(msg)
                await ctx.send(sender, res)
                ctx.logger.info("Successfully returned collection logistics schedule details.")
            except Exception as e:
                ctx.logger.error(f"Error calculating pickup schedule: {e}")

collection_scheduler_agent = CollectionSchedulerAgent()

if __name__ == "__main__":
    collection_scheduler_agent.run()
