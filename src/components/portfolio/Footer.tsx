import { useTheme } from "../../contexts/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer
      className="px-6 py-8 text-center"
      style={{
        backgroundColor: theme.colors.backgroundAlt,
        borderTop: `1px solid ${theme.colors.border}`,
      }}
    >
      <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
        Built with the{" "}
        <span className="font-medium" style={{ color: theme.colors.accent }}>
          {theme.name}
        </span>{" "}
        design system
      </p>
      <p className="mt-1 text-xs" style={{ color: theme.colors.textSecondary }}>
        AI Builder Portfolio — Leland's AI Builder Course
      </p>
    </footer>
  );
}
