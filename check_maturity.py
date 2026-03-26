
f = open('EA2_Toolkit/EA20 Maturity Toolbox V2.html', 'rb')
data = f.read()
f.close()

# Find the two script blocks by their approximate byte positions
# Script block 1 starts after <script> near line 469
s1_marker = b'let matChatOpen'
s1_pos = data.find(s1_marker)
s1_start = data.rfind(b'<script>', 0, s1_pos)
s1_end = data.find(b'</script>', s1_pos)

# Script block 2
s2_marker = b'let dataManager = null'
s2_pos = data.find(s2_marker)
s2_start = data.rfind(b'<script>', 0, s2_pos)
s2_end = data.find(b'</script>', s2_pos)

print(f'Script1: bytes {s1_start}-{s1_end}')
print(f'Script2: bytes {s2_start}-{s2_end}')

found_any = False
for name, start, end in [('S1', s1_start, s1_end), ('S2', s2_start, s2_end)]:
    chunk = data[start:end]
    lines = chunk.split(b'\n')
    for i, line in enumerate(lines):
        for j, b in enumerate(line):
            if b > 127:
                found_any = True
                ctx = line[max(0,j-30):j+30]
                print(f'{name} line {i+1} col {j+1}: 0x{b:02X} | {repr(ctx)}')
                break  # only first non-ASCII per line

if not found_any:
    print("No non-ASCII bytes found in script blocks!")

# Now find what's at browser line 622 and 936
# The browser counts lines from start of file
all_lines = data.split(b'\n')
print(f'\nTotal lines: {len(all_lines)}')
print(f'Browser L622: {repr(all_lines[621][:80])}')
print(f'Browser L936: {repr(all_lines[935][:80])}')
# Show surrounding lines for context
for li in range(619, 625):
    print(f'L{li+1}: {repr(all_lines[li][:100])}')
