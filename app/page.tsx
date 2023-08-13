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
      <Loading isFetching={isFetching} />

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

      <button
        onClick={fetchImage}
        className="absolute bottom-2 right-1/2 translate-x-1/2 bg-red-400 px-6 py-2"
      >
        Paw
      </button>
    </main>
  );
};

const Loading = ({ isFetching }: { isFetching: boolean }) => {
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let bufferId: NodeJS.Timer;
    let hideId: NodeJS.Timer;

    if (isFetching) {
      setHidden(false);
      setLoadPercentage(30);

      bufferId = setInterval(
        () =>
          setLoadPercentage((previous) => {
            if (previous < 80) {
              return previous + 5;
            }

            clearInterval(bufferId);
            return previous;
          }),
        100,
      );
    } else {
      setLoadPercentage(100);

      hideId = setTimeout(() => {
        setHidden(true);
        setLoadPercentage(0);
      }, 700);
    }

    return () => {
      clearInterval(bufferId);
      clearTimeout(hideId);
    };
  }, [isFetching]);

  return (
    <div
      style={{ width: loadPercentage + "%" }}
      className={`${
        hidden ? "hidden" : "block"
      } fixed top-0 left-0 h-2 bg-blue-400 w-10 transition-width duration-700`}
    />
  );
};

export default Page;
