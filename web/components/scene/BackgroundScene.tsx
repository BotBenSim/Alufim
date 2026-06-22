export function BackgroundScene() {
  const clouds = ["sc1", "sc2", "sc3", "sc4", "sc5", "sc6", "sc7", "sc8"];

  return (
    <div id="bgScene" className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="sun absolute left-[26px] top-[18px] h-[130px] w-[130px] animate-sunPulse rounded-full bg-[radial-gradient(circle,#FFE45E_52%,#FFD12E_100%)] shadow-[0_0_70px_26px_rgba(255,210,46,.55)]" />
      <div className="rainbow absolute left-1/2 top-[-14%] aspect-[2/1] w-[min(150vw,1100px)] -translate-x-1/2 opacity-80 bg-[radial-gradient(circle_at_50%_100%,rgba(255,255,255,0)_0_32%,#FF8787_32%_38%,#FFC078_38%_44%,#FFE066_44%_50%,#8CE99A_50%_56%,#74C0FC_56%_62%,#B197FC_62%_68%,rgba(255,255,255,0)_68%_100%)] [mask-image:linear-gradient(180deg,#000_60%,transparent_100%)]" />
      {clouds.map((cls) => (
        <div key={cls} className={`skyCloud ${cls}`} />
      ))}
      <div className="ground absolute bottom-0 left-0 right-0 min-h-[120px] h-[20vh] bg-gradient-to-b from-[#8FD957] via-[#6FC23E] to-[#57AC2C]">
        <div className="absolute left-0 right-0 top-[-26px] h-[52px] scale-x-[1.4] rounded-[50%_50%_0_0/100%_100%_0_0] bg-[#8FD957]" />
        <span className="tree t1" />
        <span className="tree t2" />
        <span className="tree t3" />
        <span className="tree t4" />
      </div>
    </div>
  );
}
