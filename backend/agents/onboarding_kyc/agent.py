"""uAgents micro-agent implementation for Onboarding & KYC Agent."""

import logging
from uagents import Agent, Context
from .models import KYCVerifyRequest, KYCRecord
from .rules import KYCVerificationEngine

logger = logging.getLogger("onboarding_kyc.uagent")

class OnboardingKYCAgent(Agent):
    """Micro-agent representing the KYC validation gatekeeper."""

    def __init__(
        self,
        name: str = "onboarding_kyc",
        seed: str = "onboarding_kyc_seed_phrase",
        port: int = 8010,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8010/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = KYCVerificationEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=KYCVerifyRequest)
        async def handle_kyc_submission(ctx: Context, sender: str, msg: KYCVerifyRequest):
            ctx.logger.info(f"Verification request received for company: {msg.company_name}")
            try:
                record = self.engine.verify_company(msg)
                ctx.logger.info(f"Company {msg.company_name} status: {record.status}")
                # Optional: Send verification event message to compliance agent registry
            except Exception as e:
                ctx.logger.error(f"Error executing KYC verification: {e}")

onboarding_kyc_agent = OnboardingKYCAgent()

if __name__ == "__main__":
    onboarding_kyc_agent.run()
