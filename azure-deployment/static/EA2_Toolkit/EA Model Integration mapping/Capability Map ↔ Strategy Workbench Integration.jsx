const { useState } = React;

const capDomains = ['Customer', 'Operations', 'Product', 'Finance', 'Technology'];

const evolutionBands = [
  { id: 'genesis', label: 'Genesis', range: '0–25%', color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'custom', label: 'Custom', range: '25–50%', color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'product', label: 'Product', range: '50–75%', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'commodity', label: 'Commodity', range: '75–100%', color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const flowSteps = [
  {
    step: 1,
    from: 'Capability Map: Domän + Prioritet + Mognad',
    to: 'Strategy Workbench: Wardley-karta (kategori + evolution)',
    icon: '1️⃣',
    detail:
      'Capability Map kategoriserar förmågor per domän (Customer/Operations/…) och prioritet (Strategisk/Viktig/Commodity) med mognadsnivå 1–5. CSV-exporten beräknar redan färdiga Wardley-koordinater (evolution + visibility).',
    outcome:
      'Du får en direkt, datadriven startpunkt på Wardley-kartan utan manuell positionering – minskar bias och sparar tid.',
  },
  {
    step: 2,
    from: 'CSV: EA2_Capabilities.csv',
    to: 'Import i AI Strategy Workbench',
    icon: '2️⃣',
    detail:
      'Strategy Workbench har en inbyggd importfunktion som känner igen Capability Map-exporten (kolumner som Capability, Domain, Wardley_X_percent, Wardley_Y_percent, Wardley_Color, Wardley_Category). Vid import skapas en nod per capability.',
    outcome:
      'Sömlös pipeline: samma capability-portfölj används nu i ett strategiskt Wardley-perspektiv – utan dubbelregistrering.',
  },
  {
    step: 3,
    from: 'Strategiska capabilities (hög prioritet, låg mognad)',
    to: 'Genesis/Custom-zon på Wardley-kartan',
    icon: '3️⃣',
    detail:
      'Capabilities som är strategiska men omogna mappas automatiskt mot Genesis/Custom-bandet. Dessa är kandidater för investering, innovation och differentiering.',
    outcome:
      'Fokuserar strategiarbetet på rätt fåtal spelpjäser – bättre kapitalallokering och konkurrensfördel.',
  },
  {
    step: 4,
    from: 'Lågprioriterade, mogna capabilities',
    to: 'Product/Commodity-zon (köp/outsourca)',
    icon: '4️⃣',
    detail:
      'Capabilities med låg strategisk vikt och hög mognad hamnar i Product/Commodity. Strategy Workbench kan då peka ut vad som bör standardiseras, köpas in eller outsourcas.',
    outcome:
      'Kostnadsbesparingar genom att sluta överinvestera i icke-differentierande förmågor.',
  },
  {
    step: 5,
    from: 'Wardley-karta med capabilities',
    to: 'AI Wardley-analys (Build/Buy/Partner + Roadmap)',
    icon: '5️⃣',
    detail:
      'När capabilities ligger på kartan körs AI Wardley-analysen som ger beslut: vad ska byggas internt, köpas som SaaS, outsourcas eller partnerlösas – med tydlig roadmap 12–36 månader.',
    outcome:
      'Riskreduktion och tydlig C-level-story: varför just dessa capabilities prioriteras när ni investerar i AI och digitalisering.',
  },
];

const mappingExamples = [
  {
    capability: 'Hyresgästportal',
    domain: 'Customer',
    priority: 'Strategisk',
    maturity: 3,
    wardley: 'Product → hög synlighet',
    decision: 'Standardiserad plattformsstrategi, undvik egenutvecklad monolit.',
  },
  {
    capability: 'Prediktivt underhåll (AI)',
    domain: 'Operations',
    priority: 'Strategisk',
    maturity: 2,
    wardley: 'Genesis/Custom → medium synlighet',
    decision: 'Bygg/partner – differentierande AI-kompetens, kopplat till ESG & OPEX.',
  },
  {
    capability: 'CSRD-rapportering',
    domain: 'Finance',
    priority: 'Viktig',
    maturity: 2,
    wardley: 'Custom → på väg mot Product',
    decision: 'Köp standardlösning, fokusera internt på datakvalitet och process.',
  },
  {
    capability: 'Molninfrastruktur',
    domain: 'Technology',
    priority: 'Commodity',
    maturity: 4,
    wardley: 'Commodity → låg synlighet',
    decision: 'Utility/SaaS – maximera standard, minimera customisering.',
  },
];

const apiKeys = ['ea20_openai_key', 'vc_openai_key', 'cap_openai_key', 'strategy_openai_key', 'openai_api_key', 'bmc_openai_key', 'ea_openai_key'];

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState('Customer');
  const [hoverBand, setHoverBand] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-900 to-purple-900 border-b border-slate-800 px-8 py-5">
        <div className="max-w-6xl mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧭</span>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Capability Mapping ↔ AI Strategy Workbench
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-purple-400/40 bg-purple-500/10 text-purple-200 font-semibold">
              EA 2.0 · Wardley Integration
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Från capability-portfolio till strategisk Wardley-karta · Build/Buy/Partner-beslut · Proptech & Fastighet.
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex gap-1 px-8">
          {['Integrationsflöde', 'Mappning & exempel', 'Data & API-nycklar'].map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === i
                  ? 'border-purple-500 text-purple-200'
                  : 'border-transparent text-slate-500 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {/* TAB 0: Integrationsflöde */}
        {activeTab === 0 && (
          <section>
            <p className="text-slate-400 text-sm mb-4">
              Stegvis pipeline från <span className="font-semibold text-slate-200">EA2_Capabilities.csv</span> till färdig Wardley-karta med AI-analys.
            </p>
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <div className="space-y-3">
                {flowSteps.map((s) => (
                  <div
                    key={s.step}
                    className="rounded-xl border border-slate-800 bg-slate-900/80 hover:border-purple-500/50 transition-all cursor-default"
                  >
                    <div className="flex items-start gap-3 p-4">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-xs font-bold">
                        {s.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-slate-100">{s.from}</span>
                          <span className="mx-1 text-slate-600">→</span>
                          <span className="font-semibold text-emerald-300">{s.to}</span>
                        </div>
                        <p className="text-xs text-slate-300 mb-2 leading-relaxed">{s.detail}</p>
                        <div className="bg-emerald-900/30 border border-emerald-600/50 rounded-lg px-3 py-2">
                          <span className="text-[9px] font-semibold text-emerald-300 tracking-widest uppercase">Affärsutfall</span>
                          <p className="text-[11px] text-emerald-100 mt-1">{s.outcome}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Evolution bands visual */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-purple-500/30 flex items-center justify-center text-[11px] text-purple-200">W</span>
                  Wardley-evolution från Capability Map
                </h2>
                <div className="relative h-48 rounded-xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
                  {evolutionBands.map((b, idx) => (
                    <div
                      key={b.id}
                      onMouseEnter={() => setHoverBand(b.id)}
                      onMouseLeave={() => setHoverBand(null)}
                      className={`absolute inset-y-0 ${b.bg} bg-opacity-10 border-x border-slate-800/60 flex flex-col items-center justify-center text-[11px] transition-all ${
                        idx === 0
                          ? 'left-0 w-1/4'
                          : idx === 1
                          ? 'left-1/4 w-1/4'
                          : idx === 2
                          ? 'left-2/4 w-1/4'
                          : 'left-3/4 w-1/4'
                      } ${hoverBand === b.id ? 'bg-opacity-20' : ''}`}
                    >
                      <div className={`font-bold mb-0.5 ${b.color}`}>{b.label}</div>
                      <div className="text-slate-400 text-[10px]">{b.range}</div>
                      {hoverBand === b.id && (
                        <div className="mt-2 text-[10px] text-slate-300 px-2 text-center">
                          Capability Map → {b.label} via <span className="text-slate-100 font-mono text-[10px]">Wardley_SuggestedEvolution</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950 to-transparent flex items-center justify-center text-[9px] text-slate-500">
                    Evolution (X) · Från Genesis (vänster) till Commodity (höger)
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                  Capability Map räknar redan ut <code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_X_percent</code>{' '}
                  och <code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_Y_percent</code>. Strategy Workbench använder dessa direkt – du slipper gissa
                  var varje capability ska ligga.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TAB 1: Mappning & exempel */}
        {activeTab === 1 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">
                  Domänbaserad mappning
                </h2>
                <p className="text-[11px] text-slate-400">
                  Välj domän för att se typiska capability → Wardley-positioner och beslutsrekommendationer.
                </p>
              </div>
              <select
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                {capDomains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Capability → Wardley examples */}
              <div className="space-y-3">
                {mappingExamples
                  .filter((m) => m.domain === selectedDomain)
                  .map((m, idx) => (
                    <div
                      key={m.capability}
                      className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 flex gap-3"
                    >
                      <div className="flex flex-col items-center mt-1">
                        <span className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-200 text-[11px] flex items-center justify-center mb-1">
                          {idx + 1}
                        </span>
                        <span className="w-px flex-1 bg-slate-700"></span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="text-xs font-semibold text-slate-100 flex justify-between">
                          <span>{m.capability}</span>
                          <span className="text-[10px] text-slate-500">{m.domain} · {m.priority}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">Mognad: {m.maturity}/5</div>
                        <div className="text-[11px] text-sky-300">Wardley-position: {m.wardley}</div>
                        <div className="text-[11px] text-emerald-200 mt-1">
                          Beslut i Strategy Workbench: {m.decision}
                        </div>
                      </div>
                    </div>
                  ))}

                {mappingExamples.filter((m) => m.domain === selectedDomain).length === 0 && (
                  <div className="text-[11px] text-slate-500 italic">
                    Inga färdiga exempel för denna domän – men samma logik gäller: prioritet + mognad
                    → Wardley-position → Build/Buy/Partner.
                  </div>
                )}
              </div>

              {/* Capability tiers → Strategic focus */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">
                  Vad Strategy Workbench gör med dina capabilities
                </h3>
                <ul className="text-[11px] text-slate-300 space-y-2 list-disc list-inside">
                  <li>
                    <span className="font-semibold text-emerald-200">Strategiska + omogna capabilities</span>{' '}
                    klustras i Genesis/Custom-zonen – underlag för <strong>investeringscase och innovation</strong>.
                  </li>
                  <li>
                    <span className="font-semibold text-sky-200">Viktiga + medelmogna capabilities</span>{' '}
                    hamnar i övergången Custom → Product – bra kandidater för <strong>standardisering & skalning</strong>.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-200">Commodity-capabilities</span> ritas ut längst till
                    höger – tydliga kandidater för <strong>outsourcing/SaaS</strong>.
                  </li>
                  <li>
                    AI-analysen i Strategy Workbench använder dessutom{' '}
                    <code className="bg-slate-800 px-1 rounded text-[10px]">note/Description</code> från Capability Map
                    som kontext för risker, beroenden och regulatorik.
                  </li>
                </ul>
                <div className="mt-3 bg-gradient-to-r from-emerald-900/60 to-slate-900 border border-emerald-700/60 rounded-xl p-3">
                  <div className="text-[10px] font-semibold text-emerald-300 uppercase tracking-widest mb-1">
                    Nettoaffekt
                  </div>
                  <p className="text-[11px] text-emerald-100">
                    Du får en <strong>sammanhängande röd tråd</strong> från capability-lista till strategisk karta och
                    AI-genererad roadmap – vilket gör det mycket enklare att motivera investeringar för styrelse och CFO.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: Data & API-nycklar */}
        {activeTab === 2 && (
          <section className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
                  Capability Map → CSV-fält (Wardley-relaterat)
                </h3>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  <li><code className="bg-slate-800 px-1 rounded text-[10px]">Capability</code> – namn på förmåga</li>
                  <li><code className="bg-slate-800 px-1 rounded text-[10px]">Domain</code> – Customer/Operations/…</li>
                  <li><code className="bg-slate-800 px-1 rounded text-[10px]">Priority_SE</code> – Strategisk/Viktig/Commodity</li>
                  <li><code className="bg-slate-800 px-1 rounded text-[10px]">Maturity_1_5</code> – mognad</li>
                  <li><code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_SuggestedEvolution</code> – text (Genesis→Commodity)</li>
                  <li><code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_SuggestedVisibility</code> – text (High/Medium/Low)</li>
                  <li><code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_X_percent</code> – 0–100 % på X-axeln</li>
                  <li><code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_Y_percent</code> – 0–100 % på Y-axeln</li>
                  <li><code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_Color</code> – t.ex. color-blue</li>
                  <li><code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_Category</code> – t.ex. Plattform, Data & AI</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
                  Strategy Workbench → Importlogik
                </h3>
                <p className="text-[11px] text-slate-300 mb-3">
                  Importmodulen i Strategy Workbench känner igen{' '}
                  <span className="font-mono text-[10px] bg-slate-800 px-1 rounded">Capability</span>-exporten och
                  använder Wardley-fälten direkt för att skapa noder:
                </p>
                <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                  <li>
                    Namn: <code className="bg-slate-800 px-1 rounded text-[10px]">Capability</code>
                  </li>
                  <li>
                    Kategori: <code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_Category</code> (fallback: Domain)
                  </li>
                  <li>
                    Färg: <code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_Color</code>
                  </li>
                  <li>
                    X/Y: <code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_X_percent</code> &{' '}
                    <code className="bg-slate-800 px-1 rounded text-[10px]">Wardley_Y_percent</code> (fallback: SuggestedEvolution/SuggestedVisibility → evoToX/visToY)
                  </li>
                  <li>
                    Notering: <code className="bg-slate-800 px-1 rounded text-[10px]">Description</code> används som note för AI-analysen.
                  </li>
                </ul>
              </div>
            </div>

            {/* API keys */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                🔑 API-nycklar i EA 2.0-sviten
              </h3>
              <p className="text-[11px] text-slate-300 mb-2">
                Både Capability Map och Strategy Workbench återanvänder samma uppsättning localStorage-nycklar för
                OpenAI:
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {apiKeys.map((k) => (
                  <code
                    key={k}
                    className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-[10px] text-slate-200"
                  >
                    {k}
                  </code>
                ))}
              </div>
              <p className="text-[11px] text-emerald-200">
                Sparar du nyckeln i ett av verktygen (t.ex. Capability Map eller BMC) skrivs den in i{' '}
                <strong>samtliga</strong> nycklar. Därmed är AI-analys aktiv direkt även i Strategy Workbench utan extra
                konfiguration.
              </p>
            </div>

            {/* Recommended workflow */}
            <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950 p-4">
              <h3 className="text-xs font-bold text-purple-200 uppercase tracking-widest mb-2 flex items-center gap-2">
                🚀 Rekommenderat end-to-end-flöde
              </h3>
              <ol className="text-[11px] text-slate-200 space-y-1 list-decimal list-inside">
                <li>
                  Bygg upp din capability-karta i <strong>AI Capability Mapping V2</strong> (domän, prioritet, mognad,
                  beskrivning).
                </li>
                <li>
                  Exportera <strong>EA2_Capabilities.csv</strong> med Wardley-koordinater för varje capability.
                </li>
                <li>
                  Importera CSV i <strong>AI Strategy Workbench V2</strong> via "Importera CSV".
                </li>
                <li>
                  Justera vid behov några nyckelkomponenter manuellt på kartan (inertia, beroenden).
                </li>
                <li>
                  Kör <strong>AI Wardley-analys</strong> för att få en prioriterad roadmap (Build/Buy/Partner) och C-level
                  narrativ.
                </li>
              </ol>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-slate-900 py-4 text-center text-[10px] text-slate-500">
        EA 2.0 Suite · Capability Map ↔ Strategy Workbench · Fokus: kostnadsbesparing, riskreduktion, konkurrensfördel & tenant retention.
      </footer>
    </div>
  );
}