import type { Spirit } from "../lib/gacha";
import SpiritArt from "./SpiritArt";
import PremiumArt from "./PremiumArt";

/**
 * Renders the right art for a spirit: the detailed elemental PremiumArt for
 * VFX-Bible characters, or the cute snack-book SpiritArt for everyone else.
 */
export default function CharacterArt({
  spirit,
  size = 72,
  talking = false,
  idle = true,
}: {
  spirit: Spirit;
  size?: number;
  talking?: boolean;
  idle?: boolean;
}) {
  if (spirit.element) {
    return <PremiumArt element={spirit.element} size={size} idle={idle} />;
  }
  return <SpiritArt spirit={spirit} size={size} talking={talking} walking={idle} />;
}
