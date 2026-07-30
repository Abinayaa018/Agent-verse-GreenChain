"""uAgents micro-agent implementation for Smart Contract Agent."""

import logging
from uagents import Agent, Context
from .models import ContractRequest, ContractResponse
from .rules import SmartContractEngine

logger = logging.getLogger("smart_contract.uagent")

class SmartContractAgent(Agent):
    """Autonomous contract validation and PDF rendering uAgent."""

    def __init__(
        self,
        name: str = "smart_contract",
        seed: str = "smart_contract_seed_phrase",
        port: int = 8023,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8023/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.engine = SmartContractEngine()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=ContractRequest)
        async def handle_contract_request(ctx: Context, sender: str, msg: ContractRequest):
            ctx.logger.info(f"Drafting transaction agreement between {msg.buyer} and {msg.seller}")
            try:
                res = self.engine.generate_contract_agreement(msg)
                await ctx.send(sender, ContractResponse(**res))
                ctx.logger.info("Successfully completed contract PDF build and signing.")
            except Exception as e:
                ctx.logger.error(f"Error drafting contract PDF: {e}")

smart_contract_agent = SmartContractAgent()

if __name__ == "__main__":
    smart_contract_agent.run()
