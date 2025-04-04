import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

import { ApiSpecification, GeneratedCode } from '@shared/schema';

interface MetadataViewerProps {
  _projectId: number;
  modelId: number;
  specification: ApiSpecification;
  generatedFiles: GeneratedCode[];
  onCodeGenerated: (files: GeneratedCode[]) => void;
}

export default function MetadataViewer({
  _projectId,
  modelId,
  specification,
  generatedFiles,
  onCodeGenerated,
}: MetadataViewerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateCode = async () => {
    setIsGenerating(true);

    try {
      const res = await apiRequest('POST', `/api/models/${modelId}/generate`, {});
      const data = await res.json();

      toast({
        title: 'Success',
        description: `Generated ${data.files.length} files successfully.`,
      });

      onCodeGenerated(data.files);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate code. Please try again.',
        variant: 'destructive',
      });
      console.error('Code generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(JSON.stringify(specification, null, 2))
      .then(() => {
        toast({ title: 'Copied', description: 'Metadata copied to clipboard' });
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard',
          variant: 'destructive',
        });
      });
  };

  return (
    <div className="bg-white rounded-lg border border-dark-200 shadow-sm overflow-hidden">
      <div className="border-b border-dark-200 p-4 flex justify-between items-center">
        <h2 className="font-semibold text-dark-800">Generated Metadata</h2>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleCopyToClipboard}>
            <i className="ri-file-copy-line"></i>
          </Button>
          <Button variant="ghost" size="icon">
            <i className="ri-download-line"></i>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="code-editor bg-dark-900 text-white font-mono text-sm p-4 rounded-md overflow-auto">
          <pre>{JSON.stringify(specification, null, 2)}</pre>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-dark-700">Output Preview</h3>
            <div className="flex items-center text-xs">
              <span className="text-dark-500 mr-1">
                {generatedFiles.length > 0
                  ? `${generatedFiles.length} files generated`
                  : 'Ready to generate files'}
              </span>
              <i className="ri-information-line text-dark-500"></i>
            </div>
          </div>
          <div className="bg-dark-100 p-3 rounded-md">
            <div className="text-sm">
              {generatedFiles.length > 0 ? (
                <FileTree files={generatedFiles} />
              ) : (
                <div className="text-center py-4">
                  <p className="text-dark-500">Click "Generate" to create code files</p>
                  <Button
                    className="mt-3 bg-primary-600 hover:bg-primary-700"
                    onClick={handleGenerateCode}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="ri-code-line mr-2"></i>
                        Generate Code
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FileTreeProps {
  files: GeneratedCode[];
}

function FileTree({ files }: FileTreeProps) {
  // Create a nested structure from file paths
  interface FileTreeDirectory {
    [key: string]: FileTreeDirectory | GeneratedCode;
  }

  const fileTree: FileTreeDirectory = {};

  files.forEach(file => {
    const pathParts = file.path.split('/');
    let current = fileTree;

    // Create the nested structure
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part] || 'path' in current[part]) {
        current[part] = {};
      }
      current = current[part] as FileTreeDirectory;
    }

    // Add the file at the end
    const fileName = pathParts[pathParts.length - 1];
    current[fileName] = file;
  });

  // Render the tree recursively
  const renderTree = (node: FileTreeItem, level = 0) => {
    const isDirectory = 'children' in node;
    const key = isDirectory ? `dir-${node.path}` : `file-${node.id}`;
    
    return (
      <div key={key} style={{ marginLeft: `${level * 20}px` }}>
        {isDirectory ? (
          <div className="font-semibold">{node.path}</div>
        ) : (
          <div className="text-sm">{node.path}</div>
        )}
        {isDirectory && node.children?.map(child => renderTree(child, level + 1))}
      </div>
    );
  };

  return <>{renderTree(fileTree)}</>;
}
