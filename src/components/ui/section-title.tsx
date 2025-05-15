
import React from "react";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
  subtitle?: string;
}

export function SectionTitle({ 
  children, 
  className, 
  subtitle 
}: SectionTitleProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent inline-block">
        {children}
      </h2>
      {subtitle && (
        <p className="text-gray-500 mt-2 text-lg">
          {subtitle}
        </p>
      )}
      <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 mt-2 rounded-full"></div>
    </div>
  );
}
