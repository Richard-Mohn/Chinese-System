'use client';

import { useEffect } from 'react';

/**
 * Tawk.to Live Chat Widget — MohnMenu (chinesesite)
 * Property ID: 698aaaf4d2e37f1c3691a253
 * Widget ID:   1jh2qnir8
 */
export default function TawkChat() {
  useEffect(() => {
    // Inject Tawk.to script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/698aaaf4d2e37f1c3691a253/1jh2qnir8';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);

    // Offset the widget so it doesn't overlap bottom nav
    const style = document.createElement('style');
    style.textContent = `
      .widget-visible iframe[title="chat widget"] {
        bottom: 80px !important;
      }
      @media (max-width: 768px) {
        .widget-visible iframe[title="chat widget"] {
          bottom: 70px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      script.remove();
      style.remove();
    };
  }, []);

  return null;
}
