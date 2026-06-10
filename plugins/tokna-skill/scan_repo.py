#!/usr/bin/env python3
import sys
import os
import subprocess
from pathlib import Path

def main():
    if len(sys.argv) < 2:
        print("Usage: scan_repo.py <path>")
        sys.exit(1)

    target_path = sys.argv[1]
    rules_dir = "/home/node/.openclaw/workspace/cost-project/engine/corpus-semgrep-scanner/rules"
    
    if not os.path.exists(target_path):
        print(f"Error: Path {target_path} does not exist.")
        sys.exit(1)

    print(f"🌩️ Cost Engine: Scanning {target_path} for cost regressions...")
    
    # Check if semgrep is installed
    try:
        subprocess.run(["semgrep", "--version"], capture_output=True, check=True)
        has_semgrep = True
    except (subprocess.CalledProcessError, FileNotFoundError):
        has_semgrep = False
        print("⚠️ Semgrep not found. Falling back to lightweight grep-based scan.")

    if has_semgrep:
        cmd = [
            "semgrep",
            "--config", rules_dir,
            target_path,
            "--quiet",
            "--metrics", "off"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        else:
            print("✅ No cost regressions detected.")
    else:
        # Simple grep fallback for a few critical patterns
        patterns = {
            "Hardcoded API Key": r"(sk-[a-zA-Z0-0]{32,})",
            "Unbounded Loop": r"while\s+True:",
            "Missing max_tokens": r"\.create\(.*(?<!max_tokens=)\)"
        }
        found = False
        for name, pattern in patterns.items():
            cmd = ["grep", "-rnE", pattern, target_path]
            res = subprocess.run(cmd, capture_output=True, text=True)
            if res.stdout:
                print(f"\nPotential {name} detected:")
                print(res.stdout)
                found = True
        
        if not found:
            print("✅ No obvious cost risks found via grep.")

if __name__ == "__main__":
    main()
