import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="flex max-w-4xl flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            AI Quiz Master
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-8 text-zinc-600 dark:text-zinc-400">
            Test your software engineering knowledge with AI-generated questions.
            Get instant feedback and improve your skills.
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row">
          <Link
            href="/quiz"
            className="flex h-14 items-center justify-center rounded-full bg-blue-600 px-8 text-lg font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Start Quiz
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 text-3xl">🤖</div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              AI-Generated
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Unique questions powered by GPT-4 Turbo for every quiz session
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 text-3xl">⚡</div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Real-time Streaming
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Watch questions generate in real-time with smooth streaming
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 text-3xl">💻</div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Code & Concepts
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Mix of code-based and conceptual software engineering questions
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
