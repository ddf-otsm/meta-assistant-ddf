import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button.js';
import { useToast } from '@/hooks/use-toast.js';
import { apiRequest } from '@/lib/queryClient.js';

interface MetadataNode {
  name: string;
  value?: string;
  children?: Record<string, MetadataNode>;
}

interface GeneratedCode {
  path: string;
  content: string;
}

interface MetadataViewerProps {
  projectId: number;
  modelId: number;
  specification: Record<string, any>;
  generatedFiles: GeneratedCode[];
  onCodeGenerated: (files: GeneratedCode[]) => void;
}

export default function MetadataViewer({
  projectId,
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

  const renderTree = (node: MetadataNode, level = 0) => {
    const indent = level * 20;
    return (
      <div key={node.name} style={{ marginLeft: `${indent}px` }}>
        <div className="flex items-center py-1">
          <span className="text-primary font-medium">{node.name}</span>
          {node.value && <span className="text-muted-foreground ml-2">: {node.value}</span>}
        </div>
        {node.children &&
          Object.entries(node.children).map(([key, child]) => renderTree(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h2 className="font-semibold text-foreground">Generated Metadata</h2>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleCopyToClipboard} aria-label="Copy to clipboard">
            <i className="ri-file-copy-line" aria-hidden="true"></i>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Download">
            <i className="ri-download-line" aria-hidden="true"></i>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="code-editor bg-muted text-foreground font-mono text-sm p-4 rounded-md overflow-auto">
          <pre>{JSON.stringify(specification, null, 2)}</pre>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-foreground">Output Preview</h3>
            <div className="flex items-center text-xs">
              <span className="text-muted-foreground mr-1">
                {generatedFiles.length > 0
                  ? `${generatedFiles.length} files generated`
                  : 'Ready to generate files'}
              </span>
              <i className="ri-information-line text-muted-foreground" aria-hidden="true"></i>
            </div>
          </div>
          <div className="bg-muted p-3 rounded-md">
            <div className="text-sm">
              {generatedFiles.length > 0 ? (
                <div className="space-y-2">
                  {generatedFiles.map((file) => (
                    <div key={file.path} className="flex items-center justify-between">
                      <span className="text-foreground">{file.path}</span>
                      <Button variant="ghost" size="sm" aria-label="View file">
                        <i className="ri-eye-line" aria-hidden="true"></i>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <i className="ri-file-code-line text-2xl mb-2" aria-hidden="true"></i>
                  <p>No files generated yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleGenerateCode}
            disabled={isGenerating}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isGenerating ? (
              <>
                <i className="ri-loader-2-line animate-spin mr-2" aria-hidden="true"></i>
                Generating...
              </>
            ) : (
              <>
                <i className="ri-code-box-line mr-2" aria-hidden="true"></i>
                Generate Code
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
