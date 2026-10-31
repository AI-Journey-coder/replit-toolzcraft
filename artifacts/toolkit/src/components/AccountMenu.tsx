import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { UserRound } from "lucide-react";
export function AccountMenu() {
  const { user, configured, loading, signOut } = useAuth();
  const [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (!configured || loading) return null;
  if (!user)
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
    );
  const logout = async () => {
    setBusy(true);
    setError("");
    try {
      await signOut();
      setConfirm(false);
    } catch {
      setError("Could not sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" aria-label="Open account menu">
            <UserRound className="h-4 w-4" />
            <span className="max-w-32 truncate">
              {user.displayName || "My account"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/profile">My profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-tools">Favourites & preferences</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/subscriptions">Subscription & credits</Link>
          </DropdownMenuItem>
          {user.role === "admin" && (
            <DropdownMenuItem asChild>
              <Link href="/admin">Admin dashboard</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirm(true)}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog
        open={confirm}
        onOpenChange={(v) => {
          if (!busy) setConfirm(v);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of ToolzCraft?</AlertDialogTitle>
            <AlertDialogDescription>
              You can sign in again anytime. Your subscription and credits stay
              with your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p role="alert">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              Stay signed in
            </AlertDialogCancel>
            <Button disabled={busy} onClick={() => void logout()}>
              {busy ? "Signing out…" : "Confirm sign out"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
