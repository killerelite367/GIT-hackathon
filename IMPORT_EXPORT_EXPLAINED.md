# 📥 📤 IMPORT & EXPORT EXPLAINED

## What Do They Do?

**EXPORT** = Download your data as a file (like taking a photo of your data)
**IMPORT** = Upload a file to restore your data (like uploading that photo back)

---

## Why You Need Them

Imagine you're moving to a new phone:
1. **EXPORT** on old phone = Save everything as `.json` file
2. Copy file to new phone
3. **IMPORT** on new phone = All your data is restored!

Without export/import = You lose ALL your data when switching devices!

---

## EXPORT in Code

When you click **"Export"** button in Settings:

```typescript
// Line 1: Get all user data
const allData = {
  modules: data.modules,      // All your modules
  assignments: data.assignments, // All your assignments
  game: data.game,            // Your game progress
  blocks: data.blocks         // Your study schedule
};

// Line 2: Convert to JSON string (text format)
const jsonString = JSON.stringify(allData, null, 2);

// Line 3: Create a file from this text
const blob = new Blob([jsonString], { type: "application/json" });

// Line 4: Create download link
const url = URL.createObjectURL(blob);

// Line 5: Auto-download with today's date in filename
const a = document.createElement("a");
a.href = url;
a.download = `studyquest-backup-${todayDate}.json`;
a.click();

// Line 6: Clean up (delete temp link)
URL.revokeObjectURL(url);
```

**What this means:**
- Takes ALL your data
- Converts to readable text format
- Creates downloadable file
- File saved to Downloads folder with today's date!

---

## IMPORT in Code

When you click **"Import"** and select a file:

```typescript
// Line 1: User selects a .json file
const file = input.files[0]; // The file they chose

// Line 2: Create a reader to read the file
const reader = new FileReader();

// Line 3: When file is done reading
reader.onload = () => {
  // Line 4: Get the file contents as text
  const jsonText = reader.result;
  
  // Line 5: Convert text back to JavaScript object
  const restoredData = JSON.parse(jsonText);
  
  // Line 6: Validate it has correct structure
  if (restoredData.modules && restoredData.game) {
    // Line 7: Save to localStorage (browser storage)
    localStorage.setItem("studyquest:v1", JSON.stringify(restoredData));
    
    // Line 8: Reload the app to show restored data
    window.location.reload();
  }
};

// Line 9: Start reading the file
reader.readAsText(file);
```

**What this means:**
- Takes uploaded .json file
- Reads its contents
- Converts text back to data
- Saves to browser's storage
- App reloads with your restored data!

---

## Real World Example

### Exporting:
You have this data:
```
Modules: C240, C216, C299
Assignments: 5 total, 2 completed
Game: Level 15, 5000 XP
```

Click **EXPORT** →
```json
{
  "modules": [
    {"code": "C240", "name": "Data Engineering", "grade": 82},
    {"code": "C216", "name": "UX Design", "grade": 88}
  ],
  "game": {
    "xp": 5000,
    "level": 15
  }
}
```

File saved: `studyquest-backup-2026-07-25.json`

---

### Importing:
1. Switch to new laptop
2. Open StudyQuest app
3. Click **"Import"** in Settings
4. Select the `studyquest-backup-2026-07-25.json` file
5. ✅ Everything appears! Same modules, same progress!

---

## Key Points

| Concept | Means |
|---------|-------|
| **JSON** | Text format to store data (stands for "JavaScript Object Notation") |
| **Blob** | Temporary file in memory before downloading |
| **localStorage** | Browser's built-in storage (saves to your computer's browser) |
| **FileReader** | Reads uploaded files |
| **parse()** | Converts text to data (opposite of stringify) |
| **stringify()** | Converts data to text |

---

## When To Use

**USE EXPORT:**
- Before you upgrade/switch devices
- Before clearing browser data
- As a backup before trying new features
- Before uninstalling/reinstalling

**USE IMPORT:**
- After switching devices
- After clearing browser cache accidentally
- After reinstalling app
- To restore from backup

---

## Where Are These Buttons?

In your app:
1. Go to **Settings** tab
2. Scroll down to **"Data"** section
3. You'll see:
   - 📥 **"Export Data"** button
   - 📤 **"Import Data"** button

---

## Summary

```
EXPORT = Download your data (safety backup)
IMPORT = Upload your data (restore from backup)

Without these = Lose all progress when switching devices!
With these = Your data is safe and portable!
```

