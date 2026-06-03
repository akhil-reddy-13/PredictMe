interface IntroScreenProps {
  onContinue: () => void;
}

export function IntroScreen({ onContinue }: IntroScreenProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 py-16">
      <div className="max-w-md space-y-8 text-center">
        <h1 className="text-3xl font-medium tracking-tight text-neutral-900 sm:text-4xl">
          real pattern or noise?
        </h1>
        <div className="space-y-3 text-lg text-neutral-600">
          <p>you&apos;ll see scatterplots, one at a time.</p>
          <p>call it: pattern or noise.</p>
          <p className="text-base text-neutral-500">20 rounds. trust your eyes.</p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-full bg-neutral-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 active:scale-[0.98]"
        >
          let&apos;s go
        </button>
      </div>
    </div>
  );
}
