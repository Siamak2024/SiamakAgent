# Quick Start Guide

> **📚 Documentation Update (April 2026)**  
> **For developers/architects:** See [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md) for complete architecture  
> **For navigation:** See [WHERE_TO_FIND_EVERYTHING.md](WHERE_TO_FIND_EVERYTHING.md)  
> **For testing:** See [ARCHITECTURE_VERIFICATION_GUIDE.md](ARCHITECTURE_VERIFICATION_GUIDE.md)

---

## 🚀 Fastest Way to Get Started

1. **Run the setup script** (PowerShell):
   ```powershell
   .\setup.ps1
   ```
   This will:
   - Check Node.js installation
   - Install all dependencies
   - Create .env file
   - Prompt for your OpenAI API key (GPT-5 Responses API)

2. **Modify your HTML file** - Add one line in the `<head>` section:
   ```html
   <script src="../client-integration.js"></script>
   ```

3. **Update the header buttons** - Replace the API Key button section with Save/Load buttons (see README.md for details)

4. **Start the server**:
   ```powershell
   npm start
   ```

5. **Open in browser**:
   ```
   http://localhost:3000/EA%20Plattform/EA%2020%20Platform_BD_final_2.html
   ```

For detailed instructions, see [README.md](README.md)

---

## 📝 Manual Setup (Alternative)

If you prefer manual setup:

```powershell
# Install dependencies
npm install

# Create environment file
Copy-Item .env.example .env

# Edit .env and add your OpenAI API key
notepad .env

# Start server
npm start
```

---

## ⚡ What You Get

- ✅ Local backend server
- ✅ SQLite database for persistence
- ✅ Secure API key management
- ✅ Save/Load multiple models
- ✅ No more browser localStorage
- ✅ Professional database backup
- ✅ GPT-5 Responses API integration (NEW)
- ✅ 30+ modular JavaScript components
- ✅ IndexedDB with localStorage fallback

---

## 🚨 Important: GPT-5 Responses API

**The platform now uses GPT-5 Responses API (not Chat Completions).**

**Correct format:**
```javascript
const response = await AzureOpenAIProxy.create(
  "user message",  // First param: string
  {
    instructions: systemPrompt,  // Use 'instructions'
    model: 'gpt-5'  // Optional
  }
);
const output = response.output_text;
```

**See:** [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md) for complete API documentation

---

## 📚 Need Help?

**For setup:**  
See [README.md](README.md) for detailed setup instructions

**For architecture:**  
See [CODEBASE_REFERENCE_2026.md](CODEBASE_REFERENCE_2026.md)

**For navigation:**  
See [WHERE_TO_FIND_EVERYTHING.md](WHERE_TO_FIND_EVERYTHING.md)

**For testing:**  
See [ARCHITECTURE_VERIFICATION_GUIDE.md](ARCHITECTURE_VERIFICATION_GUIDE.md)

**For troubleshooting:**  
- Check browser console for errors
- Verify OpenAI API key in .env file
- Ensure all dependencies installed (npm install)
- Check server is running on port 3000

---

**Last Updated:** April 21, 2026
