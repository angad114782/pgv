'use client';
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Topbar from './Topbar';
import Footer from './Footer';
import MobileBottomCTA from './MobileBottomCTA';
import StickyButtons from './StickyButtons';
import { TrackingProvider } from '@/components/lead/TrackingProvider';
import { UrgencyBanner, TrustStrip, LiveActivityToast, BackToTopButton, ExitIntentPopup } from '@/components/conversion/PsychTriggers';
import { toWhatsAppNumber } from '@/lib/settings';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5007/api';

interface SiteShellProps {
  children: React.ReactNode;
  settings: {
    phone?: string;
    phone2?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
    siteName?: string;
    logoUrl?: string;
    footerLogoUrl?: string;
    openingHours?: string;
    reraNumber?: string;
    reraLink?: string;
    social?: any;
    marketStats?: any;
    conversion?: any;
    navMenu?: any;
    footerLinks?: any;
    newLaunch?: { label?: string; href?: string };
  };
}

export default function SiteShell({ children, settings }: SiteShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  // WhatsApp always mirrors Phone — one number for admin to keep updated.
  const whatsapp = toWhatsAppNumber(settings.phone);

  const submitExitIntentLead = async (mobile: string) => {
    try {
      const visitorId = sessionStorage.getItem('gr_visitor_id') || localStorage.getItem('gr_visitor_id') || '';
      await fetch(`${API_URL}/leads/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          visitorId,
          sourcePage: window.location.pathname,
          whatsappConsent: true,
          source: 'exit_intent',
        }),
      });
    } catch { /* fire-and-forget */ }
  };

  return (
    <TrackingProvider>
      <UrgencyBanner config={settings.conversion?.urgencyBanner} />
      <Topbar
        phone={settings.phone}
        email={settings.email}
        address={settings.address}
        totalProjects={settings.marketStats?.totalProjects}
      />
      <Header phone={settings.phone} siteName={settings.siteName} logoUrl={settings.logoUrl} navMenu={settings.navMenu} newLaunch={settings.newLaunch} />
      <TrustStrip config={settings.conversion?.trustStrip} />
      <main>{children}</main>
      <Footer
        phone={settings.phone}
        email={settings.email}
        whatsapp={whatsapp}
        siteName={settings.siteName}
        address={settings.address}
        openingHours={settings.openingHours}
        social={settings.social}
        reraNumber={settings.reraNumber}
        reraLink={settings.reraLink}
        logoUrl={settings.footerLogoUrl || settings.logoUrl}
        links={settings.footerLinks}
      />
      <MobileBottomCTA phone={settings.phone} whatsapp={whatsapp} />
      <StickyButtons phone={settings.phone} whatsapp={whatsapp} />
      <LiveActivityToast config={settings.conversion?.liveActivity} />
      <ExitIntentPopup onSubmit={submitExitIntentLead} config={settings.conversion?.exitPopup} />
      <BackToTopButton />
      <Toaster
        position="bottom-right"
        toastOptions={{ duration: 3000, style: { background: '#1a1a2e', color: '#fff', border: '1px solid #2d2d4e' } }}
      />
    </TrackingProvider>
  );
}
