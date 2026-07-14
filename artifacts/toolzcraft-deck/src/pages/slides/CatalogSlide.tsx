export default function CatalogSlide() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-text font-body">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "2vw 2vh" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "10vw 10vh" }} />
      <div className="absolute pointer-events-none border border-white/20" style={{ top: "3vh", left: "3vw", right: "3vw", bottom: "3vh" }} />
      <div className="absolute pointer-events-none border border-white/10" style={{ top: "5vh", left: "5vw", right: "5vw", bottom: "5vh" }} />
      <div className="relative h-full flex flex-col justify-between" style={{ padding: "7vh 7vw" }}>
        <div className="flex justify-between items-start">
          <div>
            <div className="uppercase opacity-50" style={{ fontSize: "0.7vw", letterSpacing: "0.2em" }}>Section 03</div>
            <div className="font-mono font-semibold" style={{ fontSize: "1vw" }}>INVENTORY SCHEDULE</div>
          </div>
          <div className="text-right">
            <div className="uppercase opacity-50" style={{ fontSize: "0.7vw", letterSpacing: "0.2em" }}>Ref No.</div>
            <div className="font-mono" style={{ fontSize: "1vw" }}>CAT-03X</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center" style={{ marginTop: "3vh", marginBottom: "3vh" }}>
          <h2 className="font-light m-0" style={{ fontSize: "3.2vw", letterSpacing: "0.05em", marginBottom: "1.5vh" }}>TOOL CATALOG</h2>
          <p className="font-mono opacity-70 m-0" style={{ fontSize: "1.2vw", marginBottom: "4vh" }}>250+ tools across 11 categories:</p>
          <div className="grid grid-cols-4" style={{ gap: "2vh 1.5vw" }}>
            <div className="border border-white/30 bg-white/[0.02] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>Text & Writing</div>
            <div className="border border-white/30 bg-white/[0.02] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>Converters</div>
            <div className="border border-white/30 bg-white/[0.02] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>Calculators</div>
            <div className="border border-white/30 bg-white/[0.02] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>Generators</div>
            <div className="border border-white/30 bg-white/[0.02] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>Image Tools</div>
            <div className="border border-white/30 bg-white/[0.02] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>Developer Tools</div>
            <div className="border border-white/30 bg-white/[0.02] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>Date & Time</div>
            <div className="border border-white/30 bg-white/[0.02] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>Web & SEO</div>
            <div className="border border-white/40 bg-white/[0.06] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>PDF Tools</div>
            <div className="border border-white/40 bg-white/[0.06] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>OCR & Documents</div>
            <div className="border border-white/40 bg-white/[0.06] flex items-center justify-center text-center" style={{ padding: "2.5vh 1vw", fontSize: "1.15vw" }}>AI Tools</div>
          </div>
        </div>
        <div className="flex justify-between border-t border-white/20" style={{ paddingTop: "1.5vh" }}>
          <div>
            <div className="uppercase opacity-40" style={{ fontSize: "0.6vw", letterSpacing: "0.15em" }}>Status</div>
            <div className="font-mono" style={{ fontSize: "0.9vw" }}>VERIFIED</div>
          </div>
          <div>
            <div className="uppercase opacity-40" style={{ fontSize: "0.6vw", letterSpacing: "0.15em" }}>Revision</div>
            <div className="font-mono" style={{ fontSize: "0.9vw" }}>A.1</div>
          </div>
          <div>
            <div className="uppercase opacity-40" style={{ fontSize: "0.6vw", letterSpacing: "0.15em" }}>Page</div>
            <div className="font-mono" style={{ fontSize: "0.9vw" }}>03</div>
          </div>
        </div>
      </div>
    </div>
  );
}
