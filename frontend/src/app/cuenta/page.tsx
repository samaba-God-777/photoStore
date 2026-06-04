import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function CuentaPage() {
  return <MarketingPage content={sitePages['/cuenta']} path="/cuenta" />;
}
