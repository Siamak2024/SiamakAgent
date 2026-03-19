$f = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\EA2_Toolkit\AI Strategy Workbench V2.html"
$enc = [System.Text.Encoding]::UTF8
$c = [System.IO.File]::ReadAllText($f, $enc)

$OrigLen = $c.Length

# Helper: report position
function Pos($text, $search, $from=0) {
    $idx = $text.IndexOf($search, $from)
    return $idx
}

# ================================================================
# FIX 3: Clean getWardContextText forEach
# ================================================================
# Find the start of the problematic vis line
$visAnchor = "        const vis = c.y < 30 ? 'H"
$visStart = Pos $c $visAnchor
Write-Host "vis line at char index: $visStart"

# Find the end marker: the broken forEach close
$forEachCloseAnchor = "        window.addEventListener('resize', renderNodes);" + "`r`n" + "    };"
$forEachCloseIdx = Pos $c $forEachCloseAnchor $visStart
if ($forEachCloseIdx -lt 0) {
    # Try with LF only
    $forEachCloseAnchor = "        window.addEventListener('resize', renderNodes);" + "`n" + "    };"
    $forEachCloseIdx = Pos $c $forEachCloseAnchor $visStart
}
Write-Host "forEach close at char index: $forEachCloseIdx"

if ($visStart -ge 0 -and $forEachCloseIdx -gt $visStart) {
    $oldBlockLen = $forEachCloseIdx - $visStart + $forEachCloseAnchor.Length
    
    # Build replacement using here-string (avoids backtick/dollar escaping issues)
    # We use [char] for Swedish chars
    $visLine = "        const vis = c.y < 30 ? 'H" + [char]0x00F6 + "g synlighet' : c.y < 60 ? 'Medel synlighet' : 'L" + [char]0x00E5 + "g synlighet';"
    $textLine = "        text += `` ``- " + '${c.name}' + " | " + '${c.category}' + " | " + '${evo}' + " | " + '${vis}' + '${c.note ? ' + "' | ' + c.note : ''}" + "\n``;"
    
    # Actually, the text += line uses backtick template literal. Let's use a file approach.
    # Write the exact replacement text to a temp file
    $NL = "`n"
    if ($c.Contains("`r`n")) { $NL = "`r`n" }
    
    $repl = $visLine + $NL
    $repl += "        text += `` ``- " + '${c.name}' + " | " + '${c.category}' + " | " + '${evo}' + " | " + '${vis}' + '${c.note ? ' + "' | ' + c.note : ''}" + "\\n``;" + $NL
    $repl += "    });" + $NL
    $repl += "    return text;" + $NL
    $repl += "}"
    
    $c = $c.Remove($visStart, $oldBlockLen).Insert($visStart, $repl)
    Write-Host "Fix 3 applied! Length change: $($c.Length - $OrigLen)"
    $OrigLen = $c.Length
} else {
    Write-Host "ERROR Fix 3: vis=$visStart, close=$forEachCloseIdx"
}

# ================================================================
# FIX 5: wardSystemPrompt broken template literal
# ================================================================
# The premature close is: "mer strategiskt relevanta.`;"
$prematureContextBefore = "mer strategiskt relevanta."
$prematureContext = $prematureContextBefore + "``;"
$premIdx = Pos $c $prematureContext
Write-Host "Premature wardSystemPrompt close at: $premIdx"

if ($premIdx -ge 0) {
    # After the premature close, there's orphaned text. Find where the CORRECT close is.
    $correctClose = "capability map``;"
    $correctCloseIdx = Pos $c $correctClose ($premIdx + 10)
    Write-Host "Correct close at: $correctCloseIdx"
    
    if ($correctCloseIdx -gt $premIdx) {
        # The region: from prematureContextBefore.Length + premIdx + 2 (for backtick+semicolon)
        # to correctCloseIdx + correctClose.Length
        # The premature close is "...relevanta.`;" - we want to REMOVE just the "`;"
        # and keep only the content, then include the orphaned text
        
        $afterPremClose = $premIdx + $prematureContext.Length
        $orphanedText = $c.Substring($afterPremClose, $correctCloseIdx - $afterPremClose + $correctClose.Length)
        Write-Host "Orphaned text (first 200): $($orphanedText.Substring(0, [Math]::Min(200, $orphanedText.Length)))"
        
        # The orphaned text starts with newline(s) then "Evolution-axeln..."
        # We want: remove the premature "``;" and keep the orphaned text going
        # BUT we need to fix mojibake in the orphaned text
        
        # Fix mojibake chars in the orphaned section
        $fixedOrphan = $orphanedText
        # skrÃ¤ddarsydd -> skräddarsydd: Ã (0xC3) + ¤ (0xA4) -> ä (0xE4)
        $fixedOrphan = $fixedOrphan.Replace([char]0x00C3 + [char]0x00A4, [char]0x00E4)
        # HÃ¶g synlighet: Ã (0xC3) + ¶ (0xB6) -> ö (0xF6) 
        $fixedOrphan = $fixedOrphan.Replace([char]0x00C3 + [char]0x00B6, [char]0x00F6)
        # kundvÃ¤rde: same pattern -> ä
        # (already covered by Ã¤ -> ä above)
        # LÃ¥g synlighet, frÃ¥n: Ã (0xC3) + ¥ (0xA5) -> å (0xE5)
        $fixedOrphan = $fixedOrphan.Replace([char]0x00C3 + [char]0x00A5, [char]0x00E5)
        
        # The region to replace: from "``;" at premature close through end of orphaned text
        $backtickSemicolon = "``;"
        $totalOldLen = $backtickSemicolon.Length + $orphanedText.Length
        
        # New content: keep the orphaned text (fixed) so it's part of the template literal,
        # ending with "capability map``;"
        # We just remove the premature backtick+semicolon and let orphaned text flow in
        $c = $c.Remove($premIdx + $prematureContextBefore.Length, $totalOldLen)
            .Insert($premIdx + $prematureContextBefore.Length, $fixedOrphan)
        
        Write-Host "Fix 5 applied! Length change: $($c.Length - $OrigLen)"
        $OrigLen = $c.Length
    } else {
        Write-Host "ERROR Fix 5: correctClose not found"
    }
} else {
    Write-Host "ERROR Fix 5: premature close not found with: $prematureContext"
    # Try alternate search
    $alt = "strategiskt relevanta"
    $altIdx = Pos $c $alt
    Write-Host "Alternate search at: $altIdx"
    $ctx = $c.Substring([Math]::Max(0, $altIdx-5), 100)
    Write-Host "Context: $ctx"
}

# ================================================================
# FIX 6: sendWardInitialGreeting - add function declaration
# ================================================================
# Find the orphaned body: after autoFillWardleyFromCapContext closes, "    if (total === 0) {"
$NL2 = if ($c.Contains("`r`n")) { "`r`n" } else { "`n" }
$orphanedBodyPattern = $NL2 + "    if (total === 0) {"
$orphanedBodyIdx = Pos $c $orphanedBodyPattern
Write-Host "Orphaned sendWardInitialGreeting body at: $orphanedBodyIdx"

# Verify context (should have "    }" closing autoFillWardleyFromCapContext just before)
if ($orphanedBodyIdx -gt 0) {
    $ctx = $c.Substring([Math]::Max(0, $orphanedBodyIdx - 100), 200)
    Write-Host "Context around orphaned body: $ctx"
    
    # We want to insert function declaration + vars BEFORE "    if (total === 0) {"
    $insertAt = $orphanedBodyIdx + $NL2.Length  # after the newline, before "    if"
    
    $declaration = "}" + $NL2 + $NL2 + "function sendWardInitialGreeting() {" + $NL2 + `
                   "    const total = components.length;" + $NL2 + `
                   "    const genesis = components.filter(c => c.x < 25).length;" + $NL2 + `
                   "    const commodity = components.filter(c => c.x >= 75).length;" + $NL2
    
    $c = $c.Insert($insertAt, $declaration)
    Write-Host "Fix 6 applied! Length change: $($c.Length - $OrigLen)"
    $OrigLen = $c.Length
} else {
    Write-Host "ERROR Fix 6: orphaned body not found"
    # Try alternate
    $altPat = "    if (total === 0) {"
    $altIdx = Pos $c $altPat
    Write-Host "Direct search result: $altIdx"
}

# ================================================================
# Save the file
# ================================================================
[System.IO.File]::WriteAllText($f, $c, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "File saved. Total length: $($c.Length)"
Write-Host "DONE"
