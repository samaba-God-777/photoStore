import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function ContactoPage() {
  return <MarketingPage content={sitePages['/contacto']} path="/contacto" />;
}
