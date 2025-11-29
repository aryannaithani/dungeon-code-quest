import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sword, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, setAuth } from "@/lib/api";
import { loginSchema } from "@/lib/validation";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
  
    try {
      const data = await api.login({ username: username.trim(), password });
      setAuth(data.user_id, data.token);
      
      toast({
        title: "Welcome Back, Hero!",
        description: "You have successfully entered the dungeon.",
        className: "bg-emerald/10 border-emerald text-foreground",
      });
      
      navigate("/profile");
    } catch (error) {
      toast({
        title: "Quest Failed",
        description: "Invalid username or password. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-card p-8 pixel-border-gold glow-gold">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Sword className="w-16 h-16 text-gold" />
              <div className="absolute inset-0 w-16 h-16 bg-gold/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-pixel text-gold text-center mb-8 leading-relaxed text-glow">
            Welcome Back Hero
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-foreground font-pixel text-xs mb-2 block">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`bg-input border-border text-foreground font-pixel text-sm pixel-border focus:pixel-border-gold transition-all ${
                  errors.username ? 'border-destructive' : ''
                }`}
                placeholder="hero_name"
                disabled={isLoading}
                autoComplete="username"
              />
              {errors.username && (
                <p className="text-destructive text-xs mt-1 font-pixel">{errors.username}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground font-pixel text-xs mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-input border-border text-foreground font-pixel text-sm pixel-border focus:pixel-border-gold transition-all ${
                  errors.password ? 'border-destructive' : ''
                }`}
                placeholder="********"
                disabled={isLoading}
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-destructive text-xs mt-1 font-pixel">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-gold-glow text-background font-pixel py-6 glow-gold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entering...
                </>
              ) : (
                'Enter Dungeon'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/signup")}
              disabled={isLoading}
              className="text-emerald hover:text-emerald-glow text-xs font-pixel transition-colors hover:underline"
            >
              Create New Hero
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
