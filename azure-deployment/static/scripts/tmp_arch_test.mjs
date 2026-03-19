import fs from 'node:fs';

const outPath = 'scripts/tmp_arch_result.txt';

try {
  const prompt = `Generate enterprise architecture for: "Real Estate Company with Legacy platform"
Return JSON:
{"valueStreams":[{"name":""}],"capabilities":[{"name":"","domain":"Customer|Product|Operations|Risk|Finance|Technology|Support","maturity":3,"strategicImportance":"low|medium|high","revenueExposure":"low|medium|high","regulatoryExposure":"low|medium|high","operationalCriticality":3,"dependsOnCapabilities":[""],"fteHoursSavedPct":15,"invoiceVolumeImpactPct":5,"investmentEstimate":150000,"riskExposureEstimate":500000}],"systems":[{"name":"","supportsCapability":"","criticality":"low|medium|high"}],"dataDomains":[{"name":""}],"aiAgents":[{"name":"","supportsCapability":"","criticality":"low|medium|high"}]}
Rules: 4-6 value streams, 14-18 capabilities, 6-10 systems, 3-5 AI agents.`;

  const body = {
    model: 'gpt-5',
    messages: [
      { role: 'system', content: 'Return ONLY valid JSON, no markdown.' },
      { role: 'user', content: prompt }
    ]
  };

  const started = Date.now();
  const response = await fetch('http://localhost:3000/api/openai/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  fs.writeFileSync(outPath, `STATUS=${response.status} SECONDS=${elapsed} LEN=${text.length}\n${text}`, 'utf8');
  console.log('WROTE ' + outPath);
} catch (err) {
  fs.writeFileSync(outPath, `ERR=${err.message}\n`, 'utf8');
  console.log('WROTE ' + outPath);
}