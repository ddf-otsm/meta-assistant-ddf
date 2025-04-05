import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Project } from "@shared/schema";

// Project creation form schema
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  userId: z.number()
});

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Fetch all projects
  const { data: projects, isLoading, isError } = useQuery<Project[]>({ 
    queryKey: ['/api/projects'], 
  });
  
  // Create project form
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      userId: 1 // Using the demo user ID
    }
  });
  
  // Create project mutation
  const createProject = useMutation({
    mutationFn: async (values: z.infer<typeof projectSchema>) => {
      const res = await apiRequest("POST", "/api/projects", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Project created",
        description: "Your new project has been created successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
      console.error("Project creation error:", error);
    }
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    createProject.mutate(values);
  };
  
  const handleProjectClick = (projectId: number) => {
    setLocation(`/projects/${projectId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Dashboard</h1>
          <p className="text-dark-500 mt-1">Manage your meta-engineering projects</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <i className="ri-add-line mr-2"></i> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new meta-engineering project to start building software generators.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My API Generator" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Build a generator that creates API endpoints from specifications" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    className="bg-primary-600 hover:bg-primary-700"
                    disabled={createProject.isPending}
                  >
                    {createProject.isPending ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Creating...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <i className="ri-loader-4-line animate-spin text-3xl text-primary-600 mb-2"></i>
            <p className="text-dark-500">Loading projects...</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <i className="ri-error-warning-line text-3xl text-red-500 mb-2"></i>
            <p className="text-dark-700 font-medium">Failed to load projects</p>
            <p className="text-dark-500 mt-1">Please try refreshing the page</p>
          </div>
        </div>
      )}

      {!isLoading && !isError && projects?.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-dark-100 inline-block p-5 rounded-full mb-4">
            <i className="ri-code-box-line text-4xl text-dark-400"></i>
          </div>
          <h2 className="text-xl font-semibold text-dark-800 mb-2">No projects yet</h2>
          <p className="text-dark-500 max-w-md mx-auto mb-6">
            Start by creating your first meta-engineering project to build software generators.
          </p>
          <Button 
            className="bg-primary-600 hover:bg-primary-700"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <i className="ri-add-line mr-2"></i> Create First Project
          </Button>
        </div>
      )}

      {!isLoading && !isError && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader 
                className="bg-primary-50 border-b border-primary-100" 
                onClick={() => handleProjectClick(project.id)}
              >
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>Created on {new Date(project.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4" onClick={() => handleProjectClick(project.id)}>
                <p className="text-dark-600 text-sm">
                  {project.description || "No description provided"}
                </p>
              </CardContent>
              <CardFooter className="border-t border-dark-100 pt-3 flex justify-between">
                <Button variant="ghost" size="sm" onClick={(e) => {
                  e.stopPropagation();
                  handleProjectClick(project.id);
                }}>
                  <i className="ri-eye-line mr-1"></i> Open
                </Button>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <i className="ri-edit-line"></i>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <i className="ri-delete-bin-line"></i>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
