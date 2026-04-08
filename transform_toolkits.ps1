# EA Toolkit Transformation — Final Version
# Translates Swedish to English, removes duplicate headings, applies full-width layout
# STRUCTURAL changes use -replace (regex, (?s) dotall); TEXT changes use .Replace() single-line only

Set-StrictMode -Off
$base = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\NexGenEA\EA2_Toolkit"
$r  = [char]0xFFFD  # U+FFFD — garbled char in Strategy Workbench (replaces Swedish a/o/a chars)
$bt = [char]96      # backtick — for building JS template literal strings
$ds = '$'           # dollar sign — to embed JS ${var} in PS double-quoted strings
$nl = "`n"          # newline

function Trans($c, $pairs) {
    foreach ($p in $pairs) { $c = $c.Replace($p[0], $p[1]) }
    return $c
}

# ============================================================================================
# 1. VALUE CHAIN ANALYZER V2.html
# ============================================================================================
Write-Host "Processing AI Value Chain Analyzer V2.html..."
$f = "$base\AI Value Chain Analyzer V2.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# STRUCTURAL: Remove duplicate heading (from <!-- Header --> through button-wrapper opening)
$c = $c -replace '(?s)<!--\s*Header\s*-->\s*<div class="flex flex-col[^"]*">\s*<div>\s*<h1[^>]*>.*?</h1>\s*<p[^>]*>.*?</p>\s*</div>\s*<div class="flex gap-3 flex-wrap items-center">', '<div class="flex flex-wrap gap-3 mb-5 items-center">'
# STRUCTURAL: Remove orphaned outer-flex </div> now between button-bar and vc-mode-banner
$c = $c -replace '(Generera EA Tool-rapport\r?\n            </button>\r?\n        </div>)\r?\n    </div>(\r?\n\r?\n    <div id="vc-mode-banner")', '$1$2'
# STRUCTURAL: Full-width layout
$c = $c.Replace('<div class="max-w-7xl mx-auto">', '<div class="w-full">')

$c = Trans $c @(
    @('<html lang="sv">', '<html lang="en">'),
    @('<title>AI Value Chain Analyzer', '<title>Value Chain Analyzer'),
    @('<h1><i class="fas fa-link"></i>AI Value Chain Analyzer</h1>', '<h1><i class="fas fa-link"></i>Value Chain Analyzer</h1>'),
    @('title="Gå till nästa verktyg: AI Capability Mapping"', 'title="Go to next tool: Capability Mapping"'),
    @('<span id="api-status-text">Konfigurera API-nyckel</span>', '<span id="api-status-text">Configure API Key</span>'),
    @('title="Använd Workshop Builder för att strukturera analysen innan du börjar"', 'title="Use Workshop Builder to structure the analysis"'),
    @('Importera (BMC)', 'Import (BMC)'),
    @('domain-specific-exempel', 'Domain Example'),
    @('<i class="fas fa-trash-alt"></i> Rensa', '<i class="fas fa-trash-alt"></i> Clear'),
    @('<i class="fas fa-save"></i> Spara', '<i class="fas fa-save"></i> Save'),
    @('<i class="fas fa-file-excel"></i> Exportera (Excel)', '<i class="fas fa-file-excel"></i> Export (Excel)'),
    @('title="Exportera till EA Platform integration"', 'title="Export to EA Platform integration"'),
    @('<i class="fas fa-project-diagram"></i> Exportera (EA)', '<i class="fas fa-project-diagram"></i> Export (EA)'),
    @('<i class="fas fa-robot"></i> AI Analysera', '<i class="fas fa-robot"></i> AI Analyze'),
    @('title="Skapa TO-BE-forslag baserat pa AI-analysen"', 'title="Generate TO-BE proposal from AI analysis"'),
    @('<i class="fas fa-lightbulb"></i> Skapa TO-BE', '<i class="fas fa-lightbulb"></i> Create TO-BE'),
    @('title="Konsolidera slutlig TO-BE och anvand den for synk"', 'title="Consolidate final TO-BE for sync"'),
    @('<i class="fas fa-check-double"></i> Konsolidera TO-BE', '<i class="fas fa-check-double"></i> Consolidate TO-BE'),
    @('title="Återställ sparad AS-IS-modell"', 'title="Restore saved AS-IS model"'),
    @('<i class="fas fa-rotate-left"></i> Återställ AS-IS', '<i class="fas fa-rotate-left"></i> Restore AS-IS'),
    @('title="Skapa EA Tool-rapport (AS IS, analys, TO BE)"', 'title="Generate EA Tool Report (AS-IS, Analysis, TO-BE)"'),
    @('<i class="fas fa-file-lines"></i> Generera EA Tool-rapport', '<i class="fas fa-file-lines"></i> Generate EA Tool Report'),
    @('<div class="section-label">Stödaktiviteter (Support Activities)</div>', '<div class="section-label">Support Activities</div>'),
    @('<div class="section-label">Primära aktiviteter (Primary Activities)</div>', '<div class="section-label">Primary Activities</div>'),
    @('<h3><i class="fas fa-building"></i> Företagsinfrastruktur</h3>', '<h3><i class="fas fa-building"></i> Enterprise Infrastructure</h3>'),
    @('<h3><i class="fas fa-users-cog"></i> HR & Kompetens</h3>', '<h3><i class="fas fa-users-cog"></i> HR & Competence</h3>'),
    @('<h3><i class="fas fa-microchip"></i> Teknikutveckling</h3>', '<h3><i class="fas fa-microchip"></i> Technology Development</h3>'),
    @('<h3><i class="fas fa-truck-loading"></i> Inköp & Upphandling</h3>', '<h3><i class="fas fa-truck-loading"></i> Procurement</h3>'),
    @('<h3><i class="fas fa-bullhorn"></i> Sälj & Marknadsföring</h3>', '<h3><i class="fas fa-bullhorn"></i> Sales & Marketing</h3>'),
    @('<h3><i class="fas fa-headset"></i> Service & Eftermarknad</h3>', '<h3><i class="fas fa-headset"></i> Service & After-Sales</h3>'),
    @('<h3><i class="fas fa-chart-line mb-2 block text-xl"></i>Marginal</h3>', '<h3><i class="fas fa-chart-line mb-2 block text-xl"></i>Margin</h3>'),
    @('placeholder="Ledning, finans, juridik, compliance, portföljstyrning..."', 'placeholder="Management, finance, legal, compliance, portfolio governance..."'),
    @('placeholder="Rekrytering, utbildning, certifiering, digital kompetens..."', 'placeholder="Recruitment, training, certification, digital competence..."'),
    @('placeholder="Plattformsutveckling, AI/ML, IoT, BIM, integrationer..."', 'placeholder="Platform development, AI/ML, IoT, BIM, integrations..."'),
    @('placeholder="Leverantörsval, ramavtal, hållbarhetskrav, SLA..."', 'placeholder="Supplier selection, framework agreements, sustainability requirements, SLA..."'),
    @('placeholder="Datainsamling, leveranser, IoT-sensorer, Verksamhetsinformation..."', 'placeholder="Data collection, deliveries, IoT sensors, operational information..."'),
    @('placeholder="Verksamhetsförvaltning, drift, underhåll, hyresgästhantering..."', 'placeholder="Operations management, maintenance, tenant management..."'),
    @('placeholder="Leverans av tjänster, rapportering till ägare, portalsystem..."', 'placeholder="Service delivery, owner reporting, portal systems..."'),
    @('placeholder="Uthyrning, varumärke, digitala kanaler, prissättning..."', 'placeholder="Leasing, branding, digital channels, pricing..."'),
    @('placeholder="Hyresgästsupport, felanmälan, NPS, retention, ESG..."', 'placeholder="Tenant support, issue reporting, NPS, retention, ESG..."'),
    @('placeholder="Var skapas mest värde? Var är marginalerna starkast?"', 'placeholder="Where is value created? Where are the strongest margins?"'),
    @('Value Chain — Strategisk AI-analys', 'Value Chain — Strategic AI Analysis'),
    @('OpenAI API-nyckel', 'OpenAI API Key'),
    @('Sparas lokalt i din webbläsare', 'Saved locally in your browser'),
    @('Ange din OpenAI API-nyckel för att aktivera AI-analysen. Nyckeln sparas i <code class="bg-gray-100 px-1 rounded">localStorage</code> och lämnar aldrig din webbläsare.', 'Enter your OpenAI API key to activate AI analysis. The key is stored in <code class="bg-gray-100 px-1 rounded">localStorage</code> and never leaves your browser.'),
    @('<label for="show-key" class="text-xs text-gray-500">Visa nyckel</label>', '<label for="show-key" class="text-xs text-gray-500">Show key</label>'),
    @('>Spara & Aktivera</button>', '>Save & Activate</button>'),
    @('>Avbryt</button>', '>Cancel</button>'),
    @('Importera från BMC', 'Import from BMC'),
    @('Ladda upp din Business Model Canvas CSV', 'Upload your Business Model Canvas CSV'),
    @('Dra och släpp din CSV-fil här eller klicka för att välja', 'Drag & drop your CSV file here or click to select'),
    @('>Stäng</button>', '>Close</button>'),
    @('<div class="vc-title">VC AI-assistent</div>', '<div class="vc-title">Value Chain AI Assistant</div>'),
    @('<div class="vc-subtitle">Value Chain · domain-specific & Verksamhet</div>', '<div class="vc-subtitle">Value Chain · Domain-Specific Analysis</div>'),
    @('>Ny chat</button>', '>New Chat</button>'),
    @('>Rensa</button>', '>Clear</button>'),
    @('<span>Läs av canvas-innehåll automatiskt</span>', '<span>Auto-read canvas content</span>'),
    @('placeholder="Ställ en fråga om din värdekedja..."', 'placeholder="Ask a question about your value chain..."'),
    # Quick buttons — remove garbled emojis, translate labels
    @('>🔍 Svagheter</button>', '>Weaknesses</button>'),
    @('>💎 Värdeskapande</button>', '>Value Creation</button>'),
    @('>⚡ Digitalisering</button>', '>Digitalization</button>'),
    @('title="Största möjligheter till kostnadsoptimering"', 'title="Greatest cost optimization opportunities"'),
    @('>💰 Kostnader</button>', '>Cost Drivers</button>'),
    @('title="Analysera ESG-potential och hållbarhetsrisker"', 'title="Analyze ESG potential and sustainability risks"'),
    @('>🌱 ESG</button>', '>ESG</button>'),
    @('>ðŸ—ï¸ Stödaktiviteter</button>', '>Support Activities</button>'),
    @('>ðŸ  Customer retention</button>', '>Customer Retention</button>'),
    @('>📅 90-dagarsplan</button>', '>90-Day Plan</button>'),
    @('>ðŸ† Konkurrensfördel</button>', '>Competitive Advantage</button>'),
    @('>⚙ï¸ Operations</button>', '>Operations</button>'),
    @('title="Förbered nästa workshop: Capability Mapping"', 'title="Prepare next workshop: Capability Mapping"'),
    @('>➡ï¸ Förbered CapMap</button>', '>Prepare CapMap</button>'),
    @('title="Öppna nästa verktyg: AI Capability Mapping"', 'title="Open next tool: Capability Mapping"'),
    @('>🚀 Öppna Capability</button>', '>Open Capability</button>'),
    # AI prompts sent from quick buttons
    @("vcQuick('Identifiera de svagaste länkarna i värdekedjan')", "vcQuick('Identify the weakest links in the value chain')"),
    @("vcQuick('Var skapas mest värde och hur kan vi förstärka det?')", "vcQuick('Where is most value created and how can we strengthen it?')"),
    @("vcQuick('Vilka aktiviteter har störst digitaliseringspotential?')", "vcQuick('Which activities have the greatest digitalization potential?')"),
    @("vcQuick('Var finns de största möjligheterna till kostnadsoptimering?')", "vcQuick('Where are the greatest opportunities for cost optimization?')"),
    @("vcQuick('Analysera ESG-potential och hållbarhetsrisker i värdekedjan')", "vcQuick('Analyze ESG potential and sustainability risks in the value chain')"),
    @("vcQuick('Hur kan stödaktiviteterna bättre stödja de primära aktiviteterna?')", "vcQuick('How can support activities better support the primary activities?')"),
    @("vcQuick('Vilka åtgärder förbättrar Customer retention och NPS mest?')", "vcQuick('What actions most improve customer retention and NPS?')"),
    @("vcQuick('Ge mig en konkret 90-dagarsplan för att stärka värdekedjan')", "vcQuick('Give me a concrete 90-day action plan to strengthen the value chain')"),
    @("vcQuick('Vilka aktiviteter ger störst konkurrensfördel gentemot marknaden?')", "vcQuick('Which activities provide the greatest competitive advantage in the market?')"),
    @("vcQuick('Analysera Operations-aktiviteten och föreslå förbättringar')", "vcQuick('Analyze the Operations activity and suggest improvements')"),
    @("vcQuick('Baserat på min värdekedja: vilka capabilities (förmågor) är kritiska att kartlägga i nästa steg? Ge mig en lista med capability-namn och domäner inför Capability Mapping-workshopen.')", "vcQuick('Based on my value chain: which capabilities are critical to map in the next step? Give me a list of capability names and domains for the Capability Mapping workshop.')"),
    # JS field labels
    @("infrastructure: 'Företagsinfrastruktur',", "infrastructure: 'Enterprise Infrastructure',"),
    @("hr: 'HR & Kompetens',", "hr: 'HR & Competence',"),
    @("tech: 'Teknikutveckling',", "tech: 'Technology Development',"),
    @("procurement: 'Inköp & Upphandling',", "procurement: 'Procurement',"),
    @("marketing: 'Sälj & Marknadsföring',", "marketing: 'Sales & Marketing',"),
    @("service: 'Service & Eftermarknad',", "service: 'Service & After-Sales',"),
    @("margin: 'Marginal / Värdeskapande'", "margin: 'Margin / Value Creation'")
)
[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "  Done: AI Value Chain Analyzer V2.html"

# ============================================================================================
# 2. CAPABILITY MAPPING V2.html
# ============================================================================================
Write-Host "Processing AI Capability Mapping V2.html..."
$f = "$base\AI Capability Mapping V2.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# STRUCTURAL: Remove duplicate heading (CapMap uses <header> tag not <div>)
$c = $c -replace '(?s)<!--\s*Header\s*-->\s*<header class="flex flex-col[^"]*">\s*<div>\s*<h1[^>]*>.*?</h1>\s*<p[^>]*>.*?</p>\s*</div>\s*<div class="flex flex-wrap gap-3">', '<div class="flex flex-wrap gap-3 mb-5">'
# STRUCTURAL: Remove orphaned </header> before cap-mode-banner
$c = $c -replace '(Generera EA Tool-rapport\r?\n      </button>\r?\n    </div>)\r?\n  </header>(\r?\n\r?\n  <div id="cap-mode-banner")', '$1$2'
# STRUCTURAL: Full-width layout
$c = $c.Replace('<div class="max-w-7xl mx-auto">', '<div class="w-full">')

$c = Trans $c @(
    @('<html lang="sv">', '<html lang="en">'),
    @('<title>AI Capability Mapping', '<title>Capability Mapping'),
    @('<h1><i class="fas fa-sitemap"></i>AI Capability Mapping</h1>', '<h1><i class="fas fa-sitemap"></i>Capability Mapping</h1>'),
    @('title="Gå till nästa verktyg: AI Strategy Workbench"', 'title="Go to next tool: Strategy Workbench"'),
    @('<span id="api-text">Konfigurera API-nyckel</span>', '<span id="api-text">Configure API Key</span>'),
    @('<i class="fas fa-lightbulb"></i> Ladda exempel', '<i class="fas fa-lightbulb"></i> Load Example'),
    @('title="Använd Workshop Builder för att strukturera capability-mappingen innan du börjar"', 'title="Use Workshop Builder to structure capability mapping"'),
    @('<i class="fas fa-trash-alt"></i> Rensa', '<i class="fas fa-trash-alt"></i> Clear'),
    @('<i class="fas fa-save"></i> Spara', '<i class="fas fa-save"></i> Save'),
    @('<i class="fas fa-file-excel"></i> Exportera (Excel)', '<i class="fas fa-file-excel"></i> Export (Excel)'),
    @('title="Exportera till EA Platform integration"', 'title="Export to EA Platform integration"'),
    @('<i class="fas fa-project-diagram"></i> Exportera (EA)', '<i class="fas fa-project-diagram"></i> Export (EA)'),
    @('<i class="fas fa-robot"></i> AI Analys', '<i class="fas fa-robot"></i> AI Analyze'),
    @('title="Skapa TO-BE-forslag baserat pa analysen"', 'title="Generate TO-BE proposal from analysis"'),
    @('<i class="fas fa-lightbulb"></i> Skapa TO-BE', '<i class="fas fa-lightbulb"></i> Create TO-BE'),
    @('title="Visa AS-IS och TO-BE sida vid sida"', 'title="Show AS-IS and TO-BE side by side"'),
    @('<i class="fas fa-columns"></i> Granska AS-IS/TO-BE', '<i class="fas fa-columns"></i> Review AS-IS/TO-BE'),
    @('title="Konsolidera slutlig TO-BE for synk"', 'title="Consolidate final TO-BE for sync"'),
    @('<i class="fas fa-check-double"></i> Konsolidera TO-BE', '<i class="fas fa-check-double"></i> Consolidate TO-BE'),
    @('title="Återställ AS-IS"', 'title="Restore AS-IS"'),
    @('<i class="fas fa-rotate-left"></i> Återställ AS-IS', '<i class="fas fa-rotate-left"></i> Restore AS-IS'),
    @('title="Skapa EA Tool-rapport (AS IS, analys, TO BE)"', 'title="Generate EA Tool Report (AS-IS, Analysis, TO-BE)"'),
    @('<i class="fas fa-file-lines"></i> Generera EA Tool-rapport', '<i class="fas fa-file-lines"></i> Generate EA Tool Report'),
    @('AS-IS vs TO-BE konsolidering', 'AS-IS vs TO-BE Consolidation'),
    @('>Stang</button>', '>Close</button>'),
    @('TO-BE Draft (redigerbar)', 'TO-BE Draft (editable)'),
    @('<div class="font-semibold text-blue-900 text-sm">APQC Process Classification Framework tillgänglig</div>', '<div class="font-semibold text-blue-900 text-sm">APQC Process Classification Framework Available</div>'),
    @('<div class="text-blue-700 text-xs">Importera branschspecifika capabilities baserat på APQC-standard</div>', '<div class="text-blue-700 text-xs">Import industry-specific capabilities based on the APQC standard</div>'),
    @('<i class="fas fa-cog mr-1"></i> Konfigurera & Importera', '<i class="fas fa-cog mr-1"></i> Configure & Import'),
    @('APQC Framework Aktiverad', 'APQC Framework Activated'),
    @('Bransch / Industry', 'Industry'),
    @('Strategiskt Fokus', 'Strategic Focus'),
    @('capabilities importerade', 'capabilities imported'),
    @('OpenAI API-nyckel', 'OpenAI API Key'),
    @('Delas med alla verktyg i EA Strategy Suite', 'Shared with all tools in EA Strategy Suite'),
    @('Nyckeln sparas i <code class="bg-gray-100 px-1 rounded text-xs">localStorage</code> under nyckeln <code class="bg-gray-100 px-1 rounded text-xs">ea_openai_key</code> och används av BMC, Capability Map och Wardley Map.', 'The key is stored in <code class="bg-gray-100 px-1 rounded text-xs">localStorage</code> under key <code class="bg-gray-100 px-1 rounded text-xs">ea_openai_key</code> and is used by BMC, Capability Map, and Wardley Map.'),
    @('<label for="show-key" class="text-xs text-gray-500 cursor-pointer">Visa nyckel</label>', '<label for="show-key" class="text-xs text-gray-500 cursor-pointer">Show key</label>'),
    @('<i class="fas fa-check mr-2"></i>Spara & Aktivera', '<i class="fas fa-check mr-2"></i>Save & Activate'),
    @('Skickas endast till OpenAI. Aldrig till annan server.', 'Sent only to OpenAI. Never to any other server.'),
    @('Redigera Capability', 'Edit Capability'),
    @('placeholder="Capability-namn"', 'placeholder="Capability name"'),
    @('placeholder="Beskrivning (valfritt)"', 'placeholder="Description (optional)"'),
    @('Strategisk Prioritet', 'Strategic Priority'),
    @('>🔴 Strategisk</button>', '>Strategic</button>'),
    @('>🟡 Viktig</button>', '>Important</button>'),
    @('Mognadsnivå (1–5)', 'Maturity Level (1-5)'),
    @('<span>5 – Optimerad</span>', '<span>5 – Optimized</span>'),
    @('>Ta bort</button>', '>Delete</button>'),
    @('APQC Framework - Importera Capabilities', 'APQC Framework — Import Capabilities'),
    @('Valj din bransch och strategiska fokus for att importera relevanta capabilities fran APQC Process Classification Framework.', 'Select your industry and strategic focus to import relevant capabilities from the APQC Process Classification Framework.'),
    @('"-- Valj bransch (eller lat AI detektera) --"', '"-- Select industry (or let AI detect) --"'),
    @('Tillverkning (Manufacturing)', 'Manufacturing'),
    @('Tjanster (Services)', 'Services'),
    @('Detaljhandel (Retail)', 'Retail'),
    @('Finansiella tjanster (Financial Services)', 'Financial Services'),
    @('Halsovard (Healthcare)', 'Healthcare'),
    @('Teknik & IT (Technology)', 'Technology & IT'),
    @('Alla branscher (Cross-Industry)', 'All Industries (Cross-Industry)'),
    @('"-- Valj strategiskt fokus --"', '"-- Select strategic focus --"'),
    @('Tillvaxt (Growth)', 'Growth'),
    @('Effektivitet (Efficiency)', 'Efficiency'),
    @('Kundfokus (Customer Centricity)', 'Customer Centricity'),
    @('Hallbarhet (Sustainability)', 'Sustainability'),
    @('(Valfritt om organisationsbeskrivning anges)', '(Optional if org description is provided)'),
    @('Organisationsbeskrivning (Valfritt)', 'Organization Description (Optional)'),
    @('<i class="fas fa-magic text-xs"></i> Forbattrar AI-detektering', '<i class="fas fa-magic text-xs"></i> Improves AI detection'),
    @("Beskriv din organisation, produkter/tjanster, strategiska mal, eller utmaningar... (t.ex. 'Vi ar en SaaS-plattform for HR-analytics med fokus pa prediktiv analys och AI-driven talangutveckling')", "Describe your organization, products/services, goals, or challenges (e.g. 'We are a SaaS platform for HR analytics focused on predictive analysis and AI-driven talent development')"),
    @('Denna information hjalper AI:n att battre detektera bransch och foreslå relevanta capabilities.', 'This information helps the AI better detect the industry and suggest relevant capabilities.'),
    @('<strong>Tva alternativ:</strong>', '<strong>Two options:</strong>'),
    @('<span>Manuellt: Valj Bransch + Strategiskt Fokus</span>', '<span>Manual: Select Industry + Strategic Focus</span>'),
    @('<span>AI-assisterat: Beskriv organisation + Valj Strategiskt Fokus → AI detekterar bransch automatiskt</span>', '<span>AI-assisted: Describe organization + Select Strategic Focus → AI detects industry automatically</span>'),
    @('APQC-capabilities laggas till i din capability map. Justera prioritet/mognad efterat.', 'APQC capabilities are added to your capability map. Adjust priority/maturity afterwards.'),
    @('<i class="fas fa-download mr-2"></i>Importera Capabilities', '<i class="fas fa-download mr-2"></i>Import Capabilities'),
    @('>Avbryt</button>', '>Cancel</button>')
)
[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "  Done: AI Capability Mapping V2.html"

# ============================================================================================
# 3. STRATEGY WORKBENCH V2.html — has U+FFFD ($r) chars where Swedish a/o/a chars were
# ============================================================================================
Write-Host "Processing AI Strategy Workbench V2.html..."
$f = "$base\AI Strategy Workbench V2.html"
$c = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)

# STRUCTURAL: Remove duplicate heading block
$c = $c -replace '(?s)<!--\s*Header\s*-->\s*<div class="flex flex-col[^"]*">\s*<div>\s*<h1[^>]*>.*?</h1>\s*<p[^>]*>.*?</p>\s*</div>\s*<div class="flex flex-wrap gap-2">', '<div class="flex flex-wrap gap-2 mb-5">'
# STRUCTURAL: Remove orphaned outer-flex </div> before main layout section
$c = $c -replace '(AI Wardley-analys\r?\n            </button>\r?\n        </div>)\r?\n    </div>(\r?\n\r?\n    <!-- Main layout: Canvas)', '$1$2'
# STRUCTURAL: Full-width layout
$c = $c.Replace('<div class="max-w-7xl mx-auto">', '<div class="w-full">')

$c = Trans $c @(
    @('<html lang="sv">', '<html lang="en">'),
    @('<title>AI Strategy Workbench', '<title>Strategy Workbench'),
    @('<h1><i class="fas fa-chess-board"></i>AI Strategy Workbench</h1>', '<h1><i class="fas fa-chess-board"></i>Strategy Workbench</h1>'),
    # API Modal
    @('OpenAI API-nyckel', 'OpenAI API Key'),
    @('Delas med alle EA 2.0-verktyg', 'Shared with all EA 2.0 tools'),
    @('<label for="show-key" class="text-[11px] text-gray-500 cursor-pointer">Visa nyckel</label>', '<label for="show-key" class="text-[11px] text-gray-500 cursor-pointer">Show key</label>'),
    @('<i class="fas fa-check"></i> Spara & Aktivera', '<i class="fas fa-check"></i> Save & Activate'),
    @('<i class="fas fa-check"></i> Spara nyckel', '<i class="fas fa-check"></i> Save Key'),
    @('<i class="fas fa-shield-alt"></i> Skickas endast till OpenAI.', '<i class="fas fa-shield-alt"></i> Sent only to OpenAI.'),
    # Add Component Modal (garbled chars)
    @('<h2 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fas fa-plus-circle text-blue-600"></i> L' + $r + 'gg till komponent</h2>', '<h2 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fas fa-plus-circle text-blue-600"></i> Add Component</h2>'),
    @('<label class="text-[11px] text-gray-600 block mb-1">Komponentnamn *</label>', '<label class="text-[11px] text-gray-600 block mb-1">Component Name *</label>'),
    @('placeholder="Ex: Hyresg' + $r + 'stportal, IoT-sensorer..."', 'placeholder="E.g. Tenant portal, IoT sensors..."'),
    @('<label class="text-[11px] text-gray-600 block mb-1">Kategori</label>', '<label class="text-[11px] text-gray-600 block mb-1">Category</label>'),
    @('>Kund (synlig)</option>', '>Customer (visible)</option>'),
    @('>Plattform</option>', '>Platform</option>'),
    @('>Infrastruktur</option>', '>Infrastructure</option>'),
    @('<label class="text-[11px] text-gray-600 block mb-1">Evolution (X-axel)</label>', '<label class="text-[11px] text-gray-600 block mb-1">Evolution (X-axis)</label>'),
    @('<option value="10">Genesis (0' + $r + '25%) ' + $r + ' Ny, unik, os' + $r + 'ker</option>', '<option value="10">Genesis (0-25%) — New, unique, uncertain</option>'),
    @('<option value="35">Custom (25' + $r + '50%) ' + $r + ' Skr' + $r + 'ddarsydd l' + $r + 'sning</option>', '<option value="35">Custom (25-50%) — Tailored solution</option>'),
    @('<option value="60">Product (50' + $r + '75%) ' + $r + ' Standardiserad produkt</option>', '<option value="60">Product (50-75%) — Standardized product</option>'),
    @('<option value="85">Commodity (75' + $r + '100%) ' + $r + ' Utility/outsourca</option>', '<option value="85">Commodity (75-100%) — Utility/outsource</option>'),
    @('<label class="text-[11px] text-gray-600 block mb-1">Synlighet f' + $r + 'r kund (Y-axel)</label>', '<label class="text-[11px] text-gray-600 block mb-1">Customer Visibility (Y-axis)</label>'),
    @('<option value="15">H' + $r + 'g ' + $r + ' Direkt kundv' + $r + 'rde</option>', '<option value="15">High — Direct customer value</option>'),
    @('<option value="35">Medel-h' + $r + 'g</option>', '<option value="35">Medium-High</option>'),
    @('<option value="55">Medel-l' + $r + 'g</option>', '<option value="55">Medium-Low</option>'),
    @('<option value="80">L' + $r + 'g ' + $r + ' Infrastruktur/backend</option>', '<option value="80">Low — Infrastructure/backend</option>'),
    @('<label class="text-[11px] text-gray-600 block mb-1">F' + $r + 'rg</label>', '<label class="text-[11px] text-gray-600 block mb-1">Color</label>'),
    @('>Bl' + $r + ' (Plattform)</option>', '>Blue (Platform)</option>'),
    @('>Gr' + $r + 'n (Kund/V' + $r + 'rde)</option>', '>Green (Customer/Value)</option>'),
    @('>R' + $r + 'd (Risk/Genesis)</option>', '>Red (Risk/Genesis)</option>'),
    @('>Lila (AI/Data)</option>', '>Purple (AI/Data)</option>'),
    @('>Gul (Compliance)</option>', '>Yellow (Compliance)</option>'),
    @('>Rosa (Kanal)</option>', '>Pink (Channel)</option>'),
    @('<label class="text-[11px] text-gray-600 block mb-1">Notering (valfri)</label>', '<label class="text-[11px] text-gray-600 block mb-1">Note (optional)</label>'),
    @('placeholder="Ex: B' + $r + 'r outsourcas, kritisk beroende..."', 'placeholder="E.g. Should be outsourced, critical dependency..."'),
    @('<i class="fas fa-plus"></i> L' + $r + 'gg till</button>', '<i class="fas fa-plus"></i> Add</button>'),
    @('<button class="btn btn-secondary" onclick="closeAddModal()">Avbryt</button>', '<button class="btn btn-secondary" onclick="closeAddModal()">Cancel</button>'),
    # Import CSV Modal (garbled)
    @('<i class="fas fa-file-import text-blue-600"></i> Importera fr' + $r + 'n Capability Map (CSV)', '<i class="fas fa-file-import text-blue-600"></i> Import from Capability Map (CSV)'),
    @('V' + $r + 'lj filen <code class="bg-gray-100 px-1 rounded">EA2_Capabilities.csv</code> som exporterades fr' + $r + 'n Capability Map-verktyget.', 'Select the <code class="bg-gray-100 px-1 rounded">EA2_Capabilities.csv</code> file exported from the Capability Map tool.'),
    @('Klicka eller dra & sl' + $r + 'pp CSV-fil h' + $r + 'r', 'Click or drag & drop CSV file here'),
    @('<button class="btn btn-secondary" onclick="closeImportModal()">Avbryt</button>', '<button class="btn btn-secondary" onclick="closeImportModal()">Cancel</button>'),
    @('<i class="fas fa-check"></i> Importera komponenter', '<i class="fas fa-check"></i> Import Components'),
    # Button bar
    @('title="Bygg kartan steg f' + $r + 'r steg med guidad workshop"', 'title="Build the map step by step with guided workshop"'),
    @('<span id="api-status-text">API-nyckel</span>', '<span id="api-status-text">API Key</span>'),
    @('<i class="fas fa-lightbulb text-yellow-400"></i> Ladda exempel', '<i class="fas fa-lightbulb text-yellow-400"></i> Load Example'),
    @('<i class="fas fa-trash-alt text-red-400"></i> Rensa', '<i class="fas fa-trash-alt text-red-400"></i> Clear'),
    @('<i class="fas fa-save text-green-400"></i> Spara', '<i class="fas fa-save text-green-400"></i> Save'),
    @('<i class="fas fa-plus text-blue-400"></i> L' + $r + 'gg till', '<i class="fas fa-plus text-blue-400"></i> Add'),
    @('<i class="fas fa-file-import"></i> Importera CSV', '<i class="fas fa-file-import"></i> Import CSV'),
    @('<i class="fas fa-file-excel"></i> Exportera (Excel)', '<i class="fas fa-file-excel"></i> Export (Excel)'),
    @('title="Exportera till EA Platform integration"', 'title="Export to EA Platform integration"'),
    @('<i class="fas fa-project-diagram"></i> Exportera (EA)', '<i class="fas fa-project-diagram"></i> Export (EA)'),
    @('<i class="fas fa-robot"></i> AI Wardley-analys</button>', '<i class="fas fa-robot"></i> AI Wardley Analysis</button>'),
    # Canvas axis labels (garbled)
    @('transform:rotate(180deg);">Synlighet ' + $r + ' H' + $r + 'g</span>', 'transform:rotate(180deg);">High Visibility</span>'),
    @('transform:rotate(180deg);">L' + $r + 'g ' + $r + '</span>', 'transform:rotate(180deg);">Low</span>'),
    # Canvas empty state hints (garbled)
    @('Klicka p' + $r + ' kartan f' + $r + 'r att l' + $r + 'gga till', 'Click on the map to add a component'),
    @('Dra noder f' + $r + 'r att flytta', 'Drag nodes to move'),
    @('Hovra f' + $r + 'r detaljer', 'Hover for details'),
    @('<span class="text-blue-600">Importera CSV</span> fr' + $r + 'n Capability Map', '<span class="text-blue-600">Import CSV</span> from Capability Map'),
    # Sidebar labels
    @('>KATEGORIER<', '>CATEGORIES<'),
    @('>Kund / V' + $r + 'rde<', '>Customer / Value<'),
    @('>EVOLUTION-GUIDE<', '>EVOLUTION GUIDE<'),
    @('Genesis:</span> Ny, unik, h' + $r + 'g risk. Bygg internt.', 'Genesis:</span> New, unique, high risk. Build internally.'),
    @('Custom:</span> Skr' + $r + 'ddarsydd. Differentiering.', 'Custom:</span> Tailored. Differentiation.'),
    @('Product:</span> Standardiserad. K' + $r + 'p/partner.', 'Product:</span> Standardized. Buy/partner.'),
    @('Commodity:</span> Utility. Outsourca/SaaS.', 'Commodity:</span> Utility. Outsource/SaaS.'),
    @('>KONTEXT F' + $r + 'R AI<', '>AI CONTEXT<'),
    @('>Organisation / Bolag<', '>Organization / Company<'),
    @('placeholder="Ex: Fastighetsbolag, 500 enheter"', 'placeholder="E.g. Real estate company, 500 units"'),
    @('>Strategiskt fokus<', '>Strategic Focus<'),
    @('>Digitalisering & automation<', '>Digitalization & Automation<'),
    @('>ESG & h' + $r + 'llbarhet<', '>ESG & Sustainability<'),
    @('>Kostnadsoptimering<', '>Cost Optimization<'),
    @('>Tillv' + $r + 'xt & skalning<', '>Growth & Scaling<'),
    @('>Riskreduktion<', '>Risk Reduction<'),
    @('>Tidshorisont<', '>Time Horizon<'),
    @('>12 m' + $r + 'nader<', '>12 months<'),
    @('>24 m' + $r + 'nader<', '>24 months<'),
    @('>36 m' + $r + 'nader<', '>36 months<'),
    @('>KOMPONENTER<', '>COMPONENTS<'),
    @('>L' + $r + 's in capabilities fr' + $r + 'n Capability Map<', '>Load capabilities from Capability Map<'),
    @('>Spara Wardley-kartan som CSV f' + $r + 'r rapporter<', '>Save Wardley map as CSV for reports<'),
    # JS strings
    @("'H" + $r + "g synlighet'", "'High visibility'"),
    @("'L" + $r + "g synlighet (infrastruktur)'", "'Low visibility (infrastructure)'"),
    @(" c.y < 60 ? 'Medel' : 'L", " c.y < 60 ? 'Medium' : 'L"),
    @("| Kategori: `${c.category}", "| Category: `${c.category}"),
    @("| Synlighet: `${vis}", "| Visibility: `${vis}"),
    @("c.note ? ' | Notering: ' + c.note", "c.note ? ' | Note: ' + c.note"),
    @("|| 'Fastighetsbolag'", "|| 'Real estate company'"),
    @("'Ange ett komponentnamn'", "'Please enter a component name'"),
    @('`"${name}" tillagd ' + $r + '`', '`"${name}" added`'),
    @('<i class="fas fa-exclamation-triangle mr-1"></i>Fel vid API-anrop</div>', '<i class="fas fa-exclamation-triangle mr-1"></i>API call failed</div>'),
    @('hover:bg-red-700 text-red-200 px-2 py-1 rounded">Uppdatera API-nyckel</button>', 'hover:bg-red-700 text-red-200 px-2 py-1 rounded">Update API Key</button>'),
    @('hittades i filen.', 'rows found in file.'),
    @('koordinater ber' + $r + 'knas automatiskt.', 'coordinates calculated automatically.'),
    @('koordinater l' + $r + 'ses direkt.', 'coordinates loaded directly.'),
    @('(visar 8 av', '(showing 8 of')
)

# ── AI System Prompt ──────────────────────────────────────────────────────────────────────
# Use IndexOf to replace entire block (avoids .NET regex $ escaping issues with ${var})
$sysStart = 'const systemPrompt = ' + $bt + 'Du ' + $r + 'r en senior enterprise-arkitekt'
$si = $c.IndexOf($sysStart)
if ($si -ge 0) {
    $ei = $c.IndexOf($bt + ';', $si + $sysStart.Length)
    if ($ei -ge 0) {
        # Build English system prompt using $bt (backtick) and $nl (newline)
        # $ds + '{var}' produces literal ${var} in JS template; double-quotes expand $ds to '$'
        $p  = "const systemPrompt = ${bt}You are a senior enterprise architect and strategic advisor specializing in digital transformation.${nl}${nl}"
        $p += "You analyze a Wardley Map with components positioned along the Evolution axis (Genesis${nl}Custom${nl}Product${nl}Commodity) and the Value Chain axis (customer visibility: High${nl}Low).${nl}${nl}"
        $p += "Respond in the same language as the user's prompt. Focus on business value: cost savings, risk reduction, competitive advantage, regulatory compliance, and customer retention.${nl}${nl}"
        $p += "Use these exact section headings:${nl}${nl}"
        $p += "## Strategic Positioning${nl}Summarize where the organization is strategically. Which components are in the right phase? What is mispositioned?${nl}${nl}"
        $p += "## Inertia and Strategic Risks${nl}Identify 2-4 components with high inertia (difficult to move) or strategic risk. Why are they critical?${nl}${nl}"
        $p += "## Build vs Buy vs Partner${nl}Give concrete recommendations per component: what should be built internally (Genesis/Custom), bought (Product), or outsourced (Commodity)?${nl}${nl}"
        $p += "## Strategic Opportunities (${ds}{horizon})${nl}List 3-5 concrete initiatives with expected business value. Link to ${ds}{focus}.${nl}${nl}"
        $p += "## Prioritized Roadmap${nl}Steps 1-3 with clear prioritization and expected ROI or risk reduction effect.${nl}${nl}"
        $p += "## Executive Summary${nl}2-3 sentences: the most important strategic insight and next steps.${bt};"
        $c = $c.Substring(0, $si) + $p + $c.Substring($ei + 2)
        Write-Host "  System prompt replaced."
    } else { Write-Warning "  systemPrompt closing backtick+semicolon not found" }
} else { Write-Warning "  systemPrompt start not found (check U+FFFD encoding)" }

# ── AI User Prompt ────────────────────────────────────────────────────────────────────────
$userStart = 'const userPrompt = ' + $bt + 'Organisation: ' + $ds + '{org}'
$si = $c.IndexOf($userStart)
if ($si -ge 0) {
    $ei = $c.IndexOf($bt + ';', $si + $userStart.Length)
    if ($ei -ge 0) {
        $up = "const userPrompt = ${bt}Organization: ${ds}{org}\nStrategic focus: ${ds}{focus}\nTime horizon: ${ds}{horizon}\n\nWardley Map components:\n${ds}{compSummary}${bt};"
        $c = $c.Substring(0, $si) + $up + $c.Substring($ei + 2)
        Write-Host "  User prompt replaced."
    } else { Write-Warning "  userPrompt closing backtick+semicolon not found" }
} else { Write-Warning "  userPrompt start not found" }

[System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
Write-Host "  Done: AI Strategy Workbench V2.html"

Write-Host ""
Write-Host "All 3 toolkits transformed. Sync to azure-deployment when ready."
