import { useTheme } from 'next-themes';
import Image from 'next/image';

export function ThemedImage({ lightSrc, darkSrc, alt, width = 500, height = 300 }) {
  const { theme } = useTheme();

  const src = theme === 'dark' ? darkSrc : lightSrc;

  return <Image src={src} alt={alt} width={width} height={height} />;
}
