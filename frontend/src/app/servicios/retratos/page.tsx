import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function RetratosPage() {
  return <MarketingPage content={sitePages['/servicios/retratos']} path="/servicios/retratos" />;
}
