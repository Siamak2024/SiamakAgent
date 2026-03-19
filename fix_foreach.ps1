$f = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\EA2_Toolkit\AI Strategy Workbench V2.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# Find the broken forEach close and fix it
$oldPattern = "        window.addEventListener('resize', renderNodes);`n    };"
$newPattern = "        window.addEventListener('resize', renderNodes);`n    });`n    return text;`n}"

$c = $c.Replace($oldPattern, $newPattern)

# Save
[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "Fixed forEach closure"
