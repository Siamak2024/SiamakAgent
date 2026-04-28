# add-module-exports.ps1 - Add module.exports to test helper files

# testUtils.js
$exports1 = @"


// CommonJS exports
module.exports = {
  wait,
  timeout,
  mockUserAnswers,
  getMockAnswer,
  clearMockAnswers,
  generateId,
  generateMockOrganizationSummary,
  deepClone,
  assertContains,
  spyOnConsole,
  restoreConsole,
  createMockContext
};
"@

Add-Content -Path 'tests\helpers\testUtils.js' -Value $exports1

# mockAIService.js
$exports2 = @"


// CommonJS exports
module.exports = {
  createMockAIService,
  createFailingAIService,
  createCustomAIService
};
"@

Add-Content -Path 'tests\helpers\mockAIService.js' -Value $exports2

# mockDatabase.js
$exports3 = @"


// CommonJS exports
module.exports = {
  createMockDatabase,
  resetMockDatabase,
  getMockDatabaseState,
  setMockDatabaseState
};
"@

Add-Content -Path 'tests\helpers\mockDatabase.js' -Value $exports3

# assertModel.js
$exports4 = @"


// CommonJS exports
module.exports = {
  ModelAssertions
};
"@

Add-Content -Path 'tests\helpers\assertModel.js' -Value $exports4

Write-Host "Module exports added to all files!"
