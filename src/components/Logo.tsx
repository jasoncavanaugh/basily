import { useTheme } from "next-themes";
import Image from "next/image";
import basil_logo_light from "public/basil-logo-light.png";
import basil_logo_dark from "public/basil-logo-dark.png";
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
    <Image
      className="w-40 md:w-72"
      src={theme === "dark" ? basil_logo_dark : basil_logo_light}
      alt="Basil logo"
    />
  );
}
