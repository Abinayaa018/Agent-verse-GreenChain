"""Compliance Agent — checks regulatory compliance for waste handling."""

from uagents import Agent, Context
from .models import ComplianceCheckRequest, ComplianceCheckResponse
from .rules import check_compliance


class ComplianceAgent(Agent):
    """
    Receives a ComplianceCheckRequest from the Waste Intelligence Agent
    (or the orchestrator), runs all compliance checks, and replies with
    a ComplianceCheckResponse.

    Team integration note:
        - Input contract : ComplianceCheckRequest  (defined in models.py)
        - Output contract: ComplianceCheckResponse (defined in models.py)
        Both can be imported by any other agent via:
            from agents.compliance.models import ComplianceCheckRequest, ComplianceCheckResponse
    """

    def __init__(self, name: str = "compliance", seed: str = None, endpoint: str = None):
        super().__init__(name=name, seed=seed, endpoint=endpoint)
        self._register_handlers()

    def _register_handlers(self):

        @self.on_message(model=ComplianceCheckRequest)
        async def handle_compliance_request(ctx: Context, sender: str, msg: ComplianceCheckRequest):
            ctx.logger.info(
                f"[ComplianceAgent] Request received from {sender} "
                f"| profile_id={msg.waste_profile_id} "
                f"| category={msg.category} "
                f"| hazard_level={msg.hazard_level}"
            )

            try:
                response: ComplianceCheckResponse = check_compliance(msg)

                ctx.logger.info(
                    f"[ComplianceAgent] Result for {msg.waste_profile_id}: "
                    f"status={response.status}, score={response.compliance_score}"
                )

                await ctx.send(sender, response)

            except ValueError as e:
                ctx.logger.error(f"[ComplianceAgent] Validation error for {msg.waste_profile_id}: {e}")
                await ctx.send(sender, ComplianceCheckResponse(
                    status="FAIL",
                    compliance_score=0.0,
                    permit_required=[],
                    required_documents=[],
                    violations=[f"Validation error: {str(e)}"],
                    recommendations=["Ensure the request contains valid category, hazard_level, and destination values."],
                ))

            except Exception as e:
                ctx.logger.error(f"[ComplianceAgent] Unexpected error for {msg.waste_profile_id}: {e}")
                await ctx.send(sender, ComplianceCheckResponse(
                    status="FAIL",
                    compliance_score=0.0,
                    permit_required=[],
                    required_documents=[],
                    violations=[f"Internal compliance check error: {str(e)}"],
                    recommendations=["Contact the compliance team to investigate this waste profile."],
                ))


if __name__ == "__main__":
    agent = ComplianceAgent()
    agent.run()
