from uagents import Agent, Context
from .models import WasteInput, WasteProfile

waste_agent = Agent(
    name="waste_intelligence",
    seed="waste_intelligence_seed_phrase",   # deterministic address
    port=8001,
    endpoint=["http://127.0.0.1:8001/submit"],
)

@waste_agent.on_message(model=WasteInput)
async def handle_waste_input(ctx: Context, sender: str, msg: WasteInput):
    # TODO: swap this stub for your trained model's inference call
    profile = WasteProfile(
        material_type="cotton_fibre",
        purity_pct=95.0,
        hazard_level="low",
        reusable=True,
    )
    ctx.logger.info(f"Classified: {profile}")
    await ctx.send(sender, profile)   # or forward to next agent's address

if __name__ == "__main__":
    waste_agent.run()