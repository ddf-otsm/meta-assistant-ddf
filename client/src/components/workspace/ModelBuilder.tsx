// External dependencies
import { useState } from 'react';

import { InfoIcon, MaximizeIcon, EditIcon, TrashIcon } from 'lucide-react';

// UI Components
import { getLogger } from '@/lib/logger.js';

import { Button } from '@/components/ui/button.js';
import { Checkbox } from '@/components/ui/checkbox.js';
import { Input } from '@/components/ui/input.js';
import { Label } from '@/components/ui/label.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.js';

import { ResourceProperty, ApiSpecification } from '@shared/schema.js';

// Shared types

interface ModelBuilderProps {
  specification: ApiSpecification;
  onSpecificationChange: (spec: ApiSpecification) => void;
  onSave?: () => void;
  onNextStep?: () => void;
}

const logger = getLogger('ModelBuilder');

export default function ModelBuilder({
  specification,
  onSpecificationChange,
  onSave,
  onNextStep,
}: ModelBuilderProps) {
  const [newProperty, setNewProperty] = useState<ResourceProperty>({
    name: '',
    type: 'string',
    required: false,
  });

  const handleResourceNameChange = (name: string) => {
    onSpecificationChange({
      ...specification,
      resource: {
        ...specification.resource,
        name,
        path: name.toLowerCase() + 's',
      },
    });
  };

  const handleAddProperty = () => {
    if (!newProperty.name) return;

    onSpecificationChange({
      ...specification,
      resource: {
        ...specification.resource,
        properties: [...specification.resource.properties, { ...newProperty }],
      },
    });

    // Reset new property form
    setNewProperty({ name: '', type: 'string', required: false });
  };

  const handlePropertyChange = (
    index: number,
    field: keyof ResourceProperty,
    value: string | boolean
  ) => {
    const updatedProperties = [...specification.resource.properties];
    updatedProperties[index] = {
      ...updatedProperties[index],
      [field]: value,
    };

    onSpecificationChange({
      ...specification,
      resource: {
        ...specification.resource,
        properties: updatedProperties,
      },
    });
  };

  const handleFrameworkChange = (name: string) => {
    const languageMap: { [key: string]: string } = {
      express: 'javascript',
      fastapi: 'python',
      spring: 'java',
      laravel: 'php',
    };

    onSpecificationChange({
      ...specification,
      framework: name,
      language: languageMap[name] || 'javascript',
    });
  };

  const handleFeatureChange = (feature: keyof ApiSpecification['features'], value: boolean) => {
    onSpecificationChange({
      ...specification,
      features: {
        ...specification.features,
        [feature]: value,
      },
    });
  };

  const getMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const handleInfoClick = () => {
    logger.info('Info button clicked');
  };

  const handleFullscreenClick = () => {
    logger.info('Fullscreen button clicked');
  };

  const handleEditProperty = (property: ResourceProperty) => {
    logger.info('Edit property:', property);
  };

  const handleDeleteProperty = (property: ResourceProperty) => {
    logger.info('Delete property:', property);
  };

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-foreground">Model Builder</h2>
          <Button variant="ghost" size="icon" onClick={handleInfoClick} aria-label="Info">
            <InfoIcon className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={handleFullscreenClick} aria-label="Fullscreen">
          <MaximizeIcon className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Resource Name */}
        <div className="space-y-2">
          <Label htmlFor="resourceName">Resource Name</Label>
          <Input
            id="resourceName"
            value={specification.resource.name}
            onChange={(e) => handleResourceNameChange(e.target.value)}
            placeholder="e.g., User, Product, Order"
          />
        </div>

        {/* Framework Selection */}
        <div className="space-y-2">
          <Label htmlFor="framework">Framework</Label>
          <Select value={specification.framework} onValueChange={handleFrameworkChange}>
            <SelectTrigger id="framework">
              <SelectValue placeholder="Select a framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="express">Express.js</SelectItem>
              <SelectItem value="fastapi">FastAPI</SelectItem>
              <SelectItem value="spring">Spring Boot</SelectItem>
              <SelectItem value="laravel">Laravel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <Label>Features</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="authentication"
                checked={specification.features.authentication}
                onCheckedChange={(checked) =>
                  handleFeatureChange('authentication', checked as boolean)
                }
              />
              <Label htmlFor="authentication">Authentication</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="authorization"
                checked={specification.features.authorization}
                onCheckedChange={(checked) =>
                  handleFeatureChange('authorization', checked as boolean)
                }
              />
              <Label htmlFor="authorization">Authorization</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="validation"
                checked={specification.features.validation}
                onCheckedChange={(checked) =>
                  handleFeatureChange('validation', checked as boolean)
                }
              />
              <Label htmlFor="validation">Validation</Label>
            </div>
          </div>
        </div>

        {/* Properties */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Properties</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={newProperty.name}
                onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                placeholder="Property name"
                className="w-32"
              />
              <Select
                value={newProperty.type}
                onValueChange={(value) => setNewProperty({ ...newProperty, type: value })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
              <Checkbox
                checked={newProperty.required}
                onCheckedChange={(checked) =>
                  setNewProperty({ ...newProperty, required: checked as boolean })
                }
              />
              <Button onClick={handleAddProperty} disabled={!newProperty.name}>
                Add
              </Button>
            </div>
          </div>

          <div className="border rounded-md divide-y">
            {specification.resource.properties.map((property, index) => (
              <div key={index} className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{property.name}</span>
                  <span className="text-muted-foreground">{property.type}</span>
                  {property.required && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditProperty(property)}
                    aria-label="Edit property"
                  >
                    <EditIcon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteProperty(property)}
                    aria-label="Delete property"
                  >
                    <TrashIcon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          {onSave && (
            <Button variant="outline" onClick={onSave}>
              Save
            </Button>
          )}
          {onNextStep && (
            <Button onClick={onNextStep} className="bg-primary text-primary-foreground">
              Next Step
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
