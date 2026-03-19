$f = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\EA2_Toolkit\AI Strategy Workbench V2.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
Write-Host "Length: $($c.Length)"

# Find ALL occurrences of const vis = c.y
$ix = 0
$count = 0
while ($true) {
    $ix = $c.IndexOf("const vis = c.y", $ix)
    if ($ix -lt 0) { break }
    $count++
    Write-Host "const vis at $ix : $($c.Substring($ix, [Math]::Min(80,$c.Length-$ix)))"
    $ix += 10
}
Write-Host "Total 'const vis' occurrences: $count"

Write-Host "---"
# Find what is around char 70949
$idx70 = 70949
if ($idx70 -lt $c.Length) {
    Write-Host "Content at char 70949 (context):"
    $st = [Math]::Max(0,$idx70-50)
    Write-Host $c.Substring($st, [Math]::Min(200,$c.Length-$st))
}

Write-Host "---"
# Check if window.onload exists in any form
$ixWol = $c.IndexOf("window.onload")
Write-Host "window.onload at: $ixWol"
if ($ixWol -ge 0) { Write-Host $c.Substring($ixWol, [Math]::Min(200,$c.Length-$ixWol)) }

Write-Host "---"
# Check sendWardMessage (should be near end)
$ixSwm = $c.IndexOf("async function sendWardMessage(")
Write-Host "sendWardMessage at: $ixSwm"

Write-Host "DONE"
