"""uAgents micro-agent implementation for Chatbot Agent."""

import logging
from uagents import Agent, Context
from .models import ChatRequest, ChatResponse
from .rules import ChatbotOrchestrator

logger = logging.getLogger("chatbot.uagent")

class ChatbotAgent(Agent):
    """Autonomous conversational micro-agent orchestrating industrial intelligence."""

    def __init__(
        self,
        name: str = "chatbot",
        seed: str = "chatbot_seed_phrase",
        port: int = 8009,
        endpoint: list = None,
    ):
        if endpoint is None:
            endpoint = ["http://127.0.0.1:8009/submit"]
        super().__init__(name=name, seed=seed, port=port, endpoint=endpoint)
        self.orchestrator = ChatbotOrchestrator()
        self._register_handlers()

    def _register_handlers(self):
        @self.on_message(model=ChatRequest)
        async def handle_chat_request(ctx: Context, sender: str, msg: ChatRequest):
            ctx.logger.info(f"Chat request received: {msg.message}")
            try:
                parsed = self.orchestrator.parse_message(msg.message)
                # Note: In multi-agent system, the agent can forward messages to others here.
                # For FastAPI REST purposes, we return a simple response.
                response_text = "Processed request successfully."
                await ctx.send(sender, ChatResponse(
                    intent=parsed["intent"],
                    entities=parsed["entities"],
                    response=response_text
                ))
            except Exception as e:
                ctx.logger.error(f"Error in chatbot handler: {e}")

chatbot_agent = ChatbotAgent()

if __name__ == "__main__":
    chatbot_agent.run()
