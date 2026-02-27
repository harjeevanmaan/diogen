import { useState, useCallback, useRef, useEffect } from "react";

/*
 ╔══════════════════════════════════════════════════════════╗
 ║  DioGen v3 — Genomic Intelligence Protocol               ║
 ║  Quiz-Flow Onboarding · Enhanced Diagnostics · 32K tokens ║
 ║  Brand: Clinical Cobalt + Genome Teal                     ║
 ║  Model: claude-sonnet-4-6 (Sonnet 4.5)          ║
 ║  Production Prototype — Feb 2026                          ║
 ╚══════════════════════════════════════════════════════════╝
*/

// ═══════════════════════════════════════════
// API CONFIG
// ═══════════════════════════════════════════
const ANTHROPIC_API_KEY = typeof import.meta !== "undefined"
  ? import.meta.env?.VITE_ANTHROPIC_API_KEY || ""
  : "";

// ═══════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════
const T = {
  cobalt900:"#1B2559", cobalt700:"#2D3A8C", cobalt500:"#4F5ED5",
  cobalt300:"#818CF8", cobalt100:"#E0E7FF", cobalt50:"#EEF2FF",
  teal:"#0EA5A0", tealDark:"#0D9488", tealLight:"#CCFBF1", teal50:"#F0FDFA",
  violet:"#7C3AED", violet50:"#F5F3FF",
  amber:"#F59E0B", amber50:"#FFFBEB",
  green:"#10B981", green50:"#ECFDF5",
  red:"#EF4444", red50:"#FEF2F2",
  blue:"#3B82F6", blue50:"#EFF6FF",
  orange:"#F97316", orange50:"#FFF7ED",
  pink:"#EC4899", pink50:"#FDF2F8",
  s900:"#0F172A", s700:"#334155", s600:"#475569", s500:"#64748B",
  s400:"#94A3B8", s300:"#CBD5E1", s200:"#E2E8F0", s100:"#F1F5F9", s50:"#F8FAFC",
  white:"#FFFFFF",
};

// ═══════════════════════════════════════════
// SNP KNOWLEDGE BANK (95 curated variants)
// ═══════════════════════════════════════════
const SNP_BANK = {
  // LONGEVITY
  rs2802292:{gene:"FOXO3",cat:"longevity",name:"Longevity / Stress Resistance",tier:1,ctx:"Most replicated human longevity gene. G allele enhances autophagy, DNA repair, and oxidative stress defense. 10-20% increased odds of extreme longevity."},
  rs429358:{gene:"APOE",cat:"longevity",name:"APOE — Alzheimer's & CV Risk",tier:1,ctx:"Determines APOE isoform with rs7412. E4 elevates Alzheimer's/CV risk; E2 protective; E3 neutral.",paired:"rs7412"},
  rs7412:{gene:"APOE",cat:"longevity",name:"APOE Isoform Modifier",tier:1,ctx:"Combined with rs429358: TT+CC=E3/E3, TT+CT=E2/E3, CT+CC=E3/E4.",paired:"rs429358"},
  rs9536314:{gene:"KLOTHO",cat:"longevity",name:"Klotho Anti-Aging Protein",tier:2,ctx:"KL-VS variant. Heterozygous carriers show enhanced cognition and longevity."},
  rs708272:{gene:"CETP",cat:"longevity",name:"HDL Cholesterol / Longevity",tier:2,ctx:"CETP activity affecting HDL-C levels. Reduced activity raises HDL, a longevity biomarker."},
  rs1042522:{gene:"TP53",cat:"longevity",name:"Tumor Suppressor Function",tier:2,ctx:"p53 Pro72Arg. Pro allele associated with longevity through enhanced DNA damage response."},
  rs2764264:{gene:"FOXO3",cat:"longevity",name:"FOXO3 Secondary Marker",tier:2,ctx:"Additional FOXO3 longevity locus. C allele associated with extended lifespan."},
  rs10507486:{gene:"TERT",cat:"longevity",name:"Telomerase Activity",tier:2,ctx:"TERT variant affecting telomere maintenance and biological aging."},
  // METABOLISM
  rs9939609:{gene:"FTO",cat:"metabolism",name:"Obesity Risk (Fat Mass)",tier:1,ctx:"Most studied obesity variant. A allele increases fat mass, BMI, hunger. Modifiable by exercise."},
  rs17782313:{gene:"MC4R",cat:"metabolism",name:"Appetite Regulation",tier:1,ctx:"Key hypothalamic appetite regulator. C allele increases hunger drive and calorie-dense food preference."},
  rs7903146:{gene:"TCF7L2",cat:"metabolism",name:"Type 2 Diabetes Risk",tier:1,ctx:"Strongest common T2D risk variant. T allele impairs beta-cell function. Amplified in South Asian populations. OR ~1.4/allele."},
  rs13266634:{gene:"SLC30A8",cat:"metabolism",name:"Zinc Transport / Insulin",tier:1,ctx:"Zinc transporter in beta cells. Affects insulin crystallization. Interacts with zinc intake."},
  rs5082:{gene:"APOA2",cat:"metabolism",name:"Saturated Fat Sensitivity",tier:2,ctx:"G allele carriers show disproportionate BMI increase with high saturated fat (>22g/day)."},
  rs4988235:{gene:"MCM6/LCT",cat:"metabolism",name:"Lactose Persistence",tier:1,ctx:"GG = lactose non-persistent (intolerant). Common in South/East Asian populations."},
  rs762551:{gene:"CYP1A2",cat:"metabolism",name:"Caffeine Metabolism",tier:1,ctx:"AA = fast metabolizer (caffeine cardioprotective). C carriers = slow (caffeine may increase CV risk)."},
  rs1801282:{gene:"PPARG",cat:"metabolism",name:"Insulin Sensitivity",tier:1,ctx:"Pro12Ala. G allele improves insulin sensitivity, reduces T2D risk ~20%."},
  rs12255372:{gene:"TCF7L2",cat:"metabolism",name:"T2D Risk (Secondary)",tier:1,ctx:"Second TCF7L2 variant confirming diabetes risk. T allele increases risk."},
  rs1260326:{gene:"GCKR",cat:"metabolism",name:"Fasting Triglycerides",tier:1,ctx:"T allele lowers fasting glucose but raises triglycerides. Affects hepatic glucose sensing."},
  rs780094:{gene:"GCKR",cat:"metabolism",name:"Metabolic Syndrome Risk",tier:2,ctx:"Confirmatory GCKR locus for fasting glucose and triglycerides."},
  rs10830963:{gene:"MTNR1B",cat:"metabolism",name:"Melatonin / Glucose",tier:1,ctx:"Melatonin receptor affecting insulin secretion timing. G allele increases fasting glucose, especially with late eating."},
  rs2943641:{gene:"IRS1",cat:"metabolism",name:"Insulin Signaling",tier:1,ctx:"C allele reduces insulin signaling efficiency, increases T2D and visceral fat risk."},
  rs4402960:{gene:"IGF2BP2",cat:"metabolism",name:"Beta Cell Function",tier:1,ctx:"T allele increases T2D risk through impaired beta-cell function."},
  rs1111875:{gene:"HHEX",cat:"metabolism",name:"Beta Cell Development",tier:1,ctx:"C allele affects pancreatic beta-cell development and insulin secretion."},
  rs7754840:{gene:"CDKAL1",cat:"metabolism",name:"CDK5 / Insulin",tier:1,ctx:"C allele increases T2D risk through impaired insulin secretion."},
  // BRAIN
  rs4680:{gene:"COMT",cat:"brain",name:"Dopamine Clearance",tier:1,ctx:"Val158Met. GG=fast clearance='Warrior'. AA=slow='Worrier'. Most studied neurogenetic variant."},
  rs1800497:{gene:"DRD2/ANKK1",cat:"brain",name:"D2 Receptor Density",tier:1,ctx:"Taq1A. A allele reduces striatal D2 receptors 30-40%. Affects reward, addiction, motivation."},
  rs6265:{gene:"BDNF",cat:"brain",name:"Neuroplasticity (BDNF)",tier:1,ctx:"Val66Met. T(Met) reduces BDNF secretion. Affects memory, mood, learning. Exercise is key BDNF inducer."},
  rs1360780:{gene:"FKBP5",cat:"brain",name:"Stress Axis (HPA)",tier:1,ctx:"T allele impairs cortisol feedback causing prolonged stress response."},
  rs1801260:{gene:"CLOCK",cat:"brain",name:"Circadian / Chronotype",tier:2,ctx:"Associated with evening chronotype and delayed sleep phase."},
  rs1800544:{gene:"ADRA2A",cat:"brain",name:"Norepinephrine / Attention",tier:2,ctx:"Alpha-2A adrenergic receptor affecting prefrontal norepinephrine and attention."},
  rs4570625:{gene:"TPH2",cat:"brain",name:"Serotonin Synthesis",tier:2,ctx:"T allele reduces central serotonin production. Affects amygdala reactivity and mood."},
  rs25531:{gene:"SLC6A4",cat:"brain",name:"Serotonin Transporter",tier:1,ctx:"5-HTTLPR region. Short allele affects serotonin reuptake, stress reactivity, SSRI response."},
  rs1799971:{gene:"OPRM1",cat:"brain",name:"Opioid Receptor / Reward",tier:1,ctx:"G allele alters reward processing, pain sensitivity, social bonding."},
  rs53576:{gene:"OXTR",cat:"brain",name:"Oxytocin / Social Bonding",tier:2,ctx:"G allele: higher empathy, social sensitivity. A allele: reduced social cognition."},
  rs1006737:{gene:"CACNA1C",cat:"brain",name:"Calcium Channel / Mood",tier:1,ctx:"Risk allele associated with bipolar, depression, schizophrenia across multiple GWAS."},
  rs4675690:{gene:"DRD4",cat:"brain",name:"D4 Receptor / Novelty",tier:2,ctx:"Associated with novelty seeking, ADHD risk, cognitive flexibility."},
  rs28363170:{gene:"SLC6A3",cat:"brain",name:"Dopamine Transporter",tier:2,ctx:"Affects dopamine reuptake speed. Associated with ADHD and stimulant response."},
  // CARDIOVASCULAR
  rs1333049:{gene:"9p21.3",cat:"cardiovascular",name:"Coronary Disease Risk",tier:1,ctx:"Most replicated CAD locus. C allele ~25% increased risk. Impactful for South Asians."},
  rs699:{gene:"AGT",cat:"cardiovascular",name:"Salt-Sensitive BP",tier:1,ctx:"AA genotype increases angiotensinogen, causing disproportionate BP response to sodium."},
  rs1800795:{gene:"IL6",cat:"cardiovascular",name:"IL-6 Inflammation",tier:1,ctx:"G allele increases basal IL-6. Chronic inflammation accelerates atherosclerosis and aging."},
  rs1042713:{gene:"ADRB2",cat:"cardiovascular",name:"Beta-2 Adrenergic",tier:2,ctx:"Affects catecholamine fat mobilization and cardiovascular exercise response."},
  rs1799963:{gene:"F2",cat:"cardiovascular",name:"Prothrombin / Clotting",tier:1,ctx:"A allele increases prothrombin levels and VTE risk 2-3x."},
  rs6025:{gene:"F5",cat:"cardiovascular",name:"Factor V Leiden",tier:1,ctx:"A allele causes APC resistance. 5-10x DVT risk for heterozygotes."},
  rs5186:{gene:"AGTR1",cat:"cardiovascular",name:"Angiotensin II Receptor",tier:2,ctx:"C allele: enhanced vasoconstriction, increased hypertension and LVH risk."},
  rs4340:{gene:"ACE",cat:"cardiovascular",name:"ACE I/D",tier:1,ctx:"D allele: higher ACE activity, elevated Ang II, higher BP. Target with ACE inhibitors if relevant."},
  rs3798220:{gene:"LPA",cat:"cardiovascular",name:"Lp(a) Levels",tier:1,ctx:"C allele: elevated Lp(a), independent CVD risk factor. Not modifiable by lifestyle."},
  rs10455872:{gene:"LPA",cat:"cardiovascular",name:"Lp(a) Secondary",tier:1,ctx:"Confirms Lp(a) elevation. Combined risk assessment with rs3798220."},
  // NUTRIENTS
  rs1801133:{gene:"MTHFR",cat:"nutrients",name:"Folate Metabolism (C677T)",tier:1,ctx:"TT genotype: 70% reduced enzyme activity. Elevated homocysteine. Supplement methylfolate."},
  rs1801131:{gene:"MTHFR",cat:"nutrients",name:"MTHFR A1298C",tier:1,ctx:"Combined with C677T for complete methylation profile. Double heterozygote significant."},
  rs7946:{gene:"PEMT",cat:"nutrients",name:"Choline Synthesis",tier:1,ctx:"C allele reduces endogenous choline. Critical for MTHFR TT carriers. Higher dietary choline needed."},
  rs855791:{gene:"TMPRSS6",cat:"nutrients",name:"Iron Regulation",tier:1,ctx:"T allele: lower serum iron and ferritin. Risk of deficiency especially with menstruation."},
  rs1799945:{gene:"HFE",cat:"nutrients",name:"Hemochromatosis (H63D)",tier:1,ctx:"G allele mildly increases iron absorption. Combined with C282Y for full assessment."},
  rs1800562:{gene:"HFE",cat:"nutrients",name:"Hemochromatosis (C282Y)",tier:1,ctx:"A allele: significant iron overload. Homozygous AA requires monitoring and phlebotomy."},
  rs7501331:{gene:"BCMO1",cat:"nutrients",name:"Beta-Carotene Conversion",tier:1,ctx:"T allele: 32% reduced conversion to retinol. Need preformed vitamin A from animal sources."},
  rs12934922:{gene:"BCMO1",cat:"nutrients",name:"Vitamin A (Secondary)",tier:2,ctx:"Combined with rs7501331 for complete beta-carotene conversion assessment."},
  rs2282679:{gene:"GC",cat:"nutrients",name:"Vitamin D Transport",tier:1,ctx:"C allele: lower circulating 25(OH)D. Higher supplementation needed. Very common."},
  rs10741657:{gene:"CYP2R1",cat:"nutrients",name:"Vitamin D Activation",tier:1,ctx:"A allele: reduced hepatic 25-hydroxylation. Impairs D activation from sun/supplements."},
  rs2228570:{gene:"VDR",cat:"nutrients",name:"Vitamin D FokI",tier:2,ctx:"Affects VDR protein length and transcriptional activity."},
  rs234706:{gene:"CBS",cat:"nutrients",name:"Homocysteine Pathway",tier:2,ctx:"Transsulfuration pathway. Interacts with MTHFR for methylation assessment."},
  rs602662:{gene:"FUT2",cat:"nutrients",name:"B12 / Secretor",tier:2,ctx:"Confirms secretor status affecting B12 absorption and gut microbiome."},
  rs492602:{gene:"FUT2",cat:"nutrients",name:"FUT2 / B12 Status",tier:2,ctx:"Non-secretors have reduced B12 absorption and altered microbiome."},
  rs4588:{gene:"GC",cat:"nutrients",name:"Vitamin D Binding Protein",tier:1,ctx:"A allele reduces VDBP levels affecting total 25(OH)D but potentially increasing free D bioavailability."},
  rs7041:{gene:"GC",cat:"nutrients",name:"VDBP Isoform",tier:1,ctx:"Defines Gc isoforms with rs4588 affecting vitamin D transport."},
  // FITNESS
  rs1815739:{gene:"ACTN3",cat:"fitness",name:"Muscle Fiber Type",tier:1,ctx:"R577X 'speed gene'. C=fast-twitch power. T=endurance. CT=hybrid. Most replicated sports variant."},
  rs1799752:{gene:"ACE",cat:"fitness",name:"ACE I/D Endurance/Power",tier:1,ctx:"I allele: endurance. D allele: power/muscle growth. Affects training response."},
  rs8192678:{gene:"PPARGC1A",cat:"fitness",name:"Mitochondrial Biogenesis",tier:2,ctx:"PGC-1alpha. A(Ser) reduces mitochondrial efficiency. Affects endurance capacity."},
  rs2104772:{gene:"TNC",cat:"fitness",name:"Tendon Injury Risk",tier:2,ctx:"Associated with Achilles tendinopathy and rotator cuff injuries."},
  rs1800012:{gene:"COL1A1",cat:"fitness",name:"Collagen / Injury Risk",tier:2,ctx:"T allele reduces ligament/tendon injury risk via collagen cross-linking."},
  rs4253778:{gene:"PPARA",cat:"fitness",name:"Fat Oxidation / Endurance",tier:2,ctx:"C allele enhances endurance performance and fat utilization."},
  rs7832552:{gene:"TRHR",cat:"fitness",name:"Lean Body Mass",tier:2,ctx:"Associated with lean body mass and muscle development capacity."},
  rs11549465:{gene:"HIF1A",cat:"fitness",name:"Hypoxia / VO2max",tier:2,ctx:"T allele may enhance altitude adaptation and VO2max training response."},
  // GUT
  rs601338:{gene:"FUT2",cat:"gut",name:"Secretor / Microbiome",tier:1,ctx:"AA/AG=secretor (diverse microbiome, better B12). GG=non-secretor (reduced diversity, norovirus resistant)."},
  rs10889677:{gene:"IL23R",cat:"gut",name:"IBD Susceptibility",tier:1,ctx:"A allele increases IL-23 signaling, associated with Crohn's and UC."},
  rs2241880:{gene:"ATG16L1",cat:"gut",name:"Autophagy / Crohn's",tier:1,ctx:"G allele impairs intestinal cell autophagy, increasing Crohn's susceptibility."},
  rs11209026:{gene:"IL23R",cat:"gut",name:"IBD Protection",tier:1,ctx:"Protective A allele reduces IL-23 signaling. Rare but high impact."},
  rs2187668:{gene:"HLA-DQ2",cat:"gut",name:"Celiac / Gluten Risk",tier:1,ctx:"T allele strongly increases celiac disease risk."},
  rs7454108:{gene:"HLA-DQ8",cat:"gut",name:"Celiac DQ8",tier:1,ctx:"Combined with DQ2 for complete celiac profile."},
  // SKIN
  rs1805007:{gene:"MC1R",cat:"skin",name:"UV Sensitivity",tier:1,ctx:"T allele reduces eumelanin, increasing UV sensitivity and melanoma risk."},
  rs12203592:{gene:"IRF4",cat:"skin",name:"Skin Aging / UV",tier:1,ctx:"T allele: sun sensitivity, freckling, accelerated photoaging."},
  rs12913832:{gene:"HERC2",cat:"skin",name:"Eye Color",tier:1,ctx:"AA=likely brown, GG=likely blue, AG=variable (green/hazel)."},
  rs16891982:{gene:"SLC45A2",cat:"skin",name:"Skin Pigmentation",tier:1,ctx:"G allele: lighter pigmentation. Affects melanin transport."},
  rs1426654:{gene:"SLC24A5",cat:"skin",name:"Pigmentation (Global)",tier:1,ctx:"Major skin color determinant. A allele: lighter skin in European/South Asian populations."},
};

const CATS = {
  longevity: { label:"Longevity & Anti-Aging", icon:"🧬", color:T.teal, light:T.teal50, desc:"Cellular aging, stress resistance, protective variants" },
  metabolism:{ label:"Metabolism & Body Comp", icon:"🔥", color:T.amber, light:T.amber50, desc:"Obesity risk, diabetes, caffeine, lactose" },
  brain:     { label:"Brain & Mental Health",  icon:"🧠", color:T.violet, light:T.violet50, desc:"Dopamine, serotonin, BDNF, sleep, stress" },
  cardiovascular:{ label:"Heart & Inflammation", icon:"❤️", color:T.red, light:T.red50, desc:"CAD risk, blood pressure, clotting, Lp(a)" },
  nutrients: { label:"Nutrient Optimization",  icon:"💊", color:T.green, light:T.green50, desc:"MTHFR, vitamins D/B/A, iron, methylation" },
  fitness:   { label:"Fitness & Performance",  icon:"💪", color:T.blue, light:T.blue50, desc:"Muscle type, injury risk, VO2max, recovery" },
  gut:       { label:"Gut & Digestion",        icon:"🦠", color:T.orange, light:T.orange50, desc:"Microbiome, IBD risk, celiac, secretor" },
  skin:      { label:"Skin & Appearance",      icon:"✨", color:T.pink, light:T.pink50, desc:"UV sensitivity, pigmentation, photoaging" },
};



// Quiz flow steps — one concept per screen (Typeform/Zoe pattern)
const STEPS = ["upload","name","about","ancestry","goals","exercise","diet","sleep","health","review","processing","results"];
const STEP_LABELS = ["Upload","Name","About You","Ancestry","Goals","Activity","Diet","Sleep","Health","Review","Analyze","Report"];
const QUIZ_TOTAL = 10; // user-facing steps (upload through review)

// Visual option card data (competitive with Noom, Zoe, AG1)
const EX_OPTS = [
  { val: "Sedentary", icon: "🪑", sub: "Desk job, minimal movement" },
  { val: "Light (1-2x/wk)", icon: "🚶", sub: "Walking, yoga, casual activity" },
  { val: "Moderate (3-4x/wk)", icon: "🏃", sub: "Gym, running, recreational sports" },
  { val: "Active (5-6x/wk)", icon: "🏋️", sub: "Dedicated training, high intensity" },
  { val: "Athlete", icon: "🏆", sub: "Competitive or elite performance" },
];
const DIET_OPTS = [
  { val: "Standard / Mixed", icon: "🍽️", sub: "No specific framework" },
  { val: "Mediterranean", icon: "🫒", sub: "Olive oil, fish, whole grains" },
  { val: "Vegetarian", icon: "🥗", sub: "Plant-based with dairy & eggs" },
  { val: "Vegan", icon: "🌱", sub: "Fully plant-based" },
  { val: "Keto / Low-Carb", icon: "🥩", sub: "High fat, very low carb" },
  { val: "Paleo", icon: "🦴", sub: "Whole foods, no grains/dairy" },
  { val: "South Asian", icon: "🍛", sub: "Dal, roti, rice, spice-forward" },
  { val: "Other", icon: "✏️", sub: "Something else" },
];
const SLEEP_OPTS = [
  { val: "Poor (<5h)", icon: "😰", sub: "Frequently disrupted, under 5 hours" },
  { val: "Fair (5-6h)", icon: "😔", sub: "Inconsistent, trouble falling asleep" },
  { val: "Good (7-8h)", icon: "😊", sub: "Consistent, feel rested most days" },
  { val: "Excellent (8+h)", icon: "😴", sub: "Deep, restorative, wake refreshed" },
];
const ANC_OPTS = [
  { val: "European", path: "M22 8c-2 0-3 2-5 3-1 0-2-1-3 0-2 2 0 4 1 6 0 1 2 2 3 1 2-1 3-3 4-3 1 0 2 1 2 2s-1 2-1 3c1 1 2 0 3 0 1 1 1 3 0 4-1 0-2-1-3 0-1 2 0 3 1 4 1 0 2-1 3-1" },
  { val: "South Asian", path: "M20 6c1 2 2 4 2 7 0 2-1 4-2 6-2 3-4 5-5 8-1 2-1 3-2 3-1-1-2-3-2-5 0-3 1-5 2-7 1-3 2-5 3-7 1-2 2-3 4-5" },
  { val: "East Asian", path: "M12 4c3 0 6 1 8 4 2 2 3 5 3 8 0 2-1 4-2 5-2 2-4 4-7 4-1 0-3 1-4 2-2 1-3 0-5-1-2-2-3-4-3-6 0-3 0-5 1-7 1-3 3-5 5-7 1-1 2-2 4-2" },
  { val: "Southeast Asian", path: "M16 5c1 1 2 3 2 5 0 1-1 3-1 4 1 1 2 3 2 5 0 1-1 2-2 3-1 2-3 3-4 2-1 0-2-1-2-2-1-2 0-4 0-5 0-2-1-3-1-4 0-2 1-3 2-4 1-2 2-3 4-4" },
  { val: "African", path: "M18 4c2 2 3 5 3 8 0 3-1 6-2 9-1 2-2 5-4 6-1 1-3 2-4 2s-3-1-4-2c-2-2-3-4-4-7-1-3-2-6-2-9 0-3 1-5 3-7 2-1 3 0 5 0s4-1 5 0" },
  { val: "Middle Eastern", path: "M14 7c2-1 5-1 7 0 2 2 3 4 3 6 0 3-2 5-4 7-1 1-3 2-4 2-2 0-3-1-4-2-2-1-3-3-4-5 0-2 0-4 1-5 1-2 3-3 5-3" },
  { val: "Latin American", path: "M17 3c1 1 2 4 3 7 0 3 0 6-1 9-1 3-2 6-4 8-1 2-2 3-3 3-2 0-3-2-3-4-1-3-1-6-1-9 0-3 0-6 1-8 1-3 2-5 4-6 1-1 3-1 4 0" },
  { val: "Indigenous", path: "M20 10a10 10 0 11-20 0 10 10 0 0120 0zM10 3v14M3 10h14M6 5l8 10M14 5L6 15" },
  { val: "Mixed / Multi", path: "M14 8a6 6 0 110 8 6 6 0 010-8zm6 4a6 6 0 110 0 6 6 0 010 0z" },
];
function GeoIcon({ path, color, size = 36 }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} style={{ display: "block", margin: "0 auto" }}>
      <rect width="28" height="28" rx="8" fill={color + "12"} />
      <g transform="translate(4,2)">
        <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
const SEX_OPTS = [
  { val: "Male", icon: "♂️" },
  { val: "Female", icon: "♀️" },
];


// ═══════════════════════════════════════════
// PARSERS (23andMe + AncestryDNA)
// ═══════════════════════════════════════════
function parse23andMe(t) {
  const r = {};
  for (const l of t.split("\n")) {
    if (l.startsWith("#") || !l.trim()) continue;
    const p = l.split("\t");
    if (p.length >= 4) {
      const id = p[0].trim().toLowerCase();
      const g = p[3].trim();
      if (id.startsWith("rs") && g && g !== "--" && g !== "00") r[id] = g.toUpperCase();
    }
  }
  return r;
}

function parseAncestry(t) {
  const r = {};
  for (const l of t.split("\n")) {
    if (l.startsWith("#") || !l.trim()) continue;
    const p = l.split("\t");
    if (p.length >= 5) {
      const id = p[0].trim().toLowerCase();
      const a1 = p[3].trim(), a2 = p[4].trim();
      if (id.startsWith("rs") && a1 !== "0" && a2 !== "0") r[id] = (a1 + a2).toUpperCase();
    }
  }
  return r;
}

function detectAndParse(t) {
  if (t.includes("AncestryDNA") || t.includes("rsid\tchromosome\tposition\tallele1\tallele2"))
    return { source: "AncestryDNA", data: parseAncestry(t) };
  return { source: "23andMe", data: parse23andMe(t) };
}

function matchSNPs(d, goals) {
  const m = [];
  for (const [id, info] of Object.entries(SNP_BANK)) {
    if (goals.length > 0 && !goals.includes(info.cat)) continue;
    const g = d[id];
    if (g) m.push({ rsid: id, genotype: g, ...info });
  }
  return m.sort((a, b) => a.tier - b.tier || a.cat.localeCompare(b.cat));
}

// ═══════════════════════════════════════════
// ROBUST JSON PARSER (Safari-safe, no lookbehind)
// ═══════════════════════════════════════════
function robustJSONParse(text) {
  let s = text.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
  try { return JSON.parse(s); } catch (_) { /* continue */ }
  const match = s.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in AI response");
  s = match[0];
  try { return JSON.parse(s); } catch (_) { /* continue */ }
  // Fix trailing commas before ] or }
  s = s.replace(/,\s*([}\]])/g, "$1");
  // Fix unescaped newlines inside strings (Safari-safe — no lookbehind)
  let inStr = false, esc = false, out = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (esc) { out += c; esc = false; continue; }
    if (c === "\\") { out += c; esc = true; continue; }
    if (c === '"') { inStr = !inStr; out += c; continue; }
    if (inStr && c === "\n") { out += "\\n"; continue; }
    if (inStr && c === "\r") { out += "\\r"; continue; }
    out += c;
  }
  s = out;
  try { return JSON.parse(s); } catch (_) { /* continue */ }
  // Last resort: close unclosed brackets/braces
  let braces = 0, brackets = 0;
  for (const c of s) {
    if (c === "{") braces++; if (c === "}") braces--;
    if (c === "[") brackets++; if (c === "]") brackets--;
  }
  s = s.replace(/,\s*$/, "");
  while (brackets > 0) { s += "]"; brackets--; }
  while (braces > 0) { s += "}"; braces--; }
  s = s.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(s);
}

// ═══════════════════════════════════════════
// SANITIZE (prevent XSS in report)
// ═══════════════════════════════════════════
function esc(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ═══════════════════════════════════════════
// API PROMPT + SYSTEM
// ═══════════════════════════════════════════
const SYS_PROMPT = `You are DioGen, a genomic intelligence system producing personalized health optimization protocols.

BRAND VOICE: Trustworthy, precise, empowering, non-alarmist, privacy-first. Frame risk variants as optimization opportunities. Use "suggests" not "proves". Write for both biohackers and newcomers — explain scientific terms naturally on first use.

EVIDENCE LABELS: Use confidence 0.85-1.0 for Tier 1 (strong GWAS), 0.60-0.84 for Tier 2 (replicated), 0.40-0.59 for Tier 3 (emerging).

STATUS RULES:
- "favorable" = protective or advantageous variant
- "attention" = warrants proactive optimization (use for most risk variants)
- "neutral" = no significant impact either way
- "alert" = clinically significant — Factor V Leiden, HFE homozygous, etc.

ANALYSIS RULES:
1. Interpret each SNP using the genotype and context provided
2. Consider ancestry-specific risk modifiers
3. Consider gene-gene interactions (MTHFR+PEMT, COMT+DRD2, TCF7L2+SLC30A8)
4. Supplement recommendations must include specific forms and doses
5. Flag genotypes warranting clinical follow-up
6. Every recommendation must link to specific RSIDs
7. Be thorough — analyze ALL provided SNPs, do not skip any
8. Consider the user's health concerns, current medications, and family history when provided
9. Flag potential drug-gene interactions if medications are listed
7. Use accessible language — explain scientific terms on first use

CRITICAL: Return ONLY valid JSON. No markdown fences. No trailing commas. Ensure all arrays and objects are properly closed.`;

function buildPrompt(snps, profile) {
  const list = snps.map(s =>
    `${s.rsid}|${s.gene}|${s.genotype}|T${s.tier}|${s.name}|${s.ctx}`
  ).join("\n");
  return `Analyze ALL ${snps.length} SNPs below for a comprehensive DioGen protocol.

USER: ${profile.name}, Age ${profile.age}, ${profile.sex}, ${profile.ancestry}
Exercise: ${profile.exercise || "Not specified"} | Diet: ${profile.diet || "Not specified"} | Sleep: ${profile.sleep || "Not specified"}
${profile.concerns ? "Health concerns: " + profile.concerns : ""}
${profile.medications ? "Current medications/supplements: " + profile.medications : ""}
${profile.familyHx ? "Family history: " + profile.familyHx : ""}

SNPs (${snps.length} — analyze every one):
${list}

Return this exact JSON (no trailing commas, all arrays properly closed):
{"executive_summary":"4-5 sentences: key findings, top risks, biggest opportunities, most impactful actions","snps":[{"rsid":"rsXXXX","gene":"GENE","genotype":"XX","category":"cat","effect":"5-8 word title","status":"favorable|attention|neutral|alert","confidence":0.0,"summary":"2-3 sentences in accessible language","action":"specific recommendation with dosing if relevant"}],"supplements":[{"name":"Name (specific bioavailable form)","dose":"dose with timing","reason":"why citing specific RSIDs","priority":"ESSENTIAL|IMPORTANT|SUPPORTIVE"}],"nutrition_rules":[{"title":"Rule","text":"specific actionable guidance"}],"training_notes":[{"title":"Note","text":"specific actionable guidance"}],"lifestyle_notes":[{"title":"Note","text":"specific actionable guidance"}],"biomarker_monitoring":[{"test":"Test Name","frequency":"how often","reason":"why based on genetics"}]}`;
}

// ═══════════════════════════════════════════
// HTML REPORT GENERATOR (new-tab safe)
// ═══════════════════════════════════════════
function genReport(a, p) {
  const snps = a.snps || [];
  const supps = a.supplements || [];
  const cats = {};
  for (const s of snps) {
    if (!cats[s.category]) cats[s.category] = [];
    cats[s.category].push(s);
  }
  const catKeys = Object.keys(cats);
  const snpCount = snps.length;
  const suppCount = supps.length;
  const catCount = catKeys.length;

  const statusBadge = (s) => {
    const m = { favorable:["#ECFDF5","#10B981","FAVORABLE"], attention:["#FFFBEB","#F59E0B","OPTIMIZE"], neutral:["#F1F5F9","#94A3B8","NEUTRAL"], alert:["#FEF2F2","#EF4444","ALERT"] };
    const [bg, c, t] = m[s] || m.neutral;
    return `<span style="background:${bg};color:${c};font-size:9px;font-weight:700;padding:2px 10px;border-radius:20px">${t}</span>`;
  };
  const priBadge = (pr) => {
    const m = { ESSENTIAL:["#FEF2F2","#EF4444"], IMPORTANT:["#FFFBEB","#F59E0B"], SUPPORTIVE:["#ECFDF5","#10B981"] };
    const [bg, c] = m[pr] || m.SUPPORTIVE;
    return `<span style="background:${bg};color:${c};font-size:8px;font-weight:700;padding:2px 10px;border-radius:20px">${pr}</span>`;
  };
  const confBar = (v, c) =>
    `<div style="display:flex;align-items:center;gap:8px;margin:4px 0 8px"><span style="font-size:9px;color:#94A3B8;min-width:55px">Evidence</span><div style="flex:1;height:5px;background:#E2E8F0;border-radius:3px;overflow:hidden;max-width:120px"><div style="width:${Math.round(v * 100)}%;height:100%;background:${c};border-radius:3px"></div></div><span style="font-size:9px;font-weight:700;color:${c}">${Math.round(v * 100)}%</span></div>`;

  let snpHTML = "";
  let n = 1;
  for (const [ck, items] of Object.entries(cats)) {
    const m = CATS[ck] || { label: ck, color: "#64748B", light: "#F8FAFC", icon: "📊" };
    snpHTML += `<div style="page-break-before:always"></div>
    <div style="margin-bottom:12px">
      <span style="font-size:10px;font-weight:700;color:${m.color};letter-spacing:0.08em">${String(n++).padStart(2, "0")}</span>
      <h2 style="font-size:22px;font-weight:700;margin:4px 0;color:#1B2559">${m.icon || ""} ${esc(m.label)}</h2>
      <div style="width:80px;height:3px;background:${m.color};border-radius:2px;margin-bottom:18px"></div>
    </div>`;
    for (const s of items) {
      snpHTML += `<div style="background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:18px 22px;margin-bottom:10px;box-shadow:0 1px 3px rgba(0,0,0,0.03);break-inside:avoid">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div><span style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;color:${m.color}">${esc(s.rsid)}</span><span style="font-size:11px;color:#94A3B8;margin-left:6px">${esc(s.gene)}</span></div>
          <div style="display:flex;gap:6px;align-items:center"><span style="background:${m.light};color:${m.color};font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px">${esc(s.genotype)}</span>${statusBadge(s.status)}</div>
        </div>
        <div style="font-weight:600;font-size:13px;color:#1B2559;margin-bottom:4px">${esc(s.effect)}</div>
        ${confBar(s.confidence || 0, m.color)}
        <p style="font-size:11px;color:#475569;line-height:1.65;margin:0 0 10px">${esc(s.summary)}</p>
        <div style="background:${m.light};border-radius:10px;padding:10px 14px">
          <div style="font-size:8px;font-weight:700;color:${m.color};letter-spacing:0.06em;margin-bottom:4px">RECOMMENDED ACTION</div>
          <div style="font-size:11px;color:#1B2559;font-weight:500;line-height:1.5">${esc(s.action)}</div>
        </div>
      </div>`;
    }
  }

  const sectionBlock = (items, label, accentColor, fieldTitle, fieldText) => {
    if (!items || items.length === 0) return "";
    return `<div style="page-break-before:always"></div>
    <div style="margin-bottom:12px"><span style="font-size:10px;font-weight:700;color:${accentColor};letter-spacing:0.08em">PROTOCOL</span>
    <h2 style="font-size:22px;font-weight:700;margin:4px 0;color:#1B2559">${esc(label)}</h2>
    <div style="width:80px;height:3px;background:${accentColor};border-radius:2px;margin-bottom:16px"></div></div>
    ${items.map(r => `<div class="no-break" style="background:#fff;border:1px solid #E2E8F0;border-left:4px solid ${accentColor};border-radius:12px;padding:14px 18px;margin-bottom:8px">
      <div style="font-weight:700;font-size:12px;color:${accentColor};margin-bottom:4px">${esc(r[fieldTitle])}</div>
      <div style="font-size:11px;color:#475569;line-height:1.6">${esc(r[fieldText])}</div>
    </div>`).join("")}`;
  };

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>DioGen Protocol — ${esc(p.name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
  @page{size:letter;margin:0.6in}
  @media print{body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.no-break{break-inside:avoid}}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#F8FAFC;color:#0F172A;font-size:11px;line-height:1.5}
  h1,h2,h3{font-family:'Outfit',sans-serif}
  .container{max-width:680px;margin:0 auto;padding:20px 0}
</style></head><body><div class="container">
  <div style="text-align:center;padding:80px 0 60px">
    <div style="height:3px;background:linear-gradient(90deg,#4F5ED5,#0EA5A0);border-radius:2px;margin-bottom:40px"></div>
    <h1 style="font-size:52px;font-weight:800;color:#1B2559">DioGen</h1>
    <p style="font-size:10px;font-weight:700;color:#4F5ED5;letter-spacing:0.25em;margin:4px 0 30px">GENOMIC INTELLIGENCE PROTOCOL</p>
    <div style="display:inline-block;background:#fff;border:1px solid #E2E8F0;border-radius:20px;padding:28px 48px;box-shadow:0 4px 20px rgba(27,37,89,0.06)">
      <p style="font-size:9px;font-weight:700;color:#94A3B8;letter-spacing:0.1em">PREPARED FOR</p>
      <h2 style="font-size:30px;font-weight:700;margin:6px 0;color:#1B2559">${esc(p.name)}</h2>
      <p style="font-size:11px;font-weight:600;color:#0EA5A0">${esc(p.age)} · ${esc(p.sex)} · ${esc(p.ancestry)}</p>
      <div style="display:flex;gap:28px;justify-content:center;margin-top:18px">
        <div><span style="font-family:'Outfit';font-size:22px;font-weight:800;color:#1B2559">${snpCount}</span><br/><span style="font-size:8px;color:#94A3B8">SNPs Analyzed</span></div>
        <div><span style="font-family:'Outfit';font-size:22px;font-weight:800;color:#1B2559">${catCount}</span><br/><span style="font-size:8px;color:#94A3B8">Categories</span></div>
        <div><span style="font-family:'Outfit';font-size:22px;font-weight:800;color:#1B2559">${suppCount}</span><br/><span style="font-size:8px;color:#94A3B8">Supplements</span></div>
      </div>
    </div>
    <p style="font-size:8px;color:#94A3B8;margin-top:40px">Educational purposes only. Not medical advice. Consult your physician.</p>
  </div>

  <div style="page-break-before:always"></div>
  <div style="margin-bottom:24px"><span style="font-size:10px;font-weight:700;color:#4F5ED5;letter-spacing:0.08em">OVERVIEW</span>
  <h2 style="font-size:22px;font-weight:700;margin:4px 0 12px;color:#1B2559">Executive Summary</h2>
  <div style="background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:20px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.03)">
    <p style="font-size:12px;color:#475569;line-height:1.7">${esc(a.executive_summary || "")}</p>
  </div></div>

  ${snpHTML}

  <div style="page-break-before:always"></div>
  <div style="margin-bottom:12px"><span style="font-size:10px;font-weight:700;color:#F9A8D4;letter-spacing:0.08em">PROTOCOL</span>
  <h2 style="font-size:22px;font-weight:700;margin:4px 0;color:#1B2559">Supplementation Stack</h2>
  <div style="width:80px;height:3px;background:linear-gradient(90deg,#F9A8D4,#EC4899);border-radius:2px;margin-bottom:16px"></div></div>
  ${supps.map(s => `<div class="no-break" style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:14px 18px;margin-bottom:8px;box-shadow:0 1px 3px rgba(0,0,0,0.03)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span style="font-weight:700;font-size:12px">${esc(s.name)}</span>${priBadge(s.priority)}</div>
    <div style="font-size:11px;font-weight:600;color:#4F5ED5;margin-bottom:3px">${esc(s.dose)}</div>
    <div style="font-size:10px;color:#94A3B8">${esc(s.reason)}</div>
  </div>`).join("")}

  ${sectionBlock(a.nutrition_rules, "Nutrition", "#0EA5A0", "title", "text")}
  ${sectionBlock(a.training_notes, "Training", "#3B82F6", "title", "text")}
  ${sectionBlock(a.lifestyle_notes, "Lifestyle", "#10B981", "title", "text")}

  ${(a.biomarker_monitoring || []).length ? `<div style="page-break-before:always"></div>
  <div style="margin-bottom:12px"><span style="font-size:10px;font-weight:700;color:#F59E0B;letter-spacing:0.08em">MONITORING</span>
  <h2 style="font-size:22px;font-weight:700;margin:4px 0;color:#1B2559">Biomarker Tracking</h2>
  <div style="width:80px;height:3px;background:#F59E0B;border-radius:2px;margin-bottom:16px"></div></div>
  ${(a.biomarker_monitoring || []).map(b => `<div class="no-break" style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:14px 18px;margin-bottom:8px;display:flex;gap:16px;align-items:center">
    <div style="flex:1"><div style="font-weight:700;font-size:12px">${esc(b.test)}</div><div style="font-size:10px;color:#94A3B8;margin-top:2px">${esc(b.reason)}</div></div>
    <div style="background:#FFFBEB;color:#F59E0B;font-size:9px;font-weight:700;padding:4px 12px;border-radius:20px;white-space:nowrap">${esc(b.frequency)}</div>
  </div>`).join("")}` : ""}

  <div style="page-break-before:always"></div>
  <div style="text-align:center;padding:40px 20px">
    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:28px;margin-bottom:40px">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:12px;color:#1B2559">Disclaimer</h3>
      <p style="font-size:10px;color:#475569;line-height:1.7">This DioGen Genomic Intelligence Protocol is for educational purposes only and does not constitute medical advice. SNP analysis is based on published genome-wide association studies. Genetic predisposition does not determine outcomes. Always discuss supplement protocols and lifestyle changes with your physician. Consumer DNA tests (23andMe, AncestryDNA) are not clinical-grade diagnostic tools.</p>
    </div>
    <h1 style="font-size:36px;font-weight:800;color:#1B2559">DioGen</h1>
    <p style="font-size:10px;font-weight:600;color:#0EA5A0">Your genome. Your protocol. Your edge.</p>
    <p style="font-size:8px;color:#94A3B8;margin-top:12px">© 2026 DioGen Genomic Intelligence</p>
  </div>
</div></body></html>`;
}


// ═══════════════════════════════════════════
// SHARED STYLES — Premium Health-Tech Aesthetic
// ═══════════════════════════════════════════
const glass = {
  background: "rgba(255,255,255,0.94)",
  backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
  border: "1px solid rgba(226,232,240,0.6)",
  borderRadius: 24, padding: "32px 30px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 8px 40px rgba(27,37,89,0.035)",
  overflow: "hidden",
};
const pBtn = {
  width: "100%", padding: "16px", borderRadius: 16, border: "none",
  background: `linear-gradient(135deg, ${T.cobalt500}, ${T.cobalt700})`,
  color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
  fontFamily: "inherit", transition: "all 0.15s",
  boxShadow: "0 2px 12px rgba(79,94,213,0.25)",
};
const sBtn = {
  width: "100%", padding: "15px", borderRadius: 16,
  border: `1.5px solid ${T.s200}`, background: T.white,
  color: T.s700, fontSize: 14, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
};
const backBtn = {
  background: "none", border: "none", color: T.s400,
  fontSize: 13, fontWeight: 600, cursor: "pointer",
  padding: "0 0 16px", fontFamily: "inherit",
  display: "flex", alignItems: "center", gap: 4,
};
const PROG_STAGES = [
  { label: "Preparing", desc: "Building analysis prompt from your SNP data", icon: "📋" },
  { label: "Transmitting", desc: "Sending matched SNPs to AI engine", icon: "📡" },
  { label: "Analyzing", desc: "AI interpreting your genetic variants", icon: "🧬" },
  { label: "Parsing", desc: "Extracting structured protocol data", icon: "⚙️" },
  { label: "Building", desc: "Generating personalized report", icon: "📄" },
  { label: "Complete", desc: "Your protocol is ready", icon: "✅" },
];

// ═══════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════
function Card({ children, style: s = {} }) {
  return <div style={{ ...glass, ...s }}>{children}</div>;
}
function Orb({ t, l, sz, c, o }) {
  return <div style={{ position: "fixed", top: t, left: l, width: sz, height: sz, borderRadius: "50%", background: c, opacity: o, filter: "blur(110px)", pointerEvents: "none", zIndex: 0 }} />;
}
function OptCard({ label, icon, sub, selected, onClick, color = T.cobalt500 }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "15px 18px", borderRadius: 16, width: "100%",
      border: `2px solid ${selected ? color : T.s200}`,
      background: selected ? `${color}08` : T.white,
      cursor: "pointer", textAlign: "left", fontFamily: "inherit",
      transition: "all 0.2s ease",
    }}>
      <span style={{ fontSize: 26, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: selected ? color : T.s900 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: T.s400, margin: "2px 0 0", lineHeight: 1.4 }}>{sub}</p>}
      </div>
      <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${selected ? color : T.s300}`,
        background: selected ? color : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}>
        {selected && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
      </div>
    </button>
  );
}
function Insight({ icon, title, text, accent = T.cobalt500 }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "16px 18px", background: `${accent}06`, borderRadius: 16, border: `1px solid ${accent}18` }}>
      <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: accent, margin: "0 0 3px" }}>{title}</p>
        <p style={{ fontSize: 12, color: T.s600, margin: 0, lineHeight: 1.55 }}>{text}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN APP — Quiz Flow Architecture
// ═══════════════════════════════════════════
export default function DioGen() {
  const [step, setStep] = useState("upload");
  const [raw, setRaw] = useState(null);
  const [src, setSrc] = useState("");
  const [total, setTotal] = useState(0);
  const [goals, setGoals] = useState([]);
  const [matched, setMatched] = useState([]);
  const [prof, setProf] = useState({
    name: "", age: "", sex: "", ancestry: "", customAnc: "",
    exercise: "", diet: "", sleep: "",
    concerns: "", medications: "", familyHx: "",
  });
  const [analysis, setAnalysis] = useState(null);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const [anim, setAnim] = useState(false);
  const [progStage, setProgStage] = useState(0);
  const [debugLog, setDebugLog] = useState([]);
  const [emailSent, setEmailSent] = useState(false);
  const [emailAddr, setEmailAddr] = useState("");
  const [fileErr, setFileErr] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    try {
      const envKey = ANTHROPIC_API_KEY || "";
      // Always prefer env key when available; fall back to localStorage
      if (envKey) { localStorage.setItem("diogen_api_key", envKey); return envKey; }
      return localStorage.getItem("diogen_api_key") || "";
    } catch { return ANTHROPIC_API_KEY || ""; }
  });

  const fRef = useRef(null);
  const logRef = useRef(null);
  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const timedOutRef = useRef(false);
  const retryRef = useRef(0);

  const si = STEPS.indexOf(step);
  const progress = Math.min(((si) / QUIZ_TOTAL) * 100, 100);

  const addLog = (msg, type = "info") => {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 });
    setDebugLog(p => [...p, { ts, msg, type }]);
  };

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [debugLog]);

  // Transition animation
  useEffect(() => {
    setAnim(false);
    const t = setTimeout(() => setAnim(true), 50);
    return () => clearTimeout(t);
  }, [step]);

  // Elapsed timer
  useEffect(() => {
    if (step === "processing") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
      return () => clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [step]);

  // Timed diagnostic warnings
  useEffect(() => {
    if (step !== "processing") return;
    if (elapsed === 15) addLog("AI is analyzing your genome — 82 SNPs typically takes 60-120s...", "system");
    if (elapsed === 45) addLog("45s — analysis in progress. Large SNP sets require thorough processing.", "system");
    if (elapsed === 90) addLog("90s — still processing. Comprehensive reports can take up to 2-3 minutes.", "system");
    if (elapsed === 150) addLog("150s — taking longer than usual. Will timeout at 300s.", "system");
    if (elapsed === 240) addLog("240s — response delayed. Will timeout at 300s.", "error");
  }, [elapsed, step]);

  const fmtTime = s => { const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}m ${sec}s` : `${sec}s`; };

  // ── File Handler ──
  const handleFile = useCallback(f => {
    setFileErr("");
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["txt", "csv", "tsv"].includes(ext)) { setFileErr("Please upload a .txt file from 23andMe or AncestryDNA."); return; }
    if (f.size > 50 * 1024 * 1024) { setFileErr("File too large (max 50MB). DNA files are typically under 30MB."); return; }
    const r = new FileReader();
    r.onload = e => {
      const { source, data } = detectAndParse(e.target.result);
      const count = Object.keys(data).length;
      if (count < 10) { setFileErr("This doesn’t appear to contain valid DNA data. Expected 23andMe or AncestryDNA format."); return; }
      setSrc(source); setRaw(data); setTotal(count); setStep("name");
    };
    r.onerror = () => setFileErr("Failed to read file. Please try again.");
    r.readAsText(f);
  }, []);

  const loadDemo = useCallback(async () => {
    setFileErr("");
    try {
      const res = await fetch("/sample_dna_data.txt");
      if (!res.ok) throw new Error("Failed to load demo file");
      const text = await res.text();
      const { source, data } = detectAndParse(text);
      const count = Object.keys(data).length;
      if (count < 10) { setFileErr("Demo data failed to parse."); return; }
      setSrc(source + " (Demo)"); setRaw(data); setTotal(count); setStep("name");
    } catch (e) {
      setFileErr("Could not load demo data: " + e.message);
    }
  }, []);

  const toggle = k => setGoals(p => p.includes(k) ? p.filter(g => g !== k) : [...p, k]);

  const goReview = () => {
    const g = goals.length > 0 ? goals : Object.keys(CATS);
    const m = matchSNPs(raw, g);
    if (m.length === 0) { setFileErr("No matching SNPs found. Try broadening your goals."); return; }
    if (goals.length === 0) setGoals(Object.keys(CATS));
    setMatched(m);
    setStep("review");
  };

  const nav = t => setStep(t);

  // ── Analysis Engine ──
  const run = async () => {
    if (!apiKey) { setErr("API key required. Go back and enter your Anthropic API key on the upload screen."); setStep("results"); return; }
    setStep("processing"); setErr(""); setDebugLog([]); setProgStage(0); setEmailSent(false);
    const ac = new AbortController(); abortRef.current = ac;
    timedOutRef.current = false;

    const finalAnc = prof.ancestry === "Other" ? prof.customAnc : prof.ancestry;
    const finalProf = { ...prof, ancestry: finalAnc };

    addLog("DioGen Analysis Engine v3 initialized", "system");
    addLog(`Profile: ${finalProf.name}, ${finalProf.age}y, ${finalProf.sex}, ${finalAnc}`);
    addLog(`Lifestyle — Exercise: ${finalProf.exercise || "—"} | Diet: ${finalProf.diet || "—"} | Sleep: ${finalProf.sleep || "—"}`);
    if (finalProf.concerns) addLog(`Health concerns: ${finalProf.concerns}`);
    if (finalProf.medications) addLog(`Medications: ${finalProf.medications}`);
    if (finalProf.familyHx) addLog(`Family history: ${finalProf.familyHx}`);

    setProgStage(0);
    const catSet = new Set(matched.map(s => s.cat));
    addLog(`Matched ${matched.length} of ${Object.keys(SNP_BANK).length} curated SNPs across ${catSet.size} categories`);
    addLog(`Categories: ${[...catSet].map(c => CATS[c]?.label || c).join(", ")}`);
    const prompt = buildPrompt(matched, finalProf);
    addLog(`Prompt: ${prompt.length.toLocaleString()} chars (~${Math.round(prompt.length / 4).toLocaleString()} tokens)`);
    await new Promise(r => setTimeout(r, 300));

    setProgStage(1);
    addLog("Initiating HTTPS connection to api.anthropic.com...", "system");
    addLog("Model: claude-sonnet-4-6 | max_tokens: 16,000");
    addLog(`Privacy: Only ${matched.length} matched rsIDs transmitted (${(matched.length / total * 100).toFixed(3)}% of ${total.toLocaleString()} total)`);
    addLog("POST /v1/messages dispatched. Waiting for response...", "system");
    addLog("Full analysis typically takes 60-120s for comprehensive reports.");

    try {
      const startT = Date.now();
      const timeout = setTimeout(() => { timedOutRef.current = true; ac.abort(); }, 300000);
      addLog("Fetch initiated — timeout set to 300s", "system");

      // Advance to "Analyzing" stage after a brief delay — the AI is now working
      setTimeout(() => setProgStage(2), 2000);

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        signal: ac.signal,
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 16000,
          system: SYS_PROMPT,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      clearTimeout(timeout);
      if (ac.signal.aborted) return;
      const elapsed_s = ((Date.now() - startT) / 1000).toFixed(1);

      if (!res.ok) {
        const b = await res.text().catch(() => "");
        addLog(`HTTP ${res.status} error after ${elapsed_s}s`, "error");
        if (res.status === 401) addLog("AUTH FAILED — API key missing or invalid.", "error");
        else if (res.status === 429) addLog("RATE LIMITED — too many requests. Wait 30-60s.", "error");
        else if (res.status === 529 || res.status === 503) addLog("API OVERLOADED — high traffic. Retry in 30s.", "error");
        else if (res.status >= 500) addLog("SERVER ERROR — Anthropic API issues. Try again shortly.", "error");
        else addLog(`Response: ${b.slice(0, 300)}`, "error");
        throw new Error(`API returned HTTP ${res.status}`);
      }
      addLog(`Response received in ${elapsed_s}s (HTTP ${res.status})`, "success");

      setProgStage(3);
      addLog("Decoding response body...");
      const data = await res.json();
      const text = (data.content || []).map(b => b.text || "").join("");
      addLog(`Response: ${text.length.toLocaleString()} chars raw`);
      if (data.usage) {
        addLog(`Tokens — input: ${data.usage.input_tokens?.toLocaleString()}, output: ${data.usage.output_tokens?.toLocaleString()}`, "success");
        const pct = data.usage.output_tokens ? Math.round((data.usage.output_tokens / 16000) * 100) : 0;
        addLog(`Token budget: ${pct}% of 16K used${pct > 90 ? " ⚠ near limit" : ""}`);
      }

      setProgStage(4);
      addLog("Running robustJSONParse() — 5-layer recovery...");
      const parsed = robustJSONParse(text);
      const ps = parsed.snps || []; const su = parsed.supplements || [];
      addLog(`Extracted: ${ps.length} SNP analyses, ${su.length} supplements`, "success");
      addLog(`Categories: ${[...new Set(ps.map(s => s.category))].join(", ")}`);
      const statusCounts = {};
      ps.forEach(s => { statusCounts[s.status] = (statusCounts[s.status] || 0) + 1; });
      addLog(`Status: ${Object.entries(statusCounts).map(([k, v]) => `${k}=${v}`).join(", ")}`);
      if (ps.length < matched.length * 0.5) addLog(`AI returned ${ps.length} of ${matched.length} sent — some may be skipped`, "system");

      setProgStage(4);
      addLog("Assembling protocol document...");
      await new Promise(r => setTimeout(r, 350));
      addLog("Report rendered", "success");

      setProgStage(5);
      addLog(`Complete — ${ps.length} SNPs · ${su.length} supplements · ${new Set(ps.map(s => s.category)).size} categories`, "success");
      await new Promise(r => setTimeout(r, 200));
      setAnalysis(parsed); setStep("results");
    } catch (e) {
      if (e.name === "AbortError") {
        if (timedOutRef.current) {
          addLog("Request timed out — server did not respond within 300s.", "error");
          addLog("Tap 'Retry Analysis' to try again.", "system");
          setErr("timeout");
          setStep("results");
        } else {
          addLog("Analysis cancelled by user.", "system");
          setStep("review");
        }
        return;
      }
      addLog(`FATAL: ${e.message}`, "error");
      addLog("Check network connection and try again", "system");
      setErr(e.message); setStep("results");
    }
  };

  const cancel = () => { if (abortRef.current) abortRef.current.abort(); setStep("review"); };

  const openReport = () => {
    if (!analysis) return;
    try {
      const h = genReport(analysis, prof);
      const w = window.open("", "_blank");
      if (!w) { alert("Please allow popups to view your report."); return; }
      w.document.write(h); w.document.close();
    } catch (e) { console.error(e); }
  };
  const printReport = () => {
    if (!analysis) return;
    try {
      const h = genReport(analysis, prof);
      const w = window.open("", "_blank");
      if (!w) { alert("Please allow popups."); return; }
      w.document.write(h); w.document.close();
      setTimeout(() => { try { w.print(); } catch(_) {} }, 800);
    } catch (e) { console.error(e); }
  };

  const reset = () => {
    setStep("upload"); setRaw(null); setMatched([]); setAnalysis(null);
    setErr(""); setGoals([]); setDebugLog([]); setProgStage(0);
    setEmailSent(false); setEmailAddr(""); setFileErr(""); setElapsed(0);
    retryRef.current = 0;
    setProf({ name:"", age:"", sex:"", ancestry:"", customAnc:"", exercise:"", diet:"", sleep:"", concerns:"", medications:"", familyHx:"" });
  };

  const handleEmailSubmit = () => {
    if (!emailAddr.includes("@")) return;
    setEmailSent(true);
    addLog(`Email registered: ${emailAddr}`, "success");
  };

  const curMatch = raw ? matchSNPs(raw, goals.length > 0 ? goals : Object.keys(CATS)) : [];


  // ═══════════════════════════════════════════
  // RENDER — Quiz Flow
  // ═══════════════════════════════════════════
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(175deg, #F8FAFF 0%, #EDF0FA 40%, #F8FAFC 100%)`,
      fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif",
      color: T.s900, position: "relative", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <Orb t="-10%" l="65%" sz={520} c={T.cobalt300} o={0.035} />
      <Orb t="35%" l="-12%" sz={420} c={T.violet} o={0.025} />
      <Orb t="55%" l="60%" sz={360} c={T.teal} o={0.02} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 580, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: si >= 10 ? 20 : 24 }}>
          <h1 style={{
            fontFamily: "'Outfit'", fontSize: 38, fontWeight: 800,
            letterSpacing: "-0.04em", margin: 0,
            background: `linear-gradient(135deg, ${T.cobalt900}, ${T.cobalt500})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>DioGen</h1>
          <p style={{ fontSize: 9, fontWeight: 700, color: T.teal, letterSpacing: "0.32em", margin: "3px 0 0" }}>
            GENOMIC INTELLIGENCE
          </p>
        </div>

        {/* PROGRESS BAR — quiz funnel style */}
        {si >= 0 && si < 10 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.s500 }}>
                Step {Math.min(si + 1, QUIZ_TOTAL)} of {QUIZ_TOTAL}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.cobalt500 }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div style={{ height: 5, background: T.s200, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                background: `linear-gradient(90deg, ${T.cobalt500}, ${T.teal})`,
                width: `${Math.max(progress, 2)}%`,
                transition: "width 0.5s cubic-bezier(0.22,1,0.36,1)",
              }} />
            </div>
          </div>
        )}

        {/* ANIMATED CONTAINER */}
        <div style={{
          opacity: anim ? 1 : 0,
          transform: anim ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.45s cubic-bezier(0.22,1,0.36,1)",
        }}>

        {/* ══════════ 1. UPLOAD ══════════ */}
        {step === "upload" && (<>
          <Card>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 56, marginBottom: 10 }}>🧬</div>
              <h2 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, margin: "0 0 10px", color: T.cobalt900 }}>
                Your DNA, Decoded
              </h2>
              <p style={{ fontSize: 14, color: T.s600, lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
                Upload your raw data from <strong>23andMe</strong> or <strong>AncestryDNA</strong> and receive a personalized genomic protocol in minutes.
              </p>
            </div>

            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fRef.current?.click()}
              style={{
                border: `2px dashed ${drag ? T.cobalt500 : T.s300}`,
                borderRadius: 18, padding: "52px 24px", textAlign: "center",
                cursor: "pointer", transition: "all 0.2s",
                background: drag ? `${T.cobalt500}06` : T.white,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
              <p style={{ fontFamily: "'Outfit'", fontSize: 16, fontWeight: 700, margin: "0 0 4px", color: T.cobalt900 }}>
                Drop your DNA file here
              </p>
              <p style={{ fontSize: 12, color: T.s400, margin: 0 }}>or click to browse · .txt format</p>
              <input ref={fRef} type="file" accept=".txt,.csv,.tsv" style={{ display: "none" }}
                onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
            </div>
            {fileErr && (
              <div style={{ marginTop: 14, padding: "12px 16px", background: T.red50, borderRadius: 12, fontSize: 12, color: T.red, fontWeight: 500 }}>
                ⚠️ {fileErr}
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 10 }}>
                <div style={{ height: 1, flex: 1, background: T.s200 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: T.s400, textTransform: "uppercase", letterSpacing: 1 }}>or</span>
                <div style={{ height: 1, flex: 1, background: T.s200 }} />
              </div>
              <button
                onClick={loadDemo}
                style={{
                  width: "100%", padding: "14px 20px", borderRadius: 14,
                  border: `1.5px solid ${T.teal}`,
                  background: `${T.teal}08`, color: T.tealDark,
                  fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
                  cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${T.teal}18`; e.currentTarget.style.borderColor = T.tealDark; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${T.teal}08`; e.currentTarget.style.borderColor = T.teal; }}
              >
                <span style={{ fontSize: 18 }}>🧪</span>
                Try with Sample DNA Data
              </button>
              <p style={{ fontSize: 10, color: T.s400, margin: "8px 0 0", lineHeight: 1.4 }}>
                Hypothetical dataset with 580+ SNPs — no real person's data
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <div style={{ flex: 1, padding: 12, background: T.s50, borderRadius: 12, border: `1px solid ${T.s200}` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: T.cobalt500, margin: "0 0 2px" }}>23andMe</p>
                <p style={{ fontSize: 10, color: T.s400, margin: 0, lineHeight: 1.4 }}>Settings → Download Raw Data</p>
              </div>
              <div style={{ flex: 1, padding: 12, background: T.s50, borderRadius: 12, border: `1px solid ${T.s200}` }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: T.teal, margin: "0 0 2px" }}>AncestryDNA</p>
                <p style={{ fontSize: 10, color: T.s400, margin: 0, lineHeight: 1.4 }}>Settings → Download DNA Data</p>
              </div>
            </div>
          </Card>

          {/* API Key */}
          <Card style={{ marginTop: 12, padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>🔑</span>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.cobalt900, margin: 0 }}>Anthropic API Key</p>
            </div>
            <p style={{ fontSize: 11, color: T.s500, margin: "0 0 10px", lineHeight: 1.5 }}>
              Required to run analysis. Get one at{" "}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                style={{ color: T.cobalt500, fontWeight: 600, textDecoration: "none" }}>console.anthropic.com</a>.
              Stored only in your browser.
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={e => {
                const v = e.target.value;
                setApiKey(v);
                try { localStorage.setItem("diogen_api_key", v); } catch {}
              }}
              placeholder="sk-ant-api03-..."
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 12,
                border: `1.5px solid ${apiKey ? T.green : T.s300}`,
                fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                background: apiKey ? `${T.green}08` : T.white,
                transition: "all 0.2s",
              }}
            />
            {apiKey && (
              <p style={{ fontSize: 10, color: T.green, fontWeight: 600, margin: "6px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                ✓ Key saved in browser
              </p>
            )}
          </Card>

          {/* Social proof */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 16, padding: "0 10px" }}>
            <span style={{ fontSize: 11, color: T.s400 }}>🔒 Privacy-first</span>
            <span style={{ fontSize: 11, color: T.s400 }}>🧬 95 SNPs analyzed</span>
            <span style={{ fontSize: 11, color: T.s400 }}>⚡ AI-powered</span>
          </div>

          {/* Privacy expandable */}
          <Card style={{ marginTop: 12, padding: "16px 22px", cursor: "pointer" }} >
            <div onClick={() => setShowPrivacy(!showPrivacy)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.cobalt900, margin: 0 }}>How we protect your data</p>
              </div>
              <span style={{ fontSize: 12, color: T.s400, transition: "transform 0.2s", transform: showPrivacy ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
            </div>
            {showPrivacy && (
              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <Insight icon="💻" title="Client-Side Parsing" text="Your DNA file is parsed entirely in your browser. The raw file (600K+ SNPs) never leaves your device." accent={T.cobalt500} />
                <Insight icon="📦" title="Minimal Transmission" text="Only ~40-80 matched rsIDs are sent for analysis — that's 0.01% of your genetic data." accent={T.teal} />
                <Insight icon="🚫" title="Zero Storage" text="We don't store your DNA, results, or personal info. Close the page and everything is gone." accent={T.violet} />
                <Insight icon="🔍" title="What Gets Sent" text="rsID (e.g. rs1801133), genotype (e.g. CT), gene name, and category context. No raw sequences." accent={T.green} />
              </div>
            )}
          </Card>
        </>)}

        {/* ══════════ 2. NAME ══════════ */}
        {step === "name" && (
          <Card>
            <button onClick={() => nav("upload")} style={backBtn}>‹ Back</button>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: T.cobalt900 }}>
              What's your name?
            </h2>
            <p style={{ fontSize: 13, color: T.s500, margin: "0 0 28px", lineHeight: 1.5 }}>
              Your protocol will be personalized to you.
            </p>
            <input
              value={prof.name}
              onChange={e => setProf(p => ({ ...p, name: e.target.value }))}
              placeholder="Full name"
              autoFocus
              style={{
                width: "100%", padding: "18px 20px", fontSize: 18, fontWeight: 600,
                border: `2px solid ${T.s200}`, borderRadius: 16,
                fontFamily: "inherit", color: T.s900, outline: "none",
                background: T.white, boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = T.cobalt500}
              onBlur={e => e.target.style.borderColor = T.s200}
            />
            <button
              onClick={() => prof.name.trim() && nav("about")}
              disabled={!prof.name.trim()}
              style={{ ...pBtn, marginTop: 24, opacity: prof.name.trim() ? 1 : 0.4, cursor: prof.name.trim() ? "pointer" : "not-allowed" }}
            >Continue</button>
          </Card>
        )}

        {/* ══════════ 3. ABOUT (Age + Sex) ══════════ */}
        {step === "about" && (
          <Card>
            <button onClick={() => nav("name")} style={backBtn}>‹ Back</button>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: T.cobalt900 }}>
              Tell us about yourself
            </h2>
            <p style={{ fontSize: 13, color: T.s500, margin: "0 0 28px" }}>
              Age and biological sex affect how your genes express.
            </p>

            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.s600, display: "block", marginBottom: 6 }}>Age</label>
              <input
                value={prof.age}
                onChange={e => setProf(p => ({ ...p, age: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                placeholder="e.g. 32"
                type="text" inputMode="numeric"
                style={{
                  width: "100%", padding: "14px 18px", borderRadius: 14,
                  border: `1.5px solid ${T.s200}`, fontSize: 16,
                  fontFamily: "inherit", background: T.s50, color: T.s900,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <label style={{ fontSize: 12, fontWeight: 600, color: T.s600, display: "block", marginBottom: 8 }}>Biological Sex</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
              {SEX_OPTS.map(o => (
                <button key={o.val} onClick={() => setProf(p => ({ ...p, sex: o.val }))} style={{
                  flex: 1, padding: "18px", borderRadius: 16,
                  border: `2px solid ${prof.sex === o.val ? T.cobalt500 : T.s200}`,
                  background: prof.sex === o.val ? `${T.cobalt500}06` : T.white,
                  cursor: "pointer", fontSize: 15, fontWeight: 700,
                  color: prof.sex === o.val ? T.cobalt500 : T.s600,
                  fontFamily: "inherit", transition: "all 0.15s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 20 }}>{o.icon}</span> {o.val}
                </button>
              ))}
            </div>

            <button
              onClick={() => prof.age && prof.sex && nav("ancestry")}
              disabled={!prof.age || !prof.sex}
              style={{ ...pBtn, marginTop: 22, opacity: prof.age && prof.sex ? 1 : 0.4 }}
            >Continue</button>
          </Card>
        )}

        {/* ══════════ 4. ANCESTRY ══════════ */}
        {step === "ancestry" && (
          <Card>
            <button onClick={() => nav("about")} style={backBtn}>‹ Back</button>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: T.cobalt900 }}>
              Your ancestry
            </h2>
            <p style={{ fontSize: 13, color: T.s500, margin: "0 0 22px", lineHeight: 1.5 }}>
              Genetic risk varies by population. This calibrates your analysis.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              {ANC_OPTS.map(a => (
                <button key={a.val} onClick={() => setProf(p => ({ ...p, ancestry: a.val }))} style={{
                  padding: "14px 8px", borderRadius: 14,
                  border: `2px solid ${prof.ancestry === a.val ? T.cobalt500 : T.s200}`,
                  background: prof.ancestry === a.val ? `${T.cobalt500}06` : T.white,
                  cursor: "pointer", textAlign: "center", fontFamily: "inherit", transition: "all 0.15s",
                  boxSizing: "border-box",
                }}>
                  <GeoIcon path={a.path} color={prof.ancestry === a.val ? T.cobalt500 : T.s500} size={34} />
                  <span style={{ fontSize: 11, fontWeight: prof.ancestry === a.val ? 700 : 500, color: prof.ancestry === a.val ? T.cobalt500 : T.s600, marginTop: 6, display: "block" }}>{a.val}</span>
                </button>
              ))}
            </div>
            {prof.ancestry === "Other" && (
              <input
                value={prof.customAnc} onChange={e => setProf(p => ({ ...p, customAnc: e.target.value }))}
                placeholder="Describe your ancestry"
                style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${T.s200}`, fontSize: 13, fontFamily: "inherit", background: T.s50, marginBottom: 8, boxSizing: "border-box" }}
              />
            )}
            <button
              onClick={() => prof.ancestry && nav("goals")}
              disabled={!prof.ancestry}
              style={{ ...pBtn, marginTop: 14, opacity: prof.ancestry ? 1 : 0.4 }}
            >Continue</button>
          </Card>
        )}

        {/* ══════════ 5. GOALS ══════════ */}
        {step === "goals" && (
          <Card>
            <button onClick={() => nav("ancestry")} style={backBtn}>‹ Back</button>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: T.cobalt900 }}>
              What do you want to optimize?
            </h2>
            <p style={{ fontSize: 13, color: T.s500, margin: "0 0 8px" }}>Select categories or leave empty for a full analysis.</p>

            <div style={{ padding: "10px 16px", background: T.cobalt50, borderRadius: 12, margin: "8px 0 18px", fontSize: 12, fontWeight: 600, color: T.cobalt700, display: "flex", justifyContent: "space-between" }}>
              <span>{curMatch.length} SNPs matched</span>
              <span>{src} · {total.toLocaleString()} variants</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16, overflow: "hidden" }}>
              {Object.entries(CATS).map(([k, c]) => {
                const sel = goals.includes(k);
                const cnt = Object.entries(SNP_BANK).filter(([id, info]) => info.cat === k && raw?.[id]).length;
                return (
                  <button key={k} onClick={() => toggle(k)} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "12px", borderRadius: 14,
                    border: `2px solid ${sel ? c.color : T.s200}`,
                    background: sel ? `${c.color}08` : T.white,
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    transition: "all 0.15s", boxSizing: "border-box",
                    minWidth: 0, overflow: "hidden",
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{c.icon}</span>
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                      <p style={{ fontSize: 11, fontWeight: 700, margin: 0, color: sel ? c.color : T.s900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</p>
                      <p style={{ fontSize: 8, color: T.s400, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.desc}</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sel ? c.color : T.s300 }}>{cnt || "—"}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button onClick={() => setGoals(Object.keys(CATS))} style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${T.s200}`, background: T.s50, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: T.cobalt500 }}>Select All</button>
              <button onClick={() => setGoals([])} style={{ flex: 1, padding: 10, borderRadius: 10, border: `1px solid ${T.s200}`, background: T.s50, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: T.s500 }}>Clear</button>
            </div>
            <button onClick={() => nav("exercise")} style={pBtn}>Continue</button>
          </Card>
        )}

        {/* ══════════ 6. EXERCISE ══════════ */}
        {step === "exercise" && (
          <Card>
            <button onClick={() => nav("goals")} style={backBtn}>‹ Back</button>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: T.cobalt900 }}>
              How active are you?
            </h2>
            <p style={{ fontSize: 13, color: T.s500, margin: "0 0 22px" }}>
              Exercise modifies how many of your gene variants express.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EX_OPTS.map(o => (
                <OptCard key={o.val} label={o.val} icon={o.icon} sub={o.sub}
                  selected={prof.exercise === o.val}
                  onClick={() => setProf(p => ({ ...p, exercise: o.val }))} />
              ))}
            </div>
            <button onClick={() => nav("diet")} style={{ ...pBtn, marginTop: 22 }}>
              {prof.exercise ? "Continue" : "Skip"}
            </button>
          </Card>
        )}

        {/* ══════════ 7. DIET ══════════ */}
        {step === "diet" && (
          <Card>
            <button onClick={() => nav("exercise")} style={backBtn}>‹ Back</button>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: T.cobalt900 }}>
              How do you eat?
            </h2>
            <p style={{ fontSize: 13, color: T.s500, margin: "0 0 22px" }}>
              Your diet interacts directly with metabolic and nutrient gene variants.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {DIET_OPTS.map(o => (
                <button key={o.val} onClick={() => setProf(p => ({ ...p, diet: o.val }))} style={{
                  padding: "14px 12px", borderRadius: 14, textAlign: "left", fontFamily: "inherit",
                  border: `2px solid ${prof.diet === o.val ? T.cobalt500 : T.s200}`,
                  background: prof.diet === o.val ? `${T.cobalt500}06` : T.white,
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <span style={{ fontSize: 20 }}>{o.icon}</span>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: "6px 0 0", color: prof.diet === o.val ? T.cobalt500 : T.s900 }}>{o.val}</p>
                  <p style={{ fontSize: 10, color: T.s400, margin: "2px 0 0", lineHeight: 1.3 }}>{o.sub}</p>
                </button>
              ))}
            </div>
            <button onClick={() => nav("sleep")} style={{ ...pBtn, marginTop: 22 }}>
              {prof.diet ? "Continue" : "Skip"}
            </button>
          </Card>
        )}

        {/* ══════════ 8. SLEEP ══════════ */}
        {step === "sleep" && (
          <Card>
            <button onClick={() => nav("diet")} style={backBtn}>‹ Back</button>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: T.cobalt900 }}>
              How's your sleep?
            </h2>
            <p style={{ fontSize: 13, color: T.s500, margin: "0 0 22px" }}>
              Sleep quality modulates CLOCK, BDNF, and stress-axis gene expression.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SLEEP_OPTS.map(o => (
                <OptCard key={o.val} label={o.val} icon={o.icon} sub={o.sub}
                  selected={prof.sleep === o.val}
                  onClick={() => setProf(p => ({ ...p, sleep: o.val }))} />
              ))}
            </div>
            <button onClick={() => nav("health")} style={{ ...pBtn, marginTop: 22 }}>
              {prof.sleep ? "Continue" : "Skip"}
            </button>
          </Card>
        )}

        {/* ══════════ 9. HEALTH CONTEXT ══════════ */}
        {step === "health" && (
          <Card>
            <button onClick={() => nav("sleep")} style={backBtn}>‹ Back</button>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: T.cobalt900 }}>
              Anything else we should know?
            </h2>
            <p style={{ fontSize: 13, color: T.s500, margin: "0 0 24px", lineHeight: 1.5 }}>
              The more context, the more actionable your protocol. All fields optional.
            </p>
            {[
              { key: "concerns", label: "Health concerns or symptoms", ph: "e.g. Low energy, brain fog, digestive issues, anxiety..." },
              { key: "medications", label: "Current medications or supplements", ph: "e.g. Vitamin D 2000IU, magnesium, metformin..." },
              { key: "familyHx", label: "Family health history", ph: "e.g. Father: T2 diabetes, Mother: thyroid issues..." },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.s600, display: "block", marginBottom: 5 }}>{f.label}</label>
                <textarea
                  value={prof[f.key] || ""}
                  onChange={e => setProf(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.ph}
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12,
                    border: `1.5px solid ${T.s200}`, fontSize: 13,
                    fontFamily: "inherit", background: T.s50, minHeight: 55,
                    resize: "vertical", boxSizing: "border-box", color: T.s900,
                  }}
                />
              </div>
            ))}
            <button onClick={goReview} style={pBtn}>Review & Generate Protocol</button>
          </Card>
        )}

        {/* ══════════ 10. REVIEW ══════════ */}
        {step === "review" && (
          <Card>
            <button onClick={() => nav("health")} style={backBtn}>‹ Back</button>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: T.cobalt900 }}>
              Ready to generate your protocol
            </h2>
            <p style={{ fontSize: 13, color: T.s500, margin: "0 0 20px" }}>
              Review your details before we start the AI analysis.
            </p>

            <div style={{ background: T.s50, borderRadius: 16, padding: "18px 20px", marginBottom: 16 }}>
              {[
                ["Name", prof.name],
                ["Age", prof.age],
                ["Sex", prof.sex],
                ["Ancestry", prof.ancestry === "Other" ? prof.customAnc : prof.ancestry],
                ["Exercise", prof.exercise || "—"],
                ["Diet", prof.diet || "—"],
                ["Sleep", prof.sleep || "—"],
              ].map(([k, v], i, arr) => (
                <div key={k} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: i < arr.length - 1 ? `1px solid ${T.s200}` : "none",
                }}>
                  <span style={{ fontSize: 12, color: T.s500, fontWeight: 500 }}>{k}</span>
                  <span style={{ fontSize: 12, color: T.s900, fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: "14px 18px", background: T.cobalt50, borderRadius: 14, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.cobalt700 }}>{matched.length} SNPs ready</span>
                <span style={{ fontSize: 11, color: T.s400 }}>{new Set(matched.map(s => s.cat)).size} categories</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {matched.slice(0, 20).map(s => {
                  const cc = CATS[s.cat]?.color || T.s400;
                  return <span key={s.rsid} style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 8, background: `${cc}10`, color: cc }}>{s.rsid}</span>;
                })}
                {matched.length > 20 && <span style={{ fontSize: 9, color: T.s400, padding: "2px 4px" }}>+{matched.length - 20}</span>}
              </div>
            </div>

            <button onClick={run} style={pBtn}>Generate Protocol →</button>
            <p style={{ fontSize: 10, color: T.s400, textAlign: "center", margin: "10px 0 0" }}>
              Analysis takes 30-60 seconds · Powered by Claude AI
            </p>
          </Card>
        )}

        {/* ══════════ 11. PROCESSING ══════════ */}
        {step === "processing" && (<>
          <Card>
            <h2 style={{ fontFamily: "'Outfit'", fontSize: 24, fontWeight: 700, margin: "0 0 6px", color: T.cobalt900, textAlign: "center" }}>
              Analyzing Your Genome
            </h2>
            <p style={{ fontSize: 12, color: T.s400, textAlign: "center", margin: "0 0 22px" }}>
              {fmtTime(elapsed)} elapsed · {matched.length} SNPs · Claude Sonnet 4.5
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 }}>
              {PROG_STAGES.map((stg, i) => {
                const done = i < progStage; const active = i === progStage;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0", opacity: i > progStage ? 0.25 : 1, transition: "opacity 0.4s" }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, flexShrink: 0,
                      background: done ? T.teal : active ? T.cobalt500 : T.s200,
                      color: done || active ? "#fff" : T.s400,
                      transition: "all 0.35s",
                      boxShadow: active ? `0 0 0 4px ${T.cobalt500}20` : "none",
                    }}>
                      {done ? "✓" : stg.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: active ? 700 : done ? 600 : 400, margin: 0, color: active ? T.cobalt900 : done ? T.teal : T.s400 }}>{stg.label}</p>
                      <p style={{ fontSize: 10, color: T.s400, margin: "1px 0 0" }}>{stg.desc}</p>
                    </div>
                    {active && <span className="dg-spin" style={{ fontSize: 14 }}>⏳</span>}
                    {done && <span style={{ fontSize: 10, color: T.teal, fontWeight: 600 }}>✓</span>}
                  </div>
                );
              })}
            </div>

            <div style={{ height: 6, background: T.s200, borderRadius: 4, overflow: "hidden", marginBottom: 16 }}>
              <div style={{
                height: "100%", borderRadius: 4,
                background: `linear-gradient(90deg, ${T.cobalt500}, ${T.teal})`,
                width: `${Math.min(((progStage + 0.5) / PROG_STAGES.length) * 100, 100)}%`,
                transition: "width 0.6s ease",
              }} />
            </div>
            <button onClick={cancel} style={{ ...sBtn, fontSize: 12, padding: 11 }}>Cancel Analysis</button>
          </Card>

          {/* Email CTA */}
          <Card style={{ marginTop: 12 }}>
            {emailSent ? (
              <div style={{ textAlign: "center", padding: "6px 0" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: T.teal, margin: "0 0 4px" }}>📨 We'll email your results</p>
                <p style={{ fontSize: 11, color: T.s500, margin: 0 }}>Protocol will be sent to <strong>{emailAddr}</strong>. Safe to close.</p>
              </div>
            ) : (<>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>📧</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.cobalt900, margin: 0 }}>Need to leave?</p>
                  <p style={{ fontSize: 11, color: T.s500, margin: 0 }}>Get results emailed when ready</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="email" value={emailAddr} onChange={e => setEmailAddr(e.target.value)} placeholder="you@email.com"
                  style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${T.s200}`, fontSize: 13, fontFamily: "inherit", background: T.s50, boxSizing: "border-box" }} />
                <button onClick={handleEmailSubmit} disabled={!emailAddr.includes("@")}
                  style={{ padding: "11px 20px", borderRadius: 12, border: "none", background: emailAddr.includes("@") ? T.cobalt500 : T.s200, color: emailAddr.includes("@") ? "#fff" : T.s400, fontSize: 12, fontWeight: 700, cursor: emailAddr.includes("@") ? "pointer" : "not-allowed", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                  Send ↗
                </button>
              </div>
            </>)}
          </Card>

          {/* Debug Console */}
          <Card style={{ marginTop: 12, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green }} className="dg-pulse" />
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, fontWeight: 700, color: T.s500, letterSpacing: "0.05em" }}>LIVE DIAGNOSTICS</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: T.cobalt500, fontWeight: 700 }}>{fmtTime(elapsed)}</span>
                <span style={{ fontSize: 9, color: T.s400 }}>{debugLog.length} events</span>
              </div>
            </div>
            <div ref={logRef} style={{
              background: "#080E1F", borderRadius: 10, padding: "12px 14px",
              maxHeight: 240, overflowY: "auto",
              fontFamily: "'JetBrains Mono', monospace", fontSize: 10, lineHeight: 1.9,
            }}>
              {debugLog.length === 0 && <span style={{ color: "#334155" }}>Initializing...</span>}
              {debugLog.map((l, i) => (
                <div key={i} style={{ color: l.type === "error" ? "#F87171" : l.type === "success" ? "#34D399" : l.type === "system" ? "#A5B4FC" : "#94A3B8" }}>
                  <span style={{ color: "#334155" }}>[{l.ts}]</span>{" "}
                  {l.type === "error" && <span style={{ color: "#F87171", fontWeight: 700 }}>ERR </span>}
                  {l.type === "success" && <span style={{ color: "#34D399", fontWeight: 700 }}>OK  </span>}
                  {l.type === "system" && <span style={{ color: "#A5B4FC", fontWeight: 700 }}>SYS </span>}
                  {l.msg}
                </div>
              ))}
              <div style={{ color: "#334155" }}><span className="dg-blink">▊</span></div>
            </div>
          </Card>
        </>)}

        {/* ══════════ 12. RESULTS ══════════ */}
        {step === "results" && (<>
          {err ? (
            <Card>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>{err === "timeout" ? "⏰" : "⚠️"}</div>
                <h3 style={{ fontFamily: "'Outfit'", fontSize: 22, fontWeight: 700, margin: "0 0 8px", color: T.cobalt900 }}>
                  {err === "timeout" ? "Analysis Timed Out" : "Analysis Error"}
                </h3>
              </div>
              {err === "timeout" ? (
                <div style={{ padding: "16px 20px", background: T.amber50, borderRadius: 14, marginBottom: 14, border: `1px solid ${T.amber}20` }}>
                  <p style={{ fontSize: 13, color: T.s700, margin: "0 0 6px", lineHeight: 1.6 }}>
                    The AI server didn't respond within the 300-second timeout. This usually means:
                  </p>
                  <p style={{ fontSize: 12, color: T.s600, margin: 0, lineHeight: 1.7 }}>
                    • High traffic on Anthropic’s API servers<br/>
                    • Slow or unstable network connection<br/>
                    • Very large analysis ({matched.length} SNPs)
                  </p>
                </div>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: T.red, margin: "0 0 12px", lineHeight: 1.5 }}>{err}</p>
                  <p style={{ fontSize: 12, color: T.s600, margin: "0 0 12px", lineHeight: 1.6 }}>
                    {err.includes("401") ? "Authentication error — the API proxy may be temporarily unavailable."
                    : err.includes("429") ? "Rate limited. Wait 30-60 seconds and retry."
                    : err.includes("5") ? "Anthropic API experiencing issues. Try again shortly."
                    : "Request couldn’t complete. Check network and retry."}
                  </p>
                </>
              )}
              <details style={{ marginTop: 8 }}>
                <summary style={{ fontSize: 12, fontWeight: 600, color: T.cobalt500, cursor: "pointer" }}>View prompt ({matched.length} SNPs)</summary>
                <pre style={{ marginTop: 10, padding: 16, background: "#080E1F", borderRadius: 12, fontSize: 10, color: "#A5B4FC", whiteSpace: "pre-wrap", maxHeight: 280, overflowY: "auto", fontFamily: "'JetBrains Mono'" }}>
                  {buildPrompt(matched, prof)}
                </pre>
              </details>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={() => { retryRef.current = 0; run(); }} style={{ ...pBtn, flex: 1 }}>Retry Analysis</button>
                <button onClick={reset} style={{ ...sBtn, flex: 1 }}>Start Over</button>
              </div>
            </Card>
          ) : analysis ? (<>
            <Card>
              <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 18 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: T.green50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✅</div>
                <div>
                  <h2 style={{ fontFamily: "'Outfit'", fontSize: 24, fontWeight: 800, margin: 0, color: T.cobalt900 }}>Your Protocol is Ready</h2>
                  <p style={{ fontSize: 12, color: T.s600, margin: "2px 0 0" }}>
                    {(analysis.snps || []).length} SNPs · {(analysis.supplements || []).length} supplements · {new Set((analysis.snps || []).map(s => s.category)).size} categories
                  </p>
                </div>
              </div>

              {analysis.executive_summary && (
                <div style={{ padding: "16px 20px", background: T.cobalt50, borderRadius: 14, marginBottom: 16, borderLeft: `4px solid ${T.cobalt500}` }}>
                  <p style={{ fontSize: 13, color: T.cobalt700, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                    {analysis.executive_summary}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={openReport} style={{ ...pBtn, flex: 1 }}>↗ View Full Report</button>
                <button onClick={printReport} style={{ ...sBtn, flex: 1 }}>🖨 Print to PDF</button>
              </div>
              <p style={{ fontSize: 10, color: T.s400, textAlign: "center", margin: "8px 0 0" }}>Opens in a new tab</p>
            </Card>

            {/* SNP Preview */}
            <Card style={{ marginTop: 12 }}>
              <h3 style={{ fontFamily: "'Outfit'", fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: T.cobalt900 }}>
                SNP Analysis ({(analysis.snps || []).length})
              </h3>
              {(analysis.snps || []).slice(0, 8).map(s => {
                const cc = CATS[s.category]?.color || T.s400;
                const cl = CATS[s.category]?.light || T.s50;
                const sm = { favorable: [T.green50, T.green], attention: [T.amber50, T.amber], neutral: [T.s100, T.s500], alert: [T.red50, T.red] };
                const [sb, sc] = sm[s.status] || sm.neutral;
                return (
                  <div key={s.rsid} style={{ padding: "14px 16px", margin: "0 0 8px", background: T.white, borderRadius: 12, border: `1px solid ${T.s200}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 12, fontWeight: 700, color: cc }}>{s.rsid}</span>
                        <span style={{ fontSize: 11, color: T.s400 }}>{s.gene}</span>
                        <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, fontWeight: 700, background: cl, color: cc, padding: "2px 8px", borderRadius: 10 }}>{s.genotype}</span>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: sb, color: sc }}>
                        {(s.status || "neutral").toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, margin: "0 0 3px", color: T.cobalt900 }}>{s.effect}</p>
                    <p style={{ fontSize: 11, color: T.s600, margin: 0, lineHeight: 1.55 }}>{s.summary}</p>
                  </div>
                );
              })}
              {(analysis.snps || []).length > 8 && (
                <p style={{ fontSize: 11, color: T.s400, textAlign: "center", margin: "10px 0 0" }}>
                  +{(analysis.snps || []).length - 8} more in full report
                </p>
              )}
            </Card>

            {/* Supplements */}
            {(analysis.supplements || []).length > 0 && (
              <Card style={{ marginTop: 12 }}>
                <h3 style={{ fontFamily: "'Outfit'", fontSize: 16, fontWeight: 700, margin: "0 0 14px", color: T.cobalt900 }}>
                  Supplement Stack
                </h3>
                {(analysis.supplements || []).map((s, i) => {
                  const pm = { ESSENTIAL: [T.red50, T.red], IMPORTANT: [T.amber50, T.amber], SUPPORTIVE: [T.green50, T.green] };
                  const [pb, pc] = pm[s.priority] || pm.SUPPORTIVE;
                  return (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 0",
                      borderBottom: i < (analysis.supplements || []).length - 1 ? `1px solid ${T.s100}` : "none",
                    }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{s.name}</p>
                        <p style={{ fontSize: 11, color: T.cobalt500, margin: "2px 0 0" }}>{s.dose}</p>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, background: pb, color: pc, padding: "3px 12px", borderRadius: 10, whiteSpace: "nowrap" }}>{s.priority}</span>
                    </div>
                  );
                })}
              </Card>
            )}

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={() => nav("review")} style={{ ...sBtn, flex: 1 }}>← Edit & Rerun</button>
              <button onClick={reset} style={{ ...sBtn, flex: 1 }}>New Analysis</button>
            </div>
          </>) : null}
        </>)}

        </div>{/* end animated container */}
      </div>{/* end main container */}

      <style>{`
        @keyframes dgspin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes dgpulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
        @keyframes dgblink { 0%, 100% { opacity: 1 } 50% { opacity: 0 } }
        .dg-spin { animation: dgspin 2.5s linear infinite; display: inline-block }
        .dg-pulse { animation: dgpulse 1.5s ease-in-out infinite }
        .dg-blink { animation: dgblink 1s step-end infinite; color: ${T.cobalt500} }
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 5px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: ${T.s200}; border-radius: 4px }
        input:focus, select:focus, textarea:focus { border-color: ${T.cobalt500} !important; outline: none; box-shadow: 0 0 0 3px rgba(79,94,213,0.12) }
        input::placeholder, textarea::placeholder { color: ${T.s400} }
        button:hover { filter: brightness(0.97) }
        button:active { transform: scale(0.985) }
      `}</style>
    </div>
  );
}

