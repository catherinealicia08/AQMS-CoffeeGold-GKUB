interface Props {
  activeTab: string;
  activeCount: number;
  completedCount: number;
}

export default function TopBar({ activeTab, activeCount, completedCount }: Props) {
  const count = activeTab === 'INCOMING' ? activeCount : completedCount;
  const label = activeTab === 'INCOMING' ? 'Active Queue' : 'Completed Order';

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-3">
        {activeTab === 'INCOMING' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        <h1 className="text-lg font-black text-gray-900">{label}</h1>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search order..."
          className="bg-cream border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-gold w-48"
        />
        <button className="w-8 h-8 bg-cream rounded-xl flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5 bg-gold/10 text-gold px-3 py-1.5 rounded-xl">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span className="text-xs font-semibold">{count} Orders Pending</span>
        </div>
      </div>
    </div>
  );
}
