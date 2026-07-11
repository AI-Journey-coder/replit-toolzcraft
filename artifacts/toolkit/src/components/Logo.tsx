export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ToolzCraft logo">
      {/* Hexagon background */}
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        fill="hsl(var(--primary))"
        opacity="0.15"
      />
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Wrench body */}
      <path
        d="M11.5 20.5L18.5 13.5"
        stroke="hsl(var(--primary))"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M10 22L10.5 21.5"
        stroke="hsl(var(--primary))"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Wrench head (circular) */}
      <circle
        cx="20.5"
        cy="11.5"
        r="3"
        stroke="hsl(var(--primary))"
        strokeWidth="1.8"
        fill="none"
      />
      {/* Spark / lightning bolt */}
      <path
        d="M14 17.5L12.5 19.5L14.5 19L13 21"
        stroke="hsl(var(--foreground))"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

export function LogoWordmark({ iconSize = 26 }: { iconSize?: number }) {
  return (
    <span className="flex items-center gap-2">
      <Logo size={iconSize} />
      <span className="font-bold text-lg tracking-tight font-mono">
        Toolz<span className="text-primary">Craft</span>
      </span>
    </span>
  );
}
