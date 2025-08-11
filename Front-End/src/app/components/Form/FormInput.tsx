"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/app/components/ui/command";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/app/components/ui/input";
import { Eye, EyeOff, Search } from "lucide-react";
import { useFormContext, Controller } from "react-hook-form";
import { ElementType, useEffect, useState } from "react";
import { Textarea } from "@/app/components/ui/textarea";
import { InputHTMLAttributes } from "react";
import { api } from "@/lib/api";
import { Student } from "@/app/utils/types/allTypes";
import { Avatar, AvatarImage } from "../ui/avatar";

export type BaseInputProps = InputHTMLAttributes<HTMLInputElement> & {
  registerName: string;
  label: string;
  icon?: ElementType;
  className?: string;
  children?: React.ReactNode;
};

export function FormInput({
  registerName,
  label,
  children,
  ...rest
}: BaseInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={registerName}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="mt-3">{label}</FormLabel>
          <FormControl className="w-full">
            <div className="relative">
              <Input
                {...field}
                {...rest}
                className={
                  "w-[16rem] border-zinc-400 bg-transparent font-medium text-zinc-200 focus:border-zinc-500 focus:ring-zinc-500 " +
                  rest.className
                }
              />
              {children}
              <FormMessage className="mt-[0.3rem] w-[16rem]" />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export function FormInputAutoComplete({
  registerName,
  label,
  ...rest
}: BaseInputProps) {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const { setValue } = useFormContext();

  useEffect(() => {
    if (query.length < 1) {
      setStudents([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      api
        .get(`/students/autocomplete?query=${query}`)
        .then((res) => {
          setStudents(res.data || []);
          setShowOptions(res.data.length > 0);
        })
        .catch(() => setStudents([]));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (student: Student) => {
    setQuery(`${student.id} - ${student.name}`);
    setValue(registerName, student.id);
    setShowOptions(false);
  };

  return (
    <div className="relative w-fit">
      <FormInput
        registerName={registerName}
        label={label}
        value={query}
        className="pr-8"
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          setValue(registerName, value);
        }}
        {...rest}
      />

      <Search size={20} className="absolute right-2 bottom-2" />

      {showOptions && students.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-[var(--border-color)] bg-zinc-800 text-zinc-200 shadow-md">
          {students.map((student, index) => (
            <li
              key={index}
              onClick={() => handleSelect(student)}
              className="cursor-pointer border-b border-zinc-700 px-4 py-2 hover:bg-zinc-700"
            >
              <div className="flex items-center justify-around gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage className="object-cover" src={student.photo} />
                </Avatar>
                <p>{`${student.id} - ${student.name}`}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FormPasswordInput({ registerName, label }: BaseInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const iconProps = {
    className:
      "absolute text-[1.5em] text-zinc-400 cursor-pointer right-2.5 top-1.5",
    onClick: () => setShowPassword(!showPassword),
  };

  const IconSeePassword: React.FC = () => {
    return (
      <>{showPassword ? <Eye {...iconProps} /> : <EyeOff {...iconProps} />}</>
    );
  };

  return (
    <FormInput
      registerName={registerName}
      label={label}
      className="pr-10"
      type={showPassword ? "text" : "password"}
      children={<IconSeePassword />}
    />
  );
}

export function FormFileInput({
  registerName,
  label,
  ...rest
}: BaseInputProps) {
  const { control } = useFormContext();

  return (
    <div className="mb-4 flex flex-col">
      {label && <label className="mt-3 font-medium">{label}</label>}
      <Controller
        name={registerName}
        control={control}
        render={({ field }) => (
          <Input
            type="file"
            onChange={(e) => field.onChange(e.target.files?.[0])}
            className={
              "border-zinc-400 bg-transparent pr-10 font-medium text-zinc-200 " +
              rest.className
            }
          />
        )}
      />
    </div>
  );
}

export function FormComboboxInput({
  registerName,
  placeholder,
  label,
  items,
  className,
  showSearch = true,
}: {
  placeholder: string;
  items: string[];
  showSearch?: boolean;
} & BaseInputProps) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name={registerName}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="mt-3">{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    "w-[16rem] cursor-pointer justify-between overflow-hidden border-1 border-zinc-200 bg-transparent text-zinc-400 hover:bg-transparent",
                    className,
                  )}
                >
                  {field.value || placeholder}
                  <ChevronsUpDown className="ml-10 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-fit min-w-[16rem] bg-zinc-900 p-1">
              <Command className="border border-zinc-300 bg-zinc-900">
                {showSearch && (
                  <CommandInput
                    placeholder={placeholder}
                    className="h-9 text-zinc-400"
                  />
                )}
                <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={(value) => {
                        field.onChange(value);
                        setOpen(false);
                      }}
                      className="flex cursor-pointer items-center text-zinc-200"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          item === field.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  );
}

export function FormTextareaInput({
  registerName,
  label,
  className,
  ...rest
}: BaseInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={registerName}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="mt-3">{label}</FormLabel>
          <FormControl>
            <div className={"w-[16rem] " + className}>
              <Textarea
                {...field}
                {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
                className="resize-none border-zinc-400 bg-transparent font-medium text-zinc-200 focus:border-zinc-500 focus:ring-zinc-500"
                spellCheck
              />
              <FormMessage className="mt-[0.3rem]" />
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
