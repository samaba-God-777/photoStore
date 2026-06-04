import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function PersonalizadoPage() {
  return <MarketingPage content={sitePages['/paquetes/personalizado']} path="/paquetes/personalizado" />;
}
