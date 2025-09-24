import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">
          Plataforma de Recrutamento AutoU
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
          Selecione o portal que deseja acessar
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link
            href="/admin"
            className="group rounded-lg border border-border bg-card p-6 hover:border-primary transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-3">
              Portal Administrador
            </h2>
            <p className="text-muted-foreground">
              Gerencie vagas e acompanhe candidatos
            </p>
          </Link>

          <Link
            href="/candidato"
            className="group rounded-lg border border-border bg-card p-6 hover:border-primary transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-3">
              Portal Candidato
            </h2>
            <p className="text-muted-foreground">
              Inscreva-se e acompanhe seu processo
            </p>
          </Link>

          <Link
            href="/avaliador"
            className="group rounded-lg border border-border bg-card p-6 hover:border-primary transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-3">
              Portal Avaliador
            </h2>
            <p className="text-muted-foreground">
              Avalie candidatos e cases
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}