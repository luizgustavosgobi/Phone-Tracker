"use client";

import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";
import Form from "../ui/form";

type FormRootProps<T extends FieldValues> = {
  title: string;
  children: React.ReactNode;
  onSubmit: SubmitHandler<T>;
  formMethods: UseFormReturn<T>;
};

export default function FormRoot<T extends FieldValues>({
  title,
  onSubmit,
  formMethods,
  children,
}: FormRootProps<T>) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-[var(--second-color)] p-8 pb-[2.3rem] shadow-[inset_0_0_4px] max-sm:p-6 max-sm:pb-[1.7rem]">
      <h1 className="text-center text-[xx-large] font-bold max-sm:text-[28.5px]">
        {title}
      </h1>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(onSubmit)}
            className="flex flex-col items-center justify-center self-start text-[medium] font-bold text-gray-100"
          >
            {children}
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
