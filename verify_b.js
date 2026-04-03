const h = require('fs').readFileSync('NexGenEA/NexGen_EA_V4.html', 'utf8');
const checks = {
  aiAgents_profiles_gone: !h.includes("aiAgents: '2-3'") && !h.includes("aiAgents: '4-6'") && !h.includes("aiAgents: '3-5'"),
  dataDomains_gone: !h.includes('"dataDomains":[{"name":""}]'),
  strategic_rationale_present: h.includes('strategic_rationale'),
  maturity_rationale_present: h.includes('maturity_rationale'),
  system_status_present: h.includes('"status":"active|legacy|planned"'),
  skeleton_calls_removed: !h.includes('_showCFOSkeleton();\r\n  _showBenchSkeleton();'),
  parallel_AI_removed: !h.includes('_enrichCapabilityFinancials(desc, _si3, model.capabilities),\r\n      _generateAIBenchmark(desc, _si3, industry)'),
  enrichFinancialsAI_function: h.includes('async function enrichFinancialsAI()'),
  enrich_button: h.includes('btn-enrich-financials'),
  heuristic_fallback: h.includes('_applyHeuristicFinancials();\r\n    computeDerivedFinancials();\r\n    renderLayers();'),
  aiAgents_in_targetArch: h.includes('agentResult') && h.includes('model.aiAgents'),
};
let allOk = true;
for (const [k,v] of Object.entries(checks)) {
  console.log((v ? 'OK  ' : 'FAIL') + ' ' + k);
  if (!v) allOk = false;
}
console.log('\n' + (allOk ? 'All checks PASSED' : 'Some checks FAILED'));
