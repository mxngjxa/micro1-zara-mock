/**
 * Page component that renders a centered landing placeholder for the voice-based AI interview platform.
 *
 * @returns The page's JSX element: a full-viewport centered main container with the title "Voice-Based AI Interview Platform" and a "Coming Soon" subtitle.
 */
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-24">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Voice-Based AI Interview Platform
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Coming Soon
      </p>
    </main>
  );
}