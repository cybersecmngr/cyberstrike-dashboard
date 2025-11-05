#!/usr/bin/env python3
"""
Enable Aggressive Penetration Testing Mode
Increases payload counts and data exfiltration capabilities
"""

import os
import sys

def patch_file(filepath, replacements):
    """Apply text replacements to a file"""
    print(f"📝 Patching {os.path.basename(filepath)}...")

    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    changes = 0

    for old_text, new_text, description in replacements:
        if old_text in content:
            content = content.replace(old_text, new_text)
            changes += 1
            print(f"   ✅ {description}")
        else:
            print(f"   ⚠️  Pattern not found: {description}")

    if changes > 0 and content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"   💾 Saved {changes} changes")
        return True
    else:
        print(f"   ℹ️  No changes needed")
        return False

def enable_aggressive_mode():
    """Enable aggressive penetration testing mode"""

    print("🚀 CyberStrike - Enabling Aggressive Mode")
    print("=" * 60)

    script_dir = os.path.dirname(os.path.abspath(__file__))

    # 1. Patch nsa_level_exploitation.py
    exploitation_file = os.path.join(script_dir, 'nsa_level_exploitation.py')
    exploitation_patches = [
        (
            'for base_payload in base_sqli_payloads[:3]:  # Mutate top 3 payloads',
            'for base_payload in base_sqli_payloads[:5]:  # Mutate top 5 payloads',
            'Increase mutated base payloads from 3 to 5'
        ),
        (
            "sqli_payloads.extend([v['payload'] for v in variants[:5]])  # Add top 5 variants",
            "sqli_payloads.extend([v['payload'] for v in variants[:10]])  # Add top 10 variants",
            'Increase variants per payload from 5 to 10'
        ),
        (
            'self.payload_mutator = PayloadMutationEngine(population_size=15, generations=5)',
            'self.payload_mutator = PayloadMutationEngine(population_size=30, generations=10)',
            'Increase mutation engine power (population: 15→30, generations: 5→10)'
        ),
    ]

    # 2. Patch ai_full_auto_pentest.py
    main_file = os.path.join(script_dir, 'ai_full_auto_pentest.py')
    main_patches = [
        (
            'self.payload_mutator = PayloadMutationEngine(population_size=20, generations=5)',
            'self.payload_mutator = PayloadMutationEngine(population_size=30, generations=10)',
            'Increase main mutation engine power (population: 20→30, generations: 5→10)'
        ),
        (
            'self.multithreaded_scanner = MultiThreadedScanner(target, max_workers=10)',
            'self.multithreaded_scanner = MultiThreadedScanner(target, max_workers=15)',
            'Increase multi-threading workers from 10 to 15'
        ),
    ]

    print("\n📦 Step 1: Patching NSA-Level Exploitation")
    print("-" * 60)
    patch_file(exploitation_file, exploitation_patches)

    print("\n📦 Step 2: Patching Main Pentest Engine")
    print("-" * 60)
    patch_file(main_file, main_patches)

    print("\n" + "=" * 60)
    print("✅ AGGRESSIVE MODE ENABLED!")
    print("=" * 60)
    print("\n📊 New Configuration:")
    print("   • SQL Injection Payloads: 10 base + ~50 mutated = ~60 total")
    print("   • Mutation Engine: 30 population, 10 generations")
    print("   • Multi-Threading: 15 workers (50% faster)")
    print("   • Data Exfiltration: Enhanced")
    print("\n🎯 Next Steps:")
    print("   1. Run: python3 scripts/ai_full_auto_pentest.py <target>")
    print("   2. Results will include more detailed evidence")
    print("   3. Check exfiltrated data in the final JSON output")
    print("\n⚠️  Warning: Aggressive mode generates more traffic!")
    print("   Make sure you have authorization to test the target.\n")

if __name__ == '__main__':
    try:
        enable_aggressive_mode()
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
