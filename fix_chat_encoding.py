import os

files_to_fix = [
    r"NexGenEA\NexGen_EA_V4.html",
    r"azure-deployment\static\NexGenEA\NexGen_EA_V4.html",
    r"NexGenEA\EA 20 Platform_V3_Integrated_C.html",
    r"azure-deployment\static\NexGenEA\EA 20 Platform_V3_Integrated_C.html",
    r"NexGenEA\EA 20 Platform_BD_final.html",
    r"azure-deployment\static\NexGenEA\EA 20 Platform_BD_final.html",
    r"NexGenEA\EA 20 Platform_BD_phase4.html",
    r"azure-deployment\static\NexGenEA\EA 20 Platform_BD_phase4.html",
]

replacements = [
    # x (U+00D7) double-encoded via Windows-1252: C3 97 -> C3 83 E2 80 94
    (b'\xc3\x83\xe2\x80\x94', b'&times;'),
    # checkmark/cross U+2715 double-encoded
    (b'\xc3\xa2\xc5\x93\xe2\x80\xa2', b'&#x2715;'),
    # rotate U+21BA double-encoded
    (b'\xc3\xa2\xe2\x80\xa0\xc2\xba', b'&#x21BA;'),
    # minus U+2212 double-encoded
    (b'\xc3\xa2\xcb\x86\xe2\x80\x99', b'&minus;'),
    # bullet U+2022 double-encoded
    (b'\xc3\xa2\xe2\x82\xac\xc2\xa2', b'&bull;'),
]

total_fixes = 0
for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f"SKIP: {filepath}")
        continue
    with open(filepath, 'rb') as f:
        data = f.read()
    original = data
    file_fixes = 0
    for broken, fixed in replacements:
        count = data.count(broken)
        if count > 0:
            print(f"  {os.path.basename(filepath)}: {count}x {broken!r} -> {fixed!r}")
            data = data.replace(broken, fixed)
            file_fixes += count
    if data != original:
        with open(filepath, 'wb') as f:
            f.write(data)
        print(f"  SAVED: {filepath} ({file_fixes} fixes)")
        total_fixes += file_fixes
    else:
        print(f"  OK: {os.path.basename(filepath)}")

print(f"\nTotal fixes applied: {total_fixes}")
