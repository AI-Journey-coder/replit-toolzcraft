import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[40vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold">Page not found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            This address does not match a page. <Link href="/" className="underline">Browse tools from the homepage</Link> or use the search above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
