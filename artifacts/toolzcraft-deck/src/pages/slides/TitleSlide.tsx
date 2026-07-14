export default function TitleSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-text font-body">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "2vw 2vh" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "10vw 10vh" }} />
      <div className="absolute pointer-events-none border border-white/20" style={{ top: "3vh", left: "3vw", right: "3vw", bottom: "3vh" }} />
      <div className="absolute pointer-events-none border border-white/10" style={{ top: "5vh", left: "5vw", right: "5vw", bottom: "5vh" }} />
      <div className="relative h-full flex flex-col justify-between" style={{ padding: "7vh 7vw" }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="uppercase opacity-50" style={{ fontSize: "0.7vw", letterSpacing: "0.2em" }}>Drawing No.</div>
            <div className="font-mono font-semibold" style={{ fontSize: "1vw" }}>TZC-DCK-001</div>
          </div>
          <div className="text-right">
            <div className="uppercase opacity-50" style={{ fontSize: "0.7vw", letterSpacing: "0.2em" }}>Date</div>
            <div className="font-mono" style={{ fontSize: "1vw" }}>2026-07-14</div>
          </div>
        </div>
        <div>
          <div className="uppercase opacity-50" style={{ fontSize: "0.8vw", letterSpacing: "0.3em", marginBottom: "1.5vh" }}>Project Title</div>
          <h1 className="font-light m-0" style={{ fontSize: "6vw", lineHeight: 0.9, letterSpacing: "0.05em" }}>TOOLZ</h1>
          <h1 className="font-light m-0" style={{ fontSize: "6vw", lineHeight: 0.9, letterSpacing: "0.05em" }}>CRAFT</h1>
          <div className="bg-white/40" style={{ width: "8vw", height: "1px", marginTop: "2vh" }} />
          <p className="font-light opacity-60 m-0" style={{ fontSize: "1.2vw", marginTop: "1.5vh", maxWidth: "42vw", lineHeight: 1.6 }}>
            Precision instruments for the web.
          </p>
          <p className="font-light opacity-60 m-0" style={{ fontSize: "1.2vw", marginTop: "0.6vh", maxWidth: "42vw", lineHeight: 1.6 }}>
            250+ free browser tools — no login, no ads, privacy-first.
          </p>
          <p className="font-light opacity-60 m-0" style={{ fontSize: "1.2vw", marginTop: "0.6vh", maxWidth: "42vw", lineHeight: 1.6 }}>
            100+ API tools
          </p>
          <p className="font-mono opacity-80 m-0" style={{ fontSize: "1.1vw", marginTop: "1.5vh" }}>
            Live at online-utility-suite.replit.app
          </p>
        </div>
        <div className="flex justify-between border-t border-white/20" style={{ paddingTop: "1.5vh" }}>
          <div>
            <div className="uppercase opacity-40" style={{ fontSize: "0.6vw", letterSpacing: "0.15em" }}>Prepared By</div>
            <div className="font-mono" style={{ fontSize: "0.9vw" }}>ToolzCraft</div>
          </div>
          <div>
            <div className="uppercase opacity-40" style={{ fontSize: "0.6vw", letterSpacing: "0.15em" }}>Classification</div>
            <div className="font-mono" style={{ fontSize: "0.9vw" }}>PUBLIC</div>
          </div>
          <div>
            <div className="uppercase opacity-40" style={{ fontSize: "0.6vw", letterSpacing: "0.15em" }}>Scale</div>
            <div className="font-mono" style={{ fontSize: "0.9vw" }}>1:1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
