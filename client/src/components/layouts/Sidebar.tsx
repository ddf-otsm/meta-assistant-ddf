import { Link, useLocation } from 'wouter';

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 border-r border-dark-200 bg-white hidden md:block">
      <div className="p-4 flex flex-col h-full">
        <div className="mb-6">
          <h3 className="text-xs uppercase text-dark-500 font-semibold tracking-wider mb-3">
            Projects
          </h3>
          <div className="space-y-1">
            <Link href="/projects/1">
              <a
                href="/projects/1"
                className={`flex items-center px-3 py-2 rounded-md ${location === '/projects/1' ? 'bg-primary-50 text-primary-700' : 'text-dark-600 hover:bg-dark-100'}`}
              >
                <i className="ri-folder-line mr-2" aria-hidden="true"></i>
                <span>Meta-API Generator</span>
              </a>
            </Link>
            <Link href="/projects/2">
              <a
                href="/projects/2"
                className={`flex items-center px-3 py-2 rounded-md ${location === '/projects/2' ? 'bg-primary-50 text-primary-700' : 'text-dark-600 hover:bg-dark-100'}`}
              >
                <i className="ri-folder-line mr-2" aria-hidden="true"></i>
                <span>Dashboard Builder</span>
              </a>
            </Link>
            <Link href="/projects/3">
              <a
                href="/projects/3"
                className={`flex items-center px-3 py-2 rounded-md ${location === '/projects/3' ? 'bg-primary-50 text-primary-700' : 'text-dark-600 hover:bg-dark-100'}`}
              >
                <i className="ri-folder-line mr-2" aria-hidden="true"></i>
                <span>CRUD App Generator</span>
              </a>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs uppercase text-dark-500 font-semibold tracking-wider mb-3">
            Tools
          </h3>
          <div className="space-y-1">
            <Link href="/tools/model-designer">
              <a
                href="/tools/model-designer"
                className="flex items-center px-3 py-2 rounded-md text-dark-600 hover:bg-dark-100"
              >
                <i className="ri-magic-line mr-2" aria-hidden="true"></i>
                <span>Model Designer</span>
              </a>
            </Link>
            <Link href="/tools/template-editor">
              <a
                href="/tools/template-editor"
                className="flex items-center px-3 py-2 rounded-md text-dark-600 hover:bg-dark-100"
              >
                <i className="ri-code-box-line mr-2" aria-hidden="true"></i>
                <span>Template Editor</span>
              </a>
            </Link>
            <Link href="/tools/generator-cli">
              <a
                href="/tools/generator-cli"
                className="flex items-center px-3 py-2 rounded-md text-dark-600 hover:bg-dark-100"
              >
                <i className="ri-terminal-box-line mr-2" aria-hidden="true"></i>
                <span>Generator CLI</span>
              </a>
            </Link>
            <Link href="/tools/ai-assistant">
              <a
                href="/tools/ai-assistant"
                className="flex items-center px-3 py-2 rounded-md text-dark-600 hover:bg-dark-100"
              >
                <i className="ri-robot-line mr-2" aria-hidden="true"></i>
                <span>AI Assistant</span>
              </a>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xs uppercase text-dark-500 font-semibold tracking-wider mb-3">
            Learn
          </h3>
          <div className="space-y-1">
            <Link href="/learn/tutorials">
              <a
                href="/learn/tutorials"
                className="flex items-center px-3 py-2 rounded-md text-dark-600 hover:bg-dark-100"
              >
                <i className="ri-book-line mr-2" aria-hidden="true"></i>
                <span>Tutorials</span>
              </a>
            </Link>
            <Link href="/learn/docs">
              <a
                href="/learn/docs"
                className="flex items-center px-3 py-2 rounded-md text-dark-600 hover:bg-dark-100"
              >
                <i className="ri-file-list-line mr-2" aria-hidden="true"></i>
                <span>Documentation</span>
              </a>
            </Link>
            <Link href="/learn/community">
              <a
                href="/learn/community"
                className="flex items-center px-3 py-2 rounded-md text-dark-600 hover:bg-dark-100"
              >
                <i className="ri-community-line mr-2" aria-hidden="true"></i>
                <span>Community</span>
              </a>
            </Link>
          </div>
        </div>

        <div className="mt-auto">
          <div className="bg-dark-100 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <i className="ri-rocket-line text-secondary-600 mr-2" aria-hidden="true"></i>
              <h4 className="font-medium">Pro Features</h4>
            </div>
            <p className="text-dark-600 text-sm mb-3">
              Upgrade to access advanced templates and AI capabilities.
            </p>
            <button
              className="bg-secondary-600 hover:bg-secondary-700 text-white py-1.5 px-3 rounded-md text-sm w-full transition"
              aria-label="Upgrade to Pro"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
