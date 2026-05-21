interface Props {
  activeTab: string;
  activeCount: number;
  completedCount: number;
  search: string;
  onSearchChange: (v: string) => void;
  searchCount?: number;
}

export default function TopBar({ activeTab, activeCount, completedCount, search, onSearchChange, searchCount }: Props) {
  const isSearching = (search ?? '').trim().length > 0;
  const count = isSearching ? searchCount ?? 0 : activeTab === 'INCOMING' ? activeCount : completedCount;
  const label = isSearching ? 'Search Results' : activeTab === 'INCOMING' ? 'Active Queue' : 'Completed Order';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-2">
        {isSearching ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ) : activeTab === 'INCOMING' ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        <h1 className="text-base md:text-lg font-black text-gray-900">{label}</h1>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="text"
          value={search ?? ''}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search order..."
          className="bg-cream border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-gold w-36 md:w-48"
        />
        <div className="flex items-center gap-1.5 bg-gold/10 text-gold px-3 py-1.5 rounded-xl">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span className="text-xs font-semibold whitespace-nowrap">{count} {isSearching ? 'Results' : activeTab === 'INCOMING' ? 'Pending' : 'Completed'}</span>
        </div>
      </div>
    </div>
  );
}
