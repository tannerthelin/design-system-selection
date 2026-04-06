import { useTheme } from "../../contexts/ThemeContext";

const categories = [
  "All",
  "AI & ML",
  "Developer Tools",
  "Design & Productivity",
  "Fintech",
  "Consumer",
  "Enterprise",
  "Car Brands",
];

interface CategoryFilterProps {
  active: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ active, onSelect }: CategoryFilterProps) {
  const { theme } = useTheme();

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className="px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: isActive ? theme.colors.accent : theme.colors.backgroundAlt,
              color: isActive
                ? theme.meta.isDark ? "#000000" : "#ffffff"
                : theme.colors.textSecondary,
              borderRadius: theme.spacing.borderRadiusFull,
              border: `1px solid ${isActive ? theme.colors.accent : theme.colors.border}`,
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
