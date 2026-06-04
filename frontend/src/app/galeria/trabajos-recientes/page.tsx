import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function TrabajosRecientesPage() {
  return <MarketingPage content={sitePages['/galeria/trabajos-recientes']} path="/galeria/trabajos-recientes" />;
}
