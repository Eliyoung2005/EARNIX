import { prisma } from '@/lib/prisma';
import LandingClient from './LandingClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Query all active membership plans directly from PostgreSQL database server-side
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { level: 'asc' }
  });

  // Query all verified vendors directly from database server-side
  const vendors = await prisma.user.findMany({
    where: { role: 'VENDOR' },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      accountNumber: true,
      customGreeting: true,
      telegramLink: true,
      profilePic: true
    }
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "name": "EARNIX",
                "url": "https://earnix.online",
                "logo": "https://earnix.online/earnix-logo.jpg",
                "sameAs": [],
                "contactPoint": {
                  "@type": "ContactPoint",
                  "email": "Supportearnix@gmail.com",
                  "contactType": "customer support"
                }
              },
              {
                "@type": "WebSite",
                "name": "EARNIX",
                "url": "https://earnix.online",
                "description": "EARNIX is the ultimate platform for SoftLife and Stress-free Earnings.",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://earnix.online/search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              }
            ]
          }).replace(/</g, '\\u003c')
        }}
      />
      <LandingClient 
        initialPlans={plans} 
        initialVendors={vendors} 
      />
    </>
  );
}
