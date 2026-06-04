import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function PremiumPage() {
  return <MarketingPage content={sitePages['/paquetes/premium']} path="/paquetes/premium" />;
}
