import { cn } from "@/lib/utils";
import Image from "next/image";

const Logo = ({ className }: { className?: string }) => (
    <div className={cn("relative flex items-center justify-center", className)}>
        <Image
          src="https://i.imgur.com/jx67IkZ.png"
          alt="OmniTools AI Logo"
          width={265}
          height={265}
          className="object-contain"
          priority
        />
    </div>
  );
  
  export default Logo;
