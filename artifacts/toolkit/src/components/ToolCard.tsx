import { Link } from "wouter";
import { Tool } from "@/lib/tools-registry";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;
  return (
    <Link href={`/tools/${tool.slug}`}>
      <Card className="h-full hover:border-primary hover:shadow-sm transition-all cursor-pointer group bg-card">
        <CardHeader className="pb-3 flex flex-row items-start space-y-0 gap-3">
          <div className="bg-primary/10 p-2 rounded-md text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <CardTitle className="text-base">{tool.name}</CardTitle>
            <CardDescription className="text-xs line-clamp-2">{tool.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex justify-end">
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </CardContent>
      </Card>
    </Link>
  );
}
