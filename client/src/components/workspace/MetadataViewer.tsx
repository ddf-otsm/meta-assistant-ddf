import * as React from 'react';

interface MetadataNode {
  name: string;
  value?: string;
  children?: Record<string, MetadataNode>;
}

interface MetadataViewerProps {
  data: Record<string, MetadataNode>;
}

const MetadataViewer: React.FC<MetadataViewerProps> = ({ data }) => {
  const renderTree = (node: MetadataNode, level = 0) => {
    const indent = '  '.repeat(level);
    return (
      <div key={node.name}>
        {`${indent}${node.name}: ${node.value || ''}`}
        {node.children && Object.values(node.children).map(child => renderTree(child, level + 1))}
      </div>
    );
  };

  const rootNode: MetadataNode = {
    name: 'root',
    children: data,
  };

  return <div className="metadata-viewer">{renderTree(rootNode)}</div>;
};

export default MetadataViewer;
