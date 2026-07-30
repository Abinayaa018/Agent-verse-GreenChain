"""uAgents micro-agent implementation for Fraud Detection Agent."""

import logging
from uagents import Agent, Context
from .models import FraudDetectionRequest, FraudDetectionResponse
from .rules import FraudDetectionEngine

logger = logging.getLogger("fraud_detection.uagent")

class FraudDetectionAgent(Agent):
    """Autonomous fraud risk profiling uAgent."""

    def __init__(
        self,
        name: str = "fraud_detection",
        seed: str = "fraud_detection_seed_phrase",
        port: int = 8019,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8019/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = FraudDetectionEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=FraudDetectionRequest)
        async def handle_fraud_request(ctx: Context, sender: str, msg: FraudDetectionRequest):
            ctx.logger.info(f"Checking transaction fraud indicators: {msg.transaction_id}")
            try:
                res = self.engine.detect_fraud(msg)
                await ctx.send(sender, FraudDetectionResponse(**res))
                ctx.logger.info("Successfully returned fraud risk calculations.")
            except Exception as e:
                ctx.logger.error(f"Error checking transaction fraud: {e}")

fraud_detection_agent = FraudDetectionAgent()

if __name__ == "__main__":
    fraud_detection_agent.run()
