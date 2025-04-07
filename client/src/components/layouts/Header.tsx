import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
          <i className="ri-code-box-line text-primary text-2xl"></i>
          <Link href="/">
            <a className="text-xl font-semibold text-foreground">Meta-Engineer</a>
          </Link>
          <span className="bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-medium">Beta</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className="text-muted-foreground hover:text-primary font-medium transition">Dashboard</a>
          </Link>
          <Link href="/projects/1">
            <a className="text-muted-foreground hover:text-primary font-medium transition">Projects</a>
          </Link>
          <a href="#" className="text-muted-foreground hover:text-primary font-medium transition">Templates</a>
          <a href="#" className="text-muted-foreground hover:text-primary font-medium transition">Documentation</a>
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground transition p-2 rounded-full hover:bg-muted"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? (
              <i className="ri-sun-line text-xl"></i>
            ) : (
              <i className="ri-moon-line text-xl"></i>
            )}
          </button>
          <button className="text-muted-foreground hover:text-foreground transition p-2 rounded-full hover:bg-muted">
            <i className="ri-notification-3-line text-xl"></i>
          </button>
          <button className="text-muted-foreground hover:text-foreground transition p-2 rounded-full hover:bg-muted">
            <i className="ri-settings-3-line text-xl"></i>
          </button>
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
            DU
          </div>
        </div>
      </div>
    </header>
  );
}
