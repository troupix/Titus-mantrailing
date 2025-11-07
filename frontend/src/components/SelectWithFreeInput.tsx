import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface SelectWithFreeInputProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  freeInputPlaceholder?: string;
  id?: string;
}

export function SelectWithFreeInput({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  freeInputPlaceholder = "Enter manually",
  id,
}: SelectWithFreeInputProps) {
  const [isFreeInput, setIsFreeInput] = useState(false);

  // Effect to handle external value changes that might switch between free input and select
  useEffect(() => {
    // If the current value is not among the options, it's likely a free input
    const isOptionSelected = options.some(option => option.value === value);
    setIsFreeInput(!isOptionSelected && value !== "");
  }, [value, options]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "free-input-option") {
      setIsFreeInput(true);
      onChange(""); // Clear value when switching to free input
    } else {
      setIsFreeInput(false);
      onChange(selectedValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {isFreeInput ? (
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={freeInputPlaceholder}
          onBlur={() => {
            // If the user blurs and the input is empty, switch back to select
            if (!value) setIsFreeInput(false);
          }}
        />
      ) : (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="free-input-option">
              Autre (saisir manuellement)
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}