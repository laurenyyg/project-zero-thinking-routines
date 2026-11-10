# Harvard Project Zero: Thinking Routines Explorer & Practice Dashboard

An interactive educational consultant and practice tracker designed for educators, facilitators, and inquiry-led learners to discover, guide, and record **Harvard Project Zero (PZ)** thinking routines.

Built with an aesthetic rooted in **Bauhaus, De Stijl, and Suprematism**: high-contrast orthogonal grids, stark pure white canvas (`#FFFFFF`), primary color accents, and elemental geometric emblems.

---

## Key Features

### 1. Interactive Diagnostic Advisor
- **Diagnostic Consultation:** Engage in an interactive conversation describing your classroom lesson, text, problem, or decision dilemma.
- **Project Zero Recommendations:** Diagnoses the core thinking disposition required and suggests the optimal routine from the Harvard PZ toolbox with clear pedagogical rationale.
- **Quick-Start Scenarios:** One-click prompts for common inquiry situations (analyzing texts, examining controversial claims, navigating trade-offs, or unpacking complex systems).

### 2. Complete Harvard Project Zero Directory (92 Routines)
- Exhaustive collection of all 92 thinking routines from the official Harvard Graduate School of Education Project Zero toolbox.
- Categorized by **Suprematist Elemental Dimensions**:
  - ■ **De Stijl Red Square (`#E52521`):** *Synthesizing & Organizing* (3-2-1 Bridge, +1 Routine, The 4 Cs, Headlines, etc.)
  - ● **Cobalt Blue Circle (`#0047AB`):** *Digging for Truth & Evidence* (Claim-Support-Question, Red Light Yellow Light, Tug for Truth, etc.)
  - ▲ **Cadmium Yellow Triangle (`#FFD000`):** *Creativity & Decision Making* (Compass Points, Options Diamond, Imagine If..., etc.)
  - ⬡ **Solid Black Diamond (`#111111`):** *Exploring Complexity & Systems* (Parts People Interactions, Think Feel Care, The 3 Whys, etc.)

### 3. Step-by-Step Interactive Guide & Worksheet
- Walk step-by-step through any thinking routine with official Harvard PZ purpose, application contexts, and facilitator launch tips.
- Digital worksheet to record student responses or reflections for each step.
- One-click export to Markdown (`.md`) and direct transfer to your practice log.

### 4. Practice Dashboard & Activity Insights
- **Metric Tiles:** Live statistics across all four thinking dimensions.
- **Proportional De Stijl Distribution Bar:** Visual breakdown of routine diversity.
- **Top Frequent Practices:** Ranked leaderboard of your most frequently used routines.
- **Chronological Activity Log:** Full history of completed practices with search, category filters, and Markdown export.
- **Standardized Logging Format:** Preserves records in the format *"Used [Routine Name] on [Date] for [Custom Note]"*.

---

## Design System

- **Background:** Gallery pure white (`#FFFFFF`) — strictly zero dark or beige backgrounds.
- **Typography:** Geometric modern sans-serif (`Plus Jakarta Sans`) paired with tabular numerals (`JetBrains Mono`).
- **Framework:** `2px`–`3px` solid black orthogonal lines, zero-pill discipline, and functional primary color blocking.

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Canvas Confetti
- **Backend:** Node.js, Express 4, Vite middleware mode
- **AI Engine:** Google Gemini API (`@google/genai` with `gemini-3.8-flash`) via server-side proxy
- **Storage:** Client-side persistent `localStorage` for privacy and offline resilience

---

## Development & Deployment

### Run Locally
```bash
# Install dependencies
npm install

# Start full-stack development server (Express + Vite on port 3000)
npm run dev
