import { useState, useMemo } from "react";
import { Palette, X, Search } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import CategoryFilter from "./CategoryFilter";
import ThemeCard from "./ThemeCard";

export default function ThemeSelector() {
  const { theme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return themes.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || t.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [themes, search, category]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        style={{
          backgroundColor: theme.colors.accent,
          color: theme.colors.accentContrast,
          borderRadius: "50%",
          boxShadow: theme.effects.shadowLg,
        }}
        aria-label="Open theme selector"
      >
        <Palette size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full flex-col transition-transform duration-300 ease-in-out"
        style={{
          fontFamily: '"Calibre", system-ui, sans-serif',
          width: "min(400px, 100vw)",
          backgroundColor: theme.colors.background,
          borderLeft: `1px solid ${theme.colors.border}`,
          boxShadow: isOpen ? theme.effects.shadowLg : "none",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${theme.colors.border}` }}
        >
          <div>
            <h2
              className="text-[20px]"
              style={{
                fontFamily: "inherit",
                fontWeight: 500,
                color: theme.colors.text,
              }}
            >
              Design Systems
            </h2>
            <p className="text-[14px]" style={{ color: theme.colors.textSecondary }}>
              {themes.length} themes available
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center transition-colors cursor-pointer"
            style={{
              color: theme.colors.textSecondary,
              borderRadius: theme.spacing.borderRadius,
            }}
            aria-label="Close theme selector"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4">
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              backgroundColor: theme.colors.backgroundAlt,
              borderRadius: theme.spacing.borderRadius,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <Search size={16} style={{ color: theme.colors.textSecondary }} />
            <input
              type="text"
              placeholder="Search design systems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
              style={{
                color: theme.colors.text,
              }}
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="px-5 py-3">
          <CategoryFilter active={category} onSelect={setCategory} />
        </div>

        {/* Theme list */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="flex flex-col gap-2">
            {filtered.map((t) => (
              <ThemeCard key={t.id} themeOption={t} />
            ))}
            {filtered.length === 0 && (
              <p
                className="py-8 text-center text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                No themes match your search.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
