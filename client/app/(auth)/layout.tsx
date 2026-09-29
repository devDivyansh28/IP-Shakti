export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F2EE] bg-[url('/images/background_mat.svg')] bg-repeat text-neutral-900 p-6 relative overflow-hidden font-sans selection:bg-lime-300 selection:text-neutral-900">
      {/* Background Architectural Guide Lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none z-0">
        <span className="absolute top-0 bottom-0 left-[12%] w-px bg-neutral-900/[0.07]" />
        <span className="absolute top-0 bottom-0 left-[38%] w-px bg-neutral-900/[0.07]" />
        <span className="absolute top-0 bottom-0 left-[62%] w-px bg-neutral-900/[0.07]" />
        <span className="absolute top-0 bottom-0 left-[88%] w-px bg-neutral-900/[0.07]" />

        {/* Floating Corner Notches on Intersections */}
        <div className="absolute top-12 left-[12%] -translate-x-1/2 w-3.5 h-3.5 bg-lime-300 border border-neutral-900 rounded-[2px]" />
        <div className="absolute bottom-16 right-[12%] translate-x-1/2 w-3.5 h-3.5 bg-lime-300 border border-neutral-900 rounded-[2px]" />
      </div>

      {/* Subtle Frosted Backdrop Blur Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 backdrop-blur-[5px] bg-[#F6F2EE]/45 z-1"
      />

      {/* Centered Auth Card Container */}
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
}
