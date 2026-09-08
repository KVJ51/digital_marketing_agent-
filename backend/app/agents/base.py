import os
import json
import logging
from openai import OpenAI

logger = logging.getLogger("marketing_agents")
logging.basicConfig(level=logging.INFO)

class BaseAgent:
    def __init__(self, name: str, role_prompt: str):
        self.name = name
        self.role_prompt = role_prompt
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def generate_json_response(self, user_prompt: str, response_schema: dict = None) -> dict:
        """
        Sends prompts to OpenAI API if available, else falls back to a rule-based mock response
        tailored to the user's business inputs.
        """
        logger.info(f"Agent '{self.name}' executing task...")
        
        if self.client:
            try:
                system_message = self.role_prompt
                if response_schema:
                    system_message += f"\nReturn a valid JSON object conforming strictly to this JSON schema: {json.dumps(response_schema)}. Do not output markdown code blocks (e.g. ```json), return raw JSON text only."

                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format={"type": "json_object"} if response_schema else {"type": "text"}
                )
                
                content = response.choices[0].message.content
                logger.info(f"Agent '{self.name}' response: {content}")
                return json.loads(content)
            except Exception as e:
                logger.error(f"Error calling OpenAI API in agent '{self.name}': {e}. Falling back to default generation.")
                # fall through to fallback
        
        # Fallback generator if API key is not present or calls fail
        return self._generate_fallback(user_prompt)

    def _generate_fallback(self, user_prompt: str) -> dict:
        """
        Subclasses should implement this method to provide realistic mocked fallback outputs
        tailored to the incoming prompt structure.
        """
        return {}
