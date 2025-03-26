import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const downloadResume = () => {
    const link = document.createElement("a");
    link.href = "/uploads/resume.pdf"; // Assuming resume is stored in this path
    link.download = "Aggelos_Kwnstantinou_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className={`bg-white border-b border-primary-200 py-4 px-6 sticky top-0 z-10 transition-shadow ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary-900">
          <span className="text-accent">Aggelos</span> Kwnstantinou
        </h1>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:block">
          <ul className="flex space-x-6 text-sm font-medium">
            <li><a href="#about" className="hover:text-accent transition-colors">About</a></li>
            <li><a href="#projects" className="hover:text-accent transition-colors">Projects</a></li>
            <li><a href="#analytics" className="hover:text-accent transition-colors">Analytics</a></li>
            <li><a href="#contact" className="hover:text-accent transition-colors">Contact</a></li>
          </ul>
        </nav>
        
        <Button onClick={downloadResume} className="bg-accent hover:bg-accent/90 text-white">
          Download CV
        </Button>
      </div>
    </header>
  );
}
