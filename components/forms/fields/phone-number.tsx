import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Input, InputControl, InputInnerPrefix } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { FieldMetadata, useInputControl } from '@conform-to/react';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import * as RPNInput from 'react-phone-number-input';
import countries from 'react-phone-number-input/';
import flags from 'react-phone-number-input/flags';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FormLabel } from '../label';
import { FormErrorMessage } from '../error';
import { FormDescription } from '../description';
import { FormFieldProps } from '../_types';
import { cva } from 'class-variance-authority';

const nonDigitRegexp = /\D/g;

type PhoneInputProps = Omit<
  React.ComponentProps<'input'>,
  'onChange' | 'value' | 'ref'
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange?: (value: RPNInput.Value) => void;
  } & FormFieldProps<string>;

export const PhoneNumberField: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, ...props }, ref) => {
      const defaultCountry = 'CO';

      const [country, setCountry] = useState<RPNInput.Country | null>(null);
      const [containerWidth, setContainerWidth] = useState(300);
      const containerRef = useRef<HTMLInputElement>(null);

      const countryCallingCode = useMemo(
        () =>
          RPNInput.getCountryCallingCode(
            country === null ? defaultCountry : country
          ),
        [country]
      );

      useLayoutEffect(() => {
        const { width = 300 } =
          containerRef.current?.getBoundingClientRect() ?? {};

        setContainerWidth(width);
      }, []);

      return (
        <div ref={containerRef} className="grid w-full items-center gap-1.5">
          <FormLabel $field={props} />
          <RPNInput.default
            ref={ref}
            className={cn('flex', className)}
            flagComponent={FlagComponent}
            defaultCountry="CO"
            onCountryChange={(newCountry) => setCountry(newCountry ?? null)}
            countrySelectProps={{
              popoverWidth: containerWidth
            }}
            countrySelectComponent={CountrySelect}
            inputComponent={InputComponent}
            numberInputProps={{
              countryCallingCode
            }}
            smartCaret={false}
            /**
             * Handles the onChange event.
             *
             * react-phone-number-input might trigger the onChange event as undefined
             * when a valid phone number is not entered. To prevent this,
             * the value is coerced to an empty string.
             *
             * @param {E164Number | undefined} value - The entered value
             */
            onChange={(value) => onChange?.(value || ('' as RPNInput.Value))}
            {...props}
          />
          <FormErrorMessage $field={props} />
          <FormDescription $field={props} />
        </div>
      );
    }
  );
PhoneNumberField.displayName = 'PhoneNumberField';

interface InputComponentProps extends React.ComponentProps<'input'> {}

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & { countryCallingCode?: string }
>(({ className, countryCallingCode, ...props }, ref) => (
  <Input className={cn('rounded-e-lg rounded-s-none', className)} ref={ref}>
    <InputInnerPrefix>+{countryCallingCode}</InputInnerPrefix>
    <InputControl {...props} />
  </Input>
));
InputComponent.displayName = 'InputComponent';

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  className?: string;
  invalid?: boolean;
  popoverWidth?: number;
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

const CountrySelectTriggerCva = cva(
  'flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10 focus:outline-none ring-0 focus-visible:outline-none focus:border-r-[1px] -mr-[1px]',
  {
    variants: {
      invalid: {
        true: 'focus-visible:border-red-500 focus-visible:bg-red-50',
        false: 'focus-visible:border-primary focus-visible:bg-purple-50'
      }
    },
    defaultVariants: {
      invalid: false
    }
  }
);

const CountrySelect = ({
  disabled,
  value: selectedCountry,
  options: countryList,
  popoverWidth,
  onChange,
  className,
  invalid
}: CountrySelectProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          focusable
          className={CountrySelectTriggerCva({ className, invalid })}
          disabled={disabled}
        >
          <FlagComponent
            country={selectedCountry}
            countryName={selectedCountry}
          />
          <ChevronsUpDown
            className={cn(
              '-mr-2 size-4 opacity-50',
              disabled ? 'hidden' : 'opacity-100'
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0"
        style={{ width: popoverWidth }}
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                    />
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
}

const CountrySelectOption = ({
  country,
  countryName,
  selectedCountry,
  onChange
}: CountrySelectOptionProps) => {
  return (
    <CommandItem className="gap-2" onSelect={() => onChange(country)}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-sm text-foreground/50">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon
        className={`ml-auto size-4 ${country === selectedCountry ? 'opacity-100' : 'opacity-0'}`}
      />
    </CommandItem>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
