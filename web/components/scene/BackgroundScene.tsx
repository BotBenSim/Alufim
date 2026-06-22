export function BackgroundScene() {
  const clouds = [
    { cls: "sc1", delay: "0s", dur: "46s" },
    { cls: "sc2", delay: "-26s", dur: "64s" },
    { cls: "sc3", delay: "-40s", dur: "54s" },
    { cls: "sc4", delay: "-15s", dur: "58s" },
    { cls: "sc5", delay: "-50s", dur: "72s" },
    { cls: "sc6", delay: "-33s", dur: "50s" },
    { cls: "sc7", delay: "-8s", dur: "68s" },
    { cls: "sc8", delay: "-45s", dur: "60s" },
  ];

  return (
    <div id="bgScene" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="sun absolute left-[26px] top-[18px] h-[130px] w-[130px] animate-sunPulse rounded-full bg-[radial-gradient(circle,#FFE45E_52%,#FFD12E_100%)] shadow-[0_0_70px_26px_rgba(255,210,46,.55)]" />
      <div className="rainbow absolute left-1/2 top-[-14%] aspect-[2/1] w-[min(150vw,1100px)] -translate-x-1/2 opacity-80 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0)_0_32%,#FF8787_32%_38%,#FFC078_38%_44%,#FFE066_44%_50%,#8CE99A_50%_56%,#74C0FC_56%_62%,#B197FC_62%_68%,rgba(255,255,255,0)_68%_100%)] [mask-image:linear-gradient(180deg,#000_60%,transparent_100%)]" />
      {clouds.map((c) => (
        <div
          key={c.cls}
          className={`skyCloud ${c.cls}`}
          style={{ animationDelay: c.delay, animationDuration: c.dur }}
        />
      ))}
      <div className="ground absolute bottom-0 left-0 right-0 min-h-[120px] h-[20vh] bg-gradient-to-b from-[#8FD957] via-[#6FC23E] to-[#57AC2C]">
        <div className="absolute left-0 right-0 top-[-26px] h-[52px] scale-x-[1.4] rounded-[50%_50%_0_0/100%_100%_0_0] bg-[#8FD957]" />
      </div>
      <div className="tree t1 absolute bottom-[58%] left-[5%] scale-[1.35]" />
      <div className="tree t2 absolute bottom-[54%] left-[23%] scale-95" />
      <div className="tree t3 absolute bottom-[58%] right-[8%] scale-150" />
      <div className="tree t4 absolute bottom-[52%] right-[29%] scale-[0.85]" />
    </div>
  );
}
