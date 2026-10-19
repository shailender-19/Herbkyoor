import { AdvertisementSlider } from "./ad-slider";
import { activeAdvertisements } from "@/data/advertisements";

export function PromoSection() {
  if (activeAdvertisements.length === 0) return null;
  return (
    <section className="w-full">
      <AdvertisementSlider ads={activeAdvertisements} />
    </section>
  );
}
