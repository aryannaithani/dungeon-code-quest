import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sword } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Invalid login");
      }
  
      const data = await response.json();
  
      // Save token + user ID for future authenticated routes
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_id", data.user_id.toString());
  
      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("Login failed. Check your username or password.");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card p-8 pixel-border-gold glow-gold">
          <div className="flex justify-center mb-6">
            <Sword className="w-16 h-16 text-gold" />
          </div>
          
          <h1 className="text-2xl md:text-3xl font-pixel text-gold text-center mb-8 leading-relaxed">
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
                className="bg-input border-border text-foreground font-pixel text-sm pixel-border"
                placeholder="hero_name"
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
              className="w-full bg-gold hover:bg-gold-glow text-background font-pixel py-6 glow-gold hover:scale-105 transition-all"
            >
              Enter Dungeon
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/signup")}
              className="text-emerald hover:text-emerald-glow text-xs font-pixel transition-colors"
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
