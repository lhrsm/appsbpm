import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useNavigationState } from "@/hooks/useNavigationState";


const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsNavigating } = useNavigationState();

  useEffect(() => {
    setIsNavigating(false);
  }, [setIsNavigating]);


  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <button 
          onClick={() => {
            setIsNavigating(true, 'Voltando ao início...');
            setTimeout(() => {
              navigate('/');
              setTimeout(() => setIsNavigating(false), 300);
            }, 100);
          }} 
          className="text-primary underline hover:text-primary/90 border-0 bg-transparent cursor-pointer"
        >
          Return to Home
        </button>

      </div>
    </div>
  );
};

export default NotFound;
