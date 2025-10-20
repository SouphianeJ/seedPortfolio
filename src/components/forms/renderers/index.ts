import { asyncArraySelectRenderer, asyncStringSelectRenderer } from "./AsyncSelectControl";
import { customRenderers } from "./customRenderers";

export const formRenderers = [
  ...customRenderers,
  asyncStringSelectRenderer,
  asyncArraySelectRenderer,
];

export { asyncArraySelectRenderer, asyncStringSelectRenderer, customRenderers };
