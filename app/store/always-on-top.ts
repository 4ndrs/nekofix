import { create } from "zustand";

type AlwaysOnTopStore = {
  alwaysOnTop: boolean;
  setAlwaysOnTop: (value: boolean) => void;
};

const useAlwaysOnTopStore = create<AlwaysOnTopStore>((set) => ({
  alwaysOnTop: false,
  setAlwaysOnTop: async (value) => {
    const { appWindow } = await import("@tauri-apps/api/window");

    await appWindow.setAlwaysOnTop(value);

    set({ alwaysOnTop: value });
  },
}));

export default useAlwaysOnTopStore;
