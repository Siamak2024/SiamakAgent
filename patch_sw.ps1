# SW Patch Script - Fix all remaining garbled/Swedish content
# Uses [char] variables to avoid UTF-8 BOM encoding issues
Set-StrictMode -Off
$r = [char]0xFFFD   # U+FFFD replacement char (garbled Swedish)
$q = [char]0x003F   # ASCII ? (used as separator in some places)
$em = [char]0x2014  # em dash character -
$ds = '$'           # dollar sign (for JS ${var} references)
$bt = [char]96      # backtick (for JS template literals in search strings)

$f = "c:\Users\SiamakKhodayari\OneDrive - Advicy Sweden AB\Dokument\Advicy\CanvasApp\NexGenEA\EA2_Toolkit\AI Strategy Workbench V2.html"
$t = [System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)
$before = ($t.ToCharArray() | Where-Object { [int]$_ -eq 0xFFFD } | Measure-Object).Count
Write-Host "U+FFFD chars before: $before"

# Title
$t = $t -replace '<title>.+</title>', ('<title>Strategy Workbench ' + $em + ' Wardley Map V2</title>')

# Phase banner
$t = $t -replace 'Exportera n.r klar - sista fasen!', 'Export when complete - final phase!'

# EA Header subtitle and chat header
$t = $t.Replace(('Wardley Map ' + $r + ' Strategisk Positionering ' + $r + ' Evolution'), ('Wardley Map ' + $em + ' Strategic Positioning ' + $em + ' Evolution'))
$t = $t.Replace(('AI Strategy Workbench ' + $r + ' PropTech'), ('Strategy Workbench ' + $em + ' PropTech'))

# Add Component modal - multi-line h2
$t = $t -replace ('(?s)(<h2 class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">)\s*<i class="fas fa-plus-circle text-blue-600"></i>\s*.+gg till komponent\s*</h2>'), ('$1<i class="fas fa-plus-circle text-blue-600"></i> Add Component</h2>')
$t = $t -replace ('(?s)(<button class="btn btn-primary flex-1" onclick="confirmAddComponent\(\)">)\s*<i class="fas fa-plus"></i>\s*.+gg till\s*</button>'), ('$1<i class="fas fa-plus"></i> Add</button>')

# Evolution options
$t = $t.Replace(('<option value="10">Genesis (0' + $r + '25%) ' + $r + ' Ny, unik, os' + $r + 'ker</option>'), ('<option value="10">Genesis (0-25%) ' + $em + ' New, unique, uncertain</option>'))
$t = $t.Replace(('<option value="35">Custom (25' + $r + '50%) ' + $r + ' Skr' + $r + 'ddarsydd l' + $r + 'sning</option>'), ('<option value="35">Custom (25-50%) ' + $em + ' Tailored solution</option>'))
$t = $t.Replace(('<option value="60">Product (50' + $r + '75%) ' + $r + ' Standardiserad produkt</option>'), ('<option value="60">Product (50-75%) ' + $em + ' Standardized product</option>'))
$t = $t.Replace(('<option value="85">Commodity (75' + $r + '100%) ' + $r + ' Utility/outsourca</option>'), ('<option value="85">Commodity (75-100%) ' + $em + ' Utility/outsource</option>'))

# Visibility label + options
$t = $t.Replace(('<label class="text-[11px] text-gray-600 block mb-1">Synlighet f' + $r + 'r kund (Y-axel)</label>'), '<label class="text-[11px] text-gray-600 block mb-1">Customer Visibility (Y-axis)</label>')
$t = $t.Replace(('<option value="15">H' + $r + 'g ' + $r + ' Direkt kundv' + $r + 'rde</option>'), ('<option value="15">High ' + $em + ' Direct customer value</option>'))
$t = $t.Replace(('<option value="35">Medel-h' + $r + 'g</option>'), '<option value="35">Medium-High</option>')
$t = $t.Replace(('<option value="55">Medel-l' + $r + 'g</option>'), '<option value="55">Medium-Low</option>')
$t = $t.Replace(('<option value="80">L' + $r + 'g ' + $r + ' Infrastruktur/backend</option>'), ('<option value="80">Low ' + $em + ' Infrastructure/backend</option>'))

# Color label + options
$t = $t.Replace(('<label class="text-[11px] text-gray-600 block mb-1">F' + $r + 'rg</label>'), '<label class="text-[11px] text-gray-600 block mb-1">Color</label>')
$t = $t.Replace(('>Bl' + $r + ' (Plattform)</option>'), '>Blue (Platform)</option>')
$t = $t.Replace(('>Gr' + $r + 'n (Kund/V' + $r + 'rde)</option>'), '>Green (Customer/Value)</option>')
$t = $t.Replace(('>R' + $r + 'd (Risk/Genesis)</option>'), '>Red (Risk/Genesis)</option>')

# Input placeholders
$t = $t.Replace(('placeholder="Ex: Hyresg' + $r + 'stportal, IoT-sensorer..."'), 'placeholder="E.g. Tenant portal, IoT sensors..."')
$t = $t.Replace(('placeholder="Ex: B' + $r + 'r outsourcas, kritisk beroende..."'), 'placeholder="E.g. Should be outsourced, critical dependency..."')

# Import CSV modal (multi-line)
$t = $t -replace '(?s)(<h2[^>]*>)\s*<i class="fas fa-file-import text-blue-600"></i>\s*Importera fr.n Capability Map \(CSV\)\s*</h2>', '$1<i class="fas fa-file-import text-blue-600"></i> Import from Capability Map (CSV)</h2>'
$t = $t -replace '(?s)(<p[^>]*>)\s*V.lj filen <code[^>]*>EA2_Capabilities\.csv</code> som exporterades fr.n Capability Map-verktyget\.\s*</p>', '$1Select the <code class="bg-gray-100 px-1 rounded">EA2_Capabilities.csv</code> file exported from the Capability Map tool.</p>'
$t = $t -replace 'Klicka eller dra & sl.pp CSV-fil h.r', 'Click or drag & drop CSV file here'

# Canvas x-axis percent ranges (separators)
$t = $t.Replace(('0' + $r + '25%'), '0-25%')
$t = $t.Replace(('25' + $r + '50%'), '25-50%')
$t = $t.Replace(('50' + $r + '75%'), '50-75%')
$t = $t.Replace(('75' + $r + '100%'), '75-100%')

# Canvas axis labels
$t = $t.Replace(('Synlighet ' + $q + ' H' + $r + 'g'), ('Visibility ' + $em + ' High'))
$t = $t.Replace(('L' + $r + 'g ' + $q), ('Low ' + $em))

# Canvas hint text (uses ASCII ? as bullet separator)
$t = $t -replace 'Klicka p. kartan f.r att l.gga till', 'Click on the map to add a component'
$t = $t -replace ($q + ' Dra noder f.r att flytta ' + $q + ' Hovra f.r detaljer ' + $q), (' - Drag nodes to move - Hover for details -')
$t = $t.Replace(('<span class="text-blue-400">Importera CSV</span> fr' + $r + 'n Capability Map'), '<span class="text-blue-400">Import CSV</span> from Capability Map')

# Sidebar categories/legend
$t = $t.Replace(('Kund / V' + $r + 'rde'), 'Customer / Value')
$t = $t.Replace('>Komponenter<', '>Components<')

# Evolution guide
$t = $t.Replace(('Ny, unik, h' + $r + 'g risk. Bygg internt.'), 'New, unique, high risk. Build internally.')
$t = $t.Replace(('Skr' + $r + 'ddarsydd. Differentiering.'), 'Tailored. Differentiation.')
$t = $t.Replace(('Standardiserad. K' + $r + 'p/partner.'), 'Standardized. Buy/partner.')

# AI Context sidebar heading + options
$t = $t.Replace(('Kontext f' + $r + 'r AI'), 'AI Context')
$t = $t.Replace(('ESG & h' + $r + 'llbarhet</option>'), 'ESG & Sustainability</option>')
$t = $t.Replace(('Tillv' + $r + 'xt & skalning</option>'), 'Growth & Scaling</option>')
$t = $t.Replace(('12 m' + $r + 'nader</option>'), '12 months</option>')
$t = $t.Replace(('24 m' + $r + 'nader</option>'), '24 months</option>')
$t = $t.Replace(('36 m' + $r + 'nader</option>'), '36 months</option>')

# Data flow sidebar
$t = $t.Replace(('Datafl' + $r + 'de'), 'Data Flow')
$t = $t.Replace(('<strong class="text-gray-800">Importera CSV</strong> ' + $q + ' L' + $r + 's in capabilities fr' + $r + 'n Capability Map'), ('<strong class="text-gray-800">Import CSV</strong> ' + $em + ' Load capabilities from Capability Map'))
$t = $t.Replace(('<strong class="text-gray-800">Exportera Excel</strong> ' + $q + ' Spara Wardley-kartan som CSV f' + $r + 'r rapporter'), ('<strong class="text-gray-800">Export Excel</strong> ' + $em + ' Save Wardley map as CSV for reports'))

# Close button X character (garbled)
$t = $t.Replace(('onclick="closeResult()" class="text-white/70 hover:text-white text-lg leading-none">' + $r + '<'), 'onclick="closeResult()" class="text-white/70 hover:text-white text-lg leading-none">&times;<')

# Node delete button X character
$t = $t -replace ('(<div class="w-node-delete"[^>]*>)' + $r + '(</div>)'), '$1&times;$2'

# Chat input placeholder
$t = $t.Replace(('placeholder="Fr' + $r + 'ga om din Wardley Map..."'), 'placeholder="Ask about your Wardley Map..."')

# Quick action buttons (askWardAI Swedish prompts)
$t = $t.Replace(('Vilka komponenter ' + $r + 'r felpositionerade p' + $r + ' kartan?'), 'Which components are mispositioned on the map?')
$t = $t.Replace('> Felpositionerade</button>', '> Mispositioned</button>')
$t = $t.Replace(('Vad ska vi bygga internt vs k' + $r + 'pa vs outsourca?'), 'What should we build internally vs buy vs outsource?')
$t = $t.Replace(('Vilka Genesis-komponenter har st' + $r + 'rst strategisk potential?'), 'Which Genesis components have the greatest strategic potential?')
$t = $t.Replace('> Genesis-potential</button>', '> Genesis Potential</button>')
$t = $t.Replace('Identifiera inertia och strategiska blockerare.', 'Identify inertia and strategic blockers.')
$t = $t.Replace('> Inertia & Blockerare</button>', '> Inertia & Blockers</button>')
$t = $t.Replace(('Vilka Commodity-komponenter b' + $r + 'r outsourcas omedelbart?'), 'Which Commodity components should be outsourced immediately?')
$t = $t.Replace('> Outsourca nu</button>', '> Outsource Now</button>')
$t = $t.Replace(('Hur p' + $r + 'verkar ESG och CSRD v' + $r + 'r value chain?'), 'How does ESG and CSRD impact our value chain?')
$t = $t.Replace(('Vilka komponenter r' + $r + 'r sig mot Commodity och b' + $r + 'r standardiseras?'), 'Which components are moving toward Commodity and should be standardized?')
$t = $t.Replace(('> Evolution-r' + $r + 'relse</button>'), '> Evolution Movement</button>')
$t = $t.Replace(('Ge en konkurrensanalys baserad p' + $r + ' kartan.'), 'Give a competitive analysis based on the map.')
$t = $t.Replace('> Konkurrensanalys</button>', '> Competitive Analysis</button>')
$t = $t.Replace(('Skapa en 12-m' + $r + 'naders strategisk roadmap.'), 'Create a 12-month strategic roadmap.')
$t = $t.Replace(('title="Skapa en 12-m' + $r + 'naders strategisk roadmap"'), 'title="Create a 12-month strategic roadmap"')
$t = $t.Replace('Sammanfatta kartan i en C-level executive summary.', 'Summarize the map in a C-level executive summary.')
$t = $t.Replace(('title="F' + $r + 'rbered n' + $r + 'sta workshop: Maturity Toolbox"'), 'title="Prepare next workshop: Maturity Toolbox"')
$t = $t -replace ('Baserat p. v.r Wardley Map: vilka mognadsdimensioner[^?]*\?'), 'Based on our Wardley Map: which maturity dimensions should we focus on? Which frameworks (Proptech, ESG, IT-Governance) do you recommend? Prepare me for the Maturity Toolbox workshop.'
$t = $t.Replace(('> F' + $r + 'rbered Mognad</button>'), '> Prepare Maturity</button>')
$t = $t.Replace(('title="' + $r + 'ppna n' + $r + 'sta verktyg: EA20 Maturity Toolbox"'), 'title="Open next tool: EA20 Maturity Toolbox"')
$t = $t.Replace(('> ' + $r + 'ppna Maturity</button>'), '> Open Maturity</button>')

# API key JS strings
$t = $t.Replace(('Nyckeln ska b' + $r + 'rja med "sk-".'), 'Key must start with "sk-".')
$t = $t.Replace(('API-nyckel sparad f' + $r + 'r alla EA 2.0-verktyg ' + $q + ' (delas med EA Platform)'), 'API key saved for all EA 2.0 tools (shared with EA Platform)')
$t = $t.Replace(("'API aktiv " + $q + " ' + key"), ("'API active: ' + key"))
$t = $t.Replace(("'API-nyckel saknas'"), "'API key missing'")

# Tooltip JS labels
$t = $t.Replace(("'H" + $r + "g synlighet'"), "'High visibility'")
$t = $t.Replace(("'Medel synlighet'"), "'Medium visibility'")
$t = $t.Replace(("'L" + $r + "g synlighet'"), "'Low visibility'")
$t = $t.Replace("' | Notering: '", "' | Note: '")

# Save map toast
$t = $t.Replace(('Wardley Map sparad i webbl' + $r + 'saren ' + $q), 'Wardley Map saved in browser')

# Import integration toast + note
$t = $t.Replace(("note: item.desc || 'Importerad fr" + $r + "n Capability Mapping'"), "note: item.desc || 'Imported from Capability Mapping'")
$t = $t -replace ('Importerade \$\{added\} komponenter fr.n Capability Mapping'), ('Imported ' + $ds + '{added} components from Capability Mapping')

# Context badge
$t = $t -replace ('Kontext fr.n Capability Map . uppdaterad'), ('Context from Capability Map ' + $em + ' updated')

# CSV import format label
$t = $t -replace 'koordinater ber.knas automatiskt\.', 'coordinates calculated automatically.'
$t = $t -replace 'koordinater l.ses direkt\.', 'coordinates loaded directly.'

# Example data (loadExample function)
$t = $t.Replace(("name: 'Hyresg" + $r + "stupplevelse'"), "name: 'Tenant Experience'")
$t = $t.Replace(("name: 'Hyresg" + $r + "stportal'"), "name: 'Tenant Portal'")
$t = $t.Replace(("name: 'Prediktivt underh" + $r + "ll'"), "name: 'Predictive Maintenance'")
$t = $t.Replace("name: 'Molninfrastruktur'", "name: 'Cloud Infrastructure'")
$t = $t.Replace(("name: 'Betalningsl" + $r + "sning'"), "name: 'Payment Solution'")
$t = $t.Replace(("name: 'Cybers" + $r + "kerhet'"), "name: 'Cybersecurity'")
$t = $t.Replace(("note: 'Direkt kundv" + $r + "rde " + $q + " differentiering'"), ("note: 'Direct customer value " + $em + " differentiation'"))
$t = $t.Replace(("note: 'Standardiserad SaaS-l" + $r + "sning'"), "note: 'Standardized SaaS solution'")
$t = $t.Replace(("note: 'Custom AI-modell " + $q + " konkurrensf" + $r + "rdel'"), ("note: 'Custom AI model " + $em + " competitive advantage'"))
$t = $t.Replace(("note: 'Commodity " + $q + " k" + $r + "p/outsourca'"), ("note: 'Commodity " + $em + " buy/outsource'"))
$t = $t.Replace("note: 'ESG-krav driver adoption'", "note: 'ESG requirements drive adoption'")
$t = $t.Replace("note: 'Regulatoriskt krav 2025'", "note: 'Regulatory requirement 2025'")
$t = $t.Replace(("note: 'Vitec/Momentum " + $q + " commodity'"), ("note: 'Vitec/Momentum " + $em + " commodity'"))
$t = $t.Replace(("note: 'Genesis " + $q + " strategisk innovation'"), ("note: 'Genesis " + $em + " strategic innovation'"))
$t = $t.Replace(("note: 'AWS/Azure " + $q + " utility'"), ("note: 'AWS/Azure " + $em + " utility'"))
$t = $t.Replace(("note: 'Genesis " + $q + " BIM + IoT + AI'"), ("note: 'Genesis " + $em + " BIM + IoT + AI'"))
$t = $t.Replace(("note: 'Commodity " + $q + " Stripe/Bankgiro'"), ("note: 'Commodity " + $em + " Stripe/Bank payment'"))
$t = $t.Replace(("note: 'ISO 27001 " + $q + " kritisk risk'"), ("note: 'ISO 27001 " + $em + " critical risk'"))
$t = $t -replace ("showToast\('Proptech Wardley-exempelscenario laddat .'\)"), "showToast('PropTech Wardley example scenario loaded')"

# runAI toast messages
$t = $t -replace ('L.gg till API-nyckel f.rst'), 'Please add an API key first'
$t = $t -replace ('L.gg till komponenter p. kartan f.rst'), 'Please add components to the map first'

# sendWardInitialGreeting (Swedish welcome message)
$t = $t -replace ('Hej! Din Wardley Map .r tom\. Klicka p. .+? f.r att komma ig.ng,.+analytisk position\.'), 'Your Wardley Map is empty. Click Load Example to get started, or add components manually.'
$t = $t.Replace('Hej! Jag har analyserat din Wardley Map.', "I've analyzed your Wardley Map.")
$t = $t.Replace(('Du har <strong>' + $ds + '{total} komponenter</strong> ' + $q), ('You have <strong>' + $ds + '{total} components</strong> -'))
$t = $t.Replace(('<strong>' + $ds + '{genesis} st i Genesis</strong> (h' + $r + 'g strategisk potential) och'), ('<strong>' + $ds + '{genesis} in Genesis</strong> (high strategic potential) and'))
$t = $t.Replace(('<strong>' + $ds + '{commodity} st i Commodity</strong> (outsourcing-kandidater).'), ('<strong>' + $ds + '{commodity} in Commodity</strong> (outsourcing candidates).'))
$t = $t.Replace(('Vill du b' + $r + 'rja med att identifiera inertia och strategiska blockerare?'), 'Shall we start by identifying inertia and strategic blockers?')

# sendWardMessage system prompt (3rd prompt - inside JS fetch)
$t = $t -replace ('Du .r en senior enterprise-arkitekt och Wardley Mapping-expert specialiserad p. fastighet och PropTech\. Svara alltid p. svenska\.'), ("You are a senior enterprise architect and Wardley Mapping expert specialized in real estate and PropTech. Respond in the same language as the user's prompt.")
$t = $t -replace ('Var konkret och aff.rsfokuserad . koppla alltid till kostnadsbesparing, riskreduktion, konkurrensf.rdel eller regulatorisk efterlevnad\.'), 'Be concrete and business-focused - always connect to cost savings, risk reduction, competitive advantage, or regulatory compliance.'
$t = $t -replace ('Kartan .r tom\.'), 'The map is empty.'

# callAdvisyAI system prompt fix (already done but ensure)
$t = $t.Replace('Always respond in Swedish.', "Respond in the same language as the user's prompt.")
$t = $t.Replace(('AI Assistant kr' + $r + 'ver konfiguration av Advicy_AI.js. L' + $r + 'gg till din OpenAI API Key via inst' + $r + 'llningar.'), 'AI Assistant requires configuration of Advicy_AI.js. Add your OpenAI API Key in settings.')

# getWardleyContext function
$t = $t.Replace(('Wardley Map ' + $r + 'r tom.'), 'Wardley Map is empty.')
$t = $t.Replace(('Wardley Map inneh' + $r + 'ller ' + $ds + '{nodes.length} komponenter:'), ('Wardley Map contains ' + $ds + '{nodes.length} components:'))

# handleWardDemoResponse knowledge base (use regex since strings are complex)
$t = $t -replace ('Genesis-komponenter</strong> representerar din h.gsta strategiska potential . men ocks. h.gst risk och kostnad\. Bygg internt och skydda som k.rnkompetens\. L.gg till API-nyckel f.r djupanalys\.'), 'Genesis components</strong> represent your highest strategic potential - but also highest risk and cost. Build internally and protect as core competence. Add an API key for deep analysis.'
$t = $t -replace ('Commodity-komponenter</strong> \(x > 75%\) b.r outsourcas till SaaS/utility-leverant.rer\. Det frig.r resurser f.r strategisk innovation i Genesis/Custom-zonen\.'), 'Commodity components</strong> (x > 75%) should be outsourced to SaaS/utility vendors. This frees resources for strategic innovation in the Genesis/Custom zone.'
$t = $t -replace ('Inertia</strong> uppst.r ofta i ERP-system och legacy-plattformar i Product-zonen\. De .r dyra att flytta men blockerar evolution\. Identifiera dem och planera migration\.'), 'Inertia</strong> typically occurs in ERP systems and legacy platforms in the Product zone. They are costly to move but block evolution. Identify them and plan migration.'
$t = $t -replace ('Roadmap-f.rslag:</strong><br>Q1-Q2: Outsourca Commodity, frig.r budget\.<br>Q3: Investera i Genesis-komponenter med st.rst kundv.rde\.<br>Q4: M.t evolution och justera positionering\.'), 'Roadmap proposal:</strong><br>Q1-Q2: Outsource Commodity, free up budget.<br>Q3: Invest in Genesis components with highest customer value.<br>Q4: Measure evolution and adjust positioning.'
$t = $t -replace ('L.gg till API-nyckel f.r en fullst.ndig C-level executive summary baserad p. din specifika karta\.'), 'Add an API key for a complete C-level executive summary based on your specific map.'
$t = $t -replace ('Konfigurera din OpenAI API Key via knappen i headern f.r fullst.ndiga AI-svar baserade p. din Wardley Map\.'), 'Configure your OpenAI API Key via the button in the header for complete AI responses based on your Wardley Map.'

# React quick action functions
$t = $t -replace ("sendMessageWithText\('Analysera min Wardley Map: identifiera styrkor, svagheter och strategiska m.jligheter\.'\)"), "sendMessageWithText('Analyze my Wardley Map: identify strengths, weaknesses and strategic opportunities.')"
$t = $t -replace ("sendMessageWithText\('Vilka komponenter b.r utvecklas vidare\? F.resl. evolution-strategier\.'\)"), "sendMessageWithText('Which components should evolve further? Suggest evolution strategies.')"
$t = $t -replace ("sendMessageWithText\('Identifiera inertia och strategiska blockerare p. kartan\.'\)"), "sendMessageWithText('Identify inertia and strategic blockers on the map.')"

# JS comment
$t = $t -replace '// anv.nder din befintliga funktion', '// uses existing function'

# Count remaining U+FFFD
$after = ($t.ToCharArray() | Where-Object { [int]$_ -eq 0xFFFD } | Measure-Object).Count
Write-Host "U+FFFD chars after: $after (fixed: $($before - $after))"

# Save the file
[System.IO.File]::WriteAllText($f, $t, [System.Text.Encoding]::UTF8)
Write-Host "File saved."

# Show any remaining garbled lines
if ($after -gt 0) {
    Write-Host "`nRemaining garbled lines (first 30):"
    $lines = $t -split "`n"
    $shown = 0
    for ($i = 0; $i -lt $lines.Count -and $shown -lt 30; $i++) {
        if ($lines[$i].Contains([char]65533)) {
            Write-Host "  L$($i+1): $($lines[$i].Trim().Substring(0,[Math]::Min($lines[$i].Trim().Length,100)))"
            $shown++
        }
    }
}
