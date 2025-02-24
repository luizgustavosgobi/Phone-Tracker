import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-center h-full flex-col gap-5">
      <h1 className="text-9xl font-extrabold text-[var(--highlight)]">Oops!</h1>
      <span className="text-2xl font-bold">404 - Página Não Encontrada</span>
      <p className="text-center">
        A página que você está procurando pode ter sido <br />
        removida, teve seu nome alterado ou está temporariamente indisponível.
      </p>

      <Link
        className="rounded-lg bg-[var(--highlight)] p-4 hover:bg-[var(--hover-highlight)]"
        href="/"
      >
        Ir para Página Principal
      </Link>
    </div>
  );
}
