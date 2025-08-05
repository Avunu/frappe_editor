import tailwindcss from "tailwindcss";
import tailwindcssNesting from "@tailwindcss/nesting";
import postcssPrefixSelector from "postcss-prefix-selector";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

export default {
  plugins: [
    tailwindcssNesting,
    tailwindcss,
    autoprefixer,
    postcssPrefixSelector({
      prefix: ".frappe-editor-root",
      transform: function (prefix, selector, prefixedSelector) {
        // Don't prefix selectors that are already targeting popover containers
        if (
          selector.startsWith("#frappeui-popper-root") ||
          selector.startsWith("[data-tippy-root]") ||
          selector.includes("[data-headlessui-")
        ) {
          return selector;
        }

        // Generate dual selectors: one for .frappe-editor-root and one for popover containers
        const popoverSelectors = [
          "#frappeui-popper-root " + selector,
          "[data-tippy-root] " + selector,
        ];

        return [prefix + " " + selector, ...popoverSelectors].join(", ");
      },
    }),
    cssnano,
  ],
};
