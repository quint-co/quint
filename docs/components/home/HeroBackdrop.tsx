export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* soft gradient wash */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_40%_0%,rgba(139,92,246,0.25),transparent_60%)]" />
    </div>
  )
}
