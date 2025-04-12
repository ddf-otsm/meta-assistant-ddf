import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

// Type definitions for documentation structure
interface DocumentFile {
  path: string;
  name: string;
  content: string;
  isDirectory: boolean;
  children?: DocumentFile[];
}

interface DocumentationViewerProps {
  projectId: number;
  projectName: string;
}

export default function DocumentationViewer({ 
  projectId,
  projectName
}: DocumentationViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [documentation, setDocumentation] = useState<DocumentFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DocumentFile | null>(null);
  const [currentSection, setCurrentSection] = useState<string>("");
  const { toast } = useToast();
  
  useEffect(() => {
    // Load documentation structure when component mounts
    fetchDocumentation();
  }, [projectId]);
  
  const fetchDocumentation = async () => {
    setIsLoading(true);
    
    try {
      const res = await apiRequest("GET", `/api/projects/${projectId}/documentation`, {});
      const data = await res.json();
      
      setDocumentation(data.files || []);
      
      // Automatically select README if available
      const readme = findReadme(data.files);
      if (readme) {
        setSelectedFile(readme);
        determineCurrentSection(readme.path);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project documentation.",
        variant: "destructive"
      });
      console.error("Documentation loading error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to find README file
  const findReadme = (files: DocumentFile[]): DocumentFile | null => {
    for (const file of files) {
      if (!file.isDirectory && file.name.toLowerCase() === "readme.md") {
        return file;
      }
      
      if (file.isDirectory && file.children) {
        const result = findReadme(file.children);
        if (result) return result;
      }
    }
    return null;
  };
  
  // Determine which section the file belongs to
  const determineCurrentSection = (filePath: string) => {
    const pathParts = filePath.split('/');
    const sections = ['architecture', 'implementations', 'plans', 'generators'];
    
    for (const section of sections) {
      if (pathParts.includes(section)) {
        setCurrentSection(section);
        return;
      }
    }
    
    setCurrentSection("");
  };
  
  // Handle file selection
  const handleFileSelect = (file: DocumentFile) => {
    if (!file.isDirectory) {
      setSelectedFile(file);
      determineCurrentSection(file.path);
    }
  };
  
  // Navigate to specific section
  const navigateToSection = (section: string) => {
    // Find section directory
    const findSection = (files: DocumentFile[]): DocumentFile | null => {
      for (const file of files) {
        if (file.isDirectory) {
          if (file.name.toLowerCase() === section) {
            return file;
          }
          
          if (file.children) {
            const result = findSection(file.children);
            if (result) return result;
          }
        }
      }
      return null;
    };
    
    const sectionDir = findSection(documentation);
    if (sectionDir && sectionDir.children && sectionDir.children.length > 0) {
      // First try to find a README in this section
      const sectionReadme = findReadme(sectionDir.children);
      if (sectionReadme) {
        handleFileSelect(sectionReadme);
      } else if (sectionDir.children[0] && !sectionDir.children[0].isDirectory) {
        // Otherwise select the first file
        handleFileSelect(sectionDir.children[0]);
      }
    }
  };

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h2 className="font-semibold text-foreground">Project Documentation</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={fetchDocumentation}
            disabled={isLoading}
          >
            <i className="ri-refresh-line"></i>
          </Button>
        </div>
      </div>
      
      {/* Section Navigation */}
      <div className="border-b border-border p-2 flex items-center overflow-x-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigateToSection("docs")}>
                Docs
              </BreadcrumbLink>
            </BreadcrumbItem>
            {currentSection && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="ml-auto flex space-x-1">
          <Button 
            variant={currentSection === "architecture" ? "default" : "ghost"} 
            size="sm"
            onClick={() => navigateToSection("architecture")}
            className="text-xs"
          >
            Architecture
          </Button>
          <Button 
            variant={currentSection === "implementations" ? "default" : "ghost"} 
            size="sm"
            onClick={() => navigateToSection("implementations")}
            className="text-xs"
          >
            Implementations
          </Button>
          <Button 
            variant={currentSection === "plans" ? "default" : "ghost"} 
            size="sm"
            onClick={() => navigateToSection("plans")}
            className="text-xs"
          >
            Plans
          </Button>
          <Button 
            variant={currentSection === "generators" ? "default" : "ghost"} 
            size="sm"
            onClick={() => navigateToSection("generators")}
            className="text-xs"
          >
            Generators
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-8 flex-grow">
          <i className="ri-loader-4-line animate-spin mr-2"></i>
          <span className="text-muted-foreground">Loading documentation...</span>
        </div>
      ) : (
        <div className="grid grid-cols-12 divide-x flex-grow overflow-hidden">
          {/* File Tree */}
          <div className="col-span-4 p-4 overflow-y-auto">
            <h3 className="text-sm font-medium mb-3">Files</h3>
            <FileTree 
              files={documentation} 
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
            />
          </div>
          
          {/* Document Content */}
          <div className="col-span-8 p-4 overflow-y-auto">
            {selectedFile ? (
              <div>
                <h3 className="text-sm font-medium mb-3">{selectedFile.name}</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{selectedFile.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <i className="ri-file-list-line text-3xl text-muted-foreground mb-2"></i>
                <p className="text-muted-foreground">Select a file to view its content</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FileTreeProps {
  files: DocumentFile[];
  onFileSelect: (file: DocumentFile) => void;
  selectedFile: DocumentFile | null;
  level?: number;
}

function FileTree({ files, onFileSelect, selectedFile, level = 0 }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    // Auto-expand docs folder
    'docs': true
  });
  
  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  const isSelected = (file: DocumentFile) => {
    return selectedFile?.path === file.path;
  };
  
  return (
    <ul className="space-y-1">
      {files.map((file) => (
        <li key={file.path}>
          <div 
            className={`flex items-center py-1 px-2 rounded hover:bg-muted cursor-pointer ${
              isSelected(file) ? 'bg-muted font-medium' : ''
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => {
              if (file.isDirectory) {
                toggleFolder(file.path);
              } else {
                onFileSelect(file);
              }
            }}
          >
            {file.isDirectory ? (
              <>
                <i className={`${
                  expandedFolders[file.path] ? 'ri-folder-open-line' : 'ri-folder-line'
                } mr-2 text-amber-500`}></i>
                <span>{file.name}</span>
              </>
            ) : (
              <>
                <i className="ri-file-text-line mr-2 text-blue-500"></i>
                <span>{file.name}</span>
              </>
            )}
          </div>
          
          {file.isDirectory && expandedFolders[file.path] && file.children && (
            <FileTree 
              files={file.children} 
              onFileSelect={onFileSelect}
              selectedFile={selectedFile}
              level={level + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
} 