# tests/test_agents.py or a per-agent test snippet
from agents.waste_intelligence.rules import classify_waste

result = classify_waste("data/sample_waste_inputs/cotton_scrap.jpg")
print(result)