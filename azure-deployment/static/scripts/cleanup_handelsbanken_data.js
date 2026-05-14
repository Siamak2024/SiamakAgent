/**
 * Cleanup Script: Delete WhiteSpot Heatmap, Target EA, and Service Category Data
 * For: Handelsbanken Account and EA Engagement
 * 
 * HOW TO USE:
 * 1. Open the application in browser (localhost:3000)
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter to execute
 * 
 * @date May 15, 2026
 */

(async function cleanupHandelsbankenData() {
    'use strict';
    
    console.log('🧹 Starting Handelsbanken Data Cleanup...');
    console.log('═══════════════════════════════════════════════════════');
    
    // Step 1: Find all accounts with "Handelsbanken" in the name
    const accountKeys = Object.keys(localStorage).filter(key => key.startsWith('ea_account_'));
    let targetAccountId = null;
    let targetAccountName = null;
    
    console.log(`📋 Scanning ${accountKeys.length} accounts...`);
    
    for (const key of accountKeys) {
        try {
            const accountData = JSON.parse(localStorage.getItem(key));
            if (accountData && accountData.name && accountData.name.toLowerCase().includes('handelsbanken')) {
                targetAccountId = accountData.id;
                targetAccountName = accountData.name;
                console.log(`✓ Found Handelsbanken account: ${targetAccountName} (${targetAccountId})`);
                break;
            }
        } catch (e) {
            console.warn(`⚠️ Could not parse account: ${key}`);
        }
    }
    
    if (!targetAccountId) {
        console.error('❌ No Handelsbanken account found in localStorage');
        console.log('Available accounts:');
        for (const key of accountKeys) {
            try {
                const accountData = JSON.parse(localStorage.getItem(key));
                console.log(`  - ${accountData.name || 'Unknown'} (${accountData.id || 'No ID'})`);
            } catch (e) {
                // Skip unparseable accounts
            }
        }
        return;
    }
    
    // Step 2: Find all engagements for this account
    const engagementKeys = Object.keys(localStorage).filter(key => key.startsWith('ea_engagement_model_'));
    const targetEngagements = [];
    
    console.log(`\n📋 Scanning ${engagementKeys.length} engagements...`);
    
    for (const key of engagementKeys) {
        try {
            const engagementData = JSON.parse(localStorage.getItem(key));
            // Support both old (accountId at root) and new (accountId in engagement) structures
            const engagementAccountId = engagementData.accountId || 
                                       (engagementData.engagement && engagementData.engagement.accountId);
            
            if (engagementAccountId === targetAccountId) {
                const engagementId = engagementData.engagement?.id || key.replace('ea_engagement_model_', '');
                const engagementName = engagementData.engagement?.name || 'Unknown';
                targetEngagements.push({
                    key,
                    id: engagementId,
                    name: engagementName,
                    data: engagementData
                });
                console.log(`✓ Found engagement: ${engagementName} (${engagementId})`);
            }
        } catch (e) {
            console.warn(`⚠️ Could not parse engagement: ${key}`);
        }
    }
    
    if (targetEngagements.length === 0) {
        console.error(`❌ No engagements found for account: ${targetAccountName}`);
        return;
    }
    
    // Step 3: Clean up each engagement
    console.log(`\n🧹 Cleaning ${targetEngagements.length} engagement(s)...`);
    console.log('═══════════════════════════════════════════════════════');
    
    let totalCleaned = 0;
    
    for (const engagement of targetEngagements) {
        console.log(`\n📝 Processing: ${engagement.name}`);
        
        const originalData = { ...engagement.data };
        let itemsCleaned = 0;
        
        // Count items before cleanup
        const counts = {
            customers: (engagement.data.customers || []).length,
            whiteSpotHeatmaps: (engagement.data.whiteSpotHeatmaps || []).length,
            selectedServices: (engagement.data.selectedServices || []).length,
            selectedServicesData: (engagement.data.selectedServicesData || []).length,
            serviceCategories: (engagement.data.serviceCategories || []).length,
            targetThemes: (engagement.data.architectureThemes || []).filter(t => t.type === 'target').length
        };
        
        console.log('   Before cleanup:');
        console.log(`   - Customers: ${counts.customers}`);
        console.log(`   - WhiteSpot Heatmaps: ${counts.whiteSpotHeatmaps}`);
        console.log(`   - Selected Services: ${counts.selectedServices}`);
        console.log(`   - Selected Services Data: ${counts.selectedServicesData}`);
        console.log(`   - Service Categories: ${counts.serviceCategories}`);
        console.log(`   - Target Architecture Themes: ${counts.targetThemes}`);
        
        // Perform cleanup
        engagement.data.customers = [];
        engagement.data.whiteSpotHeatmaps = [];
        engagement.data.selectedServices = [];
        engagement.data.selectedServicesData = [];
        engagement.data.serviceCategories = [];
        
        // Keep only non-target architecture themes
        const originalThemes = engagement.data.architectureThemes || [];
        engagement.data.architectureThemes = originalThemes.filter(theme => theme.type !== 'target');
        
        // Count cleaned items
        itemsCleaned = counts.customers + counts.whiteSpotHeatmaps + counts.selectedServices + 
                      counts.selectedServicesData + counts.serviceCategories + counts.targetThemes;
        
        // Update metadata
        if (engagement.data.engagement) {
            engagement.data.engagement.lastModified = new Date().toISOString();
        }
        
        // Save back to localStorage
        try {
            localStorage.setItem(engagement.key, JSON.stringify(engagement.data));
            console.log(`   ✅ Cleaned ${itemsCleaned} items and saved to localStorage`);
            totalCleaned += itemsCleaned;
        } catch (error) {
            console.error(`   ❌ Error saving engagement: ${error.message}`);
        }
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`✅ CLEANUP COMPLETE`);
    console.log(`   Account: ${targetAccountName}`);
    console.log(`   Engagements processed: ${targetEngagements.length}`);
    console.log(`   Total items removed: ${totalCleaned}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('📢 NEXT STEPS:');
    console.log('   1. Refresh the page (F5) to reload clean data');
    console.log('   2. Navigate to EA Engagement Playbook');
    console.log('   3. Verify that WhiteSpot, Target Architecture, and Service Categories are empty');
    console.log('');
    
})();
