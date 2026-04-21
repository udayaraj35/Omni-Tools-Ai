'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

// This component renders the Europass logo as a static image.
const EuropassLogo = ({ className, style }: { className?: string; style?: React.CSSProperties }) => {
  return (
    <Image
      src="https://i.imgur.com/gBhoUiG.png"
      alt="Europass Logo"
      width={130}
      height={30}
      className={cn('w-auto', className)}
      style={style}
    />
  );
};

export default EuropassLogo;
