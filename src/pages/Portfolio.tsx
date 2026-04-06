import {
  Wand2,
  Wrench,
  Presentation,
  Table2,
  Bot,
  GraduationCap,
} from "lucide-react";
import HeroSection from "../components/portfolio/HeroSection";
import SessionSection from "../components/portfolio/SessionSection";
import Footer from "../components/portfolio/Footer";

const sessions = [
  {
    number: 1,
    title: "Imagination to Reality",
    subtitle: "Vibe-coded Portfolio Website",
    description:
      "Transform a creative vision into a fully functional portfolio website using AI-powered code generation. Learn to go from idea to deployed site in a single session.",
    icon: Wand2,
  },
  {
    number: 2,
    title: "Give AI Hands with Tools",
    subtitle: "Email Management System",
    description:
      "Build an intelligent email management system that leverages AI tool-use capabilities to read, categorize, draft responses, and automate email workflows.",
    icon: Wrench,
  },
  {
    number: 3,
    title: "Sculpt Polished Outputs",
    subtitle: "Beautiful Slideshow",
    description:
      "Create a stunning presentation generator that produces polished, design-quality slideshows from rough content using AI's creative capabilities.",
    icon: Presentation,
  },
  {
    number: 4,
    title: "Get AI Into the Sheets",
    subtitle: "Data Analysis & Spreadsheet Model",
    description:
      "Harness AI to build powerful data analysis tools and spreadsheet models that can parse, transform, and visualize complex datasets automatically.",
    icon: Table2,
  },
  {
    number: 5,
    title: "Connecting with Agents",
    subtitle: "Social Media Agent",
    description:
      "Design and deploy an autonomous social media agent capable of generating content, scheduling posts, and engaging with audiences across platforms.",
    icon: Bot,
  },
  {
    number: 6,
    title: "Learn How to Learn With AI",
    subtitle: "Full Automation Workflow",
    description:
      "Combine all skills learned to build a comprehensive automation workflow that chains multiple AI capabilities into a seamless, self-improving system.",
    icon: GraduationCap,
  },
];

export default function Portfolio() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      {sessions.map((session) => (
        <SessionSection
          key={session.number}
          {...session}
          {...(session.number === 1 ? { id: "session-1" } : {})}
        />
      ))}
      <Footer />
    </div>
  );
}
