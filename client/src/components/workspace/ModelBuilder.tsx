import { useState } from "react";
import { ResourceProperty, Endpoint, ApiSpecification } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ModelBuilderProps {
  specification: ApiSpecification;
  onSpecificationChange: (spec: ApiSpecification) => void;
  onSave?: () => void;
  onNextStep?: () => void;
}

export default function ModelBuilder({ specification, onSpecificationChange, onSave, onNextStep }: ModelBuilderProps) {
  const [newProperty, setNewProperty] = useState<ResourceProperty>({ 
    name: '', 
    type: 'string', 
    required: false 
  });

  const handleResourceNameChange = (name: string) => {
    onSpecificationChange({
      ...specification,
      resource: {
        ...specification.resource,
        name,
        path: name.toLowerCase() + 's'
      }
    });
  };

  const handleAddProperty = () => {
    if (!newProperty.name) return;
    
    onSpecificationChange({
      ...specification,
      resource: {
        ...specification.resource,
        properties: [...specification.resource.properties, { ...newProperty }]
      }
    });
    
    // Reset new property form
    setNewProperty({ name: '', type: 'string', required: false });
  };

  const handleRemoveProperty = (index: number) => {
    const updatedProperties = [...specification.resource.properties];
    updatedProperties.splice(index, 1);
    
    onSpecificationChange({
      ...specification,
      resource: {
        ...specification.resource,
        properties: updatedProperties
      }
    });
  };

  const handlePropertyChange = (index: number, field: keyof ResourceProperty, value: string | boolean) => {
    const updatedProperties = [...specification.resource.properties];
    updatedProperties[index] = {
      ...updatedProperties[index],
      [field]: value
    };
    
    onSpecificationChange({
      ...specification,
      resource: {
        ...specification.resource,
        properties: updatedProperties
      }
    });
  };

  const handleEndpointChange = (index: number, field: keyof Endpoint, value: any) => {
    const updatedEndpoints = [...specification.resource.endpoints];
    updatedEndpoints[index] = {
      ...updatedEndpoints[index],
      [field]: value
    };
    
    onSpecificationChange({
      ...specification,
      resource: {
        ...specification.resource,
        endpoints: updatedEndpoints
      }
    });
  };

  const handleFrameworkChange = (name: string) => {
    const languageMap: { [key: string]: string } = {
      express: 'javascript',
      fastapi: 'python',
      spring: 'java',
      laravel: 'php'
    };
    
    console.log(`Changing framework to: ${name}, language: ${languageMap[name]}`);
    
    // Create a new specification object to ensure React detects the change
    const updatedSpec = {
      ...specification,
      framework: {
        name,
        language: languageMap[name] || 'javascript'
      }
    };
    
    // Update the state through the parent component
    onSpecificationChange(updatedSpec);
  };

  const handleFeatureChange = (feature: keyof ApiSpecification['features'], value: boolean) => {
    onSpecificationChange({
      ...specification,
      features: {
        ...specification.features,
        [feature]: value
      }
    });
  };
  
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-background rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h2 className="font-semibold text-foreground">API Specification Builder</h2>
        <div className="flex items-center space-x-2">
          <button className="text-muted-foreground hover:text-foreground">
            <i className="ri-information-line"></i>
          </button>
          <button className="text-muted-foreground hover:text-foreground">
            <i className="ri-fullscreen-line"></i>
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="mb-6">
          <Label className="block text-foreground font-medium mb-2">API Resource Name</Label>
          <div className="flex">
            <Input 
              type="text" 
              className="flex-1"
              value={specification.resource.name}
              onChange={(e) => handleResourceNameChange(e.target.value)}
            />
            <Button variant="outline" className="ml-2">
              <i className="ri-refresh-line"></i>
            </Button>
          </div>
          <p className="text-muted-foreground text-sm mt-1">The main resource this API will manage</p>
        </div>

        <div className="mb-6">
          <Label className="block text-foreground font-medium mb-2">Resource Properties</Label>
          <div className="border border-input rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-dark-100">
                  <th className="py-2 px-3 text-left font-medium text-foreground">Name</th>
                  <th className="py-2 px-3 text-left font-medium text-foreground">Type</th>
                  <th className="py-2 px-3 text-left font-medium text-foreground">Required</th>
                  <th className="py-2 px-3 text-left font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {specification.resource.properties.map((property, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="py-2 px-3">{property.name}</td>
                    <td className="py-2 px-3">
                      <Select 
                        value={property.type} 
                        onValueChange={(value) => handlePropertyChange(index, 'type', value)}
                      >
                        <SelectTrigger className="border border-input rounded px-2 py-1 text-sm w-full">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">string</SelectItem>
                          <SelectItem value="number">number</SelectItem>
                          <SelectItem value="boolean">boolean</SelectItem>
                          <SelectItem value="object">object</SelectItem>
                          <SelectItem value="array">array</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 px-3">
                      <Checkbox 
                        className="rounded text-primary-600" 
                        checked={property.required}
                        onCheckedChange={(checked) => handlePropertyChange(index, 'required', !!checked)}
                      />
                    </td>
                    <td className="py-2 px-3">
                      <button className="text-dark-500 hover:text-dark-700 mr-1">
                        <i className="ri-edit-line"></i>
                      </button>
                      <button 
                        className="text-dark-500 hover:text-red-600"
                        onClick={() => handleRemoveProperty(index)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border p-2 bg-dark-50">
              <div className="flex gap-2">
                <Input 
                  className="text-sm flex-1"
                  placeholder="Property name"
                  value={newProperty.name}
                  onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                />
                <Select 
                  value={newProperty.type}
                  onValueChange={(value) => setNewProperty({...newProperty, type: value})}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">string</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                    <SelectItem value="boolean">boolean</SelectItem>
                    <SelectItem value="object">object</SelectItem>
                    <SelectItem value="array">array</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center">
                  <Checkbox 
                    id="property-required"
                    checked={newProperty.required}
                    onCheckedChange={(checked) => setNewProperty({...newProperty, required: !!checked})}
                    className="mr-2"
                  />
                  <Label htmlFor="property-required" className="text-sm">Required</Label>
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                  onClick={handleAddProperty}
                >
                  <i className="ri-add-line mr-1"></i> Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <Label className="block text-foreground font-medium mb-2">API Endpoints</Label>
          {specification.resource.endpoints.map((endpoint, index) => (
            <div key={index} className="bg-dark-100 p-3 rounded-md mb-3">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`${getMethodColor(endpoint.method)} px-2 py-0.5 rounded text-xs font-medium mr-2`}>
                      {endpoint.method}
                    </span>
                    <code className="text-foreground font-mono text-sm">{endpoint.path}</code>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">{endpoint.description}</p>
                </div>
                <div className="flex items-center">
                  <Checkbox 
                    className="rounded text-primary-600 mr-2" 
                    checked={true}
                    onCheckedChange={(checked) => {
                      // Since 'enabled' is not a property of Endpoint, we'll use this checkbox for toggling something else
                      // For now, let's just log the change
                      console.log(`Toggled endpoint ${index} to ${checked ? 'enabled' : 'disabled'}`);
                    }}
                  />
                  <button className="text-dark-500 hover:text-dark-700">
                    <i className="ri-settings-3-line"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
          <Button variant="link" className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium p-0">
            <i className="ri-add-line mr-1"></i> Add Custom Endpoint
          </Button>
        </div>

        <div className="mb-6">
          <Label className="block text-foreground font-medium mb-2">Framework Selection</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div 
              className={`framework-option border rounded-md p-3 flex flex-col items-center cursor-pointer ${specification.framework.name === 'express' ? 'selected' : 'border-border bg-background'}`}
              onClick={() => handleFrameworkChange('express')}
            >
              <img src="https://expressjs.com/images/express-facebook-share.png" alt="Express.js" className="h-10 object-contain mb-2" />
              <span className="text-sm font-medium text-foreground">Express.js</span>
              <span className="text-xs text-muted-foreground mt-1">Node.js</span>
            </div>
            <div 
              className={`framework-option border rounded-md p-3 flex flex-col items-center cursor-pointer ${specification.framework.name === 'fastapi' ? 'selected' : 'border-border bg-background'}`}
              onClick={() => handleFrameworkChange('fastapi')}
            >
              <img src="https://static-00.iconduck.com/assets.00/fastapi-icon-512x512-a7ggfxfw.png" alt="FastAPI" className="h-10 object-contain mb-2" />
              <span className="text-sm font-medium text-foreground">FastAPI</span>
              <span className="text-xs text-muted-foreground mt-1">Python</span>
            </div>
            <div 
              className={`framework-option border rounded-md p-3 flex flex-col items-center cursor-pointer ${specification.framework.name === 'spring' ? 'selected' : 'border-border bg-background'}`}
              onClick={() => handleFrameworkChange('spring')}
            >
              <img src="https://spring.io/img/spring.svg" alt="Spring Boot" className="h-10 object-contain mb-2" />
              <span className="text-sm font-medium text-foreground">Spring Boot</span>
              <span className="text-xs text-muted-foreground mt-1">Java</span>
            </div>
            <div 
              className={`framework-option border rounded-md p-3 flex flex-col items-center cursor-pointer ${specification.framework.name === 'laravel' ? 'selected' : 'border-border bg-background'}`}
              onClick={() => handleFrameworkChange('laravel')}
            >
              <img src="https://laravel.com/img/logomark.min.svg" alt="Laravel" className="h-10 object-contain mb-2" />
              <span className="text-sm font-medium text-foreground">Laravel</span>
              <span className="text-xs text-muted-foreground mt-1">PHP</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="block text-foreground font-medium mb-2">Additional Features</Label>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="feature-auth" 
                className="rounded text-primary-600 mr-2" 
                checked={specification.features.authentication}
                onCheckedChange={(checked) => handleFeatureChange('authentication', !!checked)}
              />
              <Label htmlFor="feature-auth" className="text-foreground">Authentication & Authorization</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="feature-docs" 
                className="rounded text-primary-600 mr-2" 
                checked={specification.features.documentation}
                onCheckedChange={(checked) => handleFeatureChange('documentation', !!checked)}
              />
              <Label htmlFor="feature-docs" className="text-foreground">API Documentation (Swagger/OpenAPI)</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="feature-validation" 
                className="rounded text-primary-600 mr-2" 
                checked={specification.features.validation}
                onCheckedChange={(checked) => handleFeatureChange('validation', !!checked)}
              />
              <Label htmlFor="feature-validation" className="text-foreground">Input Validation</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="feature-testing" 
                className="rounded text-primary-600 mr-2" 
                checked={specification.features.testing}
                onCheckedChange={(checked) => handleFeatureChange('testing', !!checked)}
              />
              <Label htmlFor="feature-testing" className="text-foreground">Automated Tests</Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="feature-docker" 
                className="rounded text-primary-600 mr-2" 
                checked={specification.features.docker}
                onCheckedChange={(checked) => handleFeatureChange('docker', !!checked)}
              />
              <Label htmlFor="feature-docker" className="text-foreground">Docker Configuration</Label>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button 
            className="bg-primary-600 hover:bg-primary-700 text-white flex items-center"
            onClick={() => {
              // Call onSave callback if provided
              console.log("Saved specification and moving to next step");
              if (onSave) onSave();
              if (onNextStep) onNextStep();
            }}
          >
            Save and Continue <i className="ri-arrow-right-line ml-2"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
