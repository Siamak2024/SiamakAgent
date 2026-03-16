/**
 * EA_FileManager.js
 * File-based storage manager for EA Platform
 * Handles exports, imports, and project backups to file system
 */

class EA_FileManager {
    constructor() {
        this.dataManager = null;
        this.basePath = '../data';
        this.folders = {
            imports: `${this.basePath}/imports`,
            exports: `${this.basePath}/exports`,
            projects: `${this.basePath}/projects`
        };
        console.log('🗂️ EA_FileManager initialized');
    }

    /**
     * Initialize with DataManager reference
     */
    init(dataManager) {
        this.dataManager = dataManager;
        console.log('✅ FileManager connected to DataManager');
    }

    /**
     * Generate filename-safe timestamp
     */
    getTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}_${hour}${minute}`;
    }

    /**
     * Sanitize filename
     */
    sanitizeFilename(name) {
        return name
            .replace(/[^a-zA-Z0-9_\-åäöÅÄÖ ]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
    }

    /**
     * Export project to downloads folder (browser download)
     */
    exportProjectToDownload(projectId, projectName, projectData) {
        const exportData = {
            version: 'EA_2.0',
            exported: new Date().toISOString(),
            projectId: projectId,
            projectName: projectName,
            data: projectData
        };

        const filename = `${this.sanitizeFilename(projectName)}_${this.getTimestamp()}.json`;
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        console.log(`📥 Exported project: ${filename}`);
        return filename;
    }

    /**
     * Export toolkit workshop data
     */
    exportWorkshopData(toolkitId, data) {
        const toolkitNames = {
            bmc: 'Business_Model_Canvas',
            capabilityMap: 'Capability_Mapping',
            wardley: 'Strategy_Workbench',
            valueChain: 'Value_Chain',
            maturity: 'Maturity_Assessment'
        };

        const exportData = {
            version: 'EA_2.0',
            toolkit: toolkitId,
            exported: new Date().toISOString(),
            data: data
        };

        const filename = `${toolkitNames[toolkitId]}_${this.getTimestamp()}.json`;
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        console.log(`📥 Exported workshop data: ${filename}`);
        return filename;
    }

    /**
     * Import file from user upload
     */
    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate import structure
                    if (!data.version || !data.data) {
                        throw new Error('Invalid import file format');
                    }

                    console.log(`📤 Imported file: ${file.name}`);
                    resolve(data);
                } catch (error) {
                    console.error('Import error:', error);
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('File read error'));
            reader.readAsText(file);
        });
    }

    /**
     * Save project snapshot (localStorage + download option)
     */
    saveProjectSnapshot(projectId, projectName, projectData, autoDownload = false) {
        // Always save to localStorage via DataManager
        if (this.dataManager) {
            this.dataManager.updateProject(projectId, projectData);
        }

        // Create backup file
        const snapshot = {
            id: projectId,
            name: projectName,
            saved: new Date().toISOString(),
            data: projectData
        };

        const filename = `${this.sanitizeFilename(projectName)}_backup_${this.getTimestamp()}.json`;
        
        // Store snapshot metadata in localStorage
        const snapshots = JSON.parse(localStorage.getItem('ea_snapshots') || '[]');
        snapshots.push({
            filename: filename,
            projectId: projectId,
            projectName: projectName,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 snapshots per project
        const filtered = snapshots
            .filter(s => s.projectId === projectId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);
        
        localStorage.setItem('ea_snapshots', JSON.stringify(filtered));

        // Optional: Auto-download backup
        if (autoDownload) {
            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        console.log(`💾 Project snapshot saved: ${filename}`);
        return filename;
    }

    /**
     * Get list of available snapshots
     */
    getSnapshots(projectId = null) {
        const snapshots = JSON.parse(localStorage.getItem('ea_snapshots') || '[]');
        if (projectId) {
            return snapshots.filter(s => s.projectId === projectId);
        }
        return snapshots;
    }

    /**
     * Export CSV for Excel
     */
    exportToCSV(data, filename) {
        // Convert array of objects to CSV
        if (!data || data.length === 0) {
            console.warn('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header] || '';
                    // Escape quotes and commas
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.sanitizeFilename(filename)}_${this.getTimestamp()}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        console.log(`📊 CSV exported: ${filename}`);
    }

    /**
     * Auto-save functionality (silent background save)
     */
    enableAutoSave(projectId, projectName, getDataCallback, intervalMinutes = 5) {
        const intervalMs = intervalMinutes * 60 * 1000;

        const autoSaveId = setInterval(() => {
            const data = getDataCallback();
            if (data && this.dataManager) {
                this.dataManager.updateProject(projectId, data);
                console.log(`💾 Auto-saved at ${new Date().toLocaleTimeString()}`);
            }
        }, intervalMs);

        // Store interval ID for cleanup
        window.ea_autosave_interval = autoSaveId;
        console.log(`⏰ Auto-save enabled (every ${intervalMinutes} min)`);

        return autoSaveId;
    }

    /**
     * Disable auto-save
     */
    disableAutoSave() {
        if (window.ea_autosave_interval) {
            clearInterval(window.ea_autosave_interval);
            window.ea_autosave_interval = null;
            console.log('⏰ Auto-save disabled');
        }
    }
}

// Export for use in EA Platform
if (typeof window !== 'undefined') {
    window.EA_FileManager = EA_FileManager;
}
