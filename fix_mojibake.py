"""
Fix all mojibake in NexGen_EA_V4.html and its azure-deployment copy.
Reads files as bytes, decodes as latin-1, re-encodes as UTF-8 to find 
mojibake sequences, then replaces each with the correct UTF-8 character.
"""
import re, sys, os, shutil

FILES = [
    r"NexGenEA\NexGen_EA_V4.html",
    r"azure-deployment\static\NexGenEA\NexGen_EA_V4.html",
]

def scan_mojibake(raw_bytes):
    """Find all unique mojibake byte sequences and map them to correct chars."""
    # Mojibake = UTF-8 multibyte sequence stored as latin-1 bytes
    pattern = re.compile(
        rb'(?:[\xc2\xc3][\x80-\xbf])'             # 2-byte UTF-8
        rb'|(?:[\xe2\xe2][\x80-\xbf][\x80-\xbf])' # 3-byte UTF-8
        rb'|(?:\xf0[\x90-\xbf][\x80-\xbf][\x80-\xbf])' # 4-byte UTF-8
    )
    matches = pattern.findall(raw_bytes)
    unique = sorted(set(matches))
    mapping = {}
    for seq in unique:
        try:
            correct = seq.decode('utf-8')
            latin1  = seq.decode('latin-1')
            mapping[latin1.encode('utf-8')] = correct.encode('utf-8')
        except Exception:
            pass
    return mapping, len(matches)

def fix_file(path):
    if not os.path.exists(path):
        print(f"  SKIP (not found): {path}")
        return 0

    with open(path, 'rb') as f:
        raw = f.read()

    mapping, total_occurrences = scan_mojibake(raw)
    if not mapping:
        print(f"  OK (no mojibake): {path}")
        return 0

    fixed = raw
    replaced = 0
    for bad_bytes, good_bytes in mapping.items():
        count = fixed.count(bad_bytes)
        if count > 0:
            fixed = fixed.replace(bad_bytes, good_bytes)
            replaced += count
            bad_str  = bad_bytes.decode('utf-8', errors='replace')
            good_str = good_bytes.decode('utf-8', errors='replace')
            print(f"    {bad_str!r} -> {good_str!r}  ({count}x)")

    if fixed != raw:
        # Backup
        shutil.copy2(path, path + '.bak')
        with open(path, 'wb') as f:
            f.write(fixed)
        print(f"  FIXED {replaced} replacements in {path}")
    else:
        print(f"  No changes needed: {path}")

    return replaced

print("=== Mojibake Fix ===")
total = 0
for fpath in FILES:
    print(f"\nProcessing: {fpath}")
    total += fix_file(fpath)

print(f"\nTotal replacements: {total}")
print("Done.")
