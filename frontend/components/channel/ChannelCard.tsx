import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Hash, User, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ChannelCardProps {
  channelName: string;
  channelDescription: string;
  createdAt: string;
  adminName: string;
  adminAvatar?: string;
}

export default function ChannelCard({
  channelName,
  channelDescription,
  createdAt,
  adminName,
  adminAvatar,
}: ChannelCardProps) {
  return (
    <Card className="w-full max-w-md border border-border shadow-sm hover:shadow-lg transition-all duration-200 bg-card">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Hash className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-lg font-semibold text-card-foreground truncate">
          {channelName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {channelDescription}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">
            {createdAt}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-card-foreground font-medium">{adminName}</span>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
              Admin
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
        >
          Join Channel
        </Button>
      </CardFooter>
    </Card>
  );
}