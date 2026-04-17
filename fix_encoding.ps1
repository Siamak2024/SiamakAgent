$file = 'c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\NexGenEA\EA2_Toolkit\EA_Engagement_Playbook.html'
$content = Get-Content $file -Raw

# Remove the duplicate malformed section between the two chat-input-container divs
$content = $content -replace '(?ms)<div id="chat-input-container">\s+<div class="message-text">[^<]*Hello.*?</div>\s+<div class="message-time">[^<]+</div>\s+</div>\s+</div>\s+</div>\s+(?=<div id="chat-input-container">)', ''

Set-Content $file $content -NoNewline

Write-Host "Fixed encoding and duplicate content"
