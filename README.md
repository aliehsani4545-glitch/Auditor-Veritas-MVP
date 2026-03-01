# 🔍 Auditor Veritas

> **GDPR-compliant audit ledger for data processing activities (DPA)**  
> A full-stack MVP that enables organizations to create, manage and track data processing records in accordance with Article 30 of GDPR.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![GDPR](https://img.shields.io/badge/GDPR-Compliant-blue?style=flat)

---

## 📌 Om projektet

Auditor Veritas är ett verktyg för organisationer som behöver uppfylla GDPR:s krav på registerföring av behandlingsaktiviteter. Systemet ger en strukturerad, sökbar och reviderbar logg över hur personuppgifter hanteras.

**Bakgrund:** Projektet uppstod ur min kombinerade bakgrund som systemvetare och socionom med erfarenhet av myndighetshantering av känsliga personuppgifter på Göteborgs Stad.

---

## ⚙️ Tech Stack

| Lager | Teknologi |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Deployment | Docker + Netlify + Railway |
| Arkitektur | REST API, komponentbaserad frontend |

---

## 🚀 Funktioner

- ✅ Skapa och hantera registerföringar (DPA records)
- ✅ Sök och filtrera behandlingsaktiviteter
- ✅ Reviderbar logg över ändringar
- ✅ GDPR Artikel 30-kompatibel struktur
- ✅ REST API med tydlig separation frontend/backend
- ✅ Containeriserad med Docker

---

## 🖥️ Kom igång lokalt

### Förutsättningar
- Node.js 18+
- npm
- Docker (valfritt)

### Installation

```bash
# Klona repot
git clone https://github.com/aliehsani4545-glitch/Auditor-Veritas-MVP.git
cd Auditor-Veritas-MVP

# Installera frontend-beroenden
npm install

# Installera backend-beroenden
cd backend && npm install && cd ..

# Kopiera miljövariabelmall
cp backend/.env.example backend/.env
# Fyll i dina egna värden i backend/.env
```

### Starta utvecklingsmiljö

```bash
# Starta backend (port 3001)
cd backend && node server.js

# Starta frontend i nytt terminalfönster (port 5173)
cd .. && npm run dev
```

### Med Docker

```bash
docker build -t auditor-veritas ./backend
docker run -p 3001:3001 auditor-veritas
```

---

## 📁 Projektstruktur

```
Auditor-Veritas-MVP/
├── backend/           # Node.js + Express API
│   ├── server.js      # Huvudserver och routes
│   ├── .env.example   # Miljövariabelmall
│   └── Dockerfile
├── frontend/          # React + Vite
├── pages/             # Next.js-sidor
├── netlify.toml       # Deployment-konfiguration
└── README.md
```

---

## 🔐 Säkerhet & GDPR

- Känsliga konfigurationsvärden hanteras via miljövariabler (aldrig i kod)
- `.env`-filer exkluderas via `.gitignore`
- Byggt med principen *privacy by design*

---

## 👤 Utvecklare

**Ali Ahsani** — Systemvetare | Göteborg  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ali-ahsani-646634230)
[![GitHub](https://img.shields.io/badge/GitHub-aliehsani4545--glitch-181717?style=flat&logo=github)](https://github.com/aliehsani4545-glitch)
