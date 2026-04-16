const fs = require('fs');
const path = require('path');

/**
 * Comprehensive encoding fix script
 * Fixes all � (replacement character) instances across files
 */

// Define replacement mappings based on context
const replacements = [
  // Swedish characters
  { pattern: /Aff�rsmodell/g, replacement: 'Affärsmodell' },
  { pattern: /V�rdeerbjudande/g, replacement: 'Värdeerbjudande' },
  { pattern: /Int�ktslogik/g, replacement: 'Intäktslogik' },
  { pattern: /Grund f�r/g, replacement: 'Grund för' },
  { pattern: /f�r kontext-medveten/g, replacement: 'för kontext-medveten' },
  { pattern: /Exakt JSON-generering f�r/g, replacement: 'Exakt JSON-generering för' },
  { pattern: /Allm�n EA-r�dgivning/g, replacement: 'Allmän EA-rådgivning' },
  { pattern: /fr�gor/g, replacement: 'frågor' },
  { pattern: /H�ller kontext f�r aktivt l�ge/g, replacement: 'Håller kontext för aktivt läge' },
  { pattern: /Diskutera resultatet, st�ll fr�gor, f�resl� f�rb�ttringar/g, replacement: 'Diskutera resultatet, ställ frågor, föreslå förbättringar' },
  { pattern: /Beskriv �ndringen du vill g�ra/g, replacement: 'Beskriv ändringen du vill göra' },
  { pattern: /Fr�ga Advicy Agent/g, replacement: 'Fråga Advicy Agent' },
  { pattern: /Du har osparade �ndringar. Vill du verkligen l�mna sidan/g, replacement: 'Du har osparade ändringar. Vill du verkligen lämna sidan' },
  { pattern: /generate|generera|create|skapa|build|bygg\)\s+\(enterprise\s+\)\?\(architecture|arkitektur\)\s\*\(for|f�r/g, replacement: 'generate|generera|create|skapa|build|bygg)\\s+(enterprise\\s+)?(architecture|arkitektur)\\s*(for|för' },
  { pattern: /V�lkommen till EA Strategic Diagnostic/g, replacement: 'Välkommen till EA Strategic Diagnostic' },
  { pattern: /Jag �r din/g, replacement: 'Jag är din' },
  { pattern: /Min uppgift �r att guida/g, replacement: 'Min uppgift är att guida' },
  { pattern: /m�larkitektur/g, replacement: 'målarkitektur' },
  { pattern: /Vilken typ av organisation\/bransch �r detta/g, replacement: 'Vilken typ av organisation/bransch är detta' },
  { pattern: /Vilket omr�de fokuserar vi p�/g, replacement: 'Vilket område fokuserar vi på' },
  { pattern: /�r detta en problemsituation eller ett generellt f�rb�ttringsinitiativ/g, replacement: 'Är detta en problemsituation eller ett generellt förbättringsinitiativ' },
  { pattern: /Svara p� fr�gorna steg f�r steg/g, replacement: 'Svara på frågorna steg för steg' },
  { pattern: /st�d/g, replacement: 'stöd' },
  { pattern: /v�rdeerbjudande/g, replacement: 'värdeerbjudande' },
  { pattern: /int�ktsstr�m/g, replacement: 'intäktsström' },
  { pattern: /f�rb�ttra/g, replacement: 'förbättra' },
  
  // En dashes and em dashes (–)
  { pattern: /Step 6"/g, replacement: 'Step 6"' },
  { pattern: /BMC, Value Chain, Capability Map, Maturity, APM"/g, replacement: 'BMC, Value Chain, Capability Map, Maturity, APM"' },
  { pattern: /AI-driven capability priorities &amp; sequencing"/g, replacement: 'AI-driven capability priorities & sequencing"' },
  { pattern: /ROI, value pool modelling, multi-scenario CBA"/g, replacement: 'ROI, value pool modelling, multi-scenario CBA"' },
  { pattern: /disruption modelling, dependency impact, resilience"/g, replacement: 'disruption modelling, dependency impact, resilience"' },
  { pattern: /alternative roadmap generation, trade-off analysis"/g, replacement: 'alternative roadmap generation, trade-off analysis"' },
  { pattern: />�Analyse Gaps�/g, replacement: '>"Analyse Gaps"' },
  { pattern: />�Roadmap�/g, replacement: '>"Roadmap"' },
  { pattern: /� generates transformation plan/g, replacement: '– generates transformation plan' },
  { pattern: /� visual capability map/g, replacement: '– visual capability map' },
  { pattern: /� gap analysis results/g, replacement: '– gap analysis results' },
  { pattern: /� maturity dashboard/g, replacement: '– maturity dashboard' },
  { pattern: /� visual roadmap/g, replacement: '– visual roadmap' },
  { pattern: /� CxO summary/g, replacement: '– CxO summary' },
  { pattern: /Save &nbsp;�&nbsp;/g, replacement: 'Save &nbsp;·&nbsp;' },
  { pattern: /Open &nbsp;�&nbsp;/g, replacement: 'Open &nbsp;·&nbsp;' },
  { pattern: /Import &nbsp;�&nbsp;/g, replacement: 'Import &nbsp;·&nbsp;' },
  { pattern: /Report &nbsp;�&nbsp;/g, replacement: 'Report &nbsp;·&nbsp;' },
  { pattern: /AI Chat &nbsp;�&nbsp;/g, replacement: 'AI Chat &nbsp;·&nbsp;' },
  { pattern: /Management overview � capability health/g, replacement: 'Management overview – capability health' },
  { pattern: /Strategic Intent � Step 1/g, replacement: 'Strategic Intent – Step 1' },
  { pattern: /one per line � what the EA must investigate/g, replacement: 'one per line – what the EA must investigate' },
  { pattern: /One sentence � direction \+ key outcome/g, replacement: 'One sentence – direction + key outcome' },
  { pattern: /one per line � strategic pre-requisites/g, replacement: 'one per line – strategic pre-requisites' },
  { pattern: /one per line � what this work delivers/g, replacement: 'one per line – what this work delivers' },
  { pattern: /One sentence � urgency driver/g, replacement: 'One sentence – urgency driver' },
  { pattern: /Strategic Alignment � AI Readiness � Technical Debt/g, replacement: 'Strategic Alignment · AI Readiness · Technical Debt' },
  { pattern: /Capability � System � AI Agent Readiness/g, replacement: 'Capability · System · AI Agent Readiness' },
  { pattern: /Current State \(AS-IS\) � capabilities derived/g, replacement: 'Current State (AS-IS) – capabilities derived' },
  { pattern: /Capability � Layer 1/g, replacement: 'Capability – Layer 1' },
  { pattern: /IT System � Layer 2/g, replacement: 'IT System – Layer 2' },
  { pattern: /AI Agent � Layer 3/g, replacement: 'AI Agent – Layer 3' },
  { pattern: /Business Capabilities � what the enterprise/g, replacement: 'Business Capabilities – what the enterprise' },
  { pattern: /IT Systems � technology platforms/g, replacement: 'IT Systems – technology platforms' },
  { pattern: /AI Agents � automation augmenting/g, replacement: 'AI Agents – automation augmenting' },
  { pattern: /CFO View � Financial Guardrails/g, replacement: 'CFO View – Financial Guardrails' },
  { pattern: /Savings � invest estimate/g, replacement: 'Savings ÷ invest estimate' },
  { pattern: /Value clusters unlocked by capability uplift � Step 6/g, replacement: 'Value clusters unlocked by capability uplift – Step 6' },
  { pattern: /Target Architecture � Capability Uplift Plan/g, replacement: 'Target Architecture – Capability Uplift Plan' },
  { pattern: /Transformation Roadmap � Visual Timeline/g, replacement: 'Transformation Roadmap – Visual Timeline' },
  { pattern: /PARALLEL ANALYTICS WORKFLOWS � 4 INDEPENDENT/g, replacement: 'PARALLEL ANALYTICS WORKFLOWS – 4 INDEPENDENT' },
  { pattern: /Loading context�/g, replacement: 'Loading context...' },
  { pattern: /Starting�/g, replacement: 'Starting...' },
  { pattern: /e\.g\. cap-3 � leave blank/g, replacement: 'e.g. cap-3 – leave blank' },
  { pattern: /optional � use 0�100/g, replacement: 'optional – use 0–100' },
  { pattern: /4-Phase End-to-End Data Flow � BMC \? Value/g, replacement: '4-Phase End-to-End Data Flow – BMC → Value' },
  { pattern: /Business Model � Value Proposition � Revenue Logic/g, replacement: 'Business Model · Value Proposition · Revenue Logic' },
  { pattern: /strategic analysis � export results/g, replacement: 'strategic analysis – export results' },
  { pattern: /Enterprise Team � New Digital/g, replacement: 'Enterprise Team – New Digital' },
  { pattern: /weak customer relationships and channels � AI recommends/g, replacement: 'weak customer relationships and channels – AI recommends' },
  { pattern: /Porter's Value Chain � Strategic Value Analysis/g, replacement: "Porter's Value Chain – Strategic Value Analysis" },
  { pattern: /Organizational Capabilities � Gap Analysis � Prioritization/g, replacement: 'Organizational Capabilities · Gap Analysis · Prioritization' },
  { pattern: /Wardley Mapping � Evolution Strategy � Sourcing/g, replacement: 'Wardley Mapping · Evolution Strategy · Sourcing' },
  { pattern: /Maturity Assessment � Multi-Industry � Strategic Roadmap/g, replacement: 'Maturity Assessment · Multi-Industry · Strategic Roadmap' },
  { pattern: /GPT-5 � PDF report � Multi-industry/g, replacement: 'GPT-5 · PDF report · Multi-industry' },
  { pattern: /Inventory � Lifecycle � Ownership � Rationalization/g, replacement: 'Inventory · Lifecycle · Ownership · Rationalization' },
  { pattern: /Score Technical Fit and Business Value \(1�5\)/g, replacement: 'Score Technical Fit and Business Value (1–5)' },
  { pattern: /CIO � Application Rationalization/g, replacement: 'CIO – Application Rationalization' },
  { pattern: /low business value and high operating cost\. The fit matrix clearly shows candidates for retire and consolidate � solid input/g, replacement: 'low business value and high operating cost. The fit matrix clearly shows candidates for retire and consolidate – solid input' },
  { pattern: /LocalStorage � JSON export � 5 views/g, replacement: 'LocalStorage · JSON export · 5 views' },
  { pattern: /step registry � populated on DOMContentLoaded/g, replacement: 'step registry – populated on DOMContentLoaded' },
  { pattern: /Advicy Agent � Discovery Mode/g, replacement: 'Advicy Agent – Discovery Mode' },
  { pattern: /Advicy Agent � Action Mode/g, replacement: 'Advicy Agent – Action Mode' },
  { pattern: /createProject generates its own ID � align/g, replacement: 'createProject generates its own ID – align' },
  { pattern: /Close dialog and navigate home FIRST � before any rendering/g, replacement: 'Close dialog and navigate home FIRST – before any rendering' },
  { pattern: /Legacy shim � keep existing callers/g, replacement: 'Legacy shim – keep existing callers' },
  { pattern: /Prompt Trace � show editable/g, replacement: 'Prompt Trace – show editable' },
  { pattern: /Thinking card � DISABLED/g, replacement: 'Thinking card – DISABLED' },
  { pattern: /PARALLEL ANALYTICS WORKFLOWS � runAnalyticsTab/g, replacement: 'PARALLEL ANALYTICS WORKFLOWS – runAnalyticsTab' },
  { pattern: /EA Context: \$\{dataStatus\.join\(' � '\)\}/g, replacement: "EA Context: ${dataStatus.join(' · ')}" },
  { pattern: /Analytics can run with partial data � results improve/g, replacement: 'Analytics can run with partial data – results improve' },
  { pattern: /Analysis complete � \$\{result\.metadata/g, replacement: 'Analysis complete – ${result.metadata' },
  { pattern: /\$\{Math\.round\(\(result\.metadata\?\.durationMs \|\| 0\) \/ 1000\)\}s � \$\{new Date/g, replacement: '${Math.round((result.metadata?.durationMs || 0) / 1000)}s · ${new Date' },
  { pattern: /\$\{p\.why \|\| ''\} � \$\{p\.timeline/g, replacement: "${p.why || ''} – ${p.timeline" },
  { pattern: /Public entry point � called by each analytics/g, replacement: 'Public entry point – called by each analytics' },
  { pattern: /Running�/g, replacement: 'Running...' },
  { pattern: /deltas will appear once capabilities are mapped\./g, replacement: 'deltas will appear once capabilities are mapped.' },
  { pattern: /capabilities � Last modified/g, replacement: 'capabilities · Last modified' },
  { pattern: /domain � Maturity/g, replacement: 'domain · Maturity' },
  { pattern: /sidebar has no minimize � just close/g, replacement: 'sidebar has no minimize – just close' },
  { pattern: /Storage full � trim the oldest/g, replacement: 'Storage full – trim the oldest' },
  { pattern: /saveConversationHistory: could not persist after trimming � localStorage/g, replacement: 'saveConversationHistory: could not persist after trimming – localStorage' },
  { pattern: /The actual structured data lives in model\.\* � the chat copy/g, replacement: 'The actual structured data lives in model.* – the chat copy' },
  { pattern: /message truncated for storage � full data saved/g, replacement: 'message truncated for storage – full data saved' },
  { pattern: /Escape HTML first \(XSS safety � placeholders/g, replacement: 'Escape HTML first (XSS safety – placeholders' },
  { pattern: /Raw HTML block placeholder � pass through/g, replacement: 'Raw HTML block placeholder – pass through' },
  { pattern: /no-op � prompt trace disabled/g, replacement: 'no-op – prompt trace disabled' },
  { pattern: /Thinking Card � shows the model's/g, replacement: "Thinking Card – shows the model's" },
  { pattern: /AI-generated � review before/g, replacement: 'AI-generated – review before' },
  { pattern: /Generating executive summary�/g, replacement: 'Generating executive summary...' },
  
  // Bullet points and list markers
  { pattern: />� </g, replacement: '>• ' },
  { pattern: /� /g, replacement: '• ' },
  
  // Placeholders that should be em dash or arrow
  { pattern: /> \? /g, replacement: '> → ' },
  
  // Fix KPI placeholders (should be empty or —)
  { pattern: /">�</g, replacement: '">—' },
  
  // Fix status badges
  { pattern: /"integration-status-badge" id="bmc-status-badge">�</g, replacement: '"integration-status-badge" id="bmc-status-badge">—' },
  { pattern: /"integration-status-badge" id="valuechain-status-badge">�</g, replacement: '"integration-status-badge" id="valuechain-status-badge">—' },
  { pattern: /"integration-status-badge" id="capability-status-badge">�</g, replacement: '"integration-status-badge" id="capability-status-badge">—' },
  { pattern: /"integration-status-badge" id="strategy-status-badge">�</g, replacement: '"integration-status-badge" id="strategy-status-badge">—' },
  
  // Fix markdown file issues
  { pattern: /## � Creating/g, replacement: '## 📁 Creating' },
  { pattern: /## �📥 Import/g, replacement: '## 📥 Import' }
];

// Files to process
const filesToProcess = [
  'FILE_MANAGEMENT_GUIDE.md',
  'NexGenEA/NexGen_EA_V4.html'
];

let totalReplacements = 0;

filesToProcess.forEach(relativePath => {
  const filePath = path.join(__dirname, relativePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    return;
  }
  
  console.log(`\n📝 Processing: ${relativePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;
  
  // Apply all replacements
  replacements.forEach(({ pattern, replacement }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fileReplacements += matches.length;
    }
  });
  
  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  
  totalReplacements += fileReplacements;
  console.log(`   ✅ Fixed ${fileReplacements} encoding issues`);
});

console.log(`\n✅ Complete! Fixed ${totalReplacements} total encoding issues across ${filesToProcess.length} files.`);
