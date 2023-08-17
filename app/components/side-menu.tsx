import clsx from "clsx";

import { Cross1Icon } from "@radix-ui/react-icons";
import { Switch } from "./ui/switch";

import { useAlwaysOnTop, useNekoStore } from "@/app/store";

type Props = { open: boolean; onClose: () => void };

const SideMenu = ({ open, onClose }: Props) => {
  const { alwaysOnTop, setAlwaysOnTop } = useAlwaysOnTop();
  const { nekos, disableNeko, enableNeko } = useNekoStore();

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className={clsx("absolute inset-0", { hidden: !open })}
      />

      <aside
        data-tauri-drag-region
        className={clsx(
          "absolute w-96 inset-y-8 bg-white rounded-r-xl transition-[left] duration-500",
          { "left-0": open, "-left-[24rem]": !open },
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 rounded-full p-1 hover:bg-red-400 text-slate-500 hover:text-white duration-500 transition-colors"
        >
          <Cross1Icon height={30} width={30} />
        </button>

        <div data-tauri-drag-region className="px-8 py-16 flex flex-col gap-7">
          <h1 className="font-bold text-3xl">Settings</h1>

          <div className="flex flex-col">
            <h2 className="font-semibold text-xl mb-1">General</h2>

            <label className="flex justify-between">
              Always on top
              <Switch
                checked={alwaysOnTop}
                onCheckedChange={() => setAlwaysOnTop(!alwaysOnTop)}
              />
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-xl mb-1">Nekos</h2>

            <label className="flex justify-between">
              Kanade
              <Switch
                checked={nekos.includes("kanade")}
                onCheckedChange={() => {
                  if (nekos.includes("kanade")) {
                    disableNeko("kanade");
                    return;
                  }

                  enableNeko("kanade");
                }}
              />
            </label>
            <label className="flex justify-between">
              Fran
              <Switch
                checked={nekos.includes("fran")}
                onCheckedChange={() => {
                  if (nekos.includes("fran")) {
                    disableNeko("fran");
                    return;
                  }

                  enableNeko("fran");
                }}
              />
            </label>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideMenu;
