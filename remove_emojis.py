#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remove emojis from AI-generated content in EA Platform
Separates semantics from presentation - AI returns structure, UI decides icons
"""

import re

files_to_clean = [
    'NexGenEA/NexGen_EA_V4.html',
    'azure-deployment/static/NexGenEA/NexGen_EA_V4.html'
]

# Emoji patterns to remove from AI content (but keep console.log/toast for debugging)
# NOTE: Emojis stored as Unicode escapes like \ud83d\udd0d in HTML files
replacements = [
    # Welcome messages
    (r'Välkommen till EA Strategic Diagnostic \\ud83c\\udfaf', 'Välkommen till EA Strategic Diagnostic'),
    (r'\\u2713 Tydlig Strategic Intent', '• Tydlig Strategic Intent'),
    (r'\\u2713 EA Transformation Foundation', '• EA Transformation Foundation'),
    (r'\\u2713 Data- och AI-driven målarkitektur', '• Data- och AI-driven målarkitektur'),
    
    # Discovery Mode badges and messages
    (r'\*\*Discovery Mode: \$\{stepName\} \\ud83d\\udd0d\*\*', '**Discovery Mode: ${stepName}**'),
    (r'badge\.textContent = `\\ud83d\\udd0d \$\{stepName', 'badge.textContent = `${stepName'),
    (r"badge\.textContent = '\\ud83d\\udca1 General'", "badge.textContent = 'General'"),
    (r"badge\.textContent = '\\u26a1 Action'", "badge.textContent = 'Action'"),
    
    # Confirmation messages   
    (r'Fantastic! \\ud83c\\udfaf', 'Fantastic!'),
    (r'\*\*\\u2713 CxO Summary\*\*', '**CxO Summary**'),
    (r'\\u2713 CxO Summary', 'CxO Summary'),
    
    # Step completion messages (in addAssistantMessage calls, not toast/console.log)
    (r'addAssistantMessage\(`\*\*Step 1 — Strategic Intent generated\*\* \\u2713',
     'addAssistantMessage(`**Step 1 — Strategic Intent generated**'),
    (r'addAssistantMessage\(`\*\*Step 2 — Business Model Canvas generated\*\* \\u2713',
     'addAssistantMessage(`**Step 2 — Business Model Canvas generated**'),
    (r'addAssistantMessage\(`\*\*Step 4 — Operating Model generated\*\* \\u2713',
     'addAssistantMessage(`**Step 4 — Operating Model generated**'),
    (r'addAssistantMessage\(`\*\*Step 6 — Value Pools identified\*\* \\u2713',
     'addAssistantMessage(`**Step 6 — Value Pools identified**'),
    (r'addAssistantMessage\(`\*\*Step 7a — Target Architecture generated\*\* \\u2713',
     'addAssistantMessage(`**Step 7a — Target Architecture generated**'),
    (r'addAssistantMessage\(`\*\*Step 7b — Transformation Roadmap generated\*\* \\u2713',
     'addAssistantMessage(`**Step 7b — Transformation Roadmap generated**'),
    
    # Other AI messages
    (r"addAssistantMessage\('\\u2705 \\u00c4ndringen \u00e4r genomf\u00f6rd",
     "addAssistantMessage('Ändringen är genomförd"),
    (r"addAssistantMessage\('\\u2705",
     "addAssistantMessage('"),
    (r'addAssistantMessage\(`\\u2705 \*\*Organisationsbeskrivning sparad!',
     'addAssistantMessage(`**Organisationsbeskrivning sparad!'),
    (r'addAssistantMessage\(`\\u2705 \*\*Context analysed',
     'addAssistantMessage(`**Context analysed'),
    (r'click \*\*\\u2713 Confirm Step 1',
     'click **Confirm Step 1'),
    
    # Sync status badges
    (r"badge\.textContent = 'Synced \\u2714'",
     "badge.textContent = 'Synced'"),
    (r"status\.textContent = '\\u2713 Done'",
     "status.textContent = 'Done'"),
    
    # Re-run and Context Analysed messages (may be already cleaned in main file but not Azure)
    (r"addAssistantMessage\('\\u2705 \*\*Context analysed",
     "addAssistantMessage('**Context analysed"),
    
    # Button/link text with emoji in HTML or addAssistantMessage
    (r'\*\*\\u2713 Confirm Step 1\*\*',
     '**Confirm Step 1**'),
    
    # HTML UI Priority  action badge
    (r'<div class="text-\[9px\] font-bold text-amber-700 uppercase mb-2">\\ud83c\\udfaf Priority action</div>',
     '<div class="text-[9px] font-bold text-amber-700 uppercase mb-2">Priority action</div>'),
    
    # HTML UI elements (business area icons) - remove emojis, keep text
    (r'<div class="font-bold text-slate-700">\\ud83d\\udd37 Digitalisation</div>',
     '<div class="font-bold text-slate-700">Digitalisation</div>'),
    (r'<div class="font-bold text-slate-700">\\ud83d\\udca1 Innovation</div>',
     '<div class="font-bold text-slate-700">Innovation</div>'),
    (r'<div class="font-bold text-slate-700">\\ud83c\\udf31 Sustainability</div>',
     '<div class="font-bold text-slate-700">Sustainability</div>'),
    (r'<div class="font-bold text-slate-700">\\u2699\\ufe0f Process Optimisation</div>',
     '<div class="font-bold text-slate-700">Process Optimisation</div>'),
    (r'<div class="font-bold text-slate-700">\\ud83d\\udcca Data Governance</div>',
     '<div class="font-bold text-slate-700">Data Governance</div>'),
    
    # Button text
    (r'<span class="text-\[10px\]">\\u2713 Confirm Step 1 — Unlock BMC</span>',
     '<span class="text-[10px]">Confirm Step 1 — Unlock BMC</span>'),
]

# Additional patterns for status messages and icon assignments
additional_patterns = [
    (r"_setStep3Status\(`✓ Structure ready", r"_setStep3Status('Structure ready"),
    (r"_setStep3Status\(`✓ Done", r"_setStep3Status('Done"),
    (r"const icon = entry\.status === 'success' \? '✅' : '.'", 
     r"const icon = entry.status === 'success' ? 'Success' : 'Error'"),
]

replacements.extend(additional_patterns)

def remove_emojis_from_file(filepath):
    """Remove emojis from AI content in specified file"""
    print(f"\nProcessing: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes_made = 0
        
        for pattern, replacement in replacements:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                changes_made += 1
                print(f"  ✓ Replaced: {pattern[:60]}...")
                content = new_content
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ {changes_made} emoji patterns removed from {filepath}")
            return True
        else:
            print(f"ℹ️  No changes needed in {filepath}")
            return False
            
    except FileNotFoundError:
        print(f"❌ File not found: {filepath}")
        return False
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False

if __name__ == '__main__':
    print("="*60)
    print("Removing Emojis from AI-Generated Content")
    print("Principle: AI returns structure, UI decides icons")
    print("="*60)
    
    files_processed = 0
    for filepath in files_to_clean:
        if remove_emojis_from_file(filepath):
            files_processed += 1
    
    print("\n" + "="*60)
    print(f"✅ Complete! {files_processed}/{len(files_to_clean)} files updated")
    print("="*60)
