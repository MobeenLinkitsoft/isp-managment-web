'use client';

import { useEffect } from 'react';

export default function RemoveExtensionAttrs() {
  useEffect(() => {
    // Remove browser extension attributes that cause hydration mismatches
    document.body.removeAttribute('data-new-gr-c-s-check-loaded');
    document.body.removeAttribute('data-gr-ext-installed');
    document.body.removeAttribute('data-gr-aaa-loaded');
  }, []);

  return null;
}