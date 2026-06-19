export default function BrandMark({ size = 26, className = 'brand-mark' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flinx-ember" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffb84d" />
          <stop offset="55%" stopColor="#ff5d62" />
          <stop offset="100%" stopColor="#c83cff" />
        </linearGradient>
      </defs>
      <path
        fill="url(#flinx-ember)"
        d="M16 1.5c1.6 4.1.1 6.7-1.9 9-2 2.4-4.1 4.7-2.6 8.7.4-2 1.6-3.2 3.1-4.1-.4 2.4.3 4.1 2 5.4 1.9 1.5 2.5 3.5 1.7 5.8 2.5-1 3.8-2.9 3.6-5.4 2 1.7 2.9 3.9 2.4 6.4 3.2-2.1 5.2-5.4 5.2-9.3 0-7.5-6-11.8-13.5-16.5Z"
      />
      <path
        fill="#fff7df"
        d="M15.3 26.3c-.5 1.6.1 2.9 1.5 3.7-3.6.3-6.5-1.9-6.5-5.3 0-1.5.6-2.6 1.5-3.5.1 1.5.9 2.4 2.1 2.9-.2-1.4.3-2.5 1.2-3.3-.6 2.1.1 3.6 1.3 4.6.5-.4.8-.9.9-1.5.6.7.8 1.6.6 2.6-.8.5-1.7.8-2.6.8Z"
      />
    </svg>
  )
}
