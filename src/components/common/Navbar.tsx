export default function Navbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-primary-50 bg-surface-light px-4">
      <span className="text-lg font-semibold text-primary-900">Seller Portal</span>
      <div className="flex items-center gap-4">
        <button aria-label="Notifications" className="text-primary-500">
          🔔
        </button>
        <button aria-label="Profile" className="text-primary-500">
          👤
        </button>
      </div>
    </header>
  );
}