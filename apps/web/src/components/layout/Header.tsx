import { useState } from "react";
import { useTheme } from "@/lib/theme";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "../ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState("");
  const { data } = useSession();
  const user = data?.user;

  const handleSignout = () => {
    signOut();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="relative hidden flex-1 items-center md:flex">
        <svg
          className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m21 21-4.3-4.3" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search runs, projects, incidents…"
          className="h-8 w-full max-w-sm rounded-md border border-border bg-muted/40 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked: boolean) =>
          setTheme(checked ? "dark" : "light")
        }
      />

      <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={user?.image || ""} alt={user?.name} />
                <AvatarFallback className="bg-foreground text-background text-xs font-semibold">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-bold">{user?.name}</span>
                <span className="text-xs text-accent-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleSignout}
              className="text-destructive focus:text-destructive"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
