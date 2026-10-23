import { usePreferences, type LogoId } from '@/hooks/use-preferences';
function OriginalLogo({ size = 28 }: { size?: number }) {
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
      <span className="hidden sm:inline font-bold text-lg tracking-tight font-mono">
        Toolz<span className="text-primary">Craft</span>
      </span>
    </span>
  );
}

export function Logo({size=28,variant}:{size?:number;variant?:LogoId}){
  const {preferences}=usePreferences();const choice=variant??preferences.logo;
  if(choice==='original')return <OriginalLogo size={size}/>;
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ToolzCraft logo" style={{color:'#4f8cff'}}>
    {choice==='monogram'&&<><rect x="2" y="2" width="36" height="36" rx="9" fill="#2563eb"/><path d="M9 12H26M17 12V29M29 20H25A5 5 0 0 0 25 30H29" stroke="white" strokeWidth="3" strokeLinecap="round"/></>}
    {choice==='brackets'&&<><path d="M12 9L3 20L12 31M28 9L37 20L28 31" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="M23 7L17 33" stroke="#a78bfa" strokeWidth="4"/></>}
    {choice==='tiles'&&<>{[[3,3,'#2563eb'],[22,3,'#60a5fa'],[3,22,'#a78bfa'],[22,22,'#38bdf8']].map(([x,y,c])=><rect key={String(x)+String(y)} x={x} y={y} width="15" height="15" rx="4" fill={String(c)}/>)}</>}
    {choice==='orbit'&&<><circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="2"/><path d="M11 14H29M20 14V28" stroke="currentColor" strokeWidth="3"/><circle cx="32" cy="10" r="5" fill="#a78bfa"/></>}
    {choice==='diamond'&&<><path d="M20 2L38 20L20 38L2 20Z" fill="#2563eb"/><path d="M11 15H29M20 15V29" stroke="white" strokeWidth="3"/></>}
  </svg>;
}
