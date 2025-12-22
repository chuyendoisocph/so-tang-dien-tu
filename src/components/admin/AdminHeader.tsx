import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  gradient?: boolean;
}

export const AdminHeader = ({ 
  title, 
  description, 
  action, 
  gradient = true 
}: AdminHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className={`text-3xl font-bold ${
          gradient 
            ? "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent" 
            : "text-foreground"
        }`}>
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && (
        <div className="w-full sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
};