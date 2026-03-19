$f = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\EA2_Toolkit\AI Strategy Workbench V2.html"
$enc = New-Object System.Text.UTF8Encoding($false)
$c = [System.IO.File]::ReadAllText($f, $enc)

$NL = if ($c.Contains("`r`n")) { "`r`n" } else { "`n" }
Write-Host "File length: $($c.Length), NewLine: $(if ($NL -eq "`r`n") { 'CRLF' } else { 'LF' })"

# Convenience chars
$o = [string][char]0x00F6  # ö
$a = [string][char]0x00E5  # å

# ================================================================
# FIX 3: Clean up getWardContextText
#   - Remove misplaced code (wardParams, forceFromCap, importFromCapabilityIntegration,
#     saved localStorage, forceFromCap check, window.addEventListener)
#   - Fix mojibake in const vis line
#   - Close forEach with }); 
#   - Add return text;
#   - Close function with }
# ================================================================

$visAnchor = "        const vis = c.y < 30 ? 'H"
$visStart = $c.IndexOf($visAnchor)
Write-Host "const-vis starts at index: $visStart"

$forEachEndAnchor = "        window.addEventListener('resize', renderNodes);" + $NL + "    };"
$forEachEndIdx = $c.IndexOf($forEachEndAnchor, $visStart)
Write-Host "forEach close block at index: $forEachEndIdx"

if ($visStart -ge 0 -and $forEachEndIdx -gt $visStart) {
    $oldLen3 = $forEachEndIdx - $visStart + $forEachEndAnchor.Length
    Write-Host "Fix3 old block length: $oldLen3"

    # Build the one-backtick char
    $BT = "``"  # ONE literal backtick in PS double-quoted

    # const vis line (fixed mojibake: ö and å)
    $newVis = "        const vis = c.y < 30 ? 'H" + $o + "g synlighet' : c.y < 60 ? 'Medel synlighet' : 'L" + $a + "g synlighet';"

    # text += line: text += `- ${c.name} | ${c.category} | ${evo} | ${vis}${c.note ? ' | ' + c.note : ''}\n`;
    $jsContent = "- " + '${c.name}' + " | " + '${c.category}' + " | " + '${evo}' + " | " + '${vis}' + '${c.note ? ' + "' | ' + c.note : ''}" + '\n'
    $newTextLine = "        text += " + $BT + $jsContent + $BT + ";"

    $newBlock = $newVis + $NL + $newTextLine + $NL + "    });" + $NL + "    return text;" + $NL + "}"
    
    $c = $c.Remove($visStart, $oldLen3).Insert($visStart, $newBlock)
    Write-Host "Fix 3 applied. New file length: $($c.Length)"
} else {
    Write-Host "ERROR Fix3: visStart=$visStart forEachEndIdx=$forEachEndIdx"
    # Debug
    $idx2 = $c.IndexOf("window.addEventListener('resize', renderNodes)")
    Write-Host "  addEventListener found at: $idx2"
}

# ================================================================
# FIX 5: wardSystemPrompt broken template literal
#   - Remove the premature closing backtick+semicolon after "mer strategiskt relevanta."
#   - Fix mojibake in the orphaned content
#   - The orphaned text becomes part of the template literal (ends at "capability map`;")
# ================================================================

$premCtxBefore = "mer strategiskt relevanta."
$premClose = $premCtxBefore + "``" + ";"   # = "mer strategiskt relevanta.`;"
$premIdx = $c.IndexOf($premClose)
Write-Host "wardSystemPrompt premature close at: $premIdx"

if ($premIdx -ge 0) {
    $afterPrem = $premIdx + $premCtxBefore.Length + 2  # +2 for backtick + semicolon
    
    # Find the CORRECT ending: "capability map`;"
    $correctCloseStr = "capability map``" + ";"   # = "capability map`;"
    $correctCloseIdx = $c.IndexOf($correctCloseStr, $premIdx + 10)
    Write-Host "Correct wardSystemPrompt close at: $correctCloseIdx"
    
    if ($correctCloseIdx -gt $premIdx) {
        $orphanLen = $correctCloseIdx - $afterPrem + $correctCloseStr.Length
        $orphanedText = $c.Substring($afterPrem, $orphanLen)
        Write-Host "Orphaned text length: $($orphanedText.Length), first 80: $($orphanedText.Substring(0,[Math]::Min(80,$orphanedText.Length)))"
        
        # Fix mojibake in orphaned content
        $ac3 = [string][char]0x00C3  # Ã
        $fixedOrphan = $orphanedText
        $fixedOrphan = $fixedOrphan.Replace($ac3 + [string][char]0x00A4, [string][char]0x00E4)  # Ã¤ -> ä
        $fixedOrphan = $fixedOrphan.Replace($ac3 + [string][char]0x00B6, [string][char]0x00F6)  # Ã¶ -> ö
        $fixedOrphan = $fixedOrphan.Replace($ac3 + [string][char]0x00A5, [string][char]0x00E5)  # Ã¥ -> å
        
        # Remove: premature "`;" (2 chars) + orphaned text, insert: fixed orphaned text
        $removeSt = $premIdx + $premCtxBefore.Length  # position of the premature backtick
        $removeLen = 2 + $orphanLen                    # backtick+semicolon + orphanedText
        
        $c = $c.Remove($removeSt, $removeLen).Insert($removeSt, $fixedOrphan)
        Write-Host "Fix 5 applied. New file length: $($c.Length)"
    } else {
        Write-Host "ERROR Fix5: correctClose not found (correctCloseIdx=$correctCloseIdx)"
        # Debug: show context
        Write-Host "Context after premature close: $($c.Substring($premIdx, [Math]::Min(200, $c.Length - $premIdx)))"
    }
} else {
    Write-Host "ERROR Fix5: premature close not found"
    $altIdx = $c.IndexOf("strategiskt relevanta")
    Write-Host "  'strategiskt relevanta' at: $altIdx"
    if ($altIdx -ge 0) { Write-Host "  Context: $($c.Substring($altIdx, [Math]::Min(100, $c.Length - $altIdx)))" }
}

# ================================================================
# FIX 6: Add sendWardInitialGreeting function declaration
#   Insert declaration before the orphaned "    if (total === 0) {"
# ================================================================

# Anchor: the orphaned body follows the close of autoFillWardleyFromCapContext
$orphanAnchor = "        }" + $NL + "    }" + $NL + "    if (total === 0) {"
$orphanIdx = $c.IndexOf($orphanAnchor)
Write-Host "sendWardInitialGreeting orphaned body at: $orphanIdx"

if ($orphanIdx -ge 0) {
    # Context check
    $ctxStart = [Math]::Max(0, $orphanIdx - 50)
    Write-Host "Context: $($c.Substring($ctxStart, [Math]::Min(200, $c.Length - $ctxStart)))"
    
    # Insert function declaration before "    if (total === 0) {",
    # i.e., after "        }" + NL + "    }" + NL
    $insertAt = $orphanIdx + ("        }" + $NL + "    }" + $NL).Length
    
    $declaration = $NL + "function sendWardInitialGreeting() {" + $NL + `
                   "    const total = components.length;" + $NL + `
                   "    const genesis = components.filter(c => c.x < 25).length;" + $NL + `
                   "    const commodity = components.filter(c => c.x >= 75).length;" + $NL
    
    $c = $c.Insert($insertAt, $declaration)
    Write-Host "Fix 6 applied. New file length: $($c.Length)"
} else {
    Write-Host "ERROR Fix6: orphaned body anchor not found"
    # Try simpler search
    $simpleOrphan = "    if (total === 0) {"
    $simpleIdx = $c.IndexOf($simpleOrphan)
    Write-Host "  Simple search '    if (total === 0) {' at: $simpleIdx"
    if ($simpleIdx -ge 0) {
        Write-Host "  Context: $($c.Substring([Math]::Max(0,$simpleIdx-100), 250))"
    }
}

# ================================================================
# Save
# ================================================================
[System.IO.File]::WriteAllText($f, $c, $enc)
Write-Host "=== File saved. Final length: $($c.Length) ==="
Write-Host "DONE"
