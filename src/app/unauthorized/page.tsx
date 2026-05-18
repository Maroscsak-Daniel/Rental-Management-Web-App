import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">Account Setup Incomplete</h1>
        <p className="text-zinc-400 max-w-xl mx-auto mb-8">
          We couldn't verify your landlord profile. This usually happens if the database trigger didn't create your profile, or if your email isn't verified yet.
        </p>
        <Link 
          href="/"
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-zinc-200"
        >
          Return Home
        </Link>
      </main>
    </div>
  )
}
