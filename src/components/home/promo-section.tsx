import { Container } from "@/components/ui/container";
import { AdvertisementSlider } from "./ad-slider";
import { activeAdvertisements } from "@/data/advertisements";

export function PromoSection() {
  if (activeAdvertisements.length === 0) return null;
  return (
    <section className="py-8 sm:py-10">
      <Container>
        <AdvertisementSlider ads={activeAdvertisements} />
      </Container>
    </section>
  );
}
