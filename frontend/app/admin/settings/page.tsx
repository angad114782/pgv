'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAdmin, API } from '../_context';
import { Card, PageHeader, Btn, Field, Input, ImageUploader, TrustSignalsInput, NavMenuInput, LinkListInput, FAQInput, ArrayObjectInput, Toast } from '../_components/shared';

const TABS = [
  { key: 'general', label: '🏢 General' },
  { key: 'navigation', label: '🧭 Navigation' },
  { key: 'homepage', label: '🏠 Homepage' },
  { key: 'about', label: '🏆 About Page' },
  { key: 'seo', label: '🔍 SEO' },
  { key: 'social', label: '📱 Social' },
  { key: 'conversion', label: '🎯 Conversion' },
  { key: 'whatsapp', label: '💬 WhatsApp' },
  { key: 'email', label: '📧 Email / SMTP' },
  { key: 'integrations', label: '🔌 Integrations' },
];

export default function SettingsPage() {
  const { authH, token } = useAdmin();
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingWa, setTestingWa] = useState(false);
  const [connectingGsc, setConnectingGsc] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    const r = await fetch(`${API}/admin/settings`, { headers: authH() });
    const d = await r.json();
    if (d.success) setSettings(d.settings);
  }, [token, authH]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const r = await fetch(`${API}/admin/settings`, {
        method: 'PUT', headers: authH(), body: JSON.stringify(settings),
      });
      const d = await r.json();
      if (d.success) { setSettings(d.settings); setToast({ msg: 'Settings saved!', type: 'success' }); }
      else setToast({ msg: d.message || 'Save failed', type: 'error' });
    } catch { setToast({ msg: 'Network error', type: 'error' }); }
    finally { setSaving(false); }
  };

  const testSmtp = async () => {
    setTestingSmtp(true);
    const r = await fetch(`${API}/admin/settings/test-smtp`, {
      method: 'POST', headers: authH(), body: JSON.stringify(settings?.smtp || {}),
    });
    const d = await r.json();
    setToast({ msg: d.message || (d.success ? 'SMTP OK ✓' : 'SMTP Failed ✗'), type: d.success ? 'success' : 'error' });
    setTestingSmtp(false);
  };

  const testWhatsApp = async () => {
    setTestingWa(true);
    const r = await fetch(`${API}/admin/settings/test-whatsapp`, {
      method: 'POST', headers: authH(), body: JSON.stringify(settings?.whatsappCloud || {}),
    });
    const d = await r.json();
    setToast({ msg: d.message || (d.success ? 'WhatsApp OK ✓' : 'WhatsApp Failed ✗'), type: d.success ? 'success' : 'error' });
    setTestingWa(false);
  };

  const connectGsc = async () => {
    setConnectingGsc(true);
    const r = await fetch(`${API}/admin/gsc/verify`, {
      method: 'POST', headers: authH(),
      body: JSON.stringify({ siteUrl: g('googleSearchConsole.siteUrl'), serviceAccountJson: g('googleSearchConsole.serviceAccountJson') }),
    });
    const d = await r.json();
    setToast({ msg: d.message || (d.success ? 'GSC connected ✓' : 'GSC connect failed ✗'), type: d.success ? 'success' : 'error' });
    if (d.success) s('googleSearchConsole.connected', true);
    setConnectingGsc(false);
  };

  const s = (path: string, val: any) => {
    if (!settings) return;
    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(settings));
    let cur = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!cur[keys[i]]) cur[keys[i]] = {};
      cur = cur[keys[i]];
    }
    cur[keys[keys.length - 1]] = val;
    setSettings(updated);
  };
  const g = (path: string, def: any = '') => {
    if (!settings) return def;
    const keys = path.split('.');
    let cur = settings;
    for (const k of keys) { if (cur == null) return def; cur = cur[k]; }
    return cur ?? def;
  };

  if (!settings) {
    return (
      <div className="p-4 sm:p-6">
        <PageHeader title="Settings" />
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 border border-slate-200" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <PageHeader title="Settings" subtitle="Site info, SEO, social, WhatsApp Cloud API and SMTP email configuration"
        action={
          <Btn onClick={save} disabled={saving}>
            {saving ? '⏳ Saving…' : '💾 Save All Settings'}
          </Btn>
        } />

      {/* Tab nav */}
      <div className="flex gap-1 flex-wrap mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === t.key ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <Card className="p-4 sm:p-6">
        {/* GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">General Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Site Name">
                <Input value={g('siteName')} onChange={(v) => s('siteName', v)} placeholder="Top Property Finder" />
              </Field>
              <Field label="Tag Line" hint="Shown in the homepage hero. Full hero content (title, subtitle, CTAs, image) is editable in the Hero tab.">
                <Input value={g('heroTagline')} onChange={(v) => s('heroTagline', v)} placeholder="Gurgaon's #1 Real Estate Advisory" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Phone" hint="Used for every Call AND WhatsApp button on the site — WhatsApp links are derived from this number automatically.">
                <Input value={g('phone')} onChange={(v) => s('phone', v)} placeholder="+91 8619930583" />
              </Field>
              <Field label="Email">
                <Input value={g('email')} onChange={(v) => s('email', v)} placeholder="info@example.com" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Secondary Phone" hint="Optional — shown in structured data / SEO schema only.">
                <Input value={g('phone2')} onChange={(v) => s('phone2', v)} placeholder="+91 9888888888" />
              </Field>
            </div>
            <Field label="Address">
              <Input value={g('address')} onChange={(v) => s('address', v)} placeholder="Sector 50, Gurgaon, Haryana 122018" rows={2} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Street Address">
                <Input value={g('streetAddress')} onChange={(v) => s('streetAddress', v)} placeholder="SCO 123, Sector 50" />
              </Field>
              <Field label="Postal Code">
                <Input value={g('postalCode')} onChange={(v) => s('postalCode', v)} placeholder="122018" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="RERA Number">
                <Input value={g('reraNumber')} onChange={(v) => s('reraNumber', v)} placeholder="HRERA/..." />
              </Field>
              <Field label="RERA Verify Link">
                <Input value={g('reraLink')} onChange={(v) => s('reraLink', v)} placeholder="https://haryanarera.gov.in" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Google Business Profile URL">
                <Input value={g('googleBusinessProfile')} onChange={(v) => s('googleBusinessProfile', v)} placeholder="maps.google.com/..." />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude (for GEO)">
                <Input value={g('geoLat')} onChange={(v) => s('geoLat', v)} placeholder="28.4595" />
              </Field>
              <Field label="Longitude (for GEO)">
                <Input value={g('geoLng')} onChange={(v) => s('geoLng', v)} placeholder="77.0266" />
              </Field>
            </div>
            {token && (
              <div className="grid grid-cols-2 gap-6">
                <ImageUploader label="Logo" value={g('logoUrl')} onChange={(v) => s('logoUrl', v as string)} token={token} />
                <ImageUploader label="Favicon" value={g('faviconUrl')} onChange={(v) => s('faviconUrl', v as string)} token={token} />
              </div>
            )}
          </div>
        )}

        {/* NAVIGATION */}
        {activeTab === 'navigation' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">"New Launch" Nav Item</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Label">
                  <Input value={g('newLaunch.label')} onChange={(v) => s('newLaunch.label', v)} placeholder="New Launch" />
                </Field>
                <Field label="Link URL">
                  <Input value={g('newLaunch.href')} onChange={(v) => s('newLaunch.href', v)} placeholder="/new-launch-projects-in-gurgaon" />
                </Field>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Its dropdown is always auto-populated from the Corridors manager on the Projects page.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Header Nav Menu</h3>
              <NavMenuInput
                items={g('navMenu', [])}
                onChange={(v) => s('navMenu', v)}
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Footer Links</h3>
              <LinkListInput
                links={g('footerLinks', [])}
                onChange={(v) => s('footerLinks', v)}
              />
            </div>
          </div>
        )}

        {/* HOMEPAGE */}
        {activeTab === 'homepage' && (
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Hero Section</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Title">
                    <Input value={g('heroTitle')} onChange={(v) => s('heroTitle', v)} placeholder="Top Property Finder 2025" />
                  </Field>
                  <Field label="Title Accent" hint="Optional highlighted word/phrase after the title.">
                    <Input value={g('heroTitleAccent')} onChange={(v) => s('heroTitleAccent', v)} placeholder="" />
                  </Field>
                </div>
                <Field label="Subtitle">
                  <Input value={g('heroSubtitle')} onChange={(v) => s('heroSubtitle', v)} rows={2}
                    placeholder="150+ verified new launch, pre-launch and ready-to-move properties..." />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Primary CTA Text">
                    <Input value={g('heroCTAPrimary')} onChange={(v) => s('heroCTAPrimary', v)} placeholder="🏠 Book Free Site Visit" />
                  </Field>
                  <Field label="Secondary CTA Text">
                    <Input value={g('heroCTASecondary')} onChange={(v) => s('heroCTASecondary', v)} placeholder="View New Launches →" />
                  </Field>
                </div>
                {token && (
                  <ImageUploader label="Hero Background Image" value={g('heroImageUrl')} onChange={(v) => s('heroImageUrl', v as string)} token={token} />
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Market Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'marketStats.totalProjects', label: 'Total Projects', placeholder: '150+' },
                  { key: 'marketStats.familiesHelped', label: 'Families Helped', placeholder: '4,200+' },
                  { key: 'marketStats.topBuilders', label: 'Top Builders', placeholder: '50+' },
                  { key: 'marketStats.avgAppreciation', label: 'Avg Appreciation', placeholder: '32%' },
                  { key: 'marketStats.avgRentalYield', label: 'Avg Rental Yield', placeholder: '3.5%' },
                  { key: 'marketStats.yearsActive', label: 'Years Active', placeholder: '5+' },
                  { key: 'marketStats.reviewCount', label: 'Review Count', placeholder: '847' },
                  { key: 'marketStats.rating', label: 'Rating', placeholder: '4.9' },
                ].map(({ key, label, placeholder }) => (
                  <Field key={key} label={label}>
                    <Input value={g(key)} onChange={(v) => s(key, v)} placeholder={placeholder} />
                  </Field>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Testimonials</h3>
              <ArrayObjectInput
                label="Testimonials"
                items={g('testimonials', [])}
                onChange={(v) => s('testimonials', v)}
                itemLabel={(t) => t.name || 'New testimonial'}
                emptyItem={{ name: '', city: '', role: '', review: '', rating: 5, avatar: '', project: '' }}
                fields={[
                  { key: 'name', placeholder: 'Name' },
                  { key: 'city', placeholder: 'City' },
                  { key: 'role', placeholder: 'Role (e.g. IT Professional)' },
                  { key: 'project', placeholder: 'Project Name' },
                  { key: 'rating', placeholder: 'Rating (1-5)', type: 'number' },
                  { key: 'avatar', placeholder: 'Avatar initial/letter' },
                  { key: 'review', placeholder: 'Review text…', type: 'textarea' },
                ]}
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Locations Grid</h3>
              <ArrayObjectInput
                label="Locations"
                items={g('locations', [])}
                onChange={(v) => s('locations', v)}
                itemLabel={(l) => l.name || 'New location'}
                emptyItem={{ name: '', projects: '10+', icon: '🏙️', href: '', highlight: 'Popular', img: '', color: 'from-blue-900/80' }}
                fields={[
                  { key: 'name', placeholder: 'Location Name' },
                  { key: 'href', placeholder: '/link-href' },
                  { key: 'projects', placeholder: 'Project count (e.g. 10+)' },
                  { key: 'icon', placeholder: '🏙️' },
                  { key: 'highlight', placeholder: 'Badge (e.g. Popular)' },
                  { key: 'img', placeholder: 'Image URL', span2: true },
                ]}
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Builder Logos</h3>
              <ArrayObjectInput
                label="Builders"
                items={g('builders', [])}
                onChange={(v) => s('builders', v)}
                itemLabel={(b) => b.name || 'New builder'}
                emptyItem={{ name: '', img: '', website: '' }}
                fields={[
                  { key: 'name', placeholder: 'Builder Name' },
                  { key: 'website', placeholder: 'Website URL' },
                  { key: 'img', placeholder: 'Logo Image URL', span2: true },
                ]}
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Homepage FAQs</h3>
              <FAQInput faqs={g('faqs', [])} onChange={(v) => s('faqs', v)} />
            </div>
          </div>
        )}

        {/* ABOUT PAGE */}
        {activeTab === 'about' && (
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Company Info</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Founding Year">
                    <Input value={g('companyInfo.foundingYear')} onChange={(v) => s('companyInfo.foundingYear', v)} placeholder="2020" />
                  </Field>
                  <Field label="Team Size">
                    <Input value={g('companyInfo.teamSize')} onChange={(v) => s('companyInfo.teamSize', v)} placeholder="25+" />
                  </Field>
                </div>
                <Field label="About Page Title">
                  <Input value={g('companyInfo.aboutTitle')} onChange={(v) => s('companyInfo.aboutTitle', v)} placeholder="About Top Property Finder" />
                </Field>
                <Field label="About Content">
                  <Input value={g('companyInfo.aboutContent')} onChange={(v) => s('companyInfo.aboutContent', v)} rows={4}
                    placeholder="Our story, what we do, why buyers trust us..." />
                </Field>
                <Field label="Mission Statement">
                  <Input value={g('companyInfo.missionStatement')} onChange={(v) => s('companyInfo.missionStatement', v)} rows={2} />
                </Field>
                <Field label="Google Maps Embed URL" hint="Used for the embedded map on the Contact page.">
                  <Input value={g('companyInfo.mapEmbedUrl')} onChange={(v) => s('companyInfo.mapEmbedUrl', v)} placeholder="https://www.google.com/maps/embed?..." />
                </Field>
                {token && (
                  <ImageUploader label="Office Photo" value={g('companyInfo.officeImage')} onChange={(v) => s('companyInfo.officeImage', v as string)} token={token} />
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Awards</h3>
              <ArrayObjectInput
                label="Awards"
                items={g('companyInfo.awards', [])}
                onChange={(v) => s('companyInfo.awards', v)}
                itemLabel={(a) => a.title || 'New award'}
                emptyItem={{ title: '', year: '', issuer: '' }}
                fields={[
                  { key: 'title', placeholder: 'Award Title' },
                  { key: 'year', placeholder: 'Year' },
                  { key: 'issuer', placeholder: 'Issued By', span2: true },
                ]}
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Certifications</h3>
              <ArrayObjectInput
                label="Certifications"
                items={g('companyInfo.certifications', [])}
                onChange={(v) => s('companyInfo.certifications', v)}
                itemLabel={(c) => c.name || 'New certification'}
                emptyItem={{ name: '', issuer: '', id: '', link: '' }}
                fields={[
                  { key: 'name', placeholder: 'Certification Name' },
                  { key: 'issuer', placeholder: 'Issued By' },
                  { key: 'id', placeholder: 'Certificate ID' },
                  { key: 'link', placeholder: 'Verify Link' },
                ]}
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Media Mentions</h3>
              <ArrayObjectInput
                label="Media Links"
                items={g('companyInfo.mediaLinks', [])}
                onChange={(v) => s('companyInfo.mediaLinks', v)}
                itemLabel={(m) => m.outlet || 'New mention'}
                emptyItem={{ outlet: '', title: '', href: '', date: '' }}
                fields={[
                  { key: 'outlet', placeholder: 'Outlet (e.g. Economic Times)' },
                  { key: 'date', placeholder: 'Date' },
                  { key: 'title', placeholder: 'Article Title', span2: true },
                  { key: 'href', placeholder: 'Article URL', span2: true },
                ]}
              />
            </div>
          </div>
        )}

        {/* SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-5">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">SEO & Meta</h3>
            <Field label="SEO Title" hint="Shown in Google search results. 50-60 characters.">
              <Input value={g('seoTitle')} onChange={(v) => s('seoTitle', v)} placeholder="Top Property Finder | Best Properties 2025" />
              <p className="text-[10px] text-slate-400 mt-1">{g('seoTitle').length}/60 chars</p>
            </Field>
            <Field label="Meta Description" hint="Google snippet. 155-160 characters.">
              <Input value={g('seoDescription')} onChange={(v) => s('seoDescription', v)} placeholder="Find new launch & ready-to-move projects in Gurgaon..." rows={3} />
              <p className="text-[10px] text-slate-400 mt-1">{g('seoDescription').length}/160 chars</p>
            </Field>
            <Field label="SEO Keywords (comma-separated)">
              <Input value={Array.isArray(g('seoKeywords', [])) ? g('seoKeywords', []).join(', ') : g('seoKeywords')}
                onChange={(v) => s('seoKeywords', v.split(',').map((k: string) => k.trim()).filter(Boolean))}
                placeholder="new projects gurgaon, 3 bhk dwarka expressway, luxury apartments..." rows={2} />
            </Field>
            {token && (
              <ImageUploader label="OG Image (Social Share Image)" value={g('ogImage')} onChange={(v) => s('ogImage', v as string)} token={token} />
            )}
            <Field label="Google Search Console Verification Code">
              <Input value={g('googleSearchConsole.verificationCode')} onChange={(v) => s('googleSearchConsole.verificationCode', v)} placeholder="google-site-verification=XXXXXX" />
            </Field>
          </div>
        )}

        {/* SOCIAL */}
        {activeTab === 'social' && (
          <div className="space-y-5">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">Social Media</h3>
            {[
              { key: 'social.facebook', label: 'Facebook', placeholder: 'facebook.com/...' },
              { key: 'social.instagram', label: 'Instagram', placeholder: 'instagram.com/...' },
              { key: 'social.youtube', label: 'YouTube', placeholder: 'youtube.com/@...' },
              { key: 'social.linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/company/...' },
              { key: 'social.twitter', label: 'Twitter / X', placeholder: 'twitter.com/...' },
            ].map(({ key, label, placeholder }) => (
              <Field key={key} label={label}>
                <Input value={g(key)} onChange={(v) => s(key, v)} placeholder={placeholder} />
              </Field>
            ))}
          </div>
        )}

        {/* CONVERSION */}
        {activeTab === 'conversion' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">🔥 Urgency Banner (top of page)</h3>
                <Btn size="sm" variant={g('conversion.urgencyBanner.enabled', true) ? 'primary' : 'secondary'}
                  onClick={() => s('conversion.urgencyBanner.enabled', !g('conversion.urgencyBanner.enabled', true))}>
                  {g('conversion.urgencyBanner.enabled', true) ? '✅ Enabled' : '⬜ Disabled'}
                </Btn>
              </div>
              <div className="space-y-4 mt-4">
                <Field label="Message">
                  <Input value={g('conversion.urgencyBanner.message')} onChange={(v) => s('conversion.urgencyBanner.message', v)}
                    placeholder="Price hike alert: Dwarka Expressway projects raising prices by 5–8% in June 2026." rows={2} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Link Text">
                    <Input value={g('conversion.urgencyBanner.linkText')} onChange={(v) => s('conversion.urgencyBanner.linkText', v)}
                      placeholder="Lock today's price →" />
                  </Field>
                  <Field label="Link URL">
                    <Input value={g('conversion.urgencyBanner.linkHref')} onChange={(v) => s('conversion.urgencyBanner.linkHref', v)}
                      placeholder="#lead-form" />
                  </Field>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">🏆 Trust Strip (scrolling badges)</h3>
                <Btn size="sm" variant={g('conversion.trustStrip.enabled', true) ? 'primary' : 'secondary'}
                  onClick={() => s('conversion.trustStrip.enabled', !g('conversion.trustStrip.enabled', true))}>
                  {g('conversion.trustStrip.enabled', true) ? '✅ Enabled' : '⬜ Disabled'}
                </Btn>
              </div>
              <div className="mt-4">
                <TrustSignalsInput
                  signals={g('conversion.trustStrip.signals', [])}
                  onChange={(v) => s('conversion.trustStrip.signals', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* WHATSAPP */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-5">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">WhatsApp Cloud API</h3>
            {[
              { key: 'whatsappCloud.accessToken', label: 'Access Token', placeholder: 'EAAx...' },
              { key: 'whatsappCloud.phoneNumberId', label: 'Phone Number ID', placeholder: '123456789...' },
              { key: 'whatsappCloud.adminNumber', label: 'Lead Alert Number(s)', placeholder: '918619930583 (comma-separated for multiple)' },
              { key: 'whatsappCloud.templateName', label: 'Lead Notification Template', placeholder: 'lead_notification' },
              { key: 'whatsappCloud.otpTemplateName', label: 'OTP Template', placeholder: 'otp_verification' },
              { key: 'whatsappCloud.thankYouTemplateName', label: 'Thank You Template', placeholder: 'thank_you_enquiry' },
              { key: 'whatsappCloud.templateLanguage', label: 'Template Language Code', placeholder: 'en' },
            ].map(({ key, label, placeholder }) => (
              <Field key={key} label={label}>
                <Input value={g(key)} onChange={(v) => s(key, v)} placeholder={placeholder} />
              </Field>
            ))}
            <Btn onClick={testWhatsApp} disabled={testingWa} variant="secondary">
              {testingWa ? '⏳ Testing…' : '🧪 Test WhatsApp'}
            </Btn>
          </div>
        )}

        {/* EMAIL SMTP */}
        {activeTab === 'email' && (
          <div className="space-y-5">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100">SMTP Email</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SMTP Host">
                <Input value={g('smtp.host')} onChange={(v) => s('smtp.host', v)} placeholder="smtp.gmail.com" />
              </Field>
              <Field label="SMTP Port">
                <Input value={g('smtp.port')} onChange={(v) => s('smtp.port', v)} placeholder="587" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="SMTP User">
                <Input value={g('smtp.user')} onChange={(v) => s('smtp.user', v)} placeholder="you@gmail.com" />
              </Field>
              <Field label="SMTP Password">
                <Input type="password" value={g('smtp.pass')} onChange={(v) => s('smtp.pass', v)} placeholder="App password" />
              </Field>
            </div>
            <Field label="From Email" hint="Display name is your Site Name automatically — only the email address is needed here.">
              <Input value={g('smtp.from')} onChange={(v) => s('smtp.from', v)} placeholder="noreply@example.com" />
            </Field>
            <Field label="Notify Email (Lead notifications go here)">
              <Input value={g('notificationEmail')} onChange={(v) => s('notificationEmail', v)} placeholder="leads@example.com" />
            </Field>
            <Btn onClick={testSmtp} disabled={testingSmtp} variant="secondary">
              {testingSmtp ? '⏳ Testing…' : '🧪 Test SMTP Connection'}
            </Btn>
          </div>
        )}

        {/* INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Ads & Tracking</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="GA4 Measurement ID">
                  <Input value={g('ga4Id')} onChange={(v) => s('ga4Id', v)} placeholder="G-XXXXXXXXXX" />
                </Field>
                <Field label="Google Tag Manager ID">
                  <Input value={g('gtmId')} onChange={(v) => s('gtmId', v)} placeholder="GTM-XXXXXXX" />
                </Field>
                <Field label="Meta (Facebook/Instagram) Pixel ID">
                  <Input value={g('metaPixelId')} onChange={(v) => s('metaPixelId', v)} placeholder="123456789012345" />
                </Field>
                <Field label="Google Ads ID">
                  <Input value={g('googleAdsId')} onChange={(v) => s('googleAdsId', v)} placeholder="AW-XXXXXXXXXX" />
                </Field>
                <Field label="Google Ads Conversion Label">
                  <Input value={g('googleAdsConversionLabel')} onChange={(v) => s('googleAdsConversionLabel', v)} placeholder="AbC-D1234efGH" />
                </Field>
                <Field label="Google Ads Conversion Value (₹)">
                  <Input type="number" value={g('googleAdsConversionValue', 0)} onChange={(v) => s('googleAdsConversionValue', Number(v))} placeholder="0" />
                </Field>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">AI Content Generation</h3>
              <Field label="Anthropic API Key" hint="Used for AI-assisted blog/content generation. Falls back to server env var if left blank.">
                <Input type="password" value={g('anthropicApiKey')} onChange={(v) => s('anthropicApiKey', v)} placeholder="sk-ant-..." />
              </Field>
            </div>

            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-4">
                <h3 className="font-bold text-slate-900">Instant Indexing (IndexNow)</h3>
                <Btn size="sm" variant={g('indexingAutoSubmit', true) ? 'primary' : 'secondary'}
                  onClick={() => s('indexingAutoSubmit', !g('indexingAutoSubmit', true))}>
                  {g('indexingAutoSubmit', true) ? '✅ Auto-submit On' : '⬜ Auto-submit Off'}
                </Btn>
              </div>
              <Field label="IndexNow Key" hint="Auto-submits new blog posts and projects to Bing/Yandex/DuckDuckGo on publish.">
                <Input value={g('indexNowKey')} onChange={(v) => s('indexNowKey', v)} placeholder="a1b2c3d4..." />
              </Field>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 mb-4">Google Search Console</h3>
              <div className="space-y-4">
                <Field label="Verification Meta Tag Content">
                  <Input value={g('googleSearchConsole.verificationCode')} onChange={(v) => s('googleSearchConsole.verificationCode', v)} placeholder="google-site-verification=XXXXXX" />
                </Field>
                <Field label="Site URL" hint="Must exactly match a property already added in Search Console.">
                  <Input value={g('googleSearchConsole.siteUrl')} onChange={(v) => s('googleSearchConsole.siteUrl', v)} placeholder="https://toppropertyfinder.com" />
                </Field>
                <Field label="Service Account JSON" hint="Paste the full JSON key from a Google Cloud service account with Search Console access.">
                  <Input value={g('googleSearchConsole.serviceAccountJson')} onChange={(v) => s('googleSearchConsole.serviceAccountJson', v)} rows={4} placeholder="{ &quot;type&quot;: &quot;service_account&quot;, ... }" />
                </Field>
                <div className="flex items-center gap-3">
                  <Btn onClick={connectGsc} disabled={connectingGsc} variant="secondary">
                    {connectingGsc ? '⏳ Connecting…' : '🔗 Connect & Verify'}
                  </Btn>
                  {g('googleSearchConsole.connected', false) && <span className="text-emerald-600 text-xs font-semibold">✅ Connected</span>}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 -mx-6 px-6 py-3 flex justify-end mt-6">
        <Btn onClick={save} disabled={saving}>
          {saving ? '⏳ Saving…' : '💾 Save All Settings'}
        </Btn>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
