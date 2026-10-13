import { Specialist } from '@/lib/api';

export default function SpecialistStep({
  specialists,
  selected,
  onChange,
  optional = false,
}: {
  specialists: Specialist[];
  selected: string | null;
  onChange: (specialistId: string | null) => void;
  optional?: boolean;
}) {
  if (specialists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No specialists available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">
        Select Specialist {optional && <span className="text-sm font-normal text-gray-500">(Optional)</span>}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        {optional
          ? 'Choose your preferred specialist or let us assign one'
          : 'Please select a specialist for your VIP home service'}
      </p>

      <div className="space-y-3">
        {optional && (
          <label className="flex items-center gap-4 p-4 rounded-card border-2 border-gray-200 cursor-pointer hover:border-bloom-300 hover:bg-bloom-50 transition-all">
            <input
              type="radio"
              name="specialist"
              checked={selected === null}
              onChange={() => onChange(null)}
              className="h-5 w-5 text-bloom-500 accent-bloom-500"
            />
            <div>
              <p className="font-medium text-gray-900">Any Available Specialist</p>
              <p className="text-sm text-gray-600">We'll assign the best match</p>
            </div>
          </label>
        )}

        {specialists.map((specialist) => (
          <label
            key={specialist.id}
            className="flex items-center gap-4 p-4 rounded-card border-2 border-gray-200 cursor-pointer hover:border-bloom-300 hover:bg-bloom-50 transition-all"
          >
            <input
              type="radio"
              name="specialist"
              checked={selected === specialist.id}
              onChange={() => onChange(specialist.id)}
              className="h-5 w-5 text-bloom-500 accent-bloom-500"
            />
            <div className="h-12 w-12 flex-shrink-0 rounded-card bg-bloom-100 overflow-hidden flex items-center justify-center">
              {specialist.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={specialist.photoUrl}
                  alt={specialist.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-semibold text-bloom-600">{specialist.name[0]}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{specialist.name}</p>
              <p className="text-sm text-gray-600">{specialist.specialty}</p>
              {specialist.bio && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{specialist.bio}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
