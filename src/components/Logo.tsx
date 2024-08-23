import { useTheme } from "next-themes";
import Image from "next/image";
import basil_logo from "public/logo.png";
import { useEffect, useState } from "react";

export function Logo() {
  const [is_client, set_is_client] = useState(false);
  useEffect(() => {
    if (!is_client) {
      set_is_client(true);
    }
  }, []);
  return is_client ? <BasilLogo /> : null;
}

function BasilLogo() {
  const { theme } = useTheme();
  return (
    <div className="flex items-center gap-2">
      <Image className="mt-2 w-12" src={basil_logo} alt="Basil logo" />
      <h1 className="text-6xl font-medium tracking-wide">BASILY</h1>
    </div>
  );
}
