
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  const [open, setOpen] = React.useState(false)
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

  // This function ensures we properly handle the selection
  const handleSelect = (currentValue: string) => {
    console.log("Handle select called with:", currentValue);
    const selectedOption = safeOptions.find((option) => option.value === currentValue);
    if (selectedOption) {
      console.log("Found matching option:", selectedOption);
      onValueChange(currentValue);
      setOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background"
          onClick={() => setOpen(!open)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-50" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    console.log("CommandItem onSelect with:", currentValue);
                    console.log("Selected option:", option);
                    handleSelect(option.value);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
