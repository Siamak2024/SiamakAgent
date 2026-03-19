$f = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\EA2_Toolkit\AI Strategy Workbench V2.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
Write-Host "Length: $($c.Length)"
$r1 = $c.Contains("allowStale = false")
$r2 = $c.Contains("const forceFromCap = wardParams.get")
$r3 = $c.Contains("return text;")
$r4 = $c.Contains("Evolution-axeln (x, 0-99)")
$r5 = $c.Contains("function sendWardInitialGreeting(")
$r6 = $c.Contains("importFromCapabilityIntegration(!forceFromCap, forceFromCap)")
Write-Host "Fix1 allowStale: $r1"
Write-Host "Fix2 forceFromCap-onload: $r2"
Write-Host "Fix3 return-text: $r3"
Write-Host "Fix5 Evolution-axeln in prompt: $r4"
Write-Host "Fix6 sendWardInitialGreeting: $r5"
Write-Host "Fix2b importFromCap-allowStale-call: $r6"
$idx3 = $c.IndexOf("return text;")
if ($idx3 -ge 0) {
    $st = [Math]::Max(0,$idx3-50)
    $seg = $c.Substring($st, [Math]::Min(120,$c.Length-$st))
    Write-Host "---Fix3 context---"
    Write-Host $seg
}
$idx5 = $c.IndexOf("mer strategiskt relevanta.")
if ($idx5 -ge 0) {
    $seg = $c.Substring($idx5, [Math]::Min(200,$c.Length-$idx5))
    Write-Host "---Fix5 context---"
    Write-Host $seg
}
Write-Host "DONE"
