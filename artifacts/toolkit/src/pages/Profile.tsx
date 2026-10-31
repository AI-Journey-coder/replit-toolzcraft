import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export function Profile() {
  const { user, loading, error } = useAuth();
  if (loading) return <p role="status">Loading your profile…</p>;
  if (!user)
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || "Sign in to see your account details."}</p>
          <Button asChild className="mt-4">
            <Link href="/login">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>My profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid gap-4">
          {[
            ["Name", user.displayName || "Not provided"],
            ["Email", user.email || "Not provided"],
            ["Mobile number", user.phoneNumber || "Not linked"],
            [
              "Account access",
              user.role === "admin" ? "Administrator" : "Member",
            ],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="font-medium break-words">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">
          These details come from your sign-in account. Manage currency, dates
          and favourites in preferences.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/my-tools">Preferences</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/subscriptions">Subscription & credits</Link>
          </Button>
          {user.role === "admin" && (
            <Button variant="outline" asChild>
              <Link href="/admin">Admin dashboard</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
