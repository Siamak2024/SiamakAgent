$f = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\EA2_Toolkit\AI Strategy Workbench V2.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
Write-Host "=== File verification ==="
Write-Host "Length: $($c.Length)"
Write-Host "Fix1 allowStale: $($c.Contains('allowStale = false'))"
Write-Host "Fix2 forceFromCap in onload: $($c.Contains('const forceFromCap = wardParams.get'))"
Write-Host "Fix3 return text: $($c.Contains('return text;'))"
Write-Host "Fix3 forEach closed: $($c.Contains('});' + [System.Environment]::NewLine + '    return text;'))"
Write-Host "Fix5 wardPrompt fixed: $($c.Contains('Evolution-axeln (x, 0-99)'))"
Write-Host "Fix6 sendWardInitialGreeting: $($c.Contains('function sendWardInitialGreeting('))"
Write-Host ""

# Check Fix3 context
$idx = $c.IndexOf("return text;")
if ($idx -ge 0) {
    Write-Host "Fix3 context (30 chars before + 50 chars after 'return text;'):"
    $st = [Math]::Max(0, $idx - 40)
    Write-Host $c.Substring($st, [Math]::Min(100, $c.Length - $st))
}

# Check Fix5 - wardSystemPrompt
$premIdx = $c.IndexOf("mer strategiskt relevanta.")
if ($premIdx -ge 0) {
    Write-Host ""
    Write-Host "wardSystemPrompt fix context (80 chars around 'strategiskt relevanta.'):"
    $st5 = [Math]::Max(0, $premIdx - 5)
    Write-Host $c.Substring($st5, [Math]::Min(150, $c.Length - $st5))
}

# Check Fix6 - sendWardInitialGreeting
$sgIdx = $c.IndexOf("function sendWardInitialGreeting(")
if ($sgIdx -ge 0) {
    Write-Host ""
    Write-Host "sendWardInitialGreeting context:"
    Write-Host $c.Substring($sgIdx, [Math]::Min(200, $c.Length - $sgIdx))
}

Write-Host "=== END ==="
