import { Service } from '@/lib/api';

export default function ServiceStep({
  services,
  selected,
  onChange,
}: {
  services: Service[];
  selected: string[];
  onChange: (serviceIds: string[]) => void;
}) {
  const toggleService = (serviceId: string) => {
    if (selected.includes(serviceId)) {
      onChange(selected.filter((id) => id !== serviceId));
    } else {
      onChange([...selected, serviceId]);
    }
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No services available</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Select Services</h3>
      <div className="space-y-3">
        {services.map((service) => (
          <label
            key={service.id}
            className="flex items-start gap-4 p-4 rounded-card border border-gray-200 hover:border-bloom-300 cursor-pointer hover:bg-bloom-50 transition-all"
          >
            <input
              type="checkbox"
              checked={selected.includes(service.id)}
              onChange={() => toggleService(service.id)}
              className="mt-1 h-5 w-5 text-bloom-500 rounded accent-bloom-500"
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{service.name}</p>
              {service.description && (
                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
              )}
              <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                <span>⏱️ {service.durationMin} min</span>
                <span className="font-semibold text-bloom-600">ETB {Number(service.price).toLocaleString()}</span>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
