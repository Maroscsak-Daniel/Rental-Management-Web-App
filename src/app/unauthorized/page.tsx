import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mt-14 md:mt-0 md:ml-64 max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">Account Setup Incomplete</h1>
        <p className="text-slate-500 max-w-xl mx-auto mb-8">
          We couldn&apos;t verify your landlord profile. This usually happens if the database trigger didn&apos;t create your profile, or if your email isn&apos;t verified yet.
        </p>
        <Link
          href="/"
          className="rounded-md bg-[#781C21] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#61161a]"
        >
          Return Home
        </Link>
      </main>
    </div>
  )
}
