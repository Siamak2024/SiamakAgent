const { useState } = React;

const steps = [
  {
    id: 1,
    from: "AI Capability Mapping V2",
    to: "Export Layer",
    label: "CSV Export",
    detail: "Capability, Domain, Strategic Weight, Maturity, Evolution, Visibility, Color/Category",
    color: "bg-purple-100 border-purple-400",
    headerColor: "bg-purple-500",
    icon: "📊",
    outcome: "Standardiserad datastruktur – noll manuell rensning"
  },
  {
    id: 2,
    from: "Export Layer",
    to: "EA 2.0 Platform",
    label: "Import / JSON Mapping",
    detail: "Capability → Name | Strategic Weight → Category | Maturity → Score | Domain → Domain | Evolution/Visibility → Metadata",
    color: "bg-blue-100 border-blue-400",
    headerColor: "bg-blue-500",
    icon: "🔄",
    outcome: "Direkt körbar i Dependency Graph & Impact Simulator"
  },
  {
    id: 3,
    from: "EA 2.0 Platform",
    to: "Heatmap + Impact Sim",
    label: "Auto-generering",
    detail: "Strategic + låg mognad → Highest Priority | Riskexponering | Teknisk skuld | KPI-påverkan",
    color: "bg-orange-100 border-orange-400",
    headerColor: "bg-orange-500",
    icon: "🔥",
    outcome: "Objektiv prioritering – eliminerar 'loudest voice wins'"
  },
  {
    id: 4,
    from: "Capabilities",
    to: "System → Data → AI Agent",
    label: "Capability Mapping",
    detail: "One-click: Capability → System | Gap-identifiering | Spårbarhet för compliance",
    color: "bg-green-100 border-green-400",
    headerColor: "bg-green-500",
    icon: "🔗",
    outcome: "Regulatorisk spårbarhet & teknisk styrning"
  },
  {
    id: 5,
    from: "Target Architecture",
    to: "Integrationer + LLM-agenter",
    label: "To-Be Modellering",
    detail: "Dataflöden | Automationspotential | LLM-agenter | API-kopplingar",
    color: "bg-teal-100 border-teal-400",
    headerColor: "bg-teal-500",
    icon: "🏗️",
    outcome: "Kortare time-to-execution – direkt konkurrensfördel"
  },
  {
    id: 6,
    from: "EA 2.0 CFO View",
    to: "ROI per Capability",
    label: "Finansiell analys",
    detail: "Årlig besparing (FTE + system) | Payback-tid | AI Readiness Index | CO2-reduktion",
    color: "bg-yellow-100 border-yellow-400",
    headerColor: "bg-yellow-600",
    icon: "💰",
    outcome: "Datadrivet investeringsunderlag – bättre kapitalallokering"
  },
  {
    id: 7,
    from: "EA 2.0 Platform",
    to: "Styrelse & Ledning",
    label: "Board Report PDF",
    detail: "Capability Heatmap | Wardley Map | Impact Simulations | ROI | Prioriterad Roadmap",
    color: "bg-red-100 border-red-400",
    headerColor: "bg-red-500",
    icon: "📋",
    outcome: "Snabbare beslut – högre governance-kvalitet"
  }
];

const jsonSchema = `{
  "capabilities": [
    {
      "id": "CAP-001",
      "name": "Predictive Maintenance",
      "domain": "Operations",
      "strategic_weight": "Strategic",
      "maturity": 2,
      "wardley": {
        "evolution": 0.35,
        "visibility": 0.72
      },
      "category": "Build",
      "color": "#ef4444",
      "investment_priority": "Critical"
    }
  ]
}`;

function App() {
  const [activeStep, setActiveStep] = useState(null);
  const [showSchema, setShowSchema] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl p-6 mb-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-1">Integration Architecture</h1>
          <p className="text-gray-300 text-sm">AI Capability Mapping V2 → EA 2.0 Platform (final 2)</p>
          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span>🎯 End-to-end pipeline</span>
            <span>⚡ Strategi → Execution</span>
            <span>📈 ROI-driven</span>
          </div>
        </div>

        {/* Pipeline Flow */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {steps.map((step, idx) => (
            <div key={step.id}>
              <div
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${step.color} ${activeStep === step.id ? 'shadow-lg scale-100' : 'hover:shadow-md'}`}
                onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">STEG {step.id}</span>
                        <span className={`text-xs text-white px-2 py-0.5 rounded-full ${step.headerColor}`}>{step.label}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-800 mt-0.5">
                        <span className="text-gray-600">{step.from}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-gray-800">{step.to}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-400 text-lg">{activeStep === step.id ? '▲' : '▼'}</span>
                </div>

                {activeStep === step.id && (
                  <div className="mt-3 pt-3 border-t border-gray-300 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-1">DATAFLÖDE / PROCESS</p>
                      <p className="text-sm text-gray-700">{step.detail}</p>
                    </div>
                    <div className="bg-white bg-opacity-60 rounded-lg p-3">
                      <p className="text-xs font-bold text-gray-500 mb-1">💼 AFFÄRSNYTTA</p>
                      <p className="text-sm font-medium text-gray-800">{step.outcome}</p>
                    </div>
                  </div>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className="flex justify-center my-1">
                  <div className="w-0.5 h-4 bg-gray-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* JSON Schema Toggle */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowSchema(!showSchema)}>
            <div>
              <h3 className="font-bold text-gray-800">📄 JSON Import Schema</h3>
              <p className="text-xs text-gray-500">Standardiserat format för capability-import till EA 2.0</p>
            </div>
            <button className="bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-gray-700">
              {showSchema ? 'Dölj' : 'Visa schema'}
            </button>
          </div>
          {showSchema && (
            <pre className="mt-3 bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto">
              {jsonSchema}
            </pre>
          )}
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: "Kostnadsbesparing", value: "Eliminerar dubbelarbete", icon: "💰", color: "bg-green-50 border-green-200" },
            { label: "Riskreduktion", value: "Datadrivna prioriteringar", icon: "🛡️", color: "bg-blue-50 border-blue-200" },
            { label: "Konkurrensfördel", value: "Snabbare strategi→execution", icon: "⚡", color: "bg-yellow-50 border-yellow-200" },
            { label: "Compliance", value: "Capability→System spårbarhet", icon: "✅", color: "bg-purple-50 border-purple-200" }
          ].map((kpi, i) => (
            <div key={i} className={`border rounded-xl p-4 ${kpi.color}`}>
              <div className="text-2xl mb-1">{kpi.icon}</div>
              <div className="text-xs font-bold text-gray-500">{kpi.label}</div>
              <div className="text-sm font-semibold text-gray-800">{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 text-white rounded-xl p-4 text-center">
          <p className="text-sm font-semibold">End-to-End Pipeline</p>
          <p className="text-xs text-gray-400 mt-1">
            Strategisk prioritering → Teknisk realisering → Finansiell analys → Styrelserapport
          </p>
        </div>
      </div>
    </div>
  );
}