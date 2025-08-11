import { ButtonHTMLAttributes } from "react";
import { useFormContext } from "react-hook-form";
import { clsx } from "clsx";

type FormButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
  children?: React.ReactNode;
};

export default function FormButton({
  label = "Enviar",
  children,
  className,
  ...props
}: FormButtonProps) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <button
      type="submit"
      disabled={isSubmitting || props.disabled}
      className={clsx(
        "mt-4 w-full cursor-pointer rounded-lg border-none bg-[var(--highlight)] p-1.5 text-[large] font-bold text-gray-50 hover:bg-[var(--hover-highlight)] focus:outline focus:outline-gray-50 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {isSubmitting ? (
        <div className="m-auto h-[23px] w-[23px] animate-spin rounded-[50%] border-l-[2.5px] border-solid border-l-[rgb(0,217,255)] bg-transparent" />
      ) : (
        (children ?? label)
      )}
    </button>
  );
}
