'use client';

import React, { useState, useEffect } from 'react';

/**
 * Handles client-side hydration logic without a blocking full-screen loader.
 * This allows SSR content to be visible immediately, improving perceived performance.
 */
export function LayoutClient({ children }: { children: React.ReactNode }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // We no longer return a blocking loader here.
    // Instead, we allow children to render. 
    // Individual components should handle their own hydration-sensitive logic.
    return <>{children}</>;
}
