import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function TerminosServicioPage() {
  return <MarketingPage content={sitePages['/legal/terminos-del-servicio']} path="/legal/terminos-del-servicio" />;
}
