from uagents import Agent, Context
from .models import LogisticsInput, LogisticsPlan
from .rules import calculate_logistics

logistics_agent = Agent(
    name="logistics",
    seed="logistics_seed_phrase",
    port=8005,
    endpoint=["http://127.0.0.1:8005/submit"],
)

@logistics_agent.on_message(model=LogisticsInput)
async def handle_logistics_input(ctx: Context, sender: str, msg: LogisticsInput):
    plan = calculate_logistics(
        msg.material_type, msg.quantity_kg,
        msg.source_location, msg.destination_location, msg.distance_km,
    )
    ctx.logger.info(f"Logistics plan: {plan}")
    await ctx.send(sender, plan)

if __name__ == "__main__":
    logistics_agent.run()