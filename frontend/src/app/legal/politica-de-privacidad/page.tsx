import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function PoliticaPrivacidadPage() {
  return <MarketingPage content={sitePages['/legal/politica-de-privacidad']} path="/legal/politica-de-privacidad" />;
}
