const { useState } = React;

// Value Chain fields mapped to Capability domains
const vcFields = [
  { id: 'infrastructure', label: 'Företagsinfrastruktur', type: 'support', icon: '🏢', mapTo: ['finance', 'technology'] },
  { id: 'hr', label: 'HR & Kompetens', type: 'support', icon: '👥', mapTo: ['technology', 'operations'] },
  { id: 'tech', label: 'Teknikutveckling', type: 'support', icon: '⚙️', mapTo: ['technology', 'product'] },
  { id: 'procurement', label: 'Inköp & Upphandling', type: 'support', icon: '📦', mapTo: ['operations', 'finance'] },
  { id: 'inbound', label: 'Inbound Logistics', type: 'primary', icon: '📥', mapTo: ['technology', 'operations'] },
  { id: 'operations', label: 'Operations', type: 'primary', icon: '🔧', mapTo: ['operations', 'product'] },
  { id: 'outbound', label: 'Outbound Logistics', type: 'primary', icon: '📤', mapTo: ['customer', 'product'] },
  { id: 'marketing', label: 'Sälj & Marknadsföring', type: 'primary', icon: '📣', mapTo: ['customer'] },
  { id: 'service', label: 'Service & Eftermarknad', type: 'primary', icon: '🎧', mapTo: ['customer', 'operations'] },
  { id: 'margin', label: 'Marginal / Värde', type: 'margin', icon: '📈', mapTo: ['finance', 'product'] },
];

const capDomains = [
  { id: 'customer', label: 'Customer', icon: '👤', color: 'bg-blue-100 border-blue-400 text-blue-800' },
  { id: 'operations', label: 'Operations', icon: '⚙️', color: 'bg-orange-100 border-orange-400 text-orange-800' },
  { id: 'product', label: 'Product', icon: '📦', color: 'bg-purple-100 border-purple-400 text-purple-800' },
  { id: 'finance', label: 'Finance', icon: '💰', color: 'bg-green-100 border-green-400 text-green-800' },
  { id: 'technology', label: 'Technology', icon: '🔬', color: 'bg-gray-100 border-gray-400 text-gray-800' },
];

const integrationSteps = [
  {
    id: 1,
    icon: '🔍',
    title: 'Identifiera värdeskapande aktiviteter',
    from: 'Value Chain Analyzer V2',
    to: 'Capability Mapping V2',
    fromColor: 'bg-blue-900',
    toColor: 'bg-purple-700',
    detail: 'AI-analysen i Value Chain identifierar vilka aktiviteter som skapar vs förstör värde. Dessa mappar direkt till capability-domäner.',
    mapping: [
      { vc: 'Operations', cap: 'Operations + Product', reason: 'Kärnprocesser → capabilities att bygga/förbättra' },
      { vc: 'Teknikutveckling', cap: 'Technology + Product', reason: 'Tech-stack → strategiska capabilities' },
      { vc: 'Service & Eftermarknad', cap: 'Customer', reason: 'Kundupplevelse → customer capabilities' },
      { vc: 'Inköp & Upphandling', cap: 'Operations + Finance', reason: 'Leverantörskedja → commodity candidates' },
    ],
    outcome: 'Capability-kartan fylls med rätt domäner baserat på var värde skapas i kedjan',
    outcomeIcon: '💡'
  },
  {
    id: 2,
    icon: '📊',
    title: 'Exportera Value Chain → CSV',
    from: 'Value Chain Analyzer V2',
    to: 'Capability Mapping V2',
    fromColor: 'bg-blue-900',
    toColor: 'bg-purple-700',
    detail: 'Exportera EA2_ValueChain.csv från Value Chain. Varje aktivitet med innehåll mappar till en capability-domän.',
    mapping: [
      { vc: 'CSV: Kategori', cap: 'Domain', reason: 'Direkt mappning' },
      { vc: 'CSV: Typ (Primär/Stöd)', cap: 'Priority (Strategic/Important/Commodity)', reason: 'Primär → Strategic/Important | Stöd → Commodity' },
      { vc: 'CSV: Innehåll', cap: 'Capability Description', reason: 'Fritext → capability-namn och beskrivning' },
    ],
    outcome: 'Strukturerad import eliminerar dubbelarbete och säkerställer konsistens',
    outcomeIcon: '⚡'
  },
  {
    id: 3,
    icon: '🎯',
    title: 'Sätt strategisk prioritet per capability',
    from: 'Value Chain (Marginal-analys)',
    to: 'Capability Mapping V2',
    fromColor: 'bg-indigo-700',
    toColor: 'bg-purple-700',
    detail: 'Marginal-fältet i Value Chain visar var marginalerna är starkast/svagast. Detta styr direkt vilka capabilities som är Strategic vs Commodity.',
    mapping: [
      { vc: 'Hög marginal + primär aktivitet', cap: 'Strategic (🔴)', reason: 'Differentierar på marknaden' },
      { vc: 'Nödvändig men låg marginal', cap: 'Important (🟡)', reason: 'Nödvändig men ej unik' },
      { vc: 'Stödaktivitet / standardprocess', cap: 'Commodity (🟢)', reason: 'Standardisera / outsourca' },
    ],
    outcome: 'Datadrivet prioriteringsunderlag – eliminerar subjektiva beslut',
    outcomeIcon: '🛡️'
  },
  {
    id: 4,
    icon: '📉',
    title: 'Identifiera capability gaps från värdeförstörare',
    from: 'Value Chain AI-analys',
    to: 'Capability Mapping V2',
    fromColor: 'bg-red-700',
    toColor: 'bg-purple-700',
    detail: 'Value Chain AI-analysen identifierar "Värdeförstörande aktiviteter". Dessa är direkt capability gaps med låg mognad (1-2) i Capability Map.',
    mapping: [
      { vc: 'Reaktivt underhåll', cap: 'Predictive Maintenance → Maturity 1', reason: 'Gap → kritisk investering' },
      { vc: 'Manuell rapportering', cap: 'Financial Reporting → Maturity 2', reason: 'Gap → automatisering' },
      { vc: 'Ingen realtidsdata', cap: 'Data Platform → Maturity 1', reason: 'Gap → strategisk capability' },
    ],
    outcome: 'Capability gaps kopplas direkt till affärsrisk och investeringsbehov',
    outcomeIcon: '🔥'
  },
  {
    id: 5,
    icon: '🗺️',
    title: 'Wardley Map-export från Capability → Value Chain context',
    from: 'Capability Mapping V2',
    to: 'Value Chain Analyzer V2',
    fromColor: 'bg-purple-700',
    toColor: 'bg-blue-900',
    detail: 'Capability Map exporterar EA2_Capabilities.csv med Wardley-koordinater. Dessa kan återimporteras i Value Chain för att visualisera var i kedjan capabilities befinner sig evolutionsmässigt.',
    mapping: [
      { vc: 'Evolution: Genesis/Custom', cap: 'Strategic + låg mognad', reason: 'Bygg internt – differentierar' },
      { vc: 'Evolution: Product/Commodity', cap: 'Commodity + hög mognad', reason: 'Köp/outsourca – standardisera' },
      { vc: 'Visibility: High', cap: 'Customer-domän', reason: 'Synlig för hyresgäst/kund' },
    ],
    outcome: 'Komplett make/buy/partner-beslut per capability kopplat till värdekedjan',
    outcomeIcon: '🏆'
  },
  {
    id: 6,
    icon: '🤖',
    title: 'Kombinerad AI-analys: Dubbel insikt',
    from: 'Value Chain AI + Capability AI',
    to: 'Strategisk Roadmap',
    fromColor: 'bg-teal-700',
    toColor: 'bg-gray-800',
    detail: 'Kör AI-analys i båda verktygen och kombinera insikterna. Value Chain ger "var i kedjan" och Capability Map ger "vad som saknas och hur moget det är".',
    mapping: [
      { vc: 'VC: Digitaliseringsmöjligheter', cap: 'Cap: Investeringsprioriteringar', reason: 'Kombinerat → konkret roadmap' },
      { vc: 'VC: Strategiska rekommendationer', cap: 'Cap: Capability Gaps', reason: 'Kombinerat → gap-to-action plan' },
      { vc: 'VC: Värdeskapande aktiviteter', cap: 'Cap: Strategiska Capabilities', reason: 'Kombinerat → build vs buy' },
    ],
    outcome: 'En sammanhängande strategisk berättelse från värdekedja till capability till investering',
    outcomeIcon: '🎯'
  },
];

const domainMapping = {
  infrastructure: ['finance', 'technology'],
  hr: ['technology', 'operations'],
  tech: ['technology', 'product'],
  procurement: ['operations', 'finance'],
  inbound: ['technology', 'operations'],
  operations: ['operations', 'product'],
  outbound: ['customer', 'product'],
  marketing: ['customer'],
  service: ['customer', 'operations'],
  margin: ['finance', 'product'],
};

function App() {
  const [activeStep, setActiveStep] = useState(null);
  const [activeVC, setActiveVC] = useState(null);
  const [view, setView] = useState('flow'); // 'flow' | 'matrix' | 'schema'

  const getHighlightedDomains = () => {
    if (!activeVC) return [];
    return domainMapping[activeVC] || [];
  };

  const highlighted = getHighlightedDomains();

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-800 text-white rounded-xl p-5 mb-5 shadow-lg">
          <h1 className="text-xl font-bold mb-1">Integration Architecture</h1>
          <p className="text-blue-200 text-sm">AI Value Chain Analyzer V2 ↔ AI Capability Mapping V2</p>
          <div className="flex gap-4 mt-3 text-xs text-blue-300">
            <span>🔵 Value Chain → Porter's 9 aktiviteter</span>
            <span>🟣 Capability Map → 5 domäner × prioritet × mognad</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'flow', label: '🔄 Integrationsflöde', desc: '6 steg' },
            { id: 'matrix', label: '🗂️ Mappningsmatris', desc: 'VC → Cap' },
            { id: 'schema', label: '📄 Data Schema', desc: 'CSV/JSON' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === tab.id ? 'bg-indigo-700 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {tab.label} <span className="text-xs opacity-60 ml-1">{tab.desc}</span>
            </button>
          ))}
        </div>

        {/* FLOW VIEW */}
        {view === 'flow' && (
          <div className="space-y-3">
            {integrationSteps.map((step, idx) => (
              <div key={step.id}>
                <div
                  className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${activeStep === step.id ? 'border-indigo-400 shadow-lg' : 'border-gray-200 hover:border-indigo-200 hover:shadow-md'}`}
                  onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-xl shrink-0">
                        {step.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-gray-400">STEG {step.id}</span>
                          <span className={`text-xs text-white px-2 py-0.5 rounded-full ${step.fromColor}`}>{step.from}</span>
                          <span className="text-gray-400 text-xs">→</span>
                          <span className={`text-xs text-white px-2 py-0.5 rounded-full ${step.toColor}`}>{step.to}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{step.title}</p>
                      </div>
                    </div>
                    <span className="text-gray-400 ml-2">{activeStep === step.id ? '▲' : '▼'}</span>
                  </div>

                  {activeStep === step.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-3">{step.detail}</p>
                      <div className="grid grid-cols-1 gap-2 mb-3">
                        {step.mapping.map((m, i) => (
                          <div key={i} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2">
                            <div className="flex-1">
                              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{m.vc}</span>
                              <span className="text-gray-400 mx-2 text-xs">→</span>
                              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{m.cap}</span>
                            </div>
                            <span className="text-xs text-gray-500 shrink-0 max-w-xs">{m.reason}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-2">
                        <span className="text-lg">{step.outcomeIcon}</span>
                        <p className="text-sm font-medium text-indigo-800">{step.outcome}</p>
                      </div>
                    </div>
                  )}
                </div>
                {idx < integrationSteps.length - 1 && (
                  <div className="flex justify-center my-1">
                    <div className="w-0.5 h-3 bg-gray-300"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MATRIX VIEW */}
        {view === 'matrix' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">Klicka på en Value Chain-aktivitet för att se vilka Capability-domäner den mappar till.</p>
            <div className="grid grid-cols-3 gap-4">
              {/* VC Column */}
              <div className="col-span-1">
                <div className="bg-blue-900 text-white text-xs font-bold uppercase px-3 py-2 rounded-t-lg text-center">Value Chain</div>
                <div className="bg-white border border-blue-200 rounded-b-lg overflow-hidden">
                  {vcFields.map(f => (
                    <div
                      key={f.id}
                      onClick={() => setActiveVC(activeVC === f.id ? null : f.id)}
                      className={`px-3 py-2 cursor-pointer border-b border-gray-100 text-sm flex items-center gap-2 transition-all ${activeVC === f.id ? 'bg-blue-100 font-semibold text-blue-900' : 'hover:bg-blue-50 text-gray-700'} ${f.type === 'support' ? 'border-l-4 border-l-gray-400' : f.type === 'margin' ? 'border-l-4 border-l-purple-400' : 'border-l-4 border-l-blue-500'}`}
                    >
                      <span>{f.icon}</span>
                      <span className="text-xs">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="col-span-1 flex flex-col items-center justify-center gap-2">
                <div className="text-3xl text-gray-300">→</div>
                {activeVC && (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Mappar till</p>
                    {domainMapping[activeVC].map(d => {
                      const domain = capDomains.find(c => c.id === d);
                      return (
                        <div key={d} className={`text-xs font-bold px-3 py-1 rounded-full border mb-1 ${domain.color}`}>
                          {domain.icon} {domain.label}
                        </div>
                      );
                    })}
                  </div>
                )}
                {!activeVC && (
                  <p className="text-xs text-gray-400 text-center">Välj en aktivitet</p>
                )}
              </div>

              {/* Cap Column */}
              <div className="col-span-1">
                <div className="bg-purple-700 text-white text-xs font-bold uppercase px-3 py-2 rounded-t-lg text-center">Capability Domains</div>
                <div className="bg-white border border-purple-200 rounded-b-lg overflow-hidden">
                  {capDomains.map(d => (
                    <div
                      key={d.id}
                      className={`px-3 py-2 border-b border-gray-100 text-sm flex items-center gap-2 transition-all ${highlighted.includes(d.id) ? 'bg-purple-100 font-semibold ring-2 ring-purple-400' : 'text-gray-500'}`}
                    >
                      <span>{d.icon}</span>
                      <span className="text-xs">{d.label}</span>
                      {highlighted.includes(d.id) && <span className="ml-auto text-purple-600 text-xs">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex gap-3 text-xs flex-wrap">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded"></div> Primär aktivitet</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-400 rounded"></div> Stödaktivitet</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-400 rounded"></div> Marginal</div>
            </div>
          </div>
        )}

        {/* SCHEMA VIEW */}
        {view === 'schema' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-blue-900 text-white text-xs px-2 py-0.5 rounded">EXPORT</span>
                EA2_ValueChain.csv → Capability Mapping
              </h3>
              <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">{`"Kategori","Typ","Innehåll"
"Operations","Primär aktivitet","Fastighetsförvaltning, drift, underhåll..."
"Teknikutveckling","Stödaktivitet","Plattformsutveckling, AI/ML, IoT..."
"Service & Eftermarknad","Primär aktivitet","Hyresgästsupport, felanmälan..."

→ Mappas till Capability Map:
  Typ: "Primär aktivitet" → Priority: Strategic/Important
  Typ: "Stödaktivitet"   → Priority: Important/Commodity
  Kategori              → Domain (se mappningsmatris)`}</pre>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-purple-700 text-white text-xs px-2 py-0.5 rounded">EXPORT</span>
                EA2_Capabilities.csv → Value Chain / Wardley
              </h3>
              <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">{`"Domain","Capability","Priority_EN","Maturity_1_5","Wardley_Evolution","Wardley_Visibility"
"Operations","Predictive Maintenance","strategic",2,"Genesis/Custom","Medium"
"Customer","Tenant Self-Service Portal","strategic",2,"Custom","High"
"Technology","Data Platform & Integration","strategic",2,"Genesis/Custom","Low"

→ Används i Value Chain för:
  Evolution: Genesis/Custom → Bygg internt (differentierar)
  Evolution: Product/Commodity → Köp/outsourca
  Visibility: High → Synlig för hyresgäst → Customer-aktiviteter`}</pre>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-2">🔗 Delad localStorage-nyckel (API)</h3>
              <pre className="bg-gray-900 text-yellow-300 text-xs p-4 rounded-lg overflow-x-auto">{`// Value Chain Analyzer V2 sparar:
localStorage.setItem('vc_openai_key', key);
localStorage.setItem('ea20_openai_key', key);  // Delad med EA 2.0

// Capability Mapping V2 läser:
localStorage.getItem('ea_openai_key');

// ⚠️ Notera: Olika nycklar! Synkronisera till samma:
// Rekommendation: Använd 'ea_suite_key' i alla verktyg`}</pre>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-5 bg-gradient-to-r from-blue-900 to-purple-800 text-white rounded-xl p-4">
          <p className="text-sm font-bold mb-2">End-to-End Pipeline</p>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="bg-white/20 px-2 py-1 rounded">Value Chain → Identifiera värde</span>
            <span>→</span>
            <span className="bg-white/20 px-2 py-1 rounded">Capability Map → Prioritera & mognad</span>
            <span>→</span>
            <span className="bg-white/20 px-2 py-1 rounded">Wardley → Make/Buy/Partner</span>
            <span>→</span>
            <span className="bg-white/20 px-2 py-1 rounded">EA 2.0 → ROI & Roadmap</span>
          </div>
        </div>
      </div>
    </div>
  );
}