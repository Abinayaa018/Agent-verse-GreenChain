from uagents import Agent, Context
from .models import MarketplaceInput, TransactionRecord
from .rules import evaluate_transaction

marketplace_agent = Agent(
    name="marketplace",
    seed="marketplace_seed_phrase",
    port=8008,
    endpoint=["http://127.0.0.1:8008/submit"],
)

@marketplace_agent.on_message(model=MarketplaceInput)
async def handle_marketplace_input(ctx: Context, sender: str, msg: MarketplaceInput):
    record = evaluate_transaction(
        msg.material_type, msg.quantity_kg,
        msg.seller_name, msg.buyer_name, msg.proposed_price_inr,
    )
    ctx.logger.info(f"Transaction record: {record}")
    await ctx.send(sender, record)

if __name__ == "__main__":
    marketplace_agent.run()