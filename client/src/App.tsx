import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';

import { queryClient } from './lib/queryClient';

import MainLayout from '@/components/layouts/MainLayout';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/pages/dashboard';
import NotFound from '@/pages/not-found';
import Project from '@/pages/project';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects/:id" component={Project} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Router />
      </MainLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
