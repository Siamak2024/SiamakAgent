$f = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\EA2_Toolkit\AI Strategy Workbench V2.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# ----- FIX 3: getWardContextText forEach -----
# The forEach has misplaced code - find it by unique anchor and replace

$forEachOld = @'
        const vis = c.y < 30 ? 'H'@ + [char]0xC3 + [char]0xB6 + @'g synlighet' : c.y < 60 ? 'Medel synlighet' : 'L'@ + [char]0xC3 + [char]0xA5 + @'g synlighet';
        text += `- ${c.name} | ${c.category} | ${evo} | ${vis}${c.note ? ' | ' + c.note : ''}\n`;
'@

# Simpler approach: just check for the pattern by using substring search
$searchStart = $c.IndexOf("        const vis = c.y < 30 ? 'H")
Write-Host "Found vis line at: $searchStart"

# Find the end of the problematic forEach block (};)
$forEachClose = "        window.addEventListener('resize', renderNodes);" + [System.Environment]::NewLine + "    };"
$searchEnd = $c.IndexOf($forEachClose, $searchStart)
Write-Host "Found forEach close at: $searchEnd"

if ($searchStart -gt 0 -and $searchEnd -gt $searchStart) {
    $beforeFix = $c.Substring($searchStart, $searchEnd - $searchStart + $forEachClose.Length)
    Write-Host "Block to replace length: $($beforeFix.Length)"
    Write-Host "First 100 chars: $($beforeFix.Substring(0, [Math]::Min(100, $beforeFix.Length)))"
    
    # The replacement: clean forEach body + close + return + close function
    $afterFix = "        const vis = c.y < 30 ? 'H`u{00F6}g synlighet' : c.y < 60 ? 'Medel synlighet' : 'L`u{00E5}g synlighet';" + `
                "`n        text += ``- `${c.name} | `${c.category} | `${evo} | `${vis}`${c.note ? ' | ' + c.note : ''}\\n``;" + `
                "`n    });" + `
                "`n    return text;" + `
                "`n}"
    
    $c = $c.Remove($searchStart, $searchEnd - $searchStart + $forEachClose.Length).Insert($searchStart, $afterFix)
    Write-Host "Fix 3 applied!"
} else {
    Write-Host "ERROR: Could not find the forEach block to fix"
    Write-Host "SearchStart=$searchStart, SearchEnd=$searchEnd"
}

# ----- FIX 5: wardSystemPrompt broken template literal -----
# Find the premature closing backtick and fix it
$prematureClose = "mer strategiskt relevanta.``;"
$prematureIdx = $c.IndexOf($prematureClose)
Write-Host "Found premature wardSystemPrompt close at: $prematureIdx"

if ($prematureIdx -gt 0) {
    # Find the start of the orphaned text (Evolution-axeln)
    $orphanedStart = $c.IndexOf("Evolution-axeln (x, 0-99):", $prematureIdx)
    Write-Host "Found orphaned text start at: $orphanedStart"
    
    # Find the final correct closing backtick (end of the orphaned text)
    $finalClose = "capability map``;"
    $finalCloseIdx = $c.IndexOf($finalClose, $orphanedStart)
    Write-Host "Found final close at: $finalCloseIdx"
    
    if ($orphanedStart -gt 0 -and $finalCloseIdx -gt $orphanedStart) {
        # The region from prematureClose to finalClose+length needs to become one unified string
        # Remove the premature close (the backtick+semicolon at end of "mer strategiskt relevanta.`;"`)
        # ... and the orphaned text becomes part of the template literal
        
        $oldBlock = $c.Substring($prematureIdx, $finalCloseIdx - $prematureIdx + $finalClose.Length)
        Write-Host "Old wardSystemPrompt tail (first 200):"
        Write-Host $oldBlock.Substring(0, [Math]::Min(200, $oldBlock.Length))
        
        # Replace: remove premature close, fix orphaned text, keep final close
        # The orphaned text is everything between "mer strategiskt relevanta.`;" and the final "`;
        # We want: "mer strategiskt relevanta.\n\nEvolution-axeln...capability map`;"
        
        $orphanedContent = $c.Substring($orphanedStart, $finalCloseIdx - $orphanedStart + $finalClose.Length)
        
        $newBlock = "mer strategiskt relevanta.`n`n" + $orphanedContent.TrimStart()
        # Fix mojibake in the orphaned content
        $newBlock = $newBlock.Replace("skr" + [char]0xC3 + [char]0xA4 + "ddarsydd", "skr`u{00E4}ddarsydd")
        $newBlock = $newBlock.Replace("H" + [char]0xC3 + [char]0xB6 + "g synlighet", "H`u{00F6}g synlighet")
        $newBlock = $newBlock.Replace("kundv" + [char]0xC3 + [char]0xA4 + "rde", "kundv`u{00E4}rde")
        $newBlock = $newBlock.Replace("L" + [char]0xC3 + [char]0xA5 + "g synlighet", "L`u{00E5}g synlighet")
        $newBlock = $newBlock.Replace("fr" + [char]0xC3 + [char]0xA5 + "n capability map", "fr`u{00E5}n capability map")
        
        $c = $c.Remove($prematureIdx, $oldBlock.Length).Insert($prematureIdx, $newBlock)
        Write-Host "Fix 5 applied!"
    } else {
        Write-Host "ERROR: Could not find orphaned wardSystemPrompt text"
    }
} else {
    Write-Host "ERROR: Could not find premature wardSystemPrompt close"
}

# ----- FIX 6: sendWardInitialGreeting declaration -----
$orphanedIfBlock = "    }" + [System.Environment]::NewLine + "    if (total === 0) {"
$orphanedIfIdx = $c.IndexOf($orphanedIfBlock)
Write-Host "Found orphaned sendWardInitialGreeting body at: $orphanedIfIdx"

# Verify it's the right one (context check)
if ($orphanedIfIdx -gt 0) {
    $ctx = $c.Substring([Math]::Max(0, $orphanedIfIdx - 100), 200)
    Write-Host "Context: $ctx"
    
    $declBlock = "    }" + [System.Environment]::NewLine + `
                 "}" + [System.Environment]::NewLine + `
                 "" + [System.Environment]::NewLine + `
                 "function sendWardInitialGreeting() {" + [System.Environment]::NewLine + `
                 "    const total = components.length;" + [System.Environment]::NewLine + `
                 "    const genesis = components.filter(c => c.x < 25).length;" + [System.Environment]::NewLine + `
                 "    const commodity = components.filter(c => c.x >= 75).length;" + [System.Environment]::NewLine + `
                 "    if (total === 0) {"
    
    $c = $c.Remove($orphanedIfIdx, $orphanedIfBlock.Length).Insert($orphanedIfIdx, $declBlock)
    Write-Host "Fix 6 applied!"
} else {
    Write-Host "ERROR: Could not locate orphaned sendWardInitialGreeting body"
}

# Save
[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "File saved!"
