import { createContext, useContext, useState, ReactNode } from 'react';

import {
  ApiSpecification,
  ProjectStep,
  ResourceDefinition,
  FrameworkDefinition,
  FeatureOptions,
  Message,
} from '@shared/schema';

// Default resource definition
const defaultResource: ResourceDefinition = {
  name: 'UserProfile',
  path: 'userProfiles',
  properties: [
    { name: 'id', type: 'string', required: true },
    { name: 'username', type: 'string', required: true },
    { name: 'email', type: 'string', required: true },
    { name: 'isActive', type: 'boolean', required: false },
  ],
  endpoints: [
    {
      method: 'GET',
      path: '/api/userProfiles',
      description: 'List all user profiles',
      pagination: true,
      filtering: true,
    },
    { method: 'GET', path: '/api/userProfiles/:id', description: 'Get a single user profile' },
    { method: 'POST', path: '/api/userProfiles', description: 'Create a new user profile' },
    {
      method: 'PUT',
      path: '/api/userProfiles/:id',
      description: 'Update an existing user profile',
    },
    { method: 'DELETE', path: '/api/userProfiles/:id', description: 'Delete a user profile' },
  ],
};

// Default framework definition
const defaultFramework: FrameworkDefinition = {
  name: 'express',
  language: 'javascript',
};

// Default feature options
const defaultFeatures: FeatureOptions = {
  authentication: true,
  documentation: true,
  validation: true,
  testing: false,
  docker: false,
};

// Default specification
const defaultSpecification: ApiSpecification = {
  resource: defaultResource,
  framework: defaultFramework,
  features: defaultFeatures,
};

// Default workflow steps
const defaultWorkflowSteps: ProjectStep[] = [
  'concept',
  'model',
  'template',
  'specification',
  'generate',
  'test',
];

interface ProjectContextProps {
  currentStep: ProjectStep;
  setCurrentStep: (step: ProjectStep) => void;
  steps: ProjectStep[];
  specification: ApiSpecification;
  updateSpecification: (spec: ApiSpecification) => void;
  updateResource: (resource: ResourceDefinition) => void;
  updateFramework: (framework: FrameworkDefinition) => void;
  updateFeatures: (features: FeatureOptions) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  // Workflow state
  const [currentStep, setCurrentStep] = useState<ProjectStep>('specification');
  const [steps] = useState<ProjectStep[]>(defaultWorkflowSteps);

  // Specification state
  const [specification, setSpecification] = useState<ApiSpecification>(defaultSpecification);

  // AI conversation state
  const [messages, setMessages] = useState<Message[]>([]);

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update the entire specification
  const updateSpecification = (spec: ApiSpecification) => {
    setSpecification(spec);
  };

  // Update just the resource part of the specification
  const updateResource = (resource: ResourceDefinition) => {
    setSpecification({
      ...specification,
      resource,
    });
  };

  // Update just the framework part of the specification
  const updateFramework = (framework: FrameworkDefinition) => {
    setSpecification({
      ...specification,
      framework,
    });
  };

  // Update just the features part of the specification
  const updateFeatures = (features: FeatureOptions) => {
    setSpecification({
      ...specification,
      features,
    });
  };

  // Add a new message to the conversation
  const addMessage = (message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const value = {
    currentStep,
    setCurrentStep,
    steps,
    specification,
    updateSpecification,
    updateResource,
    updateFramework,
    updateFeatures,
    messages,
    setMessages,
    addMessage,
    isGenerating,
    setIsGenerating,
    isSaving,
    setIsSaving,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
