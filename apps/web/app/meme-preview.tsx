import Image from "next/image";
import type { Option } from "@/lib/cowriter/contracts";
import { captionLayout, galleryLayout } from "@/lib/cowriter/layout";

export function MemePreview({ option, url, framed = false, first = false }: {
  option: Option; url: string; framed?: boolean; first?: boolean;
}) {
  const layout = framed ? galleryLayout(option.caption) : captionLayout(option.caption, option.width, option.height);
  const { width, height, photoHeight, bandHeight, lines, fontSize } = layout;
  const label = option.alt.slice(0, 220) + ". Caption: " + option.caption;
  const start = framed ? (bandHeight - lines.length * 62) / 2 : photoHeight + 32;
  const text = lines.map((line, index) => <text key={index} x={width / 2} y={start + index * 62 + 43}
    textAnchor="middle" fontSize={fontSize} className="cw-meme-caption">{line}</text>);

  if (framed) return <div className="funny-thumbnail" role="img" aria-label={label}>
    <Image src={url} alt="" width={640} height={480} unoptimized preload={first} />
    <svg viewBox={'0 0 ' + width + ' ' + bandHeight} aria-hidden="true">{text}</svg>
  </div>;

  return <svg className="cw-meme" viewBox={'0 0 ' + width + ' ' + height} role="img" aria-label={label}>
    <title>{option.caption}</title><rect width={width} height={height} className="cw-meme-paper"/>
    <image href={url} width={width} height={photoHeight} preserveAspectRatio="xMidYMid meet"/>{text}
  </svg>;
}
