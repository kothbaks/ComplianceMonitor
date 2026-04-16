export function Toast({ toasts, removeToast }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 animate-slide-in ${
            t.type === 'success' ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'
          }`}
        >
          <span>{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="ml-2 opacity-70 hover:opacity-100">
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
