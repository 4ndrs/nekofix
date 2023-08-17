import { create } from "zustand";

type Neko = "kanade" | "fran";

type NekoStore = {
  nekos: Neko[];
  enableNeko: (neko: Neko) => void;
  disableNeko: (neko: Neko) => void;
};

const useNekoStore = create<NekoStore>((set, get) => ({
  nekos: ["fran", "kanade"],
  enableNeko: (neko) => {
    const currentNekos = get().nekos;

    if (currentNekos.includes(neko)) {
      return;
    }

    set({ nekos: [...currentNekos, neko] });
  },
  disableNeko: (neko) => {
    const currentNekos = get().nekos;

    if (currentNekos.length > 1) {
      set({ nekos: currentNekos.filter((cat) => cat !== neko) });
      return;
    }

    // at least one neko needs to be always enabled
    if (neko === "kanade") {
      set({ nekos: ["fran"] });
    } else {
      set({ nekos: ["kanade"] });
    }
  },
}));

export default useNekoStore;
