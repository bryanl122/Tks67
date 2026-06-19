import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-lux min-h-[60vh] grid place-items-center text-center py-24">
      <div>
        <p className="script text-4xl text-eclat mb-2">oups…</p>
        <h1 className="text-5xl md:text-6xl mb-4">Page introuvable</h1>
        <p className="text-muted max-w-[44ch] mx-auto mb-8">
          La flamme s&apos;est éteinte par ici. Revenons vers la lumière.
        </p>
        <Link href="/" className="btn btn-primary">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
