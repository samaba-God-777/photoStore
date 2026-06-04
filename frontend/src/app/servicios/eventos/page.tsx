import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function EventosPage() {
  return <MarketingPage content={sitePages['/servicios/eventos']} path="/servicios/eventos" />;
}
