# HTML AI Studio Pro 🚀

> Enterprise AI Web Builder & IDE – Build, Preview & Deploy with AI

## 📦 Deploy ke GitHub Pages

### Langkah 1 – Upload ke GitHub
1. Buat repository baru di GitHub (misal: `html-ai-studio-pro`)
2. Upload semua isi folder ZIP ini ke root repository

### Langkah 2 – Aktifkan GitHub Pages
1. Buka **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **master** → folder **/ (root)**
4. Klik **Save**

### Langkah 3 – Akses App
Setelah ±1 menit, app bisa diakses di:
```
https://<username>.github.io/<repo-name>/
```

---

## 📁 Struktur File

```
📂 root/
├── index.html          ← App utama (HTML AI Studio Pro)
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker (offline support)
├── favicon.ico         ← Favicon
├── .nojekyll           ← Wajib untuk GitHub Pages
├── README.md           ← Dokumentasi ini
└── icons/
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png
```

---

## ✅ Fitur PWA
- **Installable** – Bisa di-install ke Home Screen (Android/iOS/Desktop)
- **Offline Support** – Cache-first strategy via Service Worker
- **App-like Experience** – Standalone display mode, no browser UI
- **All Platforms** – Android, iOS Safari, Chrome Desktop

## 🛠️ Tech Stack
- React 18 (bundled single-file)
- Tailwind CSS
- CodeMirror (editor)
- Firebase (cloud sync)
- Multi-provider AI (Anthropic, OpenAI, Gemini, Groq, OpenRouter)

---

*Built with ❤️ by RiL Developer*
