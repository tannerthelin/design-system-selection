import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Types ───────────────────────────────────────────────────────────────────
interface ThemeTokens {
  id: string;
  name: string;
  category: string;
  colors: {
    background: string;
    backgroundAlt: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
    border: string;
    surface: string;
    accentContrast: string;
  };
  typography: {
    fontFamily: string;
    fontFamilyDisplay: string;
    headingWeight: number;
    bodyWeight: number;
    headingLetterSpacing: string;
    buttonTextTransform: string;
    buttonLetterSpacing: string;
    buttonWeight: number;
  };
  spacing: {
    borderRadius: string;
    borderRadiusLg: string;
    borderRadiusFull: string;
    buttonRadius: string;
  };
  effects: {
    shadow: string;
    shadowLg: string;
  };
  meta: {
    isDark: boolean;
    atmosphere: string;
  };
}

// ─── Font Mapping ────────────────────────────────────────────────────────────
const fontMap: Record<string, string> = {
  // ─── Neutral neo-grotesque → Inter ─────────────────────────────────────────
  "sohne": '"Inter", system-ui, sans-serif',        // Stripe (Söhne is refined grotesque)
  "inter": '"Inter", system-ui, sans-serif',
  "notion": '"Inter", system-ui, sans-serif',        // Notion (modified Inter)
  "geist": '"Inter", system-ui, sans-serif',         // Vercel (Geist is Inter-adjacent)
  "suisse": '"Inter", system-ui, sans-serif',        // Swiss neo-grotesque
  "untitled": '"Inter", system-ui, sans-serif',
  "favorit": '"Inter", system-ui, sans-serif',
  "nb international": '"Inter", system-ui, sans-serif',
  "objektiv": '"Inter", system-ui, sans-serif',
  "graphik": '"Inter", system-ui, sans-serif',
  "neue haas": '"Inter", system-ui, sans-serif',     // Neue Haas Grotesk → Inter (same lineage as Helvetica)

  // ─── Circular-geometric / rounded → Outfit ─────────────────────────────────
  "circular": '"Outfit", system-ui, sans-serif',     // Spotify (CircularSp)
  "spotifymix": '"Outfit", system-ui, sans-serif',   // Spotify
  "cereal": '"Outfit", system-ui, sans-serif',       // Airbnb (Cereal VF — rounded geometric)
  "gt walsheim": '"Outfit", system-ui, sans-serif',  // Framer (rounded geometric, medium only)
  "roobert": '"Outfit", system-ui, sans-serif',      // Rounded geometric
  "general sans": '"Outfit", system-ui, sans-serif',
  "aeonik": '"Outfit", system-ui, sans-serif',       // Geometric with rounded terminals

  // ─── Clean futuristic geometric → Sora ─────────────────────────────────────
  "sf pro": '"Sora", system-ui, sans-serif',         // Apple (SF Pro — clean, premium)
  "universal sans": '"Sora", system-ui, sans-serif', // Tesla (Universal Sans — futuristic minimal)
  "mona sans": '"Sora", system-ui, sans-serif',      // GitHub (geometric, modern)
  "hubot sans": '"Sora", system-ui, sans-serif',     // GitHub companion

  // ─── Modern architectural → Urbanist ───────────────────────────────────────
  "ubermove": '"Urbanist", system-ui, sans-serif',   // Uber (bold, architectural)
  "ferrari": '"Urbanist", system-ui, sans-serif',    // Ferrari (sans-serif, NOT serif)
  "bmw type": '"Urbanist", system-ui, sans-serif',   // BMW (corporate precision)
  "neue montreal": '"Urbanist", system-ui, sans-serif', // Geometric grotesque

  // ─── Friendly rounded → Plus Jakarta Sans ──────────────────────────────────
  "plus jakarta": '"Plus Jakarta Sans", system-ui, sans-serif',
  "gilroy": '"Plus Jakarta Sans", system-ui, sans-serif',   // Rounded geometric
  "satoshi": '"Plus Jakarta Sans", system-ui, sans-serif',
  "manrope": '"Plus Jakarta Sans", system-ui, sans-serif',  // Rounded, friendly
  "wix madefor": '"Plus Jakarta Sans", system-ui, sans-serif',
  "alliance": '"Plus Jakarta Sans", system-ui, sans-serif',

  // ─── Friendly geometric → DM Sans (kept for remaining geometric brands) ────
  "dm sans": '"DM Sans", system-ui, sans-serif',
  "coinbase": '"DM Sans", system-ui, sans-serif',
  "anthropic sans": '"DM Sans", system-ui, sans-serif',

  // ─── Quirky geometric → Space Grotesk ──────────────────────────────────────
  "space grotesk": '"Space Grotesk", system-ui, sans-serif',
  "abc diatype": '"Space Grotesk", system-ui, sans-serif',
  "whyte": '"Space Grotesk", system-ui, sans-serif',
  "cal sans": '"Space Grotesk", system-ui, sans-serif',
  "cabinet grotesk": '"Space Grotesk", system-ui, sans-serif',
  "sharp grotesk": '"Space Grotesk", system-ui, sans-serif',
  "gt america": '"Space Grotesk", system-ui, sans-serif',

  // ─── Corporate structured → IBM Plex Sans ──────────────────────────────────
  "ibm plex sans": '"IBM Plex Sans", system-ui, sans-serif',
  "ibm plex mono": '"JetBrains Mono", monospace',
  "ibm plex serif": '"Playfair Display", serif',

  // ─── Serif / editorial ─────────────────────────────────────────────────────
  "playfair display": '"Playfair Display", serif',
  "anthropic serif": '"Playfair Display", serif',

  // ─── Monospace ─────────────────────────────────────────────────────────────
  "jetbrains mono": '"JetBrains Mono", monospace',
};

function mapFont(rawFont: string): string {
  const lower = rawFont.toLowerCase().trim().replace(/['"`,]/g, "");
  for (const [key, val] of Object.entries(fontMap)) {
    if (lower.includes(key)) return val;
  }
  if (/serif/i.test(rawFont)) return '"Playfair Display", serif';
  return '"Inter", system-ui, sans-serif';
}

function extractSection(text: string, sectionNum: number): string {
  const startRegex = new RegExp(`## ${sectionNum}\\.[^\\n]*\\n`);
  const startMatch = text.match(startRegex);
  if (!startMatch || startMatch.index === undefined) return "";
  const contentStart = startMatch.index + startMatch[0].length;
  const rest = text.slice(contentStart);
  const nextSection = rest.match(/\n## \d/);
  if (nextSection && nextSection.index !== undefined) {
    return rest.slice(0, nextSection.index);
  }
  return rest;
}

function darkenHex(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const r = Math.max(0, parseInt(c.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(c.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(c.substring(4, 6), 16) - amount);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function lightenHex(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const r = Math.min(255, parseInt(c.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(c.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(c.substring(4, 6), 16) + amount);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function contrastColor(hex: string): string {
  return isLightColor(hex) ? "#000000" : "#ffffff";
}

// Extract from "Quick Color Reference" in section 9 using line-by-line label matching
function extractQuickRef(section9: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = section9.split("\n");
  for (const line of lines) {
    // Match patterns like: - Label: Something (`#hex`) or - **Label**: Something (#hex)
    const m = line.match(/[-*]\s*\*{0,2}(.+?)\*{0,2}\s*[:]\s*.*?(#[0-9a-fA-F]{6})/);
    if (m) {
      result[m[1].trim().toLowerCase()] = m[2];
    }
  }
  return result;
}

function extractAtmosphere(section1: string, name: string): string {
  const firstSentence = section1.split(/\.\s/)[0]?.replace(/^[\s\n]*/, "").trim();
  if (firstSentence && firstSentence.length > 20 && firstSentence.length < 200) {
    return firstSentence.replace(/[#*`]/g, "").trim() + ".";
  }
  return `${name}'s distinctive design system.`;
}

// ─── Hardcoded overrides for themes where auto-extraction fails ──────────────
// Each override only needs to specify the fields that need correcting
type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };
const overrides: Record<string, DeepPartial<ThemeTokens>> = {
  airbnb: {
    colors: { background: "#ffffff", backgroundAlt: "#f7f7f7", text: "#222222", textSecondary: "#717171", accent: "#ff385c", accentHover: "#e31c5f", border: "#dddddd", surface: "#ffffff" },
    typography: { fontFamily: '"Outfit", system-ui, sans-serif', fontFamilyDisplay: '"Outfit", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "12px", borderRadiusLg: "16px", buttonRadius: "8px" },
    meta: { isDark: false, atmosphere: "Airbnb's warm, friendly design with rounded corners and the iconic Rausch pink accent." },
  },
  airtable: {
    colors: { background: "#ffffff", backgroundAlt: "#f2f4f8", text: "#1d1f25", textSecondary: "#666d80", accent: "#166ee1", accentHover: "#1259b8", border: "#d4d8e1", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "6px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  apple: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f5f7", text: "#1d1d1f", textSecondary: "#6e6e73", accent: "#0071e3", accentHover: "#0066cc", border: "#d2d2d7", surface: "#ffffff" },
    typography: { fontFamily: '"Sora", system-ui, sans-serif', fontFamilyDisplay: '"Sora", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "12px", borderRadiusLg: "18px" },
    meta: { isDark: false, atmosphere: "Apple's refined, minimalist design language emphasizing clarity, whitespace, and premium materials." },
  },
  bmw: {
    colors: { background: "#ffffff", backgroundAlt: "#f2f2f2", text: "#262626", textSecondary: "#757575", accent: "#1c69d4", accentHover: "#1554a8", border: "#cccccc", surface: "#ffffff" },
    typography: { fontFamily: '"Urbanist", system-ui, sans-serif', fontFamilyDisplay: '"Urbanist", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400, buttonTextTransform: "uppercase", buttonLetterSpacing: "1px", buttonWeight: 700 },
    spacing: { borderRadius: "0px", borderRadiusLg: "0px", buttonRadius: "0px" },
    meta: { isDark: false, atmosphere: "BMW's precise, architectural design with strong geometry and corporate blue identity." },
  },
  cal: {
    colors: { background: "#ffffff", backgroundAlt: "#f9fafb", text: "#111827", textSecondary: "#6b7280", accent: "#111827", accentHover: "#1f2937", border: "#e5e7eb", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', fontFamilyDisplay: '"Space Grotesk", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  claude: {
    colors: { background: "#f5f4ed", backgroundAlt: "#ebe9df", text: "#141413", textSecondary: "#5d5c58", accent: "#c96442", accentHover: "#b5583a", border: "#e8e6dc", surface: "#faf9f5" },
    typography: { fontFamily: '"DM Sans", system-ui, sans-serif', fontFamilyDisplay: '"Playfair Display", serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "12px", borderRadiusLg: "16px" },
    meta: { isDark: false, atmosphere: "Claude's warm, literary design with parchment tones and terracotta accents." },
  },
  clay: {
    colors: { background: "#faf9f7", backgroundAlt: "#f0eeeb", text: "#1a1a1a", textSecondary: "#6b6b6b", accent: "#078a52", accentHover: "#06703f", border: "#e0ddd8", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  clickhouse: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f5f5", text: "#1d1d1d", textSecondary: "#666666", accent: "#fadb4e", accentHover: "#e8c93e", border: "#e0e0e0", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false, atmosphere: "ClickHouse's bold technical design with distinctive yellow brand accent." },
  },
  cohere: {
    colors: { background: "#ffffff", backgroundAlt: "#f6f6f7", text: "#1a1a2e", textSecondary: "#6b6e82", accent: "#3962f7", accentHover: "#2d51d9", border: "#e5e5ea", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "16px" },
    meta: { isDark: false },
  },
  coinbase: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f8ff", text: "#0a0b0d", textSecondary: "#5b616e", accent: "#0052ff", accentHover: "#0041cc", border: "#d1d5db", surface: "#ffffff" },
    typography: { fontFamily: '"DM Sans", system-ui, sans-serif', headingWeight: 500, bodyWeight: 400 },
    spacing: { borderRadius: "4px", borderRadiusLg: "8px" },
    meta: { isDark: false, atmosphere: "Coinbase's clean, trustworthy fintech design with their iconic blue." },
  },
  composio: {
    colors: { background: "#ffffff", backgroundAlt: "#f7f7f8", text: "#18181b", textSecondary: "#71717a", accent: "#6366f1", accentHover: "#4f46e5", border: "#e4e4e7", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  cursor: {
    colors: { background: "#1a1a1a", backgroundAlt: "#242424", text: "#e4e4e4", textSecondary: "#999999", accent: "#c08532", accentHover: "#d49a3c", border: "#333333", surface: "#2a2a2a" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: true, atmosphere: "Cursor's sleek dark editor interface with warm amber-gold accents." },
  },
  elevenlabs: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f5f5", text: "#1a1a1a", textSecondary: "#666666", accent: "#000000", accentHover: "#333333", border: "#e5e5e5", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  expo: {
    colors: { background: "#ffffff", backgroundAlt: "#f6f6f9", text: "#27272a", textSecondary: "#71717a", accent: "#0066ff", accentHover: "#0052cc", border: "#e4e4e7", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "6px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  ferrari: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f5f5", text: "#181818", textSecondary: "#666666", accent: "#da291c", accentHover: "#b82318", border: "#d2d2d2", surface: "#ffffff" },
    typography: { fontFamily: '"Urbanist", system-ui, sans-serif', fontFamilyDisplay: '"Urbanist", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400, buttonTextTransform: "uppercase", buttonLetterSpacing: "1px", buttonWeight: 600 },
    spacing: { borderRadius: "0px", borderRadiusLg: "0px", buttonRadius: "2px" },
    meta: { isDark: false, atmosphere: "Ferrari's dramatic, luxury automotive design with the iconic Rosso Corsa red." },
  },
  figma: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f5f5", text: "#1e1e1e", textSecondary: "#6e6e6e", accent: "#a259ff", accentHover: "#8b3fe0", border: "#e5e5e5", surface: "#ffffff" },
    typography: { fontFamily: '"DM Sans", system-ui, sans-serif', fontFamilyDisplay: '"DM Sans", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false, atmosphere: "Figma's vibrant, playful design tool aesthetic with signature purple accent." },
  },
  framer: {
    colors: { background: "#000000", backgroundAlt: "#111111", text: "#ffffff", textSecondary: "#999999", accent: "#0099ff", accentHover: "#1aadff", border: "#222222", surface: "#111111" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', fontFamilyDisplay: '"Outfit", system-ui, sans-serif', headingWeight: 500, bodyWeight: 400, headingLetterSpacing: "-1.5px" },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: true, atmosphere: "Framer's sleek, modern dark design with electric blue accents and smooth animations." },
  },
  hashicorp: {
    colors: { background: "#ffffff", backgroundAlt: "#f7f8fa", text: "#1d2126", textSecondary: "#656a76", accent: "#7b42bc", accentHover: "#6a37a1", border: "#dce0e6", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "6px", borderRadiusLg: "8px" },
    meta: { isDark: false },
  },
  ibm: {
    colors: { background: "#ffffff", backgroundAlt: "#f4f4f4", text: "#161616", textSecondary: "#525252", accent: "#0f62fe", accentHover: "#0353e9", border: "#e0e0e0", surface: "#ffffff" },
    typography: { fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontFamilyDisplay: '"IBM Plex Sans", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "0px", borderRadiusLg: "0px", buttonRadius: "0px" },
    meta: { isDark: false, atmosphere: "IBM's iconic Carbon design system with strict geometric precision and blue accent." },
  },
  intercom: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f5f5", text: "#1a1a1a", textSecondary: "#737373", accent: "#0073b1", accentHover: "#005e91", border: "#e0e0e0", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  kraken: {
    colors: { background: "#0b0e11", backgroundAlt: "#1a1d23", text: "#f0f0f3", textSecondary: "#8c8e98", accent: "#7b61ff", accentHover: "#9580ff", border: "#2a2d35", surface: "#14171c" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: true, atmosphere: "Kraken's sophisticated dark trading interface with deep blacks and purple accents." },
  },
  lamborghini: {
    colors: { background: "#000000", backgroundAlt: "#111111", text: "#f5f5f5", textSecondary: "#999999", accent: "#ffc000", accentHover: "#e6ad00", border: "#333333", surface: "#1a1a1a" },
    typography: { fontFamily: '"Urbanist", system-ui, sans-serif', fontFamilyDisplay: '"Urbanist", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400, buttonTextTransform: "uppercase", buttonLetterSpacing: "1px", buttonWeight: 700 },
    spacing: { borderRadius: "0px", borderRadiusLg: "0px", buttonRadius: "0px" },
    meta: { isDark: true, atmosphere: "Lamborghini's fierce, angular dark design with signature gold accent." },
  },
  "linear.app": {
    colors: { background: "#08090a", backgroundAlt: "#0f1011", text: "#f7f8f8", textSecondary: "#8a8f98", accent: "#5e6ad2", accentHover: "#828fff", border: "#23252a", surface: "#191a1b" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 500, bodyWeight: 400, headingLetterSpacing: "-1.056px", buttonWeight: 500 },
    spacing: { borderRadius: "6px", borderRadiusLg: "12px" },
    meta: { isDark: true, atmosphere: "Linear's dark-mode-first design — near-black canvas where content emerges like starlight." },
  },
  lovable: {
    colors: { background: "#ffffff", backgroundAlt: "#faf5ff", text: "#1a1a2e", textSecondary: "#6b7280", accent: "#9b59b6", accentHover: "#8e44ad", border: "#e9d8fd", surface: "#ffffff" },
    typography: { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontFamilyDisplay: '"Plus Jakarta Sans", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "12px", borderRadiusLg: "16px", buttonRadius: "9999px" },
    meta: { isDark: false },
  },
  minimax: {
    colors: { background: "#ffffff", backgroundAlt: "#f8f9fa", text: "#18181b", textSecondary: "#71717a", accent: "#2563eb", accentHover: "#1d4ed8", border: "#e4e4e7", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  mintlify: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f5f5", text: "#1a1a1a", textSecondary: "#666666", accent: "#18e299", accentHover: "#15c584", border: "#e5e5e5", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false, atmosphere: "Mintlify's fresh, documentation-focused design with vibrant green accent." },
  },
  miro: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f5f5", text: "#1a1a1a", textSecondary: "#666666", accent: "#ffd02f", accentHover: "#f0c020", border: "#e0e0e0", surface: "#ffffff" },
    typography: { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontFamilyDisplay: '"Plus Jakarta Sans", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "16px" },
    meta: { isDark: false, atmosphere: "Miro's collaborative, whiteboard-inspired design with sunny yellow accent." },
  },
  "mistral.ai": {
    colors: { background: "#ffffff", backgroundAlt: "#f7f7f8", text: "#1a1a1a", textSecondary: "#666666", accent: "#ff7000", accentHover: "#e66300", border: "#e5e5e5", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false, atmosphere: "Mistral AI's bold European AI design with vibrant orange brand color." },
  },
  mongodb: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f6f7", text: "#1c2d38", textSecondary: "#5c6c75", accent: "#00684a", accentHover: "#004d38", border: "#e8edeb", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "6px", borderRadiusLg: "12px" },
    meta: { isDark: false, atmosphere: "MongoDB's professional developer design with forest green brand accent." },
  },
  notion: {
    colors: { background: "#ffffff", backgroundAlt: "#f6f5f4", text: "#37352f", textSecondary: "#787774", accent: "#0075de", accentHover: "#0060b6", border: "#e9e9e7", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400, headingLetterSpacing: "-1px" },
    spacing: { borderRadius: "4px", borderRadiusLg: "8px", buttonRadius: "4px" },
    meta: { isDark: false, atmosphere: "Notion's warm, paper-like workspace design with soft organic tones." },
  },
  nvidia: {
    colors: { background: "#ffffff", backgroundAlt: "#f2f2f2", text: "#1a1a1a", textSecondary: "#666666", accent: "#76b900", accentHover: "#5c9400", border: "#e0e0e0", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "4px", borderRadiusLg: "8px" },
    meta: { isDark: false, atmosphere: "NVIDIA's powerful tech design with iconic green brand color." },
  },
  ollama: {
    colors: { background: "#ffffff", backgroundAlt: "#f9fafb", text: "#111827", textSecondary: "#6b7280", accent: "#000000", accentHover: "#333333", border: "#e5e7eb", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  "opencode.ai": {
    colors: { background: "#0a0a0b", backgroundAlt: "#141415", text: "#e4e4e7", textSecondary: "#a1a1aa", accent: "#a78bfa", accentHover: "#c4b5fd", border: "#27272a", surface: "#18181b" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: true, atmosphere: "OpenCode's developer-focused dark interface with violet accent tones." },
  },
  pinterest: {
    colors: { background: "#ffffff", backgroundAlt: "#f0f0f0", text: "#333333", textSecondary: "#767676", accent: "#e60023", accentHover: "#cc001f", border: "#efefef", surface: "#ffffff" },
    typography: { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontFamilyDisplay: '"Plus Jakarta Sans", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "16px", borderRadiusLg: "24px", buttonRadius: "24px" },
    meta: { isDark: false, atmosphere: "Pinterest's warm, visual-first design with signature red and generous rounding." },
  },
  posthog: {
    colors: { background: "#eeefe9", backgroundAlt: "#e5e7df", text: "#151515", textSecondary: "#515151", accent: "#f54e00", accentHover: "#cc4100", border: "#d0d1c9", surface: "#fafaf6" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false, atmosphere: "PostHog's distinctive warm-neutral design with bold orange accent." },
  },
  raycast: {
    colors: { background: "#171717", backgroundAlt: "#232323", text: "#eeeeee", textSecondary: "#999999", accent: "#ff6363", accentHover: "#ff4949", border: "#333333", surface: "#232323" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400, headingLetterSpacing: "-0.5px" },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: true, atmosphere: "Raycast's sleek dark launcher interface with coral-red accents." },
  },
  renault: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f5f5", text: "#1a1a1a", textSecondary: "#666666", accent: "#efdf00", accentHover: "#d4c600", border: "#e0e0e0", surface: "#ffffff" },
    typography: { fontFamily: '"Urbanist", system-ui, sans-serif', fontFamilyDisplay: '"Urbanist", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400, buttonTextTransform: "uppercase", buttonLetterSpacing: "1px", buttonWeight: 700 },
    spacing: { borderRadius: "0px", borderRadiusLg: "0px", buttonRadius: "0px" },
    meta: { isDark: false, atmosphere: "Renault's modern automotive design with bold yellow brand identity." },
  },
  replicate: {
    colors: { background: "#ffffff", backgroundAlt: "#f7f7f7", text: "#1a1a1a", textSecondary: "#666666", accent: "#2563eb", accentHover: "#1d4ed8", border: "#e5e7eb", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  resend: {
    colors: { background: "#000000", backgroundAlt: "#111111", text: "#fafafa", textSecondary: "#a3a3a3", accent: "#ffffff", accentHover: "#e5e5e5", border: "#262626", surface: "#171717" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 500, bodyWeight: 400, headingLetterSpacing: "-1px" },
    spacing: { borderRadius: "6px", borderRadiusLg: "8px" },
    meta: { isDark: true, atmosphere: "Resend's ultra-minimal dark design with stark white-on-black contrast." },
  },
  revolut: {
    colors: { background: "#ffffff", backgroundAlt: "#f7f7f7", text: "#1c1c1e", textSecondary: "#8e8e93", accent: "#0066ff", accentHover: "#0052cc", border: "#e5e5ea", surface: "#ffffff" },
    typography: { fontFamily: '"Sora", system-ui, sans-serif', fontFamilyDisplay: '"Sora", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "12px", borderRadiusLg: "16px", buttonRadius: "12px" },
    meta: { isDark: false, atmosphere: "Revolut's sleek fintech design with clean lines and vibrant blue accent." },
  },
  runwayml: {
    colors: { background: "#000000", backgroundAlt: "#111111", text: "#ffffff", textSecondary: "#888888", accent: "#5c6ac4", accentHover: "#7b85d4", border: "#222222", surface: "#1a1a1a" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: true, atmosphere: "Runway's cinematic dark interface designed for creative AI workflows." },
  },
  sanity: {
    colors: { background: "#101112", backgroundAlt: "#1a1b1d", text: "#ffffff", textSecondary: "#8b8b8b", accent: "#f03e2f", accentHover: "#e83526", border: "#2a2b2d", surface: "#1a1b1d" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "4px", borderRadiusLg: "6px" },
    meta: { isDark: true, atmosphere: "Sanity's dark, content-focused design with bold red accent." },
  },
  sentry: {
    colors: { background: "#1c1028", backgroundAlt: "#231730", text: "#e7e1ec", textSecondary: "#9386a0", accent: "#6c5fc7", accentHover: "#8478d4", border: "#382c4a", surface: "#231730" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400, headingLetterSpacing: "-0.5px" },
    spacing: { borderRadius: "6px", borderRadiusLg: "8px" },
    meta: { isDark: true, atmosphere: "Sentry's deep purple-dark monitoring interface with focused violet accent." },
  },
  spacex: {
    colors: { background: "#ffffff", backgroundAlt: "#f5f5f5", text: "#1a1a1a", textSecondary: "#666666", accent: "#005288", accentHover: "#004070", border: "#e0e0e0", surface: "#ffffff" },
    typography: { fontFamily: '"Urbanist", system-ui, sans-serif', fontFamilyDisplay: '"Urbanist", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400, buttonTextTransform: "uppercase", buttonLetterSpacing: "1px", buttonWeight: 600 },
    spacing: { borderRadius: "0px", borderRadiusLg: "0px", buttonRadius: "0px" },
    meta: { isDark: false, atmosphere: "SpaceX's mission-driven, minimalist design with aerospace precision." },
  },
  spotify: {
    colors: { background: "#121212", backgroundAlt: "#181818", text: "#ffffff", textSecondary: "#b3b3b3", accent: "#1ed760", accentHover: "#1db954", border: "#282828", surface: "#181818" },
    typography: { fontFamily: '"Outfit", system-ui, sans-serif', fontFamilyDisplay: '"Outfit", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400, buttonTextTransform: "uppercase", buttonLetterSpacing: "1.4px", buttonWeight: 700 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px", buttonRadius: "9999px" },
    meta: { isDark: true, atmosphere: "Spotify's immersive dark listening environment with the iconic green accent." },
  },
  stripe: {
    colors: { background: "#ffffff", backgroundAlt: "#f6f9fc", text: "#061b31", textSecondary: "#64748d", accent: "#533afd", accentHover: "#4434d4", border: "#e5edf5", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 300, bodyWeight: 400, headingLetterSpacing: "-0.96px", buttonWeight: 400 },
    spacing: { borderRadius: "6px", borderRadiusLg: "8px", buttonRadius: "6px" },
    meta: { isDark: false, atmosphere: "Stripe's premium fintech design — technical yet luxurious with signature purple." },
  },
  supabase: {
    colors: { background: "#171717", backgroundAlt: "#1c1c1c", text: "#ededed", textSecondary: "#8f8f8f", accent: "#3ecf8e", accentHover: "#34b87a", border: "#2e2e2e", surface: "#1c1c1c" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 500, bodyWeight: 400, headingLetterSpacing: "-0.5px" },
    spacing: { borderRadius: "6px", borderRadiusLg: "8px" },
    meta: { isDark: true, atmosphere: "Supabase's developer-friendly dark interface with emerald green accent." },
  },
  superhuman: {
    colors: { background: "#ffffff", backgroundAlt: "#f7f5ff", text: "#1a1a2e", textSecondary: "#6b6a80", accent: "#6c47ff", accentHover: "#5a3bd6", border: "#e8e6f0", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false, atmosphere: "Superhuman's elegant email-focused design with refined purple accent." },
  },
  tesla: {
    colors: { background: "#ffffff", backgroundAlt: "#f4f4f4", text: "#171a20", textSecondary: "#5c5e62", accent: "#3e6ae1", accentHover: "#2d5ad1", border: "#d0d1d2", surface: "#ffffff" },
    typography: { fontFamily: '"Sora", system-ui, sans-serif', fontFamilyDisplay: '"Sora", system-ui, sans-serif', headingWeight: 500, bodyWeight: 400, headingLetterSpacing: "0px" },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false, atmosphere: "Tesla's clean, futuristic automotive design with electric blue accent." },
  },
  "together.ai": {
    colors: { background: "#ffffff", backgroundAlt: "#f7f7f8", text: "#1a1a1a", textSecondary: "#666666", accent: "#6366f1", accentHover: "#4f46e5", border: "#e5e5e5", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  uber: {
    colors: { background: "#ffffff", backgroundAlt: "#f6f6f6", text: "#000000", textSecondary: "#6b6b6b", accent: "#000000", accentHover: "#333333", border: "#e0e0e0", surface: "#ffffff" },
    typography: { fontFamily: '"Urbanist", system-ui, sans-serif', fontFamilyDisplay: '"Urbanist", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false, atmosphere: "Uber's bold, high-contrast black-and-white design language." },
  },
  vercel: {
    colors: { background: "#000000", backgroundAlt: "#111111", text: "#ededed", textSecondary: "#888888", accent: "#ffffff", accentHover: "#cccccc", border: "#333333", surface: "#111111" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400, headingLetterSpacing: "-2.4px" },
    spacing: { borderRadius: "6px", borderRadiusLg: "8px" },
    meta: { isDark: true, atmosphere: "Vercel's iconic dark-mode-first design — stark black canvas with white typography." },
  },
  voltagent: {
    colors: { background: "#050507", backgroundAlt: "#111114", text: "#f5f5f5", textSecondary: "#a0a0a8", accent: "#2fd6a1", accentHover: "#26b888", border: "#1e1e22", surface: "#111114" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: true, atmosphere: "VoltAgent's dark agent-focused interface with mint green accent." },
  },
  warp: {
    colors: { background: "#1e1e28", backgroundAlt: "#262633", text: "#e0def4", textSecondary: "#908caa", accent: "#ebbcba", accentHover: "#f5d6d4", border: "#393552", surface: "#26233a" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: true, atmosphere: "Warp's rose-tinted dark terminal design with warm, inviting palette." },
  },
  webflow: {
    colors: { background: "#ffffff", backgroundAlt: "#f6f6f8", text: "#1a1a1a", textSecondary: "#666666", accent: "#146ef5", accentHover: "#0e5ad5", border: "#e3e3e3", surface: "#ffffff" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false },
  },
  wise: {
    colors: { background: "#ffffff", backgroundAlt: "#f2f5f7", text: "#163300", textSecondary: "#4d6633", accent: "#9fe870", accentHover: "#8ad65c", border: "#dde3d5", surface: "#ffffff" },
    typography: { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontFamilyDisplay: '"Plus Jakarta Sans", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "16px" },
    meta: { isDark: false, atmosphere: "Wise's nature-inspired fintech design with bright green tones." },
  },
  "x.ai": {
    colors: { background: "#000000", backgroundAlt: "#0d0d0d", text: "#ffffff", textSecondary: "#888888", accent: "#1da1f2", accentHover: "#0d8de0", border: "#222222", surface: "#111111" },
    typography: { fontFamily: '"Inter", system-ui, sans-serif', headingWeight: 600, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "16px" },
    meta: { isDark: true, atmosphere: "xAI's stark, high-tech dark design with blue accent." },
  },
  zapier: {
    colors: { background: "#fff5eb", backgroundAlt: "#fff0e1", text: "#201515", textSecondary: "#6b5c52", accent: "#ff4f00", accentHover: "#e64700", border: "#ffe0c8", surface: "#ffffff" },
    typography: { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif', fontFamilyDisplay: '"Plus Jakarta Sans", system-ui, sans-serif', headingWeight: 700, bodyWeight: 400 },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px" },
    meta: { isDark: false, atmosphere: "Zapier's warm, energetic automation brand with bold orange accent." },
  },
};

// ─── Main Extraction ─────────────────────────────────────────────────────────

function extractTheme(id: string, content: string): ThemeTokens {
  const nameMap: Record<string, string> = {
    "linear.app": "Linear", "mistral.ai": "Mistral AI", "together.ai": "Together AI",
    "x.ai": "xAI", "opencode.ai": "OpenCode", claude: "Claude (Anthropic)",
    cal: "Cal.com", bmw: "BMW", ibm: "IBM", nvidia: "NVIDIA", spacex: "SpaceX",
    posthog: "PostHog", clickhouse: "ClickHouse", mongodb: "MongoDB",
    elevenlabs: "ElevenLabs", runwayml: "Runway", minimax: "MiniMax",
    airbnb: "Airbnb", webflow: "Webflow", superhuman: "Superhuman",
    mintlify: "Mintlify", voltagent: "VoltAgent", composio: "Composio",
    coinbase: "Coinbase", airtable: "Airtable",
  };

  const categoryMap: Record<string, string> = {
    stripe: "Fintech", coinbase: "Fintech", revolut: "Fintech", wise: "Fintech", kraken: "Fintech",
    "linear.app": "Developer Tools", vercel: "Developer Tools", supabase: "Developer Tools",
    cursor: "Developer Tools", raycast: "Developer Tools", warp: "Developer Tools",
    resend: "Developer Tools", sentry: "Developer Tools", expo: "Developer Tools",
    hashicorp: "Developer Tools", posthog: "Developer Tools", clickhouse: "Developer Tools",
    mongodb: "Developer Tools", "opencode.ai": "Developer Tools",
    claude: "AI & ML", "mistral.ai": "AI & ML", cohere: "AI & ML", "together.ai": "AI & ML",
    replicate: "AI & ML", "x.ai": "AI & ML", ollama: "AI & ML", nvidia: "AI & ML",
    elevenlabs: "AI & ML", minimax: "AI & ML", runwayml: "AI & ML",
    notion: "Design & Productivity", figma: "Design & Productivity", framer: "Design & Productivity",
    miro: "Design & Productivity", airtable: "Design & Productivity", webflow: "Design & Productivity",
    cal: "Design & Productivity", superhuman: "Design & Productivity", mintlify: "Design & Productivity",
    sanity: "Design & Productivity", lovable: "Design & Productivity",
    spotify: "Consumer", airbnb: "Consumer", pinterest: "Consumer", uber: "Consumer",
    tesla: "Car Brands", bmw: "Car Brands", ferrari: "Car Brands", lamborghini: "Car Brands",
    renault: "Car Brands", spacex: "Enterprise",
    apple: "Enterprise", ibm: "Enterprise", intercom: "Enterprise", zapier: "Enterprise",
    composio: "Enterprise", voltagent: "Enterprise", clay: "Enterprise",
  };

  const name = nameMap[id] || id.charAt(0).toUpperCase() + id.slice(1);
  const category = categoryMap[id] || "Enterprise";
  const section1 = extractSection(content, 1);

  // Default theme
  const theme: ThemeTokens = {
    id,
    name,
    category,
    colors: {
      background: "#ffffff", backgroundAlt: "#f5f5f5", text: "#1a1a1a",
      textSecondary: "#6b7280", accent: "#635bff", accentHover: "#5046e5",
      border: "#e5e7eb", surface: "#ffffff", accentContrast: "#ffffff",
    },
    typography: {
      fontFamily: '"Inter", system-ui, sans-serif',
      fontFamilyDisplay: '"Inter", system-ui, sans-serif',
      headingWeight: 700, bodyWeight: 400,
      headingLetterSpacing: "-0.02em", buttonTextTransform: "none",
      buttonLetterSpacing: "0px", buttonWeight: 500,
    },
    spacing: { borderRadius: "8px", borderRadiusLg: "12px", borderRadiusFull: "9999px", buttonRadius: "8px" },
    effects: {
      shadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)",
      shadowLg: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05)",
    },
    meta: {
      isDark: false,
      atmosphere: extractAtmosphere(section1, name),
    },
  };

  // Apply overrides
  const ov = overrides[id];
  if (ov) {
    if (ov.colors) Object.assign(theme.colors, ov.colors);
    if (ov.typography) {
      Object.assign(theme.typography, ov.typography);
      if (!ov.typography.fontFamilyDisplay && ov.typography.fontFamily) {
        theme.typography.fontFamilyDisplay = ov.typography.fontFamily;
      }
    }
    if (ov.spacing) Object.assign(theme.spacing, ov.spacing);
    if (ov.effects) Object.assign(theme.effects, ov.effects);
    if (ov.meta) Object.assign(theme.meta, ov.meta);
  }

  // Compute accentContrast from accent luminance (unless overridden)
  if (!ov?.colors?.accentContrast) {
    theme.colors.accentContrast = contrastColor(theme.colors.accent);
  }

  // Set dark mode shadows
  if (theme.meta.isDark) {
    theme.effects.shadow = "0 2px 8px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)";
    theme.effects.shadowLg = "0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)";
  }

  return theme;
}

// ─── Run ─────────────────────────────────────────────────────────────────────

const designSystemsDir = join(__dirname, "..", "design-systems");
const outputPath = join(__dirname, "..", "src", "data", "themes.json");

const dirs = readdirSync(designSystemsDir).sort();
const themes: ThemeTokens[] = [];

for (const dir of dirs) {
  const mdPath = join(designSystemsDir, dir, "DESIGN.md");
  if (!existsSync(mdPath)) continue;
  const content = readFileSync(mdPath, "utf-8");
  try {
    const theme = extractTheme(dir, content);
    themes.push(theme);
    console.log(
      `✓ ${theme.name.padEnd(25)} ${theme.category.padEnd(22)} ${theme.meta.isDark ? "dark " : "light"} accent=${theme.colors.accent}`
    );
  } catch (err) {
    console.error(`✗ ${dir}: ${(err as Error).message}`);
  }
}

writeFileSync(outputPath, JSON.stringify(themes, null, 2));
console.log(`\nWrote ${themes.length} themes to ${outputPath}`);

// ─── Copy DESIGN.md files to public/ for download ─────────────────────────────
const publicDesignDir = join(__dirname, "..", "public", "design-systems");
let copied = 0;
for (const dir of dirs) {
  const mdPath = join(designSystemsDir, dir, "DESIGN.md");
  if (!existsSync(mdPath)) continue;
  const pubDir = join(publicDesignDir, dir);
  mkdirSync(pubDir, { recursive: true });
  copyFileSync(mdPath, join(pubDir, "DESIGN.md"));
  copied++;
}
console.log(`Copied ${copied} DESIGN.md files to public/design-systems/`);
