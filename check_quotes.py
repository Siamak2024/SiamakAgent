
f = open('EA2_Toolkit/EA20 Maturity Toolbox V2.html', 'rb')
data = f.read()
f.close()

# Search for curly/smart quotes U+2018 (E2 80 98), U+2019 (E2 80 99), U+201C (E2 80 9C), U+201D (E2 80 9D)
# Also check UTF-16 encoded quotes: 0x91, 0x92, 0x93, 0x94 in CP1252
curly_seqs = [
    (b'\xe2\x80\x98', 'U+2018 left single quote'),
    (b'\xe2\x80\x99', 'U+2019 right single quote'),
    (b'\xe2\x80\x9c', 'U+201C left double quote'),
    (b'\xe2\x80\x9d', 'U+201D right double quote'),
    (b'\xe2\x80\x93', 'U+2013 en dash'),
    (b'\xe2\x80\x94', 'U+2014 em dash'),
]

# Find script block boundaries
s1_pos = data.find(b'let matChatOpen')
s1_start = data.rfind(b'<script>', 0, s1_pos)
s1_end = data.find(b'</script>', s1_pos)
s2_pos = data.find(b'let dataManager = null')
s2_start = data.rfind(b'<script>', 0, s2_pos)
s2_end = data.find(b'</script>', s2_pos)

print("=== Curly/smart quotes in script blocks ===")
for seq, name in curly_seqs:
    idx = 0
    while True:
        idx = data.find(seq, idx)
        if idx == -1:
            break
        # Check if inside a script block
        in_s = 'S1' if s1_start <= idx <= s1_end else ('S2' if s2_start <= idx <= s2_end else None)
        if in_s:
            # Find line number
            line_num = data[:idx].count(b'\n') + 1
            line_start = data.rfind(b'\n', 0, idx) + 1
            line_end = data.find(b'\n', idx)
            line_ctx = data[line_start:line_end]
            print(f"{in_s} L{line_num}: {name} | {repr(line_ctx[:100])}")
        idx += len(seq)

print("\n=== Done ===")
