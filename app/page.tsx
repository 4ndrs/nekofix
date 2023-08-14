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

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key !== "q" && event.key !== "Escape") {
        return;
      }

      const { appWindow } = await import("@tauri-apps/api/window");

      appWindow.close();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
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
    <main
      onContextMenu={(event) => event.preventDefault()}
      className="relative group rounded-2xl overflow-hidden"
    >
      <Loading isFetching={isFetching} />

      {blobUrl && (
        <Image
          ref={imageRef}
          alt="image of a catgirl"
          src={blobUrl}
          width={300}
          height={300}
          draggable={false}
          className="h-screen object-cover w-auto max-w-full mx-auto select-none"
        />
      )}

      {/* draggable area to move the window */}
      <div data-tauri-drag-region className="absolute inset-3" />

      <button
        onClick={async () => {
          const { appWindow } = await import("@tauri-apps/api/window");
          appWindow.close();
        }}
        className="absolute top-3 right-4 text-white p-1 rounded-full transition duration-500 hover:bg-red-400 opacity-0 group-hover:opacity-100"
      >
        <Cross height="30" width="30" />
      </button>

      <button
        onClick={fetchImage}
        disabled={isFetching}
        className="absolute bottom-2 right-1/2 translate-x-1/2 bg-red-400 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"
      >
        <Paw className="text-pink-100 w-20 h-20" />
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
        hidden ? "opacity-0" : "opacity-100"
      } absolute top-0 left-0 h-2 bg-red-400 w-10 transition-[width] duration-700`}
    />
  );
};

const Paw = (props: React.ComponentProps<"svg">) => (
  <svg viewBox="0 0 419.14 403.6" fill="currentColor" {...props}>
    <path d="m281.78 0c-0.88 0.011256-1.79 0.054519-2.69 0.125-35.82 6.1835-55.52 44.064-58.37 77.469-4.17 30.316 9.19 69.266 42.47 76.066 4.83 0.92 9.84 0.5 14.56-0.78 40.08-13.44 58.01-60.908 52.22-100.22-1.69-25.396-20.83-53.009-48.19-52.66zm-151.87 1.625c-22.28 0.5468-39.63 23.138-43.16 44.375-7.441 42.074 11.698 94.35 55.53 107.66 4.11 0.89 8.35 0.98 12.5 0.34 29.63-4.94 42.18-38.15 40.94-64.969-0.89-35.372-19.27-76.273-56-86.218-3.36-0.8909-6.63-1.2661-9.81-1.188zm248.93 119.5c-38.53 2.31-64.95 40.76-68.72 76.66-5.09 25.89 8.71 60.53 38.26 62.6 41.19-0.51 69.3-44.53 70.46-82.41 2.61-25.05-12.15-55.46-40-56.85zm-337.28 8.54c-16.394-0.14-32.517 9.68-37.874 26.34-14.293 44.58 14.408 101.04 61.624 110.41 19.706 3.37 37.018-11.76 41.908-29.97 10.35-38.95-10.915-84.17-46.908-101.85-5.863-3.29-12.334-4.88-18.75-4.93zm172.75 79.93c-32.14 0.07-64.78 16.38-85.59 40.66-22.48 28.3-40.892 61.23-48.095 96.94-8.751 25.7 11.083 55.29 38.565 55.47 33.06 0.91 61.47-21.79 94.34-23.47 27.89-4.25 52.86 10.25 77.94 19.75 21.35 9.13 50.85 5.63 61.75-17.35 8.57-23.41-4.05-48.39-14.5-69.18-21.32-33.76-44.17-69.24-79.13-90.32-14.01-8.68-29.58-12.53-45.28-12.5z" />
  </svg>
);

const Cross = (props: React.ComponentProps<"svg">) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="currentColor"
    {...props}
  >
    <path
      d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

export default Page;
