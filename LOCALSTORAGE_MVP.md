# EA Platform - LocalStorage MVP

## Overview
This MVP version stores all data locally in your browser using **localStorage** with JSON format. No backend server required!

## 📦 What's Stored

### 1. API Key
```
Key: 'ea_api_key'
Value: Your OpenAI API key (string)
```

### 2. Saved Models List
```
Key: 'ea_saved_models'
Value: Array of model objects in JSON format
```

Each model object contains:
```json
{
  "id": "model_1234567890",
  "name": "My Architecture Model",
  "created": "2026-03-12T10:30:00.000Z",
  "updated": "2026-03-12T11:45:00.000Z",
  "data": {
    "valueStreams": [...],
    "capabilities": [...],
    "processes": [...],
    "systems": [...],
    "dataDomains": [...],
    "aiAgents": [...],
    "initiatives": [...],
    "operatingModel": {...}
  }
}
```

### 3. Current Active Model
```
Key: 'ea_current_model'
Value: Single model object (same structure as above)
```
This is the currently loaded model, auto-saved every 30 seconds.

## 🎮 Features

### Auto-Save
- Current model is automatically saved every **30 seconds**
- Saves to `ea_current_model` in localStorage
- Also updates the model in the saved models list if it has an ID

### Auto-Load
- On page load, automatically loads the last active model
- Restores all visualizations and data
- Shows a success toast notification

### Multiple Models
- Save unlimited models with unique names
- Each model gets a unique ID: `model_[timestamp]`
- View all saved models with metadata (update time, # capabilities, # systems)

### Export/Import
- **Export**: Downloads model as JSON file with metadata
- **Import**: Loads model from JSON file
- Exported files include model name and export timestamp

## 🔒 Data Security

✅ **Stored locally** - All data stays in your browser  
✅ **No cloud sync** - Nothing sent to external servers (except OpenAI API calls)  
✅ **API key secure** - Stored in localStorage, never exposed in URLs  
✅ **Private** - Each browser profile has its own data  

## ⚠️ Important Limitations

1. **Browser-specific**: Data is stored per browser. Different browsers/profiles = different data
2. **Computer-specific**: Data doesn't sync across devices
3. **Clear browser data = lost data**: If you clear browser data, models are deleted
4. **Storage limit**: Most browsers limit localStorage to 5-10 MB
5. **No collaboration**: Can't share models with others (use Export/Import instead)

## 💾 Backup Strategy

### Recommended Approach
1. **Regular exports**: Use "Export" button to download JSON backups
2. **Before browser updates**: Export all important models
3. **Before clearing cache**: Export first!
4. **Share with team**: Export → Send file → Team imports

### Storage Calculation
Typical model size: 50-200 KB  
localStorage limit: ~5-10 MB  
**Capacity**: ~25-200 models (depending on complexity)

## 🛠️ Technical Details

### LocalStorage Keys Used
- `ea_api_key` - OpenAI API key
- `ea_saved_models` - Array of all saved models
- `ea_current_model` - Currently active model (auto-save)

### Data Flow
```
User Action → Model Data → JSON.stringify() → localStorage
Page Load → localStorage → JSON.parse() → Model Data → Render UI
```

### Functions Available
- `newModel()` - Create new blank model
- `saveModelToDB()` - Save current model to localStorage
- `loadModelFromDB()` - Show saved models and select one
- `selectModel(id)` - Load specific model by ID
- `deleteModelFromDB(id)` - Delete model by ID
- `exportModel()` - Download as JSON file
- `importModel(event)` - Load from JSON file
- `autoSaveCurrentModel()` - Auto-save (runs every 30s)

## 🔄 Migrating to Backend (Future)

When ready to add a backend:
1. Keep the same JSON structure
2. Replace localStorage calls with API calls
3. Add server-side storage (database)
4. Enable multi-user collaboration
5. Add cloud sync

The model structure is already designed to be backend-compatible!

## 📝 Example Usage

### Save a Model
1. Generate architecture
2. Click "💾 Save"
3. Enter model name
4. Model saved to localStorage

### Load a Model
1. Click "📂 Load"
2. Select from list
3. Model loads with all data

### Backup Models
1. Click "📂 Load" to see all models
2. Load each one
3. Click "↓ Export" to download
4. Store JSON files safely

### Share Model with Colleague
1. Click "↓ Export"
2. Send JSON file via email/Teams
3. Colleague clicks "↑ Import"
4. Colleague selects your JSON file
5. Model loads in their browser

## 🎯 Best Practices

1. **Name models clearly**: Use descriptive names (e.g., "Q1_2026_Enterprise_Architecture")
2. **Export regularly**: Weekly exports recommended
3. **Keep JSON backups**: Store in OneDrive/Teams
4. **Test imports**: Occasionally test that imports work
5. **Don't rely solely on auto-save**: Manually save important work

---

**Note**: This is an MVP (Minimum Viable Product) version. For production use with multiple users, consider implementing the backend server solution.
