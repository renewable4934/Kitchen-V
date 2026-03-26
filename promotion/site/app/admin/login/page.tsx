import { LoginForm } from "@/components/admin/login-form"

export const dynamic = "force-dynamic"

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(65,108,130,0.14),_transparent_35%),linear-gradient(180deg,_#f7fafb_0%,_#edf3f5_100%)] px-6 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full max-w-5xl gap-8 rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_30px_80px_rgba(44,65,76,0.12)] backdrop-blur md:grid-cols-[1.15fr_0.85fr] md:p-10">
          <section className="flex flex-col justify-between rounded-[1.5rem] bg-[#2f4954] p-8 text-white">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/65">Pegas CMS</p>
              <h1 className="mt-6 font-serif text-4xl leading-tight md:text-5xl">
                Управление сайтом без правки кода
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/78">
                Вход для владельца, дизайнера, вебмастера и копирайтера. Изменения публикуются сразу в текущий сайт
                через Supabase.
              </p>
            </div>
            <div className="mt-10 grid gap-4 text-sm text-white/72 md:grid-cols-2">
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="font-medium text-white">Что доступно</p>
                <p className="mt-2">Тексты, hero, портфолио, конфигуратор, навигация и изображения.</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                <p className="font-medium text-white">Без почты</p>
                <p className="mt-2">Подтверждение email отключено. Аккаунты создаёт владелец внутри CMS.</p>
              </div>
            </div>
          </section>
          <section className="flex items-center">
            <LoginForm />
          </section>
        </div>
      </div>
    </main>
  )
}
