import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LiquidBackground } from "@/components/LiquidBackground";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <LiquidBackground complexity="low" interactive={true} pointerInjection={false} resolutionScale={0.5}>
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-3xl p-12 text-center space-y-6 max-w-md">
          <h1 className="text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent">404</h1>
          <h2 className="text-3xl font-bold">Page Not Found</h2>
          <p className="text-lg text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild className="btn-glow">
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </a>
            </Button>
            <Button asChild variant="outline" className="glass-button">
              <a href="/buyer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Browse Products
              </a>
            </Button>
          </div>
        </div>
      </div>
    </LiquidBackground>
  );
};

export default NotFound;
