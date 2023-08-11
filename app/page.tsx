"use client";

import axios from "axios";
import Image from "next/image";

import { useEffect, useRef, useState } from "react";

const endpoint = "https://placeneko.com/api/random";

const Page = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>();

  const imageRef = useRef<HTMLImageElement>(null);
  const previousWidthRef = useRef<number>();

  useEffect(() => {
    fetchImage();
  }, []);

  useEffect(() => {
    const imageElement = imageRef.current;

    if (!imageElement) {
      return;
    }

    const updateWindowSize = async () => {
      const { appWindow, LogicalSize } = await import("@tauri-apps/api/window");

      const newWidth = Math.floor(
        (imageElement.naturalWidth * imageElement.height) /
          imageElement.naturalHeight,
      );

      const newWindowSize = new LogicalSize(newWidth, imageElement.height);

      await appWindow.setSize(newWindowSize);
      await updateWindowPosition(newWidth);

      previousWidthRef.current = newWidth;
    };

    const updateWindowPosition = async (newWidth: number) => {
      if (typeof previousWidthRef.current === "undefined") {
        return;
      }

      const { appWindow, LogicalPosition } = await import(
        "@tauri-apps/api/window"
      );

      const currentPosition = (await appWindow.outerPosition()).toLogical(
        await appWindow.scaleFactor(),
      );

      const offset = previousWidthRef.current - newWidth;

      const newWindowPosition = new LogicalPosition(
        currentPosition.x + offset / 2,
        currentPosition.y,
      );

      await appWindow.setPosition(newWindowPosition);
    };

    imageElement.addEventListener("load", updateWindowSize);

    return () => imageElement.removeEventListener("load", updateWindowSize);
  }, [blobUrl]);

  const fetchImage = async () => {
    setIsFetching(true);

    try {
      const { data: blob } = await axios.get<Blob>(endpoint, {
        responseType: "blob",
      });

      const blobUrl = URL.createObjectURL(blob);

      setBlobUrl(blobUrl);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <main>
      {blobUrl && (
        <Image
          ref={imageRef}
          alt="image of a catgirl"
          src={blobUrl}
          width={300}
          height={300}
          className="h-screen object-cover w-auto max-w-full mx-auto"
        />
      )}

      {isFetching && (
        <div className="absolute inset-0 text-3xl bold flex justify-center items-center backdrop-blur">
          <span className="text-blue-800 animate-bounce">Loading Now...</span>
        </div>
      )}

      <button
        onClick={fetchImage}
        className="absolute bottom-2 right-1/2 translate-x-1/2 bg-red-400 px-6 py-2"
      >
        Paw
      </button>
    </main>
  );
};

export default Page;
