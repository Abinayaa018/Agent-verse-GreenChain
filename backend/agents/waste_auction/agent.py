"""uAgents micro-agent implementation for Waste Auction Agent."""

import logging
from uagents import Agent, Context
from .models import BidRequest, AuctionResponse
from .rules import WasteAuctionEngine

logger = logging.getLogger("waste_auction.uagent")

class WasteAuctionAgent(Agent):
    """Autonomous waste marketplace bidding and auction uAgent."""

    def __init__(
        self,
        name: str = "waste_auction",
        seed: str = "waste_auction_seed_phrase",
        port: int = 8026,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8026/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = WasteAuctionEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=BidRequest)
        async def handle_auction_bidding(ctx: Context, sender: str, msg: BidRequest):
            ctx.logger.info(f"Simulating bidding process for auction: {msg.auction_id}")
            try:
                res = self.engine.run_simulated_auction(msg)
                await ctx.send(sender, AuctionResponse(**res))
                ctx.logger.info("Successfully returned simulated bids and AI outcome summaries.")
            except Exception as e:
                ctx.logger.error(f"Error executing auction simulations: {e}")

waste_auction_agent = WasteAuctionAgent()

if __name__ == "__main__":
    waste_auction_agent.run()
