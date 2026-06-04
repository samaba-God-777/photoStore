import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function EstandarPage() {
  return <MarketingPage content={sitePages['/paquetes/estandar']} path="/paquetes/estandar" />;
}
