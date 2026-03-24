"""
Fix all text-level mojibake (double-encoded UTF-8 via CP1252) in HTML files.

Pattern: original UTF-8 bytes were misread as CP1252, producing the wrong 
Unicode chars, which were then saved as proper UTF-8. We reverse this.
"""
import os, shutil

FILES = [
    r"NexGenEA\NexGen_EA_V4.html",
    r"azure-deployment\static\NexGenEA\NexGen_EA_V4.html",
    r"EA2_Toolkit\AI Value Chain Analyzer V2.html",
    r"EA2_Toolkit\AI Strategy Workbench V2.html",
    r"EA2_Toolkit\AI Capability Mapping V2.html",
    r"EA2_Toolkit\AI Business Model Canvas.html",
    r"EA2_Toolkit\EA20 Maturity Toolbox V2.html",
    r"EA2_Toolkit\EA2_Strategic_Tools.html",
    r"azure-deployment\static\EA2_Toolkit\AI Value Chain Analyzer V2.html",
    r"azure-deployment\static\EA2_Toolkit\AI Strategy Workbench V2.html",
    r"azure-deployment\static\EA2_Toolkit\AI Capability Mapping V2.html",
    r"azure-deployment\static\EA2_Toolkit\AI Business Model Canvas.html",
    r"azure-deployment\static\EA2_Toolkit\EA20 Maturity Toolbox V2.html",
    r"azure-deployment\static\EA2_Toolkit\EA2_Strategic_Tools.html",
    r"NexGenEA\js\EA_Config.js",
    r"NexGenEA\js\EA_DataManager.js",
    r"NexGenEA\js\EA_SyncEngine.js",
]

# CP1252 byte 0x80-0x9F map to Unicode (rest map 1:1 like Latin-1)
CP1252_EXTRA = {
    0x80: '\u20ac', 0x82: '\u201a', 0x83: '\u0192', 0x84: '\u201e',
    0x85: '\u2026', 0x86: '\u2020', 0x87: '\u2021', 0x88: '\u02c6',
    0x89: '\u2030', 0x8a: '\u0160', 0x8b: '\u2039', 0x8c: '\u0152',
    0x8e: '\u017d', 0x91: '\u2018', 0x92: '\u2019', 0x93: '\u201c',
    0x94: '\u201d', 0x95: '\u2022', 0x96: '\u2013', 0x97: '\u2014',
    0x98: '\u02dc', 0x99: '\u2122', 0x9a: '\u0161', 0x9b: '\u203a',
    0x9c: '\u0153', 0x9e: '\u017e', 0x9f: '\u0178',
}

# Build reverse: Unicode char → CP1252 byte
UNICODE_TO_CP1252 = {v: k for k, v in CP1252_EXTRA.items()}
# Add 0x00-0x7F and 0xA0-0xFF (map 1:1)
for i in range(0x00, 0x80):
    UNICODE_TO_CP1252[chr(i)] = i
for i in range(0xa0, 0x100):
    UNICODE_TO_CP1252[chr(i)] = i


def unicode_to_cp1252_bytes(s):
    """Convert a string to CP1252 bytes; return None if any char is unmappable."""
    result = []
    for c in s:
        b = UNICODE_TO_CP1252.get(c)
        if b is None:
            return None
        result.append(b)
    return bytes(result)


def scan_and_fix(text):
    """Scan text for mojibake sequences and replace them."""
    # The mojibake starting chars come from bytes 0xC2, 0xC3, 0xE2, 0xF0
    # mapped through CP1252:
    # 0xC2 → Â (U+00C2), 0xC3 → Ã (U+00C3), 0xE2 → â (U+00E2), 0xF0 → ð (U+00F0)
    STARTER_BYTES = {'\xc2': 2, '\xc3': 2, '\xe2': 3, '\xf0': 4}

    replacements = {}
    i = 0
    while i < len(text):
        ch = text[i]
        nbytes = STARTER_BYTES.get(ch)
        if nbytes is not None and i + nbytes <= len(text):
            seq = text[i:i + nbytes]
            raw = unicode_to_cp1252_bytes(seq)
            if raw is not None:
                try:
                    decoded = raw.decode('utf-8')
                    if decoded != seq and len(decoded) <= len(seq):
                        replacements[seq] = decoded
                except UnicodeDecodeError:
                    pass
        i += 1

    if not replacements:
        return text, {}

    # Apply replacements, longest first
    fixed = text
    applied = {}
    for bad in sorted(replacements, key=len, reverse=True):
        good = replacements[bad]
        count = fixed.count(bad)
        if count > 0:
            fixed = fixed.replace(bad, good)
            applied[bad] = (good, count)

    return fixed, applied


def fix_file(path):
    if not os.path.exists(path):
        print(f"  SKIP (not found): {path}")
        return 0

    with open(path, encoding='utf-8') as f:
        text = f.read()

    fixed, applied = scan_and_fix(text)

    if not applied:
        print(f"  OK (clean): {path}")
        return 0

    total = sum(c for _, c in applied.values())
    for bad, (good, count) in sorted(applied.items(), key=lambda x: -x[1][1]):
        print(f"    {count:4d}x  {bad!r}  ->  {good!r}")

    shutil.copy2(path, path + '.bak')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(fixed)
    print(f"  FIXED {total} replacements in {path}")
    return total


print("=== Mojibake Fix (CP1252 round-trip) ===\n")
grand = 0
for fpath in FILES:
    print(f"Processing: {fpath}")
    grand += fix_file(fpath)
    print()

print(f"Grand total: {grand} replacements")
