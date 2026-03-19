$f = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\EA2_Toolkit\AI Strategy Workbench V2.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
Write-Host "Length: $($c.Length)"

# Show window.onload section
$wol = $c.IndexOf("window.onload = () =>")
Write-Host "window.onload at: $wol"
if ($wol -ge 0) { Write-Host $c.Substring($wol, [Math]::Min(500,$c.Length-$wol)) }

Write-Host "==="

# Show getWardContextText
$gwc = $c.IndexOf("function getWardContextText()")
Write-Host "getWardContextText at: $gwc"
if ($gwc -ge 0) { Write-Host $c.Substring($gwc, [Math]::Min(600,$c.Length-$gwc)) }

Write-Host "==="

# Check if autoFillWardleyFromCapContext is present
$afwc = $c.IndexOf("async function autoFillWardleyFromCapContext")
Write-Host "autoFillWardleyFromCapContext at: $afwc"

# Check if importFromCapabilityIntegration(!forceFromCap is present
$ifci = $c.IndexOf("importFromCapabilityIntegration(!forceFromCap")
Write-Host "importFromCapabilityIntegration(!forceFromCap at: $ifci"
if ($ifci -ge 0) { Write-Host $c.Substring($ifci-50, 150) }

Write-Host "DONE"
