import { type LucideIcon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface SessionSectionProps {
  id?: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
}

export default function SessionSection({
  id,
  number,
  title,
  subtitle,
  description,
  icon: Icon,
}: SessionSectionProps) {
  const { theme } = useTheme();
  const isEven = number % 2 === 0;

  return (
    <section
      id={id}
      className="px-6 py-12 sm:py-16"
      style={{
        backgroundColor: isEven ? theme.colors.backgroundAlt : theme.colors.background,
      }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12">
          {/* Session badge & info */}
          <div className="flex-1">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: theme.meta.isDark
                    ? `${theme.colors.accent}22`
                    : `${theme.colors.accent}15`,
                  color: theme.colors.accent,
                  borderRadius: theme.spacing.borderRadius,
                }}
              >
                {number}
              </div>
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: theme.colors.textSecondary }}
              >
                Session {number}
              </span>
            </div>

            <h2
              className="mb-2 text-2xl sm:text-3xl"
              style={{
                fontFamily: theme.typography.fontFamilyDisplay,
                fontWeight: theme.typography.headingWeight,
                letterSpacing: theme.typography.headingLetterSpacing,
                color: theme.colors.text,
              }}
            >
              {title}
            </h2>

            <p
              className="mb-3 text-base font-medium"
              style={{ color: theme.colors.accent }}
            >
              {subtitle}
            </p>

            <p
              className="text-base leading-relaxed"
              style={{ color: theme.colors.textSecondary }}
            >
              {description}
            </p>
          </div>

          {/* Project placeholder card */}
          <div
            className="flex-1 p-6 sm:p-8"
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.spacing.borderRadiusLg,
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.effects.shadow,
            }}
          >
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center"
              style={{
                backgroundColor: theme.meta.isDark
                  ? `${theme.colors.accent}22`
                  : `${theme.colors.accent}12`,
                borderRadius: theme.spacing.borderRadius,
              }}
            >
              <Icon size={24} style={{ color: theme.colors.accent }} />
            </div>

            <h3
              className="mb-2 text-lg font-semibold"
              style={{ color: theme.colors.text }}
            >
              {subtitle}
            </h3>

            <p
              className="mb-4 text-sm leading-relaxed"
              style={{ color: theme.colors.textSecondary }}
            >
              Project showcase coming soon. This card will display the completed project from Session {number}.
            </p>

            <div
              className="h-32 flex items-center justify-center"
              style={{
                backgroundColor: theme.colors.backgroundAlt,
                borderRadius: theme.spacing.borderRadius,
                border: `1px dashed ${theme.colors.border}`,
              }}
            >
              <span
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                Project Preview
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
