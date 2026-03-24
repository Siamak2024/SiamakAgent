"""Detect and fix all text-level mojibake (double-encoded UTF-8) in target files."""
import re, shutil, os

FILES = [
    r"NexGenEA\NexGen_EA_V4.html",
    r"azure-deployment\static\NexGenEA\NexGen_EA_V4.html",
]

def find_mojibake(text):
    """Find all sequences that are mojibake (valid latin-1 that re-decodes to different UTF-8)."""
    # Match sequences starting with high-latin chars that are often double-encoded
    pattern = re.compile(r'[\xc0-\xff][\x80-\xff]{0,8}')
    found = {}
    for m in pattern.finditer(text):
        s = m.group()
        try:
            encoded = s.encode('latin-1')
            decoded = encoded.decode('utf-8')
            if decoded != s and len(decoded) < len(s):  # shorter = likely correct
                found[s] = decoded
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass
    return found

def fix_file(path):
    if not os.path.exists(path):
        print(f"  SKIP (not found): {path}")
        return 0

    with open(path, encoding='utf-8') as f:
        text = f.read()

    mapping = find_mojibake(text)
    if not mapping:
        print(f"  OK (nothing to fix): {path}")
        return 0

    # Sort by length descending so longer sequences are replaced first
    sorted_mapping = sorted(mapping.items(), key=lambda x: -len(x[0]))

    fixed = text
    total = 0
    for bad, good in sorted_mapping:
        count = fixed.count(bad)
        if count > 0:
            fixed = fixed.replace(bad, good)
            total += count
            print(f"    {count:4d}x  {bad!r}  ->  {good!r}")

    if fixed != text:
        shutil.copy2(path, path + '.prebak')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed)
        print(f"  FIXED {total} replacements in {path}")
    else:
        print(f"  No changes after replacement in {path}")

    return total

print("=== Mojibake Text-Level Fix ===\n")
grand_total = 0
for fpath in FILES:
    print(f"Processing: {fpath}")
    grand_total += fix_file(fpath)
    print()

print(f"Grand total replacements: {grand_total}")
