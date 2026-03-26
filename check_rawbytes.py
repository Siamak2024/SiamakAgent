
f = open('EA2_Toolkit/EA20 Maturity Toolbox V2.html', 'rb')
data = f.read()
f.close()

all_lines = data.split(b'\n')
print(f"Total lines: {len(all_lines)}")

# Dump raw bytes for lines 615-625
print("\n=== Lines 615-625 (raw) ===")
for i in range(614, 625):
    line = all_lines[i]
    hex_bytes = ' '.join(f'{b:02X}' for b in line[:60])
    print(f"L{i+1} ({len(line)}b): {repr(line[:80])}")
    print(f"     HEX: {hex_bytes}")

print("\n=== Lines 930-938 (raw) ===")
for i in range(929, 938):
    line = all_lines[i]
    hex_bytes = ' '.join(f'{b:02X}' for b in line[:60])
    print(f"L{i+1} ({len(line)}b): {repr(line[:120])}")
    print(f"     HEX: {hex_bytes}")

# Specifically look for any non-standard characters that would trick HTML parser
# The HTML spec says the browser should stop reading a script at </
# But also check for any <!-- that could comment out code
print("\n=== HTML-significant sequences in script blocks ===")
s1_start = data.find(b'let matChatOpen')
s1_end = data.find(b'</script>', s1_start)
s2_start = data.find(b'let dataManager = null')
s2_end = data.find(b'</script>', s2_start)

for seq in [b'</', b'<!--', b']]>', b'\x00']:
    for name, start, end in [('S1', s1_start, s1_end), ('S2', s2_start, s2_end)]:
        idx = start
        while True:
            idx = data.find(seq, idx, end)
            if idx == -1:
                break
            ln = data[:idx].count(b'\n') + 1
            ctx = data[max(0,idx-20):idx+30]
            print(f"{name} L{ln}: {seq!r} found | {repr(ctx)}")
            idx += 1
