import { Sparkles } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function HeroSection() {
  const { theme } = useTheme();

  return (
    <section className="relative overflow-hidden px-6 py-20 sm:py-28 md:py-32">
      {/* Gradient background accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${theme.colors.accent}, transparent)`,
        }}
      />

      <div className="relative mx-auto max-w-3xl text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium"
          style={{
            backgroundColor: theme.colors.backgroundAlt,
            color: theme.colors.textSecondary,
            borderRadius: theme.spacing.borderRadiusFull,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Sparkles size={14} style={{ color: theme.colors.accent }} />
          <span>Leland's AI Builder Course</span>
        </div>

        <h1
          className="mb-4 text-4xl sm:text-5xl md:text-6xl"
          style={{
            fontFamily: theme.typography.fontFamilyDisplay,
            fontWeight: theme.typography.headingWeight,
            letterSpacing: theme.typography.headingLetterSpacing,
            color: theme.colors.text,
          }}
        >
          My Portfolio
        </h1>

        <p
          className="mb-8 text-lg sm:text-xl leading-relaxed"
          style={{ color: theme.colors.textSecondary }}
        >
          AI Builder Portfolio — 6 sessions of building with AI, from imagination to full automation.
        </p>

        <a
          href="#session-1"
          className="inline-flex items-center px-6 py-3 text-sm transition-colors"
          style={{
            backgroundColor: theme.colors.accent,
            color: theme.colors.accentContrast,
            borderRadius: theme.spacing.buttonRadius,
            fontWeight: theme.typography.buttonWeight,
            textTransform: theme.typography.buttonTextTransform as React.CSSProperties["textTransform"],
            letterSpacing: theme.typography.buttonLetterSpacing,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.colors.accentHover)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.accent)}
        >
          Get Started
        </a>

        <p
          className="mt-4 text-xs"
          style={{ color: theme.colors.textSecondary }}
        >
          Themed with {theme.name}
        </p>
      </div>
    </section>
  );
}
