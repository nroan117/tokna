import Hero from '../../components/marketing/Hero';
import TrustBar from '../../components/marketing/TrustBar';
import Approach from '../../components/marketing/Approach';
import ProductTabs from '../../components/marketing/ProductTabs';
import Stats from '../../components/marketing/Stats';
import PersonaTabs from '../../components/marketing/PersonaTabs';
import CTAStrip from '../../components/marketing/CTAStrip';
import SiteFooter from '../../components/marketing/SiteFooter';

export default function HomePage() {
  return (
    <main>
      <Hero />
      {/* <TrustBar /> */}
      <Approach />
      <ProductTabs />
      <Stats />
      <PersonaTabs />
      <CTAStrip />
      <SiteFooter />
    </main>
  );
}
