import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function ExhibicionesPage() {
  return <MarketingPage content={sitePages['/exhibiciones']} path="/exhibiciones" />;
}
