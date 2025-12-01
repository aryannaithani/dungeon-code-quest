import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { api, type LeaderboardEntry } from "@/lib/api";
import { LeaderboardSkeleton } from "@/components/LoadingSkeleton";

const USERS_PER_PAGE = 10;
const MAX_USERS = 100;

const Leaderboard = () => {
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getLeaderboard();
        // Limit to top 100 users
        setPlayers(data.slice(0, MAX_USERS));
      } catch (err) {
        toast({
          title: "Hall of Fame Error",
          description: "Failed to load leaderboard. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-gold animate-pulse" />;
      case 2:
        return <Trophy className="w-6 h-6 text-muted-foreground" />;
      case 3:
        return <Medal className="w-6 h-6 text-emerald" />;
      default:
        return <span className="text-lg font-pixel text-muted-foreground">{rank}</span>;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "pixel-border-gold glow-gold bg-gold/5";
      case 2:
        return "pixel-border hover:glow-gold bg-card";
      case 3:
        return "pixel-border hover:glow-emerald bg-card";
      default:
        return "pixel-border bg-card";
    }
  };

  const totalPages = Math.ceil(players.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const currentPlayers = players.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-8 text-center leading-relaxed text-glow">
            Hall of Fame
          </h1>
          <LeaderboardSkeleton />
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-8 leading-relaxed text-glow">
            Hall of Fame
          </h1>
          <div className="py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground font-pixel">
              No heroes have claimed their glory yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-pixel text-gold mb-2 text-center leading-relaxed text-glow">
          Hall of Fame
        </h1>
        <p className="text-center text-muted-foreground font-pixel text-xs mb-8">
          Top {Math.min(players.length, MAX_USERS)} Heroes
        </p>

        <div className="space-y-3">
          {currentPlayers.map((player, index) => (
            <Card
              key={player.rank}
              className={`p-4 md:p-6 transition-all duration-300 hover:scale-[1.02] ${getRankClass(player.rank)}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 flex justify-center">
                  {getRankIcon(player.rank)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-base md:text-lg font-pixel text-foreground truncate">
                      {player.username}
                    </h3>
                    <Badge className="bg-emerald text-background font-pixel text-xs shrink-0">
                      {player.title}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="font-pixel">Lvl {player.level}</span>
                    <span className="font-pixel">{player.xp.toLocaleString()} XP</span>
                  </div>
                </div>

                {player.rank <= 3 && (
                  <div className="hidden md:block">
                    <Badge
                      variant="outline"
                      className={`font-pixel text-xs ${
                        player.rank === 1
                          ? "border-gold text-gold"
                          : player.rank === 2
                          ? "border-muted-foreground text-muted-foreground"
                          : "border-emerald text-emerald"
                      }`}
                    >
                      Top {player.rank}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="font-pixel text-xs pixel-border hover:pixel-border-gold"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, idx) => (
                typeof page === 'number' ? (
                  <Button
                    key={idx}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className={`font-pixel text-xs min-w-[36px] ${
                      currentPage === page 
                        ? "bg-gold text-background hover:bg-gold/90" 
                        : "pixel-border hover:pixel-border-gold"
                    }`}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={idx} className="px-2 text-muted-foreground font-pixel text-xs">
                    {page}
                  </span>
                )
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="font-pixel text-xs pixel-border hover:pixel-border-gold"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Page info */}
        {totalPages > 1 && (
          <p className="text-center text-muted-foreground font-pixel text-xs mt-4">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
