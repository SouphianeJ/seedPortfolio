import { asyncArraySelectRenderer, asyncStringSelectRenderer } from "./AsyncSelectControl";
import { customRenderers } from "./customRenderers";

export const formRenderers = [
  asyncStringSelectRenderer,
  asyncArraySelectRenderer,
  ...customRenderers,
];

export { asyncArraySelectRenderer, asyncStringSelectRenderer, customRenderers };
