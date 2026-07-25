import Image from 'next/image';

interface Props {
  size?: number;
}

export default function LogoMark({ size = 36 }: Props) {
  return (
    <Image
      src="/logo.png"
      alt="Dakshin Vihar"
      width={size}
      height={size}
      priority
      className="rounded-full object-cover"
      style={{
        width: size,
        height: 'auto',
      }}
    />
  );
}