import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function BodasPage() {
  return <MarketingPage content={sitePages['/servicios/bodas']} path="/servicios/bodas" />;
}
