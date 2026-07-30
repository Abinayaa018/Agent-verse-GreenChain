from uagents import Agent, Context
from .models import ImpactInput, ImpactReport
from .rules import calculate_impact

impact_agent = Agent(
    name="environmental_impact",
    seed="environmental_impact_seed_phrase",
    port=8006,
    endpoint=["http://127.0.0.1:8006/submit"],
)

@impact_agent.on_message(model=ImpactInput)
async def handle_impact_input(ctx: Context, sender: str, msg: ImpactInput):
    report = calculate_impact(msg.material_type, msg.quantity_kg)
    ctx.logger.info(f"Impact calculated: {report}")
    await ctx.send(sender, report)

if __name__ == "__main__":
    impact_agent.run()
