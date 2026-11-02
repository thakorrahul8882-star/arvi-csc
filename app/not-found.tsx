import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mb-4 text-2xl font-bold">
        404
      </div>
      <h2 className="text-2xl font-bold mb-2">પેજ મળ્યું નથી / Page Not Found</h2>
      <p className="text-slate-400 mb-6 max-w-md text-sm">
        તમે જે પેજ શોધી રહ્યા છો તે ઉપલબ્ધ નથી અથવા ખસેડવામાં આવ્યું છે.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-all"
      >
        હોમ પેજ પર પાછા જાઓ
      </Link>
    </div>
  );
}
