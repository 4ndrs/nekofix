"use client";

import axios from "axios";
import Image from "next/image";

import { useEffect, useRef, useState } from "react";

const endpoint = "https://placeneko.com/api/random";

const Page = () => {
  const [isFetching, setIsFetching] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string>();
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

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

  const handleSetAlwaysOnTop = async () => {
    const { appWindow } = await import("@tauri-apps/api/window");

    if (isAlwaysOnTop) {
      await appWindow.setAlwaysOnTop(false);

      setIsAlwaysOnTop(false);

      return;
    }

    await appWindow.setAlwaysOnTop(true);

    setIsAlwaysOnTop(true);
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
        onClick={handleSetAlwaysOnTop}
        className="absolute top-3 left-4 text-white p-1 rounded-full transition duration-500 hover:bg-red-400 opacity-0 group-hover:opacity-100"
      >
        {isAlwaysOnTop ? (
          <PinFilled height="30" width="30" />
        ) : (
          <Pin height="30" width="30" />
        )}
      </button>

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

const Pin = (props: React.ComponentProps<"svg">) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="currentColor"
    {...props}
  >
    <path
      d="M10.3285 1.13607C10.1332 0.940809 9.81662 0.940808 9.62136 1.13607C9.42609 1.33133 9.42609 1.64792 9.62136 1.84318L10.2744 2.49619L5.42563 6.13274L4.31805 5.02516C4.12279 4.8299 3.80621 4.8299 3.61095 5.02516C3.41569 5.22042 3.41569 5.537 3.61095 5.73226L5.02516 7.14648L6.08582 8.20714L2.81545 11.4775C2.62019 11.6728 2.62019 11.9894 2.81545 12.1846C3.01072 12.3799 3.3273 12.3799 3.52256 12.1846L6.79293 8.91425L7.85359 9.97491L9.2678 11.3891C9.46306 11.5844 9.77965 11.5844 9.97491 11.3891C10.1702 11.1939 10.1702 10.8773 9.97491 10.682L8.86733 9.57443L12.5039 4.7257L13.1569 5.37871C13.3522 5.57397 13.6687 5.57397 13.864 5.37871C14.0593 5.18345 14.0593 4.86687 13.864 4.6716L12.8033 3.61094L11.3891 2.19673L10.3285 1.13607ZM6.13992 6.84702L10.9887 3.21047L11.7896 4.01142L8.15305 8.86015L6.13992 6.84702Z"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

const PinFilled = (props: React.ComponentProps<"svg">) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="currentColor"
    {...props}
  >
    <path
      d="M9.62129 1.13607C9.81656 0.940808 10.1331 0.940809 10.3284 1.13607L11.3891 2.19673L12.8033 3.61094L13.8639 4.6716C14.0592 4.86687 14.0592 5.18345 13.8639 5.37871C13.6687 5.57397 13.3521 5.57397 13.1568 5.37871L12.5038 4.7257L8.86727 9.57443L9.97485 10.682C10.1701 10.8773 10.1701 11.1939 9.97485 11.3891C9.77959 11.5844 9.463 11.5844 9.26774 11.3891L7.85353 9.97491L6.79287 8.91425L3.5225 12.1846C3.32724 12.3799 3.01065 12.3799 2.81539 12.1846C2.62013 11.9894 2.62013 11.6728 2.81539 11.4775L6.08576 8.20714L5.0251 7.14648L3.61089 5.73226C3.41563 5.537 3.41562 5.22042 3.61089 5.02516C3.80615 4.8299 4.12273 4.8299 4.31799 5.02516L5.42557 6.13274L10.2743 2.49619L9.62129 1.84318C9.42603 1.64792 9.42603 1.33133 9.62129 1.13607Z"
      fillRule="evenodd"
      clipRule="evenodd"
    />
    <path
      d="M9.62129 1.13607C9.81656 0.940808 10.1331 0.940809 10.3284 1.13607L11.3891 2.19673L12.8033 3.61094L13.8639 4.6716C14.0592 4.86687 14.0592 5.18345 13.8639 5.37871C13.6687 5.57397 13.3521 5.57397 13.1568 5.37871L12.5038 4.7257L8.86727 9.57443L9.97485 10.682C10.1701 10.8773 10.1701 11.1939 9.97485 11.3891C9.77959 11.5844 9.463 11.5844 9.26774 11.3891L7.85353 9.97491L6.79287 8.91425L3.5225 12.1846C3.32724 12.3799 3.01065 12.3799 2.81539 12.1846C2.62013 11.9894 2.62013 11.6728 2.81539 11.4775L6.08576 8.20714L5.0251 7.14648L3.61089 5.73226C3.41563 5.537 3.41562 5.22042 3.61089 5.02516C3.80615 4.8299 4.12273 4.8299 4.31799 5.02516L5.42557 6.13274L10.2743 2.49619L9.62129 1.84318C9.42603 1.64792 9.42603 1.33133 9.62129 1.13607Z"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

export default Page;
