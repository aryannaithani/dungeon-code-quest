import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Signup failed");
      }
  
      const data = await response.json();
  
      // Save token (for future authenticated routes)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_id", data.user_id.toString());
  
      // Navigate to profile
      navigate("/profile");
  
    } catch (err) {
      console.error(err);
      toast({
        title: "✨ Hero Creation Failed",
        description: "Signup failed. Try again.",
        variant: "destructive",
      });
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card p-8 pixel-border-gold glow-gold">
          <div className="flex justify-center mb-6">
            <Sparkles className="w-16 h-16 text-emerald" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-pixel text-gold text-center mb-8 leading-relaxed">
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
                className="bg-input border-border text-foreground font-pixel text-sm pixel-border"
                placeholder="hero_name"
              />
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
                className="bg-input border-border text-foreground font-pixel text-sm pixel-border"
                placeholder="hero@dungeon.com"
              />
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
                className="bg-input border-border text-foreground font-pixel text-sm pixel-border"
                placeholder="********"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-emerald hover:bg-emerald-glow text-background font-pixel py-6 glow-emerald hover:scale-105 transition-all"
            >
              Begin Quest
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-gold hover:text-gold-glow text-xs font-pixel transition-colors"
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
