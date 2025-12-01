'use client';

interface LandingPageProps {
  onStartQuiz: () => void;
}

export default function LandingPage({ onStartQuiz }: LandingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 border-2 border-border">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-primary bg-opacity-10 rounded-full mb-6">
              <span className="text-6xl">🌍</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              ESG Sustainability Quiz
            </h1>
            <p className="text-xl text-foreground opacity-90 max-w-2xl mx-auto">
              Test your knowledge on Environmental, Social, and Governance topics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-accent bg-opacity-20 rounded-xl p-6 text-center border border-accent">
              <div className="text-3xl mb-3">🌱</div>
              <h3 className="font-semibold text-primary mb-2">Environmental</h3>
              <p className="text-sm text-foreground opacity-75">
                Climate change, renewable energy, and carbon footprint
              </p>
            </div>
            <div className="bg-accent bg-opacity-20 rounded-xl p-6 text-center border border-accent">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-primary mb-2">Social</h3>
              <p className="text-sm text-foreground opacity-75">
                Social equity, human rights, and community impact
              </p>
            </div>
            <div className="bg-accent bg-opacity-20 rounded-xl p-6 text-center border border-accent">
              <div className="text-3xl mb-3">⚖️</div>
              <h3 className="font-semibold text-primary mb-2">Governance</h3>
              <p className="text-sm text-foreground opacity-75">
                Corporate responsibility and ethical practices
              </p>
            </div>
          </div>

          <div className="bg-primary-light bg-opacity-10 rounded-xl p-6 mb-8 border border-primary-light">
            <h3 className="font-semibold text-primary mb-4">What to Expect:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-success text-xl">✓</span>
                <span className="text-foreground">
                  <strong>5 Questions</strong> covering key sustainability topics
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-success text-xl">✓</span>
                <span className="text-foreground">
                  <strong>Instant Feedback</strong> with detailed explanations
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-success text-xl">✓</span>
                <span className="text-foreground">
                  <strong>Learning Resources</strong> from the web to expand your knowledge
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-success text-xl">✓</span>
                <span className="text-foreground">
                  <strong>Navigate Freely</strong> between questions at your own pace
                </span>
              </li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={onStartQuiz}
              className="bg-primary hover:bg-primary-dark text-white font-bold text-lg py-4 px-12 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Start Quiz
            </button>
            <p className="mt-4 text-sm text-foreground opacity-60">
              Estimated time: 5-10 minutes
            </p>
          </div>
        </div>

        <div className="text-center mt-6 text-foreground opacity-50">
          <p className="text-sm">
            Powered by OpenAI and enhanced with real-time web search
          </p>
        </div>
      </div>
    </div>
  );
}
