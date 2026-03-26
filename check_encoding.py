
f = open('EA2_Toolkit/EA20 Maturity Toolbox V2.html', 'rb')
data = f.read()
f.close()

# Find script block boundaries
s1_pos = data.find(b'let matChatOpen')
s1_start = data.rfind(b'<script>', 0, s1_pos)
s1_end = data.find(b'</script>', s1_pos)
s2_pos = data.find(b'let dataManager = null')
s2_start = data.rfind(b'<script>', 0, s2_pos)
s2_end = data.find(b'</script>', s2_pos)

# Check for invalid UTF-8 sequences
print("=== Invalid UTF-8 byte sequences ===")
i = 0
invalid_count = 0
while i < len(data):
    b = data[i]
    if b < 0x80:  # ASCII
        i += 1
    elif b < 0xC0:  # Unexpected continuation byte
        # Find line number
        ln = data[:i].count(b'\n') + 1
        in_s = 'S1' if s1_start <= i <= s1_end else ('S2' if s2_start <= i <= s2_end else ' ')
        ctx = data[max(0,i-10):i+10]
        print(f"LONE_CONTINUATION {in_s} L{ln} byte=0x{b:02X}: {repr(ctx)}")
        invalid_count += 1
        i += 1
    elif b < 0xE0:  # 2-byte sequence
        if i+1 >= len(data) or (data[i+1] & 0xC0) != 0x80:
            ln = data[:i].count(b'\n') + 1
            in_s = 'S1' if s1_start <= i <= s1_end else ('S2' if s2_start <= i <= s2_end else ' ')
            print(f"BAD_2BYTE {in_s} L{ln}: 0x{b:02X} 0x{data[i+1]:02X}")
            invalid_count += 1
        i += 2
    elif b < 0xF0:  # 3-byte sequence
        if i+2 >= len(data) or (data[i+1] & 0xC0) != 0x80 or (data[i+2] & 0xC0) != 0x80:
            ln = data[:i].count(b'\n') + 1
            in_s = 'S1' if s1_start <= i <= s1_end else ('S2' if s2_start <= i <= s2_end else ' ')
            print(f"BAD_3BYTE {in_s} L{ln}: 0x{b:02X}")
            invalid_count += 1
        i += 3
    else:  # 4-byte sequence
        if i+3 >= len(data) or (data[i+1] & 0xC0) != 0x80 or (data[i+2] & 0xC0) != 0x80 or (data[i+3] & 0xC0) != 0x80:
            ln = data[:i].count(b'\n') + 1
            in_s = 'S1' if s1_start <= i <= s1_end else ('S2' if s2_start <= i <= s2_end else ' ')
            print(f"BAD_4BYTE {in_s} L{ln}: 0x{b:02X}")
            invalid_count += 1
        i += 4

if invalid_count == 0:
    print("No invalid UTF-8 sequences found!")
else:
    print(f"\nTotal invalid sequences: {invalid_count}")

# Also scan for isolated Windows-1252 special chars (0x80-0x9F range)
print("\n=== Windows-1252 special chars (0x80-0x9F range as isolated bytes) ===")
found = []
i = 0
while i < len(data):
    b = data[i]
    if 0xC0 <= b <= 0xF7:  # UTF-8 start of multi-byte
        seq_len = 2 if b < 0xE0 else (3 if b < 0xF0 else 4)
        i += seq_len
    elif 0x80 <= b <= 0x9F:  # Windows-1252 special range
        ln = data[:i].count(b'\n') + 1
        in_s = 'S1' if s1_start <= i <= s1_end else ('S2' if s2_start <= i <= s2_end else ' ')
        ctx = data[max(0,i-15):i+15]
        print(f"CP1252 {in_s} L{ln}: 0x{b:02X} | {repr(ctx)}")
        found.append((ln, b))
        i += 1
    else:
        i += 1

if not found:
    print("No Windows-1252 special chars found")
