import { MarketingPage } from '@/components/marketing-page';
import { sitePages } from '@/components/site-page-data';

export default function PortfolioPage() {
  return <MarketingPage content={sitePages['/portfolio']} path="/portfolio" />;
}
