import { QueryClientProvider } from '@tanstack/react-query';
import { Switch, Route } from 'wouter';

import MainLayout from '@/components/layouts/MainLayout';
import { Toaster } from '@/components/ui/toaster';
import Dashboard from '@/pages/dashboard';
import NotFound from '@/pages/not-found';
import Project from '@/pages/project';
import { ThemeProvider } from '@/contexts/ThemeContext';

import { queryClient } from './lib/queryClient';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/project/:id" component={Project} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MainLayout>
          <Router />
        </MainLayout>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
