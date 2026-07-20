"use client";

import { AboutScreen } from "@/components/screens/AboutScreen";
import { ProfileEditor } from "@/components/screens/ProfileEditor";
import { ProfilesScreen } from "@/components/screens/ProfilesScreen";
import { GameScreen } from "@/components/game/GameScreen";
import { useStore } from "@/state/store";

export default function HomePage() {
  const screen = useStore((s) => s.screen);

  return (
    <div className="relative h-full min-h-0 flex-1">
      {screen === "profiles" && <ProfilesScreen />}
      {screen === "profileEdit" && <ProfileEditor />}
      {screen === "about" && <AboutScreen />}
      {screen === "game" && <GameScreen />}
    </div>
  );
}
