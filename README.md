# GreenChain AI

Decentralized waste-to-resource intelligence platform powered by uAgents.

## Overview

GreenChain AI is a multi-agent AI system that transforms waste management into a transparent, efficient, and economically viable circular economy. Each agent specializes in a domain — from waste classification and compliance to logistics and marketplace negotiation — and communicates via the uAgents protocol.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the full architecture documentation.

## Quick Start

1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Configure environment: copy `.env.example` to `.env` and fill in values
4. Run the orchestrator: `python -m orchestrator.bureau`

## Project Structure

```
greenchain-ai/
├── agents/                    # Specialized uAgents
│   ├── waste_intelligence/    # Waste classification & profiling
│   ├── resource_matching/     # Industry reuse matching
│   ├── compliance/            # Regulatory compliance checking
│   ├── economic_value/        # Pricing & valuation
│   ├── logistics/             # Routing & transport optimization
│   ├── environmental_impact/  # Environmental metrics
│   ├── circular_innovation/   # Research & patent discovery
│   └── marketplace/           # Negotiation & contracts
├── orchestrator/              # Agent orchestration layer
├── shared/                    # Shared schemas & constants
├── data/                      # Sample data & mock databases
├── frontend/                  # Dashboard / demo UI (optional)
├── tests/                     # Test suite
└── docs/                      # Documentation
```

