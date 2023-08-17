"use client";

import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";

import clsx from "clsx";
import axios from "axios";

import Image from "next/image";

import { useEffect, useRef, useState } from "react";
import { useNekoStore } from "./store";

import SideMenu from "./components/side-menu";
import Loading from "./components/loading";
import Shigure from "./assets/15141311421079.jpg";
import Paw from "./components/svg/paw";

const endpoint = "https://placeneko.com/api/random";

const Page = () => {
  const [blobUrl, setBlobUrl] = useState<string>();
  const [isFetching, setIsFetching] = useState(false);
  const [sideMenuIsOpen, setSideMenuIsOpen] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const previousWidthRef = useRef<number>();

  const { nekos } = useNekoStore();

  useEffect(() => {
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

    const nekoFilter = `?nekos=${nekos.join(",")}`;

    try {
      const { data: blob } = await axios.get<Blob>(endpoint + nekoFilter, {
        responseType: "blob",
      });

      const blobUrl = URL.createObjectURL(blob);

      setBlobUrl(blobUrl);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden">
      <main
        onContextMenu={(event) => event.preventDefault()}
        className="relative"
      >
        <Loading isFetching={isFetching} />

        <Image
          ref={imageRef}
          alt="image of a catgirl"
          src={blobUrl || Shigure}
          width={300}
          height={300}
          draggable={false}
          className="h-screen object-cover w-auto max-w-full mx-auto select-none"
        />

        {/* draggable area to move the window */}
        <div data-tauri-drag-region className="absolute inset-3" />

        <button
          onClick={() => setSideMenuIsOpen(true)}
          className={clsx(
            "absolute top-3 left-4 text-white p-1 rounded-full transition duration-500 hover:bg-red-400 opacity-0",
            {
              "group-hover:opacity-100": !sideMenuIsOpen,
            },
          )}
        >
          <HamburgerMenuIcon width={30} height={30} />
        </button>

        <button
          onClick={async () => {
            const { appWindow } = await import("@tauri-apps/api/window");
            appWindow.close();
          }}
          className={clsx(
            "absolute top-3 right-4 text-white p-1 rounded-full transition duration-500 hover:bg-red-400 opacity-0",
            { "group-hover:opacity-100": !sideMenuIsOpen },
          )}
        >
          <Cross1Icon height="30" width="30" />
        </button>

        <button
          onClick={fetchImage}
          disabled={isFetching}
          className={clsx(
            "absolute bottom-2 right-1/2 translate-x-1/2 bg-red-400 p-3 opacity-0 transition-opacity duration-500 rounded-full",
            { "group-hover:opacity-100": !sideMenuIsOpen },
          )}
        >
          <Paw className="text-pink-100 w-20 h-20" />
        </button>
      </main>

      <SideMenu
        open={sideMenuIsOpen}
        onClose={() => setSideMenuIsOpen(false)}
      />
    </div>
  );
};

export default Page;
