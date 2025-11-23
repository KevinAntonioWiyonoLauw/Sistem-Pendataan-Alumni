'use client'
import React, { useCallback, useState, forwardRef, useEffect } from 'react'

// shadcn
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// utils
import { cn } from '@/lib/utils'

// assets
import { ChevronDown, CheckIcon, Globe } from 'lucide-react'
import { CircleFlag } from 'react-circle-flags'

// data
import { countries } from 'country-data-list'

// Country interface
export interface Country {
  alpha2: string
  alpha3: string
  countryCallingCodes: string[]
  currencies: string[]
  emoji?: string
  ioc: string
  languages: string[]
  name: string
  status: string
}

// Dropdown props
interface CountryDropdownProps {
  options?: Country[]
  onChange?: (country: Country) => void
  defaultValue?: string
  disabled?: boolean
  placeholder?: string
  slim?: boolean
  className?: string
}

const CountryDropdownComponent = (
  {
    options = countries.all.filter(
      (country: Country) => country.emoji && country.status !== 'deleted' && country.ioc !== 'PRK',
    ),
    onChange,
    defaultValue,
    disabled = false,
    placeholder = 'Select a country',
    slim = false,
    className,
    ...props
  }: CountryDropdownProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) => {
  const [open, setOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(undefined)

  useEffect(() => {
    if (defaultValue) {
      const initialCountry = options.find(
        (country) =>
          country.name.toLowerCase() === defaultValue.toLowerCase() ||
          country.alpha2.toLowerCase() === defaultValue.toLowerCase() ||
          country.alpha3.toLowerCase() === defaultValue.toLowerCase(),
      )
      if (initialCountry) {
        setSelectedCountry(initialCountry)
      } else {
        setSelectedCountry(undefined)
      }
    } else {
      setSelectedCountry(undefined)
    }
  }, [defaultValue, options])

  const handleSelect = useCallback(
    (country: Country) => {
      console.log('🌍 CountryDropdown value: ', country)
      setSelectedCountry(country)
      onChange?.(country)
      setOpen(false)
    },
    [onChange],
  )

  // Base styling yang sama dengan FormInput
  const triggerClasses = cn(
    'flex w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors items-center justify-between whitespace-nowrap bg-white text-sm disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
    slim === true && 'w-20',
    className,
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger ref={ref} className={triggerClasses} disabled={disabled} {...props}>
        {selectedCountry ? (
          <div className="flex items-center flex-grow w-0 gap-3 overflow-hidden">
            <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
              <CircleFlag countryCode={selectedCountry.alpha2.toLowerCase()} height={20} />
            </div>
            {slim === false && (
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-gray-900">
                {selectedCountry.name}
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-500">
            {slim === false ? placeholder : <Globe size={20} />}
          </span>
        )}
        <ChevronDown size={16} className="text-gray-400" />
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={10}
        side="bottom"
        className="min-w-[--radix-popper-anchor-width] p-0 bg-white border border-gray-200 shadow-lg rounded-lg"
      >
        <Command className="w-full max-h-[200px] sm:max-h-[270px]">
          <CommandList>
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
              <CommandInput
                placeholder="Search country..."
                className="border-0 px-4 py-3 text-gray-900"
              />
            </div>
            <CommandEmpty className="text-gray-500 py-6 text-center text-sm">
              No country found.
            </CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.name)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((option, key: number) => (
                  <CommandItem
                    className="flex items-center w-full gap-3 py-3 px-4 text-gray-900 hover:bg-gray-50 cursor-pointer data-[selected=true]:bg-gray-50"
                    key={key}
                    onSelect={() => handleSelect(option)}
                  >
                    <div className="flex flex-grow w-0 space-x-3 overflow-hidden">
                      <div className="inline-flex items-center justify-center w-5 h-5 shrink-0 overflow-hidden rounded-full">
                        <CircleFlag countryCode={option.alpha2.toLowerCase()} height={20} />
                      </div>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                        {option.name}
                      </span>
                    </div>
                    <CheckIcon
                      className={cn(
                        'ml-auto h-4 w-4 shrink-0 text-blue-500',
                        option.name === selectedCountry?.name ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

CountryDropdownComponent.displayName = 'CountryDropdownComponent'

export const CountryDropdown = forwardRef(CountryDropdownComponent)
