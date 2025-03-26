import { Link } from "wouter";

export function MobileNavigation() {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-primary-200 py-3 px-6 z-10">
      <ul className="flex justify-between items-center">
        <li>
          <a href="#about" className="flex flex-col items-center text-primary-500 hover:text-accent">
            <i className="ri-user-line text-xl"></i>
            <span className="text-xs mt-1">About</span>
          </a>
        </li>
        <li>
          <a href="#projects" className="flex flex-col items-center text-primary-500 hover:text-accent">
            <i className="ri-folder-line text-xl"></i>
            <span className="text-xs mt-1">Projects</span>
          </a>
        </li>
        <li>
          <a href="#analytics" className="flex flex-col items-center text-primary-500 hover:text-accent">
            <i className="ri-line-chart-line text-xl"></i>
            <span className="text-xs mt-1">Analytics</span>
          </a>
        </li>
        <li>
          <a href="#contact" className="flex flex-col items-center text-primary-500 hover:text-accent">
            <i className="ri-mail-line text-xl"></i>
            <span className="text-xs mt-1">Contact</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
