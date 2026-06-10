#!/usr/bin/env python3
import sys
import os

def main():
    if len(sys.argv) < 2:
        print("Usage: analyze_cost.py <snippet_or_file>")
        sys.exit(1)

    target = sys.argv[1]
    content = ""
    
    if os.path.exists(target):
        with open(target, 'r') as f:
            content = f.read()
    else:
        content = target

    print("🌩️ Cost Engine: Analyzing code for cost-regression vectors...\n")
    
    # Analysis logic (heuristics-based for the skill MVP)
    risks = []
    if "while True" in content or "while(true)" in content:
        risks.append("- 🔴 **Unbounded Agent Loop**: Detected a raw while-loop. If this contains an LLM call, a single failure or halluncination could cause an infinite billing loop. (Vector #1)")
    
    if ".create(" in content and "max_tokens" not in content and "max_output_tokens" not in content:
        risks.append("- 🟠 **Missing Output Caps**: LLM call detected without `max_tokens`. A 'chatty' model response could consume your entire context window. (Vector #22)")

    if "reasoning_effort" in content and ("high" in content or "max" in content):
         risks.append("- 🔴 **Reasoning Budget Breach**: Hardcoded high/max reasoning effort detected. Reasoning tokens are often 2-3x more expensive than standard tokens. (Vector #2)")

    if "cache_control" not in content and ("anthropic" in content.lower() or "claude" in content.lower()):
        risks.append("- 🟡 **Missing Prompt Caching**: No `cache_control` found in Anthropic call. For large system prompts, this can increase costs by 90% per call. (Vector #3)")

    if risks:
        print("\n".join(risks))
    else:
        print("✅ No high-risk cost patterns detected in this snippet.")

if __name__ == "__main__":
    main()
