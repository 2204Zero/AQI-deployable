import { Wind } from "lucide-react";
import { ESP32Status } from "./ESP32Status";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/90 border-b border-border shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-pulse-glow rounded-full p-2 bg-gradient-to-br from-primary to-accent">
              <Wind className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gradient">Air Quality Monitoring System</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ESP32Status />
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm bg-muted/50 px-4 py-2 rounded-full border border-border">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}</span>
                  {isAdmin && <span className="text-xs bg-primary/20 px-2 py-0.5 rounded-full">Admin</span>}
                </div>
                <Button variant="outline" size="sm" onClick={signOut} className="shadow-sm hover:shadow-md transition-shadow">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="shadow-sm hover:shadow-md transition-shadow">
                Sign In
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
