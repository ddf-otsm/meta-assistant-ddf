import { useState, useEffect } from 'react';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';

import { Button } from '@/components/ui/button';
import AIAssistant from '@/components/workspace/AIAssistant';
import MetadataViewer from '@/components/workspace/MetadataViewer';
import ModelBuilder from '@/components/workspace/ModelBuilder';
import WorkflowSteps from '@/components/workspace/WorkflowSteps';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

import {
  Project,
  ModelDefinition,
  AiConversation,
  GeneratedCode,
  ApiSpecification,
  ProjectStep,
  Message,
} from '@shared/schema';

export default function ProjectPage() {
  const [, params] = useRoute<{ id: string }>('/projects/:id');
  const projectId = parseInt(params?.id || '1');
  const { toast } = useToast();

  // State for the current workflow step
  const [currentStep, setCurrentStep] = useState<ProjectStep>('specification');
  const steps: ProjectStep[] = [
    'concept',
    'patterns',
    'metamodel',
    'specification',
    'generate',
    'test',
  ];

  // State for the API specification
  const [specification, setSpecification] = useState<ApiSpecification>({
    resource: {
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
    },
    framework: {
      name: 'express',
      language: 'javascript',
    },
    features: {
      authentication: true,
      documentation: true,
      validation: true,
      testing: false,
      docker: false,
    },
  });

  // State for AI messages
  const [messages, setMessages] = useState<Message[]>([]);

  // State for generated code files
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedCode[]>([]);

  // Fetch project details
  const { data: project, isLoading: isLoadingProject } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
  });

  // Fetch model definitions for this project
  const { data: models, isLoading: isLoadingModels } = useQuery<ModelDefinition[]>({
    queryKey: [`/api/projects/${projectId}/models`],
  });

  // Fetch AI conversation for this project
  const { data: conversation, isLoading: isLoadingConversation } = useQuery<AiConversation>({
    queryKey: [`/api/projects/${projectId}/conversation`],
  });

  // Fetch generated code files
  const { data: generatedCodeFiles, isLoading: isLoadingGeneratedCode } = useQuery<GeneratedCode[]>(
    {
      queryKey: [`/api/projects/${projectId}/generated`],
    }
  );

  // Update state when data is loaded
  useEffect(() => {
    if (models && models.length > 0) {
      // Use the first model's definition as the current specification
      setSpecification(models[0].definition as ApiSpecification);
    }

    if (conversation && conversation.messages) {
      // The messages are stored as a JSON object in the database, so we need to parse it
      const conversationMessages = conversation.messages as unknown as Message[];
      if (Array.isArray(conversationMessages)) {
        setMessages(conversationMessages);
      }
    }

    if (generatedCodeFiles) {
      setGeneratedFiles(generatedCodeFiles);
    }
  }, [models, conversation, generatedCodeFiles]);

  // Update model definition mutation
  const updateModel = useMutation({
    mutationFn: async (modelData: { id: number; definition: ApiSpecification }) => {
      const res = await apiRequest('PUT', `/api/models/${modelData.id}`, {
        definition: modelData.definition,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/models`] });
      toast({
        title: 'Saved',
        description: 'Your model definition has been updated',
      });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to save model definition',
        variant: 'destructive',
      });
      console.error('Model update error:', error);
    },
  });

  // Create new model definition if none exists
  const createModel = useMutation({
    mutationFn: async (modelData: {
      name: string;
      projectId: number;
      definition: ApiSpecification;
    }) => {
      const res = await apiRequest('POST', '/api/models', modelData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/models`] });
      toast({
        title: 'Model Created',
        description: 'Your new model definition has been created',
      });
    },
    onError: error => {
      toast({
        title: 'Error',
        description: 'Failed to create model definition',
        variant: 'destructive',
      });
      console.error('Model creation error:', error);
    },
  });

  // Handle save button click
  const handleSave = async () => {
    if (models && models.length > 0) {
      // Update existing model
      updateModel.mutate({ id: models[0].id, definition: specification });
    } else {
      // Create new model
      createModel.mutate({
        name: `${specification.resource.name}API`,
        projectId,
        definition: specification,
      });
    }
  };

  // Handle specification changes
  const handleSpecificationChange = (newSpec: ApiSpecification) => {
    setSpecification(newSpec);
  };

  // Handle messages update
  const handleMessagesUpdate = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  // Handle code generation result
  const handleCodeGenerated = (files: GeneratedCode[]) => {
    setGeneratedFiles(files);
    // Move to the next step
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const isLoading =
    isLoadingProject || isLoadingModels || isLoadingConversation || isLoadingGeneratedCode;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-primary-600 mb-3"></i>
          <p className="text-dark-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">
            {project?.name || 'Meta-API Generator'}
          </h1>
          <p className="text-dark-500">
            {project?.description ||
              'Build a generator that creates API endpoints from specifications'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handleSave}
            disabled={updateModel.isPending || createModel.isPending}
          >
            {updateModel.isPending || createModel.isPending ? (
              <i className="ri-loader-4-line animate-spin mr-2"></i>
            ) : (
              <i className="ri-save-line mr-2"></i>
            )}
            Save
          </Button>
          <Button
            className="flex items-center bg-primary-600 hover:bg-primary-700"
            onClick={() => {
              // Move to the generate step
              setCurrentStep('generate');
            }}
          >
            <i className="ri-play-line mr-2"></i> Generate
          </Button>
        </div>
      </div>

      <WorkflowSteps steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ModelBuilder
            specification={specification}
            onSpecificationChange={handleSpecificationChange}
            onSave={handleSave}
            onNextStep={() => {
              // Move to the next step in the workflow
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex < steps.length - 1) {
                setCurrentStep(steps[currentIndex + 1]);
              }
            }}
          />
        </div>

        <div className="lg:col-span-1">
          <AIAssistant
            projectId={projectId}
            messages={messages}
            onMessagesUpdate={handleMessagesUpdate}
          />

          <MetadataViewer
            projectId={projectId}
            modelId={models && models.length > 0 ? models[0].id : 0}
            specification={specification}
            generatedFiles={generatedFiles}
            onCodeGenerated={handleCodeGenerated}
          />
        </div>
      </div>
    </div>
  );
}
