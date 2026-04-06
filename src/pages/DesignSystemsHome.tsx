import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, ArrowRight } from "lucide-react";
import themes from "../data/themes.json";
import { domains } from "../data/domains";
import { useTheme, type Theme } from "../contexts/ThemeContext";

const allThemes = themes as Theme[];

function LogoImg({ theme }: { theme: Theme }) {
  const [failed, setFailed] = useState(false);
  const domain = domains[theme.id];

  if (failed || !domain) {
    return (
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
        style={{ backgroundColor: theme.colors.accent }}
      >
        {theme.name[0]}
      </div>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt={theme.name}
      className="w-10 h-10 rounded-[10px] shrink-0 shadow-[0_2px_12px_rgba(0,0,0,0.08)]"
      onError={() => setFailed(true)}
    />
  );
}

export default function DesignSystemsHome() {
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '"Calibre", system-ui, sans-serif' }}>
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-[#111]">
          Design Systems
        </h1>
        <p className="mt-2 text-lg text-[#666]">
          {allThemes.length} design systems available for download
        </p>
      </header>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allThemes.map((theme) => (
            <div
              key={theme.id}
              className="bg-white rounded-xl flex flex-col border border-[#e5e5e5] hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
              onClick={() => {
                setTheme(theme.id);
                navigate("/preview");
              }}
            >
              {/* Logo container */}
              <div className="flex items-center justify-center bg-[#fafafa] p-6">
                <LogoImg theme={theme} />
              </div>

              {/* Name, category, download */}
              <div className="flex items-center gap-2 px-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-medium text-[#111] truncate leading-tight">
                    {theme.name}
                  </p>
                  <p className="text-[14px] text-[#707070] truncate">
                    {theme.category}
                  </p>
                </div>
                <a
                  href={`${import.meta.env.BASE_URL}design-systems/${theme.id}/DESIGN.md`}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#888] hover:text-[#111] transition-colors shrink-0"
                  title="Download DESIGN.md"
                >
                  <Download size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating "Try it out" button */}
      <Link
        to="/preview"
        className="fixed top-6 right-6 bg-[#2222220d] text-[#222] px-5 py-2.5 rounded-full text-[16px] font-medium flex items-center gap-2 hover:bg-[#2222221a] transition-colors z-50"
      >
        Try it out
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
