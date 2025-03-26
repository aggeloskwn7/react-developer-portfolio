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
    <header className={`bg-white py-4 px-6 sticky top-0 z-10 transition-all ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">
          <span className="text-accent font-extrabold">Aggelos</span> Kwnstantinou
        </h1>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:block">
          <ul className="flex space-x-8 text-sm font-medium">
            <li>
              <a 
                href="#about" 
                className="text-gray-800 hover:text-accent transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#projects" 
                className="text-gray-800 hover:text-accent transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                Projects
              </a>
            </li>
            <li>
              <a 
                href="#analytics" 
                className="text-gray-800 hover:text-accent transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                Analytics
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                className="text-gray-800 hover:text-accent transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>
        
        <Button onClick={downloadResume} className="btn-primary">
          Download CV
        </Button>
      </div>
    </header>
  );
}
