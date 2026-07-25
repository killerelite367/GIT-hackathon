# 🔧 SUPABASE BACKEND SETUP GUIDE

## What is Supabase?
Supabase is a **FREE** Firebase alternative that gives you:
- PostgreSQL database (store your modules)
- Real-time updates
- Authentication (login system)
- Easy to use dashboard

---

## STEP 1: Create Supabase Account

1. Go to: https://supabase.com
2. Click **"Start your project"**
3. Sign up with email (use jaydengoh2@gmail.com)
4. Create a new organization (name: "StudyQuest")
5. Create a new project (name: "studyquest-db")
   - Choose region closest to you
   - Save the database password somewhere safe!

---

## STEP 2: Create Modules Table

Once your project is created:

1. Go to **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Copy & paste this code:

```sql
CREATE TABLE modules (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  credits INT DEFAULT 4,
  grade FLOAT,
  UNIQUE(user_id, code)
);

-- Enable Row Level Security
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- Allow users to only see their own modules
CREATE POLICY "Users can view their own modules"
ON modules
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own modules"
ON modules
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own modules"
ON modules
FOR UPDATE
USING (auth.uid() = user_id);
```

4. Click **"Run"** button (bottom right)
5. ✅ Done! Table created!

---

## STEP 3: Get Your Credentials

1. Go to **"Settings"** → **"API"** (left sidebar)
2. Copy these values (SAVE THEM!):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Public Key**: `eyJhbGc...` (long string)

---

## STEP 4: Install Supabase in Your App

```bash
npm install @supabase/supabase-js
```

---

## STEP 5: Create Supabase Client

Create file: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://YOUR_PROJECT_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**REPLACE** these with your actual values from Step 3!

---

## STEP 6: Update Module Input to Save to Database

In `src/views/ModulesView.tsx`, change `addModule`:

```typescript
const addModule = async () => {
  if (!newCode.trim() || !newName.trim()) return;
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in!');
      return;
    }

    // Insert into database
    const { error } = await supabase
      .from('modules')
      .insert({
        user_id: user.id,
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        credits: Number(newCredits) || 4,
        grade: newGrade ? Number(newGrade) : null,
      });

    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }

    alert(`✅ Added: ${newCode.toUpperCase()}`);
    setNewCode("");
    setNewName("");
    setNewCredits("4");
    setNewGrade("");
    
    // Refresh modules from database
    fetchModules();
  } catch (err) {
    alert(`Error: ${err}`);
  }
};
```

---

## What About Import/Export?

**IMPORT** = Load your backup file (restore data)
- Click "Import" button
- Select .json file you saved
- Your data loads back!

**EXPORT** = Save your data as backup file
- Click "Export" button
- Saves as `studyquest-backup-2026-07-25.json`
- Keep this safe! Use if you switch devices

---

## Quick Summary

| Step | What | Why |
|------|------|-----|
| 1 | Create Supabase account | Free database |
| 2 | Create modules table | Store your modules |
| 3 | Get credentials | Connect your app |
| 4 | Install package | Use database in app |
| 5 | Create client | Tell app WHERE database is |
| 6 | Update form | Save to database |

---

## Testing It

1. Start your app (`npm run dev`)
2. Go to **Grades** tab
3. Add a new module (e.g., C999 Advanced AI, 6 credits, 95%)
4. Go to Supabase dashboard → **Table Editor** → **modules**
5. ✅ Your module appears in the table!

---

## Troubleshooting

**"user is null"** → You need to add authentication first
**"permission denied"** → Check Row Level Security policies
**"UNIQUE constraint failed"** → You already added this module code
**"Cannot find module"** → Make sure you ran `npm install`

