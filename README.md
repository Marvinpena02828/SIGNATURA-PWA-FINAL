# 🔐 Signatura PWA - Digital Document Verification System

Complete full-stack PWA with **brand colors** (Red + Dark Gray theme) + Vercel Functions backend!

---

## 🎨 BRAND COLORS

- **Primary Red:** #E63946
- **Accent Red:** #DC143C
- **Dark Gray:** #1F2937
- **Light Background:** #F8F9FA

---

## 📁 STRUCTURE

```
SIGNATURA-PWA/
├── frontend/                 # React + Vite (RED THEME)
│   ├── src/
│   ├── public/
│   ├── tailwind.config.js   # Updated with brand colors
│   └── ...
├── api/                      # Vercel Functions
│   ├── auth.js
│   ├── documents.js
│   ├── users.js
│   └── admin.js
├── package.json
├── vite.config.js
├── vercel.json
└── .gitignore
```

---

## 🚀 DEPLOY ON VERCEL

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Signatura PWA with brand colors"
git push origin main
```

### Step 2: Vercel Settings
- **Root Directory:** `./`
- **Build Command:** `npm install && npm run build`
- **Output Directory:** `frontend/dist`

### Step 3: Environment Variables
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAi...
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAi...
JWT_SECRET=your_secret_key
```

### Step 4: Deploy! 🚀

---

## ✅ FEATURES

✅ Multi-role authentication
✅ Document management
✅ Digital signatures
✅ Brand color theme (Red + Gray)
✅ Responsive design
✅ PWA support
✅ Vercel Functions backend
✅ Supabase database

---

**Ready to verify documents digitally!** 🎉

