"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const MAGNIFY_SIZE = 200;
const MAGNIFY_SIZE_HALF = MAGNIFY_SIZE / 2;

export default function MagnifyImage({ url }: { url: string }) {
  const [magnifyStyle, setMagnifyStyle] = useState({
    backgroundImage: `url(${url})`,
    display: "none",
  });

  useEffect(() => {
    setMagnifyStyle((prev) => ({
      ...prev,
      backgroundImage: `url(${url})`,
    }));
  }, [url]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { offsetX, offsetY, target } = e.nativeEvent;
    const { offsetWidth, offsetHeight } = target as HTMLElement;

    const xPercentage = (offsetX / offsetWidth) * 100;
    const yPercentage = (offsetY / offsetHeight) * 100;

    setMagnifyStyle((prev) => ({
      ...prev,
      display: "block",
      top: `${offsetY - MAGNIFY_SIZE_HALF}px`,
      left: `${offsetX - MAGNIFY_SIZE_HALF}px`,
      backgroundPosition: `${xPercentage}% ${yPercentage}%`,
    }));
  };

  const handleMouseLeave = () => {
    setMagnifyStyle((prev) => ({
      ...prev,
      display: "none",
    }));
  };

  return (
    <div className="relative cursor-none rounded-lg border border-white">
      <Image
        src={url}
        alt="Ocorrência"
        width={1000}
        height={1000}
        draggable={false}
        priority
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="w-[25rem] rounded-lg"
      />
      <div className="magnify" style={magnifyStyle}></div>
    </div>
  );
}
