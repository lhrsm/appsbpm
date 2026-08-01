/** Camadas de empilhamento — evita `z-[9999]` espalhado pelo projeto. */
export const zIndex = {
  base: 0,
  raised: 10,
  sticky: 20,
  header: 30,
  drawer: 40,
  overlay: 45,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  skipLink: 100,
} as const;

export type ZIndexToken = keyof typeof zIndex;

export const zIndexClass: Record<ZIndexToken, string> = {
  base: "z-0",
  raised: "z-10",
  sticky: "z-20",
  header: "z-30",
  drawer: "z-40",
  overlay: "z-[45]",
  modal: "z-50",
  popover: "z-[60]",
  tooltip: "z-[70]",
  toast: "z-[80]",
  skipLink: "z-[100]",
};
