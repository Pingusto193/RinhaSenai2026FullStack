export default function EyeIcon({ hidden, size = 18 }) {
  if (hidden) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M6.6 6.6C4.5 8 3 9.8 2 12c1.6 3.6 5.2 7 10 7 1.6 0 3-.3 4.3-.9M9.9 4.2C10.6 4.1 11.3 4 12 4c4.8 0 8.4 3.4 10 7-.5 1.1-1.1 2.1-1.9 3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12c1.6-3.6 5.2-7 10-7s8.4 3.4 10 7c-1.6 3.6-5.2 7-10 7s-8.4-3.4-10-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}
