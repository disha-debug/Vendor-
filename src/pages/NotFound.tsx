import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="text-center max-w-md animate-in-fade">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted border border-border mb-6">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-6xl font-heading font-bold text-foreground mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-6">This page doesn’t exist or was moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary font-medium hover:underline underline-offset-4"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
