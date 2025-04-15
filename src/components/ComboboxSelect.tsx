
import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"

interface ComboboxSelectProps {
  options: { label: string; value: string }[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
}

export const ComboboxSelect = ({
  options = [], // Provide default empty array
  value,
  onValueChange,
  placeholder = "Select an option",
  emptyText = "No results found"
}: ComboboxSelectProps) => {
  const [searchQuery, setSearchQuery] = React.useState("")
  
  // Make sure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];
  
  // Filter options based on search query
  const filteredOptions = safeOptions.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Find the selected option for display
  const selectedOption = safeOptions.find((option) => option.value === value)
  
  // Debug for troubleshooting
  React.useEffect(() => {
    console.log("ComboboxSelect - value:", value);
    console.log("ComboboxSelect - selectedOption:", selectedOption);
    console.log("ComboboxSelect - options count:", safeOptions.length);
  }, [value, selectedOption, safeOptions]);

  // This function handles the selection of an option
  const handleSelect = (currentValue: string) => {
    console.log("Handle select called with:", currentValue);
    const selectedOption = safeOptions.find((option) => option.value === currentValue);
    if (selectedOption) {
      console.log("Found matching option:", selectedOption);
      onValueChange(currentValue);
      setSearchQuery("");
    }
  };

  return (
    <div className="relative w-full">
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
      {searchQuery && (
        <div className="absolute top-full left-0 w-full z-50 mt-1 bg-white border border-input rounded-md shadow-md">
          <Command>
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => {
                        console.log("CommandItem onSelect with option:", option);
                        handleSelect(option.value);
                      }}
                      className="cursor-pointer hover:bg-accent"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))
                ) : null}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
      
      {selectedOption && !searchQuery && (
        <div className="mt-2 text-sm">
          Selected: <span className="font-medium">{selectedOption.label}</span>
        </div>
      )}
    </div>
  )
}
