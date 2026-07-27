import { useState } from "react";
import { Gem, Sprout, Hammer, Flower, Users } from "lucide-react";
import GachaView from "./GachaView";
import GardenView from "./GardenView";
import WorkshopView from "./WorkshopView";
import ShopView from "./ShopView";
import GroupProjectView from "./GroupProjectView";

type Tab = "summon" | "garden" | "workshop" | "shop" | "group";

export default function RewardsView() {
  const [tab, setTab] = useState<Tab>("summon");

  return (
    <div className="space-y-6">
      {/* Sub-tab toggle */}
      <div className="inline-flex flex-wrap rounded-full border border-line bg-surface p-1 shadow-soft">
        <TabButton active={tab === "summon"} onClick={() => setTab("summon")} icon={<Gem size={15} />}>
          Summon
        </TabButton>
        <TabButton active={tab === "garden"} onClick={() => setTab("garden")} icon={<Sprout size={15} />}>
          Garden
        </TabButton>
        <TabButton active={tab === "workshop"} onClick={() => setTab("workshop")} icon={<Hammer size={15} />}>
          Workshop
        </TabButton>
        <TabButton active={tab === "shop"} onClick={() => setTab("shop")} icon={<Flower size={15} />}>
          Shop
        </TabButton>
        <TabButton active={tab === "group"} onClick={() => setTab("group")} icon={<Users size={15} />}>
          Group Project
        </TabButton>
      </div>

      {/* Game surfaces */}
      <div
        key={tab}
        className="summon-stage animate-viewin overflow-hidden rounded-[1.75rem] p-4 shadow-pop ring-1 ring-brand/20 sm:p-6"
      >
        {tab === "summon" && <GachaView />}
        {tab === "garden" && <GardenView />}
        {tab === "workshop" && <WorkshopView />}
        {tab === "shop" && <ShopView />}
        {tab === "group" && <GroupProjectView />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
        active ? "bg-brand text-white shadow-brand" : "text-dusk hover:text-night"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
