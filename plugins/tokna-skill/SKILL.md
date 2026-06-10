# Tokna AI Performance Engineer — Active Performance & Cost Engineering

Optimize your AI development lifecycle for peak performance and minimal spend. This skill combines real-time turn optimization (latency, throughput, caching) with a final deep-structural audit to ensure your AI code and agent workflows are high-performance, engineering-grade, and cost-efficient.

## Core Capabilities

### 1. Active Turn Optimization (Performance & Efficiency)
Automatically enforces engineering best practices during the development loop:
- **Latency & Throughput Guard:** Monitors token-per-second and suggests optimizations (like streaming or model-swapping) to maintain high-performance interaction.
- **Prompt Caching Enforcer:** Automatically applies ephemeral caching to system prompts and history, reducing latency and saving 90% on input costs.
- **Selective Fetching:** Intercepts data-heavy tools (browser, file-read) to enforce subset loading, preventing "context bloat" that slows down model reasoning.

### 2. Success Interceptor (The Performance Audit)
Automatically triggers a deep check before code is submitted.
- **`Stop` Hook Performance Gate:** When the model finishes a task, Tokna runs 220+ specialized Semgrep rules against the new code.
- **Regression Detection:** Catches performance and cost "smells" like unbounded loops, inefficient polling, missing TTLs, and uncompressed data transfers.
- **Self-Correction Loop:** Violations are fed back to the model for an automatic fix turn, ensuring you ship high-performance code by default.

## Usage

### Manual Scan
`scan_repo.py <path>`
Force a manual audit of the current directory for all cost regression vectors.

### Cost Analysis
`analyze_cost.py <snippet_or_file>`
Analyze a specific piece of code or an LLM call configuration for cost risks.

## Project Context
**Vision:** "Performance Engineering for the Agentic Era."
**Moat:** Powered by Nick's experience in Capacity Engineering at Google and Salesforce. Rules are updated daily via the Tokna research pipeline.

---
_Tokna: Maximized performance. Reduced spend. You focus on building._
