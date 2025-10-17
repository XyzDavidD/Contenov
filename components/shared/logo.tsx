import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="/assets/logo.png"
        alt="Contenov Logo"
        width={120}
        height={120}
        className="rounded-lg"
      />
    </Link>
  );
}

