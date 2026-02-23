# DioGen v3 — Genomic Intelligence Protocol

DioGen analyzes your raw DNA data (23andMe or AncestryDNA) and generates a personalized health optimization protocol powered by Claude AI.

It matches your genetic variants against 95 curated SNPs across 8 categories: longevity, metabolism, brain health, cardiovascular, nutrients, fitness, gut health, and skin — then produces actionable supplement, nutrition, training, and lifestyle recommendations.

## Quick Start

```bash
git clone git@github.com:harjeevanmaan/diogen.git
cd diogen
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Setup

**You need an Anthropic API key** to run the analysis:

1. Create an account at [console.anthropic.com](https://console.anthropic.com)
2. Add credits (a single analysis costs ~$0.05–0.15)
3. Generate a key at [Settings > API Keys](https://console.anthropic.com/settings/keys)
4. Paste it into the key field on the app's upload screen

The key is stored in your browser's localStorage — it never leaves your machine and is not sent anywhere except directly to the Anthropic API.

Alternatively, create a `.env` file:

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

## How It Works

1. **Upload** your raw DNA file (.txt from 23andMe or AncestryDNA)
2. **Walk through** the quiz (name, age, ancestry, goals, lifestyle)
3. **DioGen matches** your variants against 95 curated SNPs
4. **Claude AI analyzes** your matched SNPs with ancestry and lifestyle context
5. **View your protocol** with SNP breakdowns, supplements, nutrition, and training guidance
6. **Export** a printable report

All DNA parsing happens client-side in your browser. Only matched rsIDs (typically 30–80 out of 600K+) are sent to the API — never raw genetic data.

## Testing

A synthetic test file is included:

```bash
# Use test_dna_data.txt in the upload step (82 matching SNPs, South Asian male profile)
```

Run the header/structure tests:

```bash
node test-api-headers.mjs
```

## Tech Stack

- React (single-component SPA)
- Vite
- Anthropic Messages API (claude-sonnet-4-5-20250929)
- No backend — runs entirely in the browser

## Disclaimer

This is for educational purposes only and does not constitute medical advice. Genetic predisposition does not determine outcomes. Always consult your physician before starting supplement protocols or making lifestyle changes.
