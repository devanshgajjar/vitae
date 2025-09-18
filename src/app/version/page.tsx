export default function VersionPage() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || 'local';
  const msg = process.env.VERCEL_GIT_COMMIT_MESSAGE || '';
  const time = new Date().toISOString();
  return (
    <main className="max-w-xl mx-auto px-6 py-12 text-sm">
      <h1 className="text-xl font-semibold mb-4">Build Version</h1>
      <div className="rounded-lg border p-4 bg-white">
        <div><span className="font-mono">commit:</span> {sha}</div>
        <div className="mt-1"><span className="font-mono">message:</span> {msg}</div>
        <div className="mt-1"><span className="font-mono">served_at:</span> {time}</div>
      </div>
    </main>
  );
}


