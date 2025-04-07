import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();
  
  return (
    <aside className="w-64 border-r border-border bg-sidebar-background hidden md:block">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-6">
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">Projects</h3>
          <div className="space-y-1">
            <Link href="/projects/1">
              <a className={`flex items-center px-3 py-2 rounded-md ${location === '/projects/1' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                <i className="ri-folder-line mr-2"></i>
                <span>Meta-API Generator</span>
              </a>
            </Link>
            <Link href="/projects/2">
              <a className={`flex items-center px-3 py-2 rounded-md ${location === '/projects/2' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                <i className="ri-folder-line mr-2"></i>
                <span>Dashboard Builder</span>
              </a>
            </Link>
            <Link href="/projects/3">
              <a className={`flex items-center px-3 py-2 rounded-md ${location === '/projects/3' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                <i className="ri-folder-line mr-2"></i>
                <span>CRUD App Generator</span>
              </a>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">Tools</h3>
          <div className="space-y-1">
            <a href="#" className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
              <i className="ri-magic-line mr-2"></i>
              <span>Model Designer</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
              <i className="ri-code-box-line mr-2"></i>
              <span>Template Editor</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
              <i className="ri-terminal-box-line mr-2"></i>
              <span>Generator CLI</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
              <i className="ri-robot-line mr-2"></i>
              <span>AI Assistant</span>
            </a>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">Learn</h3>
          <div className="space-y-1">
            <a href="#" className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
              <i className="ri-book-line mr-2"></i>
              <span>Tutorials</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
              <i className="ri-file-list-line mr-2"></i>
              <span>Documentation</span>
            </a>
            <a href="#" className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
              <i className="ri-community-line mr-2"></i>
              <span>Community</span>
            </a>
          </div>
        </div>

        <div className="mt-auto">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center mb-3">
              <i className="ri-rocket-line text-secondary mr-2"></i>
              <h4 className="font-medium text-foreground">Pro Features</h4>
            </div>
            <p className="text-muted-foreground text-sm mb-3">Upgrade to access advanced templates and AI capabilities.</p>
            <button className="bg-secondary text-secondary-foreground py-1.5 px-3 rounded-md text-sm w-full transition hover:bg-secondary/90">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
