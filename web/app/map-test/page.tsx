import BloomMap from '@/components/maps/BloomMap';

export default function MapTestPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Bloom Maps
        </h1>

        <p className="mb-6 text-gray-500">
          MapLibre map test
        </p>

        <BloomMap className="h-[500px] shadow-sm" />
      </div>
    </main>
  );
}