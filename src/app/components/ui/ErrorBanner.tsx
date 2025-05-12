export default function ErrorBanner({ error }: { error: string }) {
  return (
    <div className="bg-red-100 text-red-700 border border-red-300 rounded-md p-4">
      <strong>Error:</strong> {error}
    </div>
  );
}
