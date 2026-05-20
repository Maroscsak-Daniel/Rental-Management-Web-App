import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Authentication Error</h1>
        <p className="text-sm text-slate-500 mb-6">
          The invitation link may have expired or already been used. 
          Please ask your landlord to send a new invitation, or try logging in if you&apos;ve already set up your account.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-md bg-[#781C21] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#61161a]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
