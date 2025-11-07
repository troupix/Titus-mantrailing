import * as React from "react";
import { X, Check, ChevronDown } from "lucide-react";

import { Badge } from "./badge";
import { Command, CommandGroup, CommandItem } from "./command";
import { CommandInput } from "cmdk";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (itemValue: string) => {
    const isSelected = value.includes(itemValue);
    if (isSelected) {
      onChange(value.filter((item) => item !== itemValue));
    } else {
      onChange([...value, itemValue]);
    }
  };

  const handleRemove = (itemValue: string) => {
    onChange(value.filter((item) => item !== itemValue));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${
            value.length > 0 ? "h-auto min-h-10" : "h-10"
          } ${className}`}
          onClick={() => setOpen(!open)}
        >
          <div className="flex flex-wrap gap-1">
            {value.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              value.map((itemValue) => {
                const option = options.find((o) => o.value === itemValue);
                return (
                  <Badge
                    key={itemValue}
                    variant="secondary"
                    className="flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent popover from closing
                      handleRemove(itemValue);
                    }}
                  >
                    {option?.label}
                    <X className="h-3 w-3 cursor-pointer" />
                  </Badge>
                );
              })
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search options..." />
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
                className="flex items-center justify-between"
              >
                {option.label}
                {value.includes(option.value) && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}