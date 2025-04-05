import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-white border-b border-dark-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center space-x-2">
          <i className="ri-code-box-line text-primary-600 text-2xl"></i>
          <Link href="/">
            <a className="text-xl font-semibold text-dark-900">Meta-Engineer</a>
          </Link>
          <span className="bg-accent-100 text-accent-800 text-xs px-2 py-0.5 rounded-full font-medium">Beta</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className="text-dark-600 hover:text-primary-600 font-medium transition">Dashboard</a>
          </Link>
          <Link href="/projects/1">
            <a className="text-dark-600 hover:text-primary-600 font-medium transition">Projects</a>
          </Link>
          <a href="#" className="text-dark-600 hover:text-primary-600 font-medium transition">Templates</a>
          <a href="#" className="text-dark-600 hover:text-primary-600 font-medium transition">Documentation</a>
        </nav>

        <div className="flex items-center space-x-4">
          <button className="text-dark-600 hover:text-dark-900 transition">
            <i className="ri-notification-3-line text-xl"></i>
          </button>
          <button className="text-dark-600 hover:text-dark-900 transition">
            <i className="ri-settings-3-line text-xl"></i>
          </button>
          <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
            DU
          </div>
        </div>
      </div>
    </header>
  );
}
