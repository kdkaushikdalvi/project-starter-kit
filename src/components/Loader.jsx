const Loader = ({ show, label = "Processing..." }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white px-8 py-6 shadow-xl">
        <div
          className="h-10 w-10 animate-spin rounded-full
            border-4 border-sky-500 border-t-transparent"
        />
        <p className="text-sm font-semibold text-gray-700">{label}</p>
      </div>
    </div>
  );
};

export default Loader;
