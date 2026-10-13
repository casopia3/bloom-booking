export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-card bg-bloom-50 p-10 text-center">
      <h1 className="font-display text-2xl font-semibold text-bloom-700">{title}</h1>
      <p className="mt-2 max-w-sm text-gray-500">
        {description ?? "This section is coming soon — it's next on the build list."}
      </p>
    </div>
  );
}