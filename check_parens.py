
f = open('EA2_Toolkit/EA20 Maturity Toolbox V2.html', 'rb')
data = f.read()
f.close()

text = data.decode('utf-8')

s1_start_byte = data.find(b'let matChatOpen')
s2_start_byte = data.find(b'let dataManager = null')
s1_end_byte = data.find(b'</script>', s1_start_byte)
s2_end_byte = data.find(b'</script>', s2_start_byte)

s1_text_start = len(data[:s1_start_byte].decode('utf-8'))
s1_text_end = len(data[:s1_end_byte].decode('utf-8'))
s2_text_start = len(data[:s2_start_byte].decode('utf-8'))
s2_text_end = len(data[:s2_end_byte].decode('utf-8'))

# Invisible / special Unicode chars that affect JS parsing
problem_chars = {
    '\u200B': 'ZERO_WIDTH_SPACE',
    '\u200C': 'ZERO_WIDTH_NON_JOINER',
    '\u200D': 'ZERO_WIDTH_JOINER',
    '\u200E': 'LTR_MARK',
    '\u200F': 'RTL_MARK',
    '\uFEFF': 'BOM/ZERO_WIDTH_NBSP',
    '\u00A0': 'NON_BREAKING_SPACE',
    '\u2028': 'LINE_SEPARATOR',
    '\u2029': 'PARA_SEPARATOR',
    '\u0000': 'NULL',
    '\u0085': 'NEL',
    '\u00AD': 'SOFT_HYPHEN',
    '\u202A': 'LTR_EMBED',
    '\u202B': 'RTL_EMBED',
    '\u202C': 'POP_DIR_FORMAT',
    '\u202D': 'LTR_OVERRIDE',
    '\u202E': 'RTL_OVERRIDE',
}

found = 0
for ch, name in problem_chars.items():
    idx = 0
    while True:
        idx = text.find(ch, idx)
        if idx == -1:
            break
        # Determine if in script block  
        in_s = 'S1' if s1_text_start <= idx <= s1_text_end else ('S2' if s2_text_start <= idx <= s2_text_end else ' ')
        if in_s in ('S1', 'S2'):
            # Get line number
            ln = text[:idx].count('\n') + 1
            ctx = text[max(0,idx-30):idx+30]
            print(f"{in_s} L{ln}: {name} (U+{ord(ch):04X}) | {repr(ctx)}")
            found += 1
        idx += 1

if found == 0:
    print("No invisible/special Unicode chars found in script blocks")

# Also try Python's 'try to parse as source' approach
# Count parens balance in each function to find unmatched ones
print("\n=== Parenthesis balance check in script 1 (lines 470-672) ===")
lines = text.split('\n')
depth = 0
in_string_single = False
in_string_double = False
in_template = False
in_line_comment = False
escape_next = False
for li in range(469, 672):
    line = lines[li]
    in_line_comment = False
    for ci, c in enumerate(line):
        if in_line_comment:
            break
        if escape_next:
            escape_next = False
            continue
        if c == '\\' and (in_string_single or in_string_double or in_template):
            escape_next = True
            continue
        if c == "'" and not in_string_double and not in_template:
            in_string_single = not in_string_single
        elif c == '"' and not in_string_single and not in_template:
            in_string_double = not in_string_double
        elif c == '`' and not in_string_single and not in_string_double:
            in_template = not in_template
        elif c == '/' and not in_string_single and not in_string_double and not in_template:
            if ci+1 < len(line) and line[ci+1] == '/':
                in_line_comment = True
                break
        elif not in_string_single and not in_string_double and not in_template:
            if c == '(':
                depth += 1
            elif c == ')':
                depth -= 1
                if depth < 0:
                    print(f"!!UNMATCHED ')' at L{li+1} col {ci+1}: {repr(line[:ci+10])}")
                    depth = 0

print(f"Final paren depth after script 1: {depth}")
print(f"String states: single={in_string_single} double={in_string_double} template={in_template}")
