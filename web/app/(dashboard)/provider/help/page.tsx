export default function HelpSupportPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-card bg-bloom-100 px-5 py-4">
        <h1 className="font-display text-xl font-bold text-bloom-700">Help & Support</h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-card bg-bloom-50 p-5">
          <h2 className="font-display font-semibold text-bloom-700">Managing your salon</h2>
          <p className="mt-1 text-sm text-gray-600">
            Use the sidebar to manage your Appointments, Services, and Specialists. Your Profile menu holds your
            Account Information, Payments, and Reviews & Ratings.
          </p>
        </div>
        <div className="rounded-card bg-bloom-50 p-5">
          <h2 className="font-display font-semibold text-bloom-700">Responding to bookings</h2>
          <p className="mt-1 text-sm text-gray-600">
            New booking requests appear under Appointments as Pending. Accept or Decline them from there, and assign
            a specialist once a booking is confirmed.
          </p>
        </div>
        <div className="rounded-card bg-bloom-50 p-5">
          <h2 className="font-display font-semibold text-bloom-700">Need more help?</h2>
          <p className="mt-1 text-sm text-gray-600">
            Contact the Bloom Booking team directly for anything not covered here.
          </p>
        </div>
      </div>
    </div>
  );
}