with open(r'NexGenEA\NexGen_EA_V4.html','rb') as f:
    d = f.read()

for label in [b'clear-chat', b'minimize-chat', b'close-chat" onclick']:
    idx = d.find(label)
    if idx == -1:
        print(f"NOT FOUND: {label}")
        continue
    start = d.rfind(b'\n', 0, idx) + 1
    end = d.find(b'\n', idx)
    line = d[start:end]
    print(f"\n--- {label} ---")
    print(repr(line))
