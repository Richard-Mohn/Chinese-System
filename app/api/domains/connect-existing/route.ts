/**
 * Connect Existing Domain API — "Bring Your Own Domain" (BYOD) Flow
 *
 * POST /api/domains/connect-existing
 *
 * For tenants who already own domains and want to point them to MohnMenu.
 * This flow:
 * 1. Accepts domain name (no payment required)
 * 2. Provides DNS instructions
 * 3. Verifies DNS is pointing correctly
 * 4. Enables custom domain routing
 *
 * Unlike domain purchase, this requires the tenant to:
 * - Already own the domain
 * - Update their DNS settings manually at their registrar
 *
 * DELETE /api/domains/connect-existing?domain=...&businessSlug=...
 *   Disconnects a previously connected domain.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyApiAuth } from '@/lib/apiAuth';

const APP_HOSTING_DOMAIN = process.env.FIREBASE_APP_HOSTING_DOMAIN || 'mohnmenu.com';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyApiAuth(request);
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { domain, businessSlug, skipVerification = false } = body;
    const uid = authResult.uid;

    if (!domain || !businessSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: domain, businessSlug' },
        { status: 400 },
      );
    }

    // Clean domain input
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');

    // ── Verify Business Ownership ──────────────────────────────
    const businessDoc = await adminDb
      .collection('businesses')
      .where('slug', '==', businessSlug)
      .where('ownerId', '==', uid)
      .limit(1)
      .get();

    if (businessDoc.empty) {
      return NextResponse.json(
        { error: 'Business not found or you are not the owner' },
        { status: 403 },
      );
    }

    const businessRef = businessDoc.docs[0].ref;
    const businessData = businessDoc.docs[0].data();

    // Check if business already has a different custom domain
    if (
      businessData.website?.customDomain &&
      businessData.website?.customDomain !== cleanDomain &&
      businessData.website?.customDomainEnabled
    ) {
      return NextResponse.json(
        { error: `Business already has custom domain: ${businessData.website.customDomain}. Disconnect it first.` },
        { status: 400 },
      );
    }

    // ── DNS Verification (check if domain points to us) ───────
    let dnsVerified = false;
    let dnsMessage = '';

    if (!skipVerification) {
      try {
        const dnsCheck = await verifyDNS(cleanDomain);
        dnsVerified = dnsCheck.verified;
        dnsMessage = dnsCheck.message;

        if (!dnsVerified) {
          // DNS not properly configured yet — save as "pending"
          await businessRef.update({
            'website.customDomain': cleanDomain,
            'website.customDomainEnabled': false,
            'website.domainPurchased': false,
            'website.domainStatus': 'pending_dns',
            'website.dnsConfigured': false,
            'website.domainSource': 'external',
            'website.dnsInstructionsShown': new Date().toISOString(),
          });

          return NextResponse.json({
            success: false,
            verified: false,
            domain: cleanDomain,
            message: dnsMessage,
            nextSteps: 'Update your DNS settings and try verification again in 5-10 minutes.',
            dnsRecords: getRequiredDNSRecords(),
          });
        }
      } catch (error) {
        console.error('[Connect Domain] DNS verification error:', error);
        dnsVerified = false;
        dnsMessage = 'Could not verify DNS. You can skip verification and try again later.';
      }
    }

    // ── Update Firestore ───────────────────────────────────────
    const domainData = {
      'website.customDomain': cleanDomain,
      'website.customDomainEnabled': true,
      'website.domainPurchased': false,
      'website.domainStatus': 'active',
      'website.dnsConfigured': dnsVerified,
      'website.domainSource': 'external',
      'website.domainConnectedAt': new Date().toISOString(),
    };

    await businessRef.update(domainData);

    // ── Record Domain in customDomains collection ──────────────
    await adminDb.collection('customDomains').doc(cleanDomain).set({
      businessSlug,
      businessId: businessDoc.docs[0].id,
      ownerId: uid,
      domain: cleanDomain,
      source: 'external',
      createdAt: new Date().toISOString(),
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      verified: dnsVerified,
      domain: cleanDomain,
      message: dnsVerified
        ? `${cleanDomain} is now connected and active!`
        : `${cleanDomain} has been configured. DNS propagation may take up to 48 hours.`,
      dnsRecords: getRequiredDNSRecords(),
    });
  } catch (error) {
    console.error('[Connect Domain] Error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to connect domain';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── DNS Verification Helper ──────────────────────────────────

async function verifyDNS(domain: string): Promise<{ verified: boolean; message: string }> {
  try {
    // Use Google Public DNS API to check if domain points to our platform
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=CNAME`);
    const data = await response.json();

    if (!data.Answer || data.Answer.length === 0) {
      // No CNAME — try A record
      const aResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const aData = await aResponse.json();

      if (!aData.Answer || aData.Answer.length === 0) {
        return {
          verified: false,
          message: `No DNS records found for ${domain}. Please add the required CNAME record.`,
        };
      }

      // Has A records but no CNAME pointing to us
      return {
        verified: false,
        message: `${domain} has A records but no CNAME pointing to ${APP_HOSTING_DOMAIN}. Please update your DNS.`,
      };
    }

    // Check if any CNAME points to our hosting domain
    const hasValidRecord = data.Answer.some((answer: { type: number; data: string }) => {
      if (answer.type === 5) { // Type 5 = CNAME
        const target = answer.data.replace(/\.$/, ''); // Remove trailing dot
        return target.includes(APP_HOSTING_DOMAIN) ||
               target.includes('firebaseapp.com') ||
               target.includes('.hosted.app') ||
               target.includes('.run.app');
      }
      return false;
    });

    if (hasValidRecord) {
      return {
        verified: true,
        message: `DNS verification successful! ${domain} is pointing to MohnMenu.`,
      };
    }

    return {
      verified: false,
      message: `${domain} does not point to MohnMenu. Please update your CNAME record to point to ${APP_HOSTING_DOMAIN}.`,
    };
  } catch (error) {
    console.error('[DNS Verification] Error:', error);
    return {
      verified: false,
      message: 'DNS verification failed. Please check your DNS settings and try again.',
    };
  }
}

// ── Get DNS Instructions Helper ──────────────────────────────

function getRequiredDNSRecords() {
  return [
    {
      type: 'CNAME',
      name: '@',
      value: APP_HOSTING_DOMAIN,
      ttl: 600,
      note: 'Points root domain to MohnMenu',
    },
    {
      type: 'CNAME',
      name: 'www',
      value: APP_HOSTING_DOMAIN,
      ttl: 600,
      note: 'Points www subdomain to MohnMenu',
    },
  ];
}

// ── Disconnect Domain ────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyApiAuth(request);
    if (authResult.error) return authResult.error;

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const businessSlug = searchParams.get('businessSlug');
    const uid = authResult.uid;

    if (!domain || !businessSlug) {
      return NextResponse.json(
        { error: 'Missing required parameters: domain, businessSlug' },
        { status: 400 },
      );
    }

    // Verify business ownership
    const businessDoc = await adminDb
      .collection('businesses')
      .where('slug', '==', businessSlug)
      .where('ownerId', '==', uid)
      .limit(1)
      .get();

    if (businessDoc.empty) {
      return NextResponse.json(
        { error: 'Business not found or you are not the owner' },
        { status: 403 },
      );
    }

    const businessRef = businessDoc.docs[0].ref;

    // Disable custom domain
    await businessRef.update({
      'website.customDomainEnabled': false,
      'website.domainStatus': 'disconnected',
      'website.domainDisconnectedAt': new Date().toISOString(),
    });

    // Remove from customDomains collection
    await adminDb.collection('customDomains').doc(domain).delete();

    return NextResponse.json({
      success: true,
      message: `${domain} has been disconnected. Your site will now use the default mohnmenu.com/${businessSlug} URL.`,
    });
  } catch (error) {
    console.error('[Disconnect Domain] Error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to disconnect domain';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
