import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api, setAuth } from "@/lib/api";
import { signupSchema } from "@/lib/validation";

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const result = signupSchema.safeParse({ username, email, password });
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
  
    try {
      const data = await api.signup({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      
      setAuth(data.user_id, data.token);
      
      toast({
        title: "Hero Created!",
        description: "Your adventure begins now.",
        className: "bg-emerald/10 border-emerald text-foreground",
      });
      
      navigate("/profile");
    } catch (error) {
      toast({
        title: "Hero Creation Failed",
        description: "Could not create account. Username may be taken.",
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
              <Sparkles className="w-16 h-16 text-emerald" />
              <div className="absolute inset-0 w-16 h-16 bg-emerald/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-pixel text-gold text-center mb-8 leading-relaxed text-glow">
            Create Your Hero
          </h1>

          <form onSubmit={handleSignup} className="space-y-6">
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
              <Label htmlFor="email" className="text-foreground font-pixel text-xs mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-input border-border text-foreground font-pixel text-sm pixel-border focus:pixel-border-gold transition-all ${
                  errors.email ? 'border-destructive' : ''
                }`}
                placeholder="hero@dungeon.com"
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1 font-pixel">{errors.email}</p>
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
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="text-destructive text-xs mt-1 font-pixel">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald hover:bg-emerald-glow text-background font-pixel py-6 glow-emerald hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Begin Quest'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              disabled={isLoading}
              className="text-gold hover:text-gold-glow text-xs font-pixel transition-colors hover:underline"
            >
              Already a Hero?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
