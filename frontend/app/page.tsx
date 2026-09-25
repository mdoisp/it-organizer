export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="mb-6 text-sm font-semibold tracking-widest text-teal-700">IT ORGANIZER</p>
      <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">Seu atendimento de TI, organizado do início ao fim.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">Um lugar para agendar serviços, acompanhar seu equipamento e conversar com o técnico.</p>
      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {[ ["01", "Agende", "Escolha o serviço e descreva o que precisa."], ["02", "Acompanhe", "Consulte o andamento da sua ordem de serviço."], ["03", "Converse", "Tire dúvidas diretamente com o técnico."] ].map(([number, title, text]) => (
          <section key={number} className="rounded-2xl border border-slate-200 bg-white p-6">
            <span className="text-sm font-semibold text-teal-700">{number}</span>
            <h2 className="mt-4 text-xl font-semibold">{title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{text}</p>
          </section>
        ))}
      </div>
      <p className="mt-10 text-sm text-slate-500">Em desenvolvimento. Agendamentos ainda não estão disponíveis.</p>
    </main>
  );
}
