// Simple test component to verify the build process is working
import { Button } from '@/components/ui/button';

export function TestComponent() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-primary">TrakNor CMMS</h1>
      <p className="text-muted-foreground">Testing basic functionality</p>
      <Button className="mt-4">Test Button</Button>
    </div>
  );
}