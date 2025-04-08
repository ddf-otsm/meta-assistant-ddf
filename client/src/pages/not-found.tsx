import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card.js';

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <Card className="w-[400px]">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <h1 className="text-2xl font-bold text-foreground">404 Page Not Found</h1>
            </div>

            <p className="text-base text-muted-foreground">
              Did you forget to add the page to the router?
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
