import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function QuienesSomosPage() {
  return <MarketingPage content={sitePages['/empresa/quienes-somos']} path="/empresa/quienes-somos" />;
}
