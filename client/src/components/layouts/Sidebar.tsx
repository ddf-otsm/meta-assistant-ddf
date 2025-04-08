import { Link, useLocation } from 'wouter';

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r border-border bg-sidebar-background hidden md:block">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-6">
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
            Projects
          </h3>
          <div className="space-y-1">
            <Link href="/project/1">
              <a
                className={`flex items-center px-3 py-2 rounded-md ${
                  location === '/project/1' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <i className="ri-folder-line mr-2" aria-hidden="true"></i>
                <span>Meta-API Generator</span>
              </a>
            </Link>
            <Link href="/project/2">
              <a
                className={`flex items-center px-3 py-2 rounded-md ${
                  location === '/project/2' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <i className="ri-folder-line mr-2" aria-hidden="true"></i>
                <span>Dashboard Builder</span>
              </a>
            </Link>
            <Link href="/project/3">
              <a
                className={`flex items-center px-3 py-2 rounded-md ${
                  location === '/project/3' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <i className="ri-folder-line mr-2" aria-hidden="true"></i>
                <span>CRUD App Generator</span>
              </a>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-3">
            Tools
          </h3>
          <div className="space-y-1">
            <Link href="/tools/model-designer">
              <a className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
                <i className="ri-magic-line mr-2" aria-hidden="true"></i>
                <span>Model Designer</span>
              </a>
            </Link>
            <Link href="/tools/template-editor">
              <a className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
                <i className="ri-code-box-line mr-2" aria-hidden="true"></i>
                <span>Template Editor</span>
              </a>
            </Link>
            <Link href="/tools/generator-cli">
              <a className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
                <i className="ri-terminal-box-line mr-2" aria-hidden="true"></i>
                <span>Generator CLI</span>
              </a>
            </Link>
            <Link href="/tools/ai-assistant">
              <a className="flex items-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted">
                <i className="ri-robot-line mr-2" aria-hidden="true"></i>
                <span>AI Assistant</span>
              </a>
            </Link>
          </div>
        </div>

        <div className="mt-auto">
          <div className="border-t border-border pt-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                U
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">User Name</p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
