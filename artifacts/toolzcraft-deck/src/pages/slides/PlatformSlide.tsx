export default function PlatformSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-text font-body">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "2vw 2vh" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "10vw 10vh" }} />
      <div className="absolute pointer-events-none border border-white/20" style={{ top: "3vh", left: "3vw", right: "3vw", bottom: "3vh" }} />
      <div className="absolute pointer-events-none border border-white/10" style={{ top: "5vh", left: "5vw", right: "5vw", bottom: "5vh" }} />
      <div className="relative h-full flex flex-col justify-between" style={{ padding: "7vh 7vw" }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="uppercase opacity-50" style={{ fontSize: "0.7vw", letterSpacing: "0.2em" }}>Section 06</div>
            <div className="font-mono font-semibold" style={{ fontSize: "1vw" }}>OPERATIONS DESK</div>
          </div>
          <div className="text-right">
            <div className="uppercase opacity-50" style={{ fontSize: "0.7vw", letterSpacing: "0.2em" }}>Ref No.</div>
            <div className="font-mono" style={{ fontSize: "1vw" }}>OPS-06X</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center" style={{ marginTop: "3vh", marginBottom: "3vh" }}>
          <h2 className="font-light m-0" style={{ fontSize: "3.2vw", letterSpacing: "0.05em", marginBottom: "5vh" }}>PLATFORM & ADMIN</h2>
          <div className="grid grid-cols-2" style={{ gap: "2.5vh 2.5vw" }}>
            <div className="border border-white/30 bg-white/[0.02]" style={{ padding: "2.5vh 2vw" }}>
              <div className="font-mono opacity-70" style={{ fontSize: "0.9vw", letterSpacing: "0.15em", marginBottom: "1.2vh" }}>&gt; AUTHENTICATION</div>
              <div className="font-light" style={{ fontSize: "1.3vw", lineHeight: 1.6 }}>Firebase sign-in: phone OTP + Google</div>
            </div>
            <div className="border border-white/30 bg-white/[0.02]" style={{ padding: "2.5vh 2vw" }}>
              <div className="font-mono opacity-70" style={{ fontSize: "0.9vw", letterSpacing: "0.15em", marginBottom: "1.2vh" }}>&gt; ADMIN CONSOLE</div>
              <div className="font-light" style={{ fontSize: "1.3vw", lineHeight: 1.6 }}>Users, roles, premium tools & packages, usage stats, API keys</div>
            </div>
            <div className="border border-white/30 bg-white/[0.02]" style={{ padding: "2.5vh 2vw" }}>
              <div className="font-mono opacity-70" style={{ fontSize: "0.9vw", letterSpacing: "0.15em", marginBottom: "1.2vh" }}>&gt; ANALYTICS</div>
              <div className="font-light" style={{ fontSize: "1.3vw", lineHeight: 1.6 }}>Anonymous usage analytics across every tool</div>
            </div>
            <div className="border border-white/30 bg-white/[0.02]" style={{ padding: "2.5vh 2vw" }}>
              <div className="font-mono opacity-70" style={{ fontSize: "0.9vw", letterSpacing: "0.15em", marginBottom: "1.2vh" }}>&gt; DEPLOYMENT</div>
              <div className="font-light" style={{ fontSize: "1.3vw", lineHeight: 1.6 }}>Published on Replit Autoscale</div>
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t border-white/20" style={{ paddingTop: "1.5vh" }}>
          <div>
            <div className="uppercase opacity-40" style={{ fontSize: "0.6vw", letterSpacing: "0.15em" }}>Status</div>
            <div className="font-mono" style={{ fontSize: "0.9vw" }}>FINAL</div>
          </div>
          <div>
            <div className="uppercase opacity-40" style={{ fontSize: "0.6vw", letterSpacing: "0.15em" }}>Revision</div>
            <div className="font-mono" style={{ fontSize: "0.9vw" }}>A.1</div>
          </div>
          <div>
            <div className="uppercase opacity-40" style={{ fontSize: "0.6vw", letterSpacing: "0.15em" }}>Page</div>
            <div className="font-mono" style={{ fontSize: "0.9vw" }}>06</div>
          </div>
        </div>
      </div>
    </div>
  );
}
