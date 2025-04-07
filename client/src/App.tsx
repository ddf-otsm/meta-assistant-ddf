import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/dashboard";
import Project from "./pages/project";
import MainLayout from "./components/layouts/MainLayout";
import { ThemeProvider } from "./contexts/ThemeContext";

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
