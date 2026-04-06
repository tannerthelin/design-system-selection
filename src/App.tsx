import { HashRouter, Routes, Route, Link } from "react-router-dom";
import { X, Download } from "lucide-react";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import Portfolio from "./pages/Portfolio";
import ThemeSelector from "./components/theme-selector/ThemeSelector";
import DesignSystemsHome from "./pages/DesignSystemsHome";

function PreviewPage() {
  const { theme } = useTheme();

  return (
    <>
      <Portfolio />
      <ThemeSelector />
      <div className="fixed top-6 right-6 flex items-center gap-2 z-30" style={{ fontFamily: '"Calibre", system-ui, sans-serif' }}>
        <a
          href={`${import.meta.env.BASE_URL}design-systems/${theme.id}/DESIGN.md`}
          download
          className="bg-[#2222220d] text-[#222] px-5 py-2.5 rounded-full text-[16px] font-medium flex items-center gap-2 hover:bg-[#2222221a] transition-colors"
        >
          <Download size={18} />
          Download design system
        </a>
        <Link
          to="/"
          className="bg-[#2222220d] text-[#222] w-10 h-10 rounded-full text-[16px] font-medium flex items-center justify-center hover:bg-[#2222221a] transition-colors"
        >
          <X size={18} />
        </Link>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<DesignSystemsHome />} />
          <Route path="/preview" element={<PreviewPage />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
