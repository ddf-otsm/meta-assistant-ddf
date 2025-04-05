import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';

import MainLayout from '@/components/layouts/MainLayout.js';
import { Toaster } from '@/components/ui/toaster.js';
import Dashboard from '@/pages/dashboard.js';
import NotFound from '@/pages/not-found.js';
import Project from '@/pages/project.js';

import { queryClient } from './lib/queryClient.js';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/project/:id" component={Project} />
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </MainLayout>
    </QueryClientProvider>
  );
}

export default App;
