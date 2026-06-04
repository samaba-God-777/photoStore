import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function PoliticaCookiesPage() {
  return <MarketingPage content={sitePages['/legal/politica-de-cookies']} path="/legal/politica-de-cookies" />;
}
