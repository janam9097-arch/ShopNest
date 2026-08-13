const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="rounded-xl border border-surface-200 overflow-hidden">
            <div className="skeleton h-52 w-full" />
            <div className="p-4 space-y-3">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="flex gap-2">
                <div className="skeleton h-5 w-16" />
                <div className="skeleton h-5 w-12" />
              </div>
              <div className="skeleton h-9 w-full rounded-lg" />
            </div>
          </div>
        );
      case 'line':
        return <div className={`skeleton h-4 w-full ${className}`} />;
      case 'avatar':
        return <div className="skeleton h-10 w-10 rounded-full" />;
      case 'detail':
        return (
          <div className="space-y-4">
            <div className="skeleton h-80 w-full rounded-xl" />
            <div className="skeleton h-6 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-10 w-40 rounded-lg" />
          </div>
        );
      case 'table-row':
        return (
          <div className="flex items-center gap-4 py-3 border-b border-surface-100">
            <div className="skeleton h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
            <div className="skeleton h-4 w-16" />
          </div>
        );
      default:
        return <div className={`skeleton h-4 w-full ${className}`} />;
    }
  };

  return (
    <div className="animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
