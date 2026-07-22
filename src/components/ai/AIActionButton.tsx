import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AIActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  label: string;
  isActive?: boolean;
}

export function AIActionButton({ icon: Icon, label, isActive, className, ...props }: AIActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "h-8 text-xs font-medium rounded-full justify-start border-purple-100 text-purple-700 hover:bg-purple-50 hover:text-purple-800 transition-colors",
        isActive && "bg-purple-100 border-purple-200 text-purple-900",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3.5 h-3.5 mr-1.5" />}
      {label}
    </Button>
  );
}
