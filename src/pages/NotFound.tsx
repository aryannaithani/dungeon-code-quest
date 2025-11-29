import { Link } from "react-router-dom";
import { Skull, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto bg-card pixel-border-gold rounded-lg flex items-center justify-center">
            <Skull className="w-16 h-16 text-gold animate-pulse" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <span className="text-6xl font-pixel text-gold text-glow">404</span>
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-pixel text-gold mb-4 leading-relaxed">
          Lost in the Dungeon
        </h1>
        
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The path you seek does not exist in this realm.
          <br />
          Perhaps you took a wrong turn in the maze?
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            className="bg-gold hover:bg-gold-glow text-background font-pixel glow-gold"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-gold text-gold hover:bg-gold hover:text-background font-pixel"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
