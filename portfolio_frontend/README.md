# 📈 WealthView – Multi-Konto Finanzsimulator

WealthView ist eine fortschrittliche, interaktive React-Anwendung zur Simulation und Visualisierung von Finanzportfolios. Mit diesem Tool können Nutzer verschiedene Finanzkonten anlegen, komplexe Geldströme (Einzahlungen, Entnahmen, Umbuchungen) simulieren und die Entwicklung ihres Gesamtvermögens unter Berücksichtigung von Inflation und Renditen über Jahrzehnte hinweg visualisieren.

## ✨ Hauptfunktionen

* **Multi-Konto-Management:** Erstelle separate Konten (z.B. Girokonto, ETF-Portfolio, Sparkonto) und verwalte sie unabhängig voneinander.
* **Detaillierte Geldströme (Streams):**
    * Monatliche oder einmalige Ein- und Auszahlungen.
    * Automatisierte Umbuchungen zwischen Konten (inkl. Simulation von Steuern/Gebühren).
* **Kontoauflösungen (Liquidations):** Simuliere die Auflösung eines Kontos zu einem bestimmten Datum und verteile das Restkapital prozentual auf andere Konten.
* **Asset-Allokation:** Detaillierter Modus zur Unterteilung eines Kontos in Cash und spezifische Anlageklassen (Assets) mit eigenen Wachstumsraten.
* **Globale Parameter:** Berücksichtigung von globaler Inflation und anpassbaren Simulationszeiträumen (z.B. 2026 bis 2056).
* **Daten-Visualisierung:** Interaktive Liniendiagramme zur Darstellung der Kaufkraft (Realwert) vs. Nominalwert, unterstützt durch Recharts.
* **Kombinierter Vergleichsmodus:** Vergleiche die Performance einzelner Konten in einer kombinierten Ansicht.
* **Import / Export:** Speichere deine Konfiguration als JSON ab und lade sie später wieder hoch.
* **Dark / Light Mode:** Integriertes Theme-Toggling für optimale Lesbarkeit.
* **Integriertes Finanz-Glossar:** Schnelle Erklärungen zu wichtigen Finanzbegriffen direkt in der App.

---

## 🛠️ Tech Stack

Das Projekt basiert auf modernen Web-Technologien und best practices der Frontend-Entwicklung:

* **Framework:** [React 18+](https://react.dev/)
* **Sprache:** [TypeScript](https://www.typescriptlang.org/) für Typensicherheit (Interfaces wie `AccountConfig`, `TransactionStream`, etc.)
* **Diagramme:** [Recharts](https://recharts.org/) (ComposedChart, PieChart, Line)
* **Animationen:** [Framer Motion](https://www.framer.com/motion/) für weiche UI-Übergänge (GlassCards, Panels).
* **Icons:** [Lucide React](https://lucide.dev/)
* **Styling:** Custom CSS (Variablen-basiert für Dark/Light-Mode Anpassungen, z.B. in `App.css`).

---

## 🚀 Lokales Setup & Installation

Folge diesen Schritten, um das Projekt lokal auf deinem Rechner auszuführen. Es wird vorausgesetzt, dass [Node.js](https://nodejs.org/) (inkl. `npm` oder `yarn`) installiert ist.

### 1. Repository klonen / Code bereitstellen
Wenn du ein Git-Repository hast, klone es. Alternativ entpacke den Projektordner in deinem gewünschten Verzeichnis.

```bash
# Beispiel für Git
git clone [https://github.com/dein-username/wealthview.git](https://github.com/dein-username/wealthview.git)
cd wealthview
```

### 2. Abhängigkeiten installieren
Installiere alle benötigten NPM-Pakete (React, Framer Motion, Recharts, Lucide, etc.).

```bash
npm install
# oder
yarn install
```

### 3. Entwicklungsserver starten
Starte den lokalen Development-Server (typischerweise Vite oder Create React App).

```bash
npm run dev
# oder bei Create React App: npm start
```

Die Anwendung sollte nun im Browser unter `http://localhost:5173` (Vite) oder `http://localhost:3000` (CRA) erreichbar sein.

> **Optionaler Backend-Hinweis:** In der Datei `utils/api.ts` gibt es eine Funktion `fetchStockData`, die Aktien-Daten von `http://localhost:8080/api/stocks` anfragt. Wenn du Live-Aktienkurse nutzen möchtest, muss das entsprechende Backend auf Port 8080 laufen. Die Hauptsimulation funktioniert jedoch komplett lokal im Browser.

---

## 📂 Projektstruktur

Die Codebase ist modular aufgebaut, um Wartbarkeit und Erweiterbarkeit zu garantieren:

* **`/components/`**: Alle UI-Komponenten.
    * `PortfolioDashboard.tsx`: Das Haupt-Dashboard, verwaltet den State und die Tabs.
    * `PortfolioChart.tsx` & `AllocationChart.tsx`: Wrapper für Recharts.
    * `*Inputs.tsx` (z.B. `DepositStreamInputs.tsx`, `TransferInputs.tsx`): Formulare für die jeweiligen Finanzströme.
    * `GlassCard.tsx`: Basis-Container mit Framer-Motion Animationen.
* **`/types/`**: `index.ts` beinhaltet alle TypeScript-Interfaces (`GlobalConfig`, `Account`, etc.).
* **`/utils/`**: Kernlogik der App.
    * `calculator.ts`: Beinhaltet die komplexe `runSimulation`-Funktion, welche das Vermögen Monat für Monat berechnet.
* **`/constants/`**: Statische Daten wie das `glossary.ts`.
* **`App.tsx` & `App.css`**: Einstiegspunkt und globales Styling (Dark Mode Logic).

---

## 💡 Nutzung & Workflow

1.  **Globale Parameter setzen:** Lege links in der Seitenleiste die Start- und Enddaten der Simulation fest und definiere die erwartete Inflation.
2.  **Konten anlegen:** Klicke oben auf "+ Neues Konto". Benenne es um (z.B. "ETF Sparplan").
3.  **Basisdaten definieren:** Trage Startkapital und den erwarteten Basiszins/Wachstum in das Formular ein.
4.  **Ströme hinzufügen:** * Füge monatliche Einzahlungen (Sparraten) hinzu.
    * Richte Umbuchungen ein, wenn Geld automatisch von Konto A nach Konto B wandern soll.
5.  **Auswerten:** Wechsle zum Tab **"Gesamtvermögen"**, um zu sehen, wie sich dein Reichtum unter Berücksichtigung der Kaufkraft (Realwert) im Laufe der Jahre entwickelt. Vergleiche verschiedene Konten im **Vergleichsmodus**.
6.  **Sichern:** Nutze die Export-Funktion (Download-Icon), um dein Setup als `.json` zu speichern, damit du es beim nächsten Mal wieder importieren kannst.