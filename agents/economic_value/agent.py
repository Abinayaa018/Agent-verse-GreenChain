"""Economic Value Agent — evaluates the financial viability of waste transactions."""

from uagents import Agent, Context

from .models import EconomicValueRequest, EconomicValueResponse
from .pricing import evaluate


class EconomicValueAgent(Agent):
    """
    Receives approved waste transactions from the Compliance Agent,
    runs a full economic evaluation, and returns an EconomicValueResponse.

    Per request:
        1. Validate the incoming EconomicValueRequest
        2. Call evaluate() from pricing.py
        3. Return EconomicValueResponse to the sender

    Team integration:
        Input  → EconomicValueRequest  (agents.economic_value.models)
        Output → EconomicValueResponse (agents.economic_value.models)
    """

    def __init__(self, name: str = "economic_value", seed: str = None, endpoint: str = None):
        super().__init__(name=name, seed=seed, endpoint=endpoint)
        self._log_startup()
        self._register_handlers()

    def _log_startup(self) -> None:
        print("[EconomicValueAgent] Agent initialised — rule-based evaluation mode.")

    def _register_handlers(self) -> None:

        @self.on_message(model=EconomicValueRequest)
        async def handle_economic_request(
            ctx: Context, sender: str, msg: EconomicValueRequest
        ) -> None:
            ctx.logger.info(
                f"[EconomicValueAgent] Request from {sender} "
                f"| id={msg.waste_profile_id} "
                f"| material={msg.material} "
                f"| quantity={msg.quantity_tons}t "
                f"| distance={msg.transport_distance_km}km"
            )

            try:
                response = evaluate(msg)

                ctx.logger.info(
                    f"[EconomicValueAgent] {msg.waste_profile_id} → "
                    f"profitability={response.profitability} | "
                    f"roi={response.roi_percent}% | "
                    f"net_profit=${response.net_profit} | "
                    f"recommendation={response.recommendation}"
                )

                await ctx.send(sender, response)

            except ValueError as e:
                ctx.logger.error(
                    f"[EconomicValueAgent] Validation error | {msg.waste_profile_id}: {e}"
                )
                await ctx.send(sender, _error_response(msg.waste_profile_id, str(e)))

            except Exception as e:
                ctx.logger.error(
                    f"[EconomicValueAgent] Unexpected error | {msg.waste_profile_id}: {e}"
                )
                await ctx.send(sender, _error_response(msg.waste_profile_id, str(e)))


def _error_response(waste_profile_id: str, reason: str) -> EconomicValueResponse:
    """Return a safe zero-value response that signals evaluation failure."""
    return EconomicValueResponse(
        waste_profile_id=waste_profile_id,
        market_price_per_ton=0.0,
        processing_cost=0.0,
        transport_cost=0.0,
        revenue=0.0,
        total_cost=0.0,
        net_profit=0.0,
        roi_percent=0.0,
        profitability="Loss",
        recommendation=f"Evaluation failed: {reason}",
    )


if __name__ == "__main__":
    agent = EconomicValueAgent()
    agent.run()
