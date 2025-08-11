import Link from "next/link";

const Paths = {
  "/dashboard": "Ver usuários",
  "/": "Ir para a página inicial",
  "/infractions": "Ver todas as Infrações",
} as const;

type FormLinkProps = {
  to: keyof typeof Paths;
};

export default function FormLink({ to }: FormLinkProps) {
  return (
    <Link
      href={to}
      className="mt-1 mr-0.5 self-end text-[medium] font-bold text-[#ff3d6d] no-underline hover:text-[#df4067] hover:underline"
    >
      {Paths[to]}
    </Link>
  );
}
