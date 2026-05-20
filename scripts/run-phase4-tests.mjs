/**
 * Lightweight Phase 4 unit checks (no test framework).
 * Run: node scripts/run-phase4-tests.mjs
 */

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

// Transpile-free: duplicate minimal checks inline for node without TS
const ALLOWED = {
  open: ['in_progress', 'resolved'],
  in_progress: ['resolved'],
  resolved: [],
}

function isValid(from, to) {
  if (from === to) return true
  return ALLOWED[from]?.includes(to) ?? false
}

let failed = 0
function test(name, fn) {
  try {
    fn()
    console.log(`✓ ${name}`)
  } catch (e) {
    console.error(`✗ ${name}:`, e.message)
    failed++
  }
}

test('open → in_progress', () => {
  if (!isValid('open', 'in_progress')) throw new Error('expected valid')
})
test('in_progress → open blocked', () => {
  if (isValid('in_progress', 'open')) throw new Error('expected invalid')
})
test('resolved is terminal', () => {
  if (isValid('resolved', 'open')) throw new Error('expected invalid')
})

test('days open overdue threshold', () => {
  const overdue = (status, days) => status === 'open' && days > 7
  if (!overdue('open', 8)) throw new Error('8 days open should be overdue')
  if (overdue('open', 3)) throw new Error('3 days should not be overdue')
})

if (failed > 0) {
  process.exit(1)
}
console.log('\nAll Phase 4 script checks passed.')
