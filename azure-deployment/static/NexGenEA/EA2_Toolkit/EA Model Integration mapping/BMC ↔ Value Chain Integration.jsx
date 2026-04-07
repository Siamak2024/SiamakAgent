const { useState } = React;

const bmcNodes = [
  { id: 'kp', label: 'Nyckelpartners', icon: '🤝', mapsTo: ['proc', 'inbound'], desc: 'Styr Procurement och Inbound Logistics – vilka partners levererar vad?' },
  { id: 'ka', label: 'Nyckelaktiviteter', icon: '⚙️', mapsTo: ['infra', 'hr', 'tech', 'ops'], desc: 'Bryts ner i Support- & Primära aktiviteter i värdekedjan' },
  { id: 'kr', label: 'Nyckelresurser', icon: '🏗️', mapsTo: ['infra', 'tech'], desc: 'Infrastruktur och teknisk plattform i värdekedjan' },
  { id: 'vp', label: 'Värdeerbjudande', icon: '💎', mapsTo: ['ops', 'sales', 'service'], desc: 'Kärnan – levereras via Operations, Sales & Service' },
  { id: 'cr', label: 'Kundrelationer', icon: '👥', mapsTo: ['sales', 'service'], desc: 'Direkt koppling till Sales & Service & Aftermarket' },
  { id: 'ch', label: 'Kanaler', icon: '📡', mapsTo: ['outbound', 'sales'], desc: 'Distribution och marknadskommunikation' },
  { id: 'cs', label: 'Kundsegment', icon: '🎯', mapsTo: ['sales'], desc: 'Målgrupp styr Sales & Marketing-strategin' },
  { id: 'cost', label: 'Kostnadsstruktur', icon: '🧾', mapsTo: ['margin'], desc: 'Direkt påverkan på Marginal-analysen' },
  { id: 'rev', label: 'Intäktsströmmar', icon: '💰', mapsTo: ['margin'], desc: 'Intäktssidan av Marginal-analysen' },
];

const vcNodes = [
  { id: 'infra', label: 'Infrastructure', type: 'support' },
  { id: 'hr', label: 'HR Management', type: 'support' },
  { id: 'tech', label: 'Tech Development', type: 'support' },
  { id: 'proc', label: 'Procurement', type: 'support' },
  { id: 'inbound', label: 'Inbound Logistics', type: 'primary' },
  { id: 'ops', label: 'Operations', type: 'primary' },
  { id: 'outbound', label: 'Outbound Logistics', type: 'primary' },
  { id: 'sales', label: 'Sales & Marketing', type: 'primary' },
  { id: 'service', label: 'Service & Aftermarket', type: 'primary' },
  { id: 'margin', label: 'MARGIN', type: 'margin' },
];

const outcomes = [
  { icon: '🛡️', color: 'blue', title: 'Riskreduktion', text: 'Identifiera glapp mellan affärsmodellens löften och värdekedjans faktiska leveransförmåga.' },
  { icon: '💸', color: 'emerald', title: 'Kostnadsbesparing', text: 'Mappa BMC:s kostnadsstruktur direkt till "Value Destroyers" i värdekedjan för riktad automation.' },
  { icon: '🚀', color: 'orange', title: 'Innovation', text: 'Hitta nya intäktsströmmar (BMC) via optimerad Tech Development och AI-driven analys (VC).' },
];

const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-400', icon: 'bg-blue-100', text: 'text-blue-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-400', icon: 'bg-emerald-100', text: 'text-emerald-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-400', icon: 'bg-orange-100', text: 'text-orange-700' },
};

const tabs = ['Integrationsflöde', 'Mappningsmatris', 'Data Schema'];

const flowSteps = [
  {
    step: 1,
    from: 'BMC: Värdeerbjudande',
    to: 'VC: Operations + Service',
    icon: '💎→⚙️',
    detail: 'Det du lovar kunden i BMC bryts ner i hur det faktiskt levereras via Operations och Service & Aftermarket i Value Chain.',
    outcome: 'Säkerställer att löftet är operativt möjligt – minskar leveransrisk.',
  },
  {
    step: 2,
    from: 'BMC: Nyckelaktiviteter',
    to: 'VC: Support + Primary Activities',
    icon: '⚙️→🏗️',
    detail: 'Aktiviteterna i BMC mappar till antingen Support Activities (Tech, HR, Infra) eller Primary Activities (Ops, Logistics).',
    outcome: 'Ger en komplett operativ bild – identifierar saknade aktiviteter.',
  },
  {
    step: 3,
    from: 'BMC: Kostnadsstruktur',
    to: 'VC: Marginalanalys',
    icon: '🧾→📊',
    detail: 'Kostnadsposterna i BMC ger direkt indata till var marginalen pressas i Value Chain-analysatorn.',
    outcome: 'Möjliggör riktad kostnadsoptimering och automation.',
  },
  {
    step: 4,
    from: 'BMC: Nyckelpartners',
    to: 'VC: Procurement + Inbound',
    icon: '🤝→📦',
    detail: 'Dina partners i BMC definierar hur effektiv din Inbound Logistics och Procurement är i värdekedjan.',
    outcome: 'Optimerar leverantörskedjan och minskar beroenderisk.',
  },
  {
    step: 5,
    from: 'BMC: Kundsegment',
    to: 'VC: Sales & Marketing',
    icon: '🎯→📣',
    detail: 'Vem du riktar dig till i BMC styr hur Sales & Marketing-boxen ska optimeras för AI-driven personalisering.',
    outcome: 'Ökad tenant retention och lägre vakansgrad.',
  },
  {
    step: 6,
    from: 'BMC CSV Export',
    to: 'VC: AI-analys input',
    icon: '📄→🤖',
    detail: 'BMC exporterar CSV med alla 12 fält. Value Chain-analysatorn kan importera dessa som kontext för sin AI-analys.',
    outcome: 'Kombinerad AI-insikt – strategisk roadmap med operativ förankring.',
  },
];

const schemaFields = {
  bmc: ['key_partners', 'key_activities', 'key_resources', 'customer_relationships', 'channels', 'customer_segments', 'value_proposition', 'revenue_streams', 'cost_structure', 'goal', 'driver', 'regulatory'],
  vc: ['activity_name', 'activity_type', 'value_score', 'cost_score', 'digitalization_potential', 'ai_opportunity', 'notes'],
};

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeNode, setActiveNode] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);

  const isHighlighted = (id) => {
    if (!activeNode) return false;
    const node = bmcNodes.find(n => n.id === activeNode);
    return node && node.mapsTo.includes(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🔗</span>
            <h1 className="text-2xl font-extrabold tracking-tight">BMC ↔ Value Chain Analyzer</h1>
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">EA 2.0</span>
          </div>
          <p className="text-blue-200 text-sm">Integrationsarkitektur · Från affärsmodell till operativ värdekedja</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8">
        <div className="max-w-5xl mx-auto flex gap-1">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === i
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* TAB 0: Integrationsflöde */}
        {activeTab === 0 && (
          <div>
            <p className="text-slate-500 text-sm mb-6">Klicka på ett steg för att expandera detaljer och affärsnytta.</p>
            <div className="space-y-3">
              {flowSteps.map((s) => (
                <div
                  key={s.step}
                  onClick={() => setExpandedStep(expandedStep === s.step ? null : s.step)}
                  className={`rounded-xl border-2 cursor-pointer transition-all ${
                    expandedStep === s.step
                      ? 'border-blue-400 bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {s.step}
                    </div>
                    <div className="text-lg">{s.icon}</div>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-800 text-sm">{s.from}</span>
                      <span className="text-slate-400 mx-2">→</span>
                      <span className="font-semibold text-emerald-700 text-sm">{s.to}</span>
                    </div>
                    <div className={`text-slate-400 transition-transform ${expandedStep === s.step ? 'rotate-180' : ''}`}>▼</div>
                  </div>
                  {expandedStep === s.step && (
                    <div className="px-6 pb-5 pt-1 border-t border-blue-100">
                      <p className="text-sm text-slate-700 mb-3">{s.detail}</p>
                      <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <span className="text-emerald-600 font-bold text-xs mt-0.5">AFFÄRSNYTTA</span>
                        <p className="text-xs text-emerald-800">{s.outcome}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: Mappningsmatris */}
        {activeTab === 1 && (
          <div>
            <p className="text-slate-500 text-sm mb-6">Hovra över en BMC-komponent för att se vilka Value Chain-aktiviteter den mappar till.</p>
            <div className="grid grid-cols-2 gap-10 items-start">
              {/* BMC */}
              <div>
                <h2 className="text-base font-bold text-blue-700 mb-4 flex items-center gap-2">
                  📋 Business Model Canvas
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {bmcNodes.map(node => (
                    <div
                      key={node.id}
                      onMouseEnter={() => setActiveNode(node.id)}
                      onMouseLeave={() => setActiveNode(null)}
                      className={`p-3 rounded-xl border-2 cursor-help transition-all duration-200 ${
                        activeNode === node.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                          : 'border-slate-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="text-lg mb-1">{node.icon}</div>
                      <div className="font-semibold text-slate-800 text-xs">{node.label}</div>
                      {activeNode === node.id && (
                        <div className="text-blue-600 text-xs mt-1 leading-tight">{node.desc}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Value Chain */}
              <div>
                <h2 className="text-base font-bold text-emerald-700 mb-4 flex items-center gap-2">
                  🔗 Value Chain Analyzer
                </h2>
                <div className="border-2 border-slate-200 rounded-2xl p-4 bg-white shadow-sm">
                  {/* Support */}
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Support Activities</div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {vcNodes.filter(n => n.type === 'support').map(node => (
                      <div
                        key={node.id}
                        className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all duration-300 ${
                          isHighlighted(node.id)
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {node.label}
                      </div>
                    ))}
                  </div>
                  {/* Primary */}
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Primary Activities</div>
                  <div className="grid grid-cols-5 gap-1 mb-3">
                    {vcNodes.filter(n => n.type === 'primary').map(node => (
                      <div
                        key={node.id}
                        className={`p-2 rounded-lg border text-center flex items-center justify-center transition-all duration-300 ${
                          isHighlighted(node.id)
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md -translate-y-1'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                        style={{ fontSize: '9px', fontWeight: 700, minHeight: '60px' }}
                      >
                        {node.label}
                      </div>
                    ))}
                  </div>
                  {/* Margin */}
                  {vcNodes.filter(n => n.type === 'margin').map(node => (
                    <div
                      key={node.id}
                      className={`p-3 rounded-xl border-2 text-center font-black tracking-widest text-sm transition-all duration-500 ${
                        isHighlighted(node.id)
                          ? 'bg-orange-500 text-white border-orange-600 shadow-xl scale-105'
                          : 'bg-slate-800 text-slate-400 border-slate-900'
                      }`}
                    >
                      {node.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Outcomes */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {outcomes.map((o, i) => {
                const c = colorMap[o.color];
                return (
                  <div key={i} className={`p-5 rounded-2xl border ${c.bg} ${c.border}`}>
                    <div className={`w-9 h-9 ${c.icon} rounded-lg flex items-center justify-center text-lg mb-3`}>{o.icon}</div>
                    <h3 className={`font-bold text-sm mb-1 ${c.text}`}>{o.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{o.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Data Schema */}
        {activeTab === 2 && (
          <div>
            <p className="text-slate-500 text-sm mb-6">CSV-strukturer och tekniska synergier mellan de två verktygen.</p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-blue-700 mb-3 flex items-center gap-2 text-sm">📋 BMC CSV Export</h3>
                <div className="space-y-1">
                  {schemaFields.bmc.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded text-center font-bold flex-shrink-0 flex items-center justify-center" style={{fontSize:'9px'}}>{i+1}</span>
                      <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{f}</code>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-emerald-700 mb-3 flex items-center gap-2 text-sm">🔗 Value Chain Data</h3>
                <div className="space-y-1">
                  {schemaFields.vc.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-4 h-4 bg-emerald-100 text-emerald-600 rounded text-center font-bold flex-shrink-0 flex items-center justify-center" style={{fontSize:'9px'}}>{i+1}</span>
                      <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{f}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* API Key note */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5">
              <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm">🔑 API-nyckel synkronisering</h3>
              <p className="text-xs text-amber-700 mb-3">BMC söker efter nycklar i följande ordning – samma som Value Chain Analyzer:</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {['ea20_openai_key', 'vc_openai_key', 'cap_openai_key', 'strategy_openai_key', 'openai_api_key'].map(k => (
                  <code key={k} className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-mono">{k}</code>
                ))}
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs text-emerald-800">
                  <strong>✅ Fullt synkroniserat:</strong> BMC sparar API-nyckeln i <em>alla</em> localStorage-nycklar samtidigt. 
                  En nyckel aktiverar AI-analysen i hela EA 2.0-sviten.
                </p>
              </div>
            </div>

            {/* Integration recommendation */}
            <div className="mt-6 bg-slate-900 text-white rounded-2xl p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">🗺️ Rekommenderat arbetsflöde</h3>
              <ol className="space-y-2 text-sm text-slate-300">
                <li className="flex gap-3"><span className="text-blue-400 font-bold">1.</span> Fyll i BMC → kör AI-analys → exportera CSV</li>
                <li className="flex gap-3"><span className="text-blue-400 font-bold">2.</span> Importera BMC CSV som kontext i Value Chain Analyzer</li>
                <li className="flex gap-3"><span className="text-blue-400 font-bold">3.</span> Identifiera Value Creators & Destroyers med BMC som referens</li>
                <li className="flex gap-3"><span className="text-blue-400 font-bold">4.</span> Exportera Value Chain-data → importera i Capability Mapping V2</li>
                <li className="flex gap-3"><span className="text-blue-400 font-bold">5.</span> Slutför i EA 2.0 Platform med full ROI-kalkyl och board report</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center text-slate-400 text-xs py-6 border-t border-slate-200">
        EA 2.0 Suite · BMC ↔ Value Chain Integration Architecture · PropTech & Real Estate
      </footer>
    </div>
  );
}