import { duration, easing } from "./animations";

/** Transições padronizadas por tipo de interação. */
export const transitions = {
  hover: `color ${duration.fast}ms ${easing.standard}, background-color ${duration.fast}ms ${easing.standard}, border-color ${duration.fast}ms ${easing.standard}`,
  focus: `box-shadow ${duration.fast}ms ${easing.standard}`,
  press: `transform ${duration.instant}ms ${easing.accelerate}`,
  loading: `opacity ${duration.normal}ms ${easing.standard}`,
  collapse: `height ${duration.normal}ms ${easing.standard}`,
  drawer: `transform ${duration.slow}ms ${easing.decelerate}`,
  sidebar: `width ${duration.normal}ms ${easing.standard}`,
  accordion: `height ${duration.normal}ms ${easing.standard}, opacity ${duration.fast}ms ${easing.standard}`,
} as const;

export type TransitionToken = keyof typeof transitions;
