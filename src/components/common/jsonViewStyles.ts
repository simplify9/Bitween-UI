import { defaultStyles } from 'react-json-view-lite';

// Colorized styling for react-json-view-lite, close to the previous react-json-view look.
// We keep the library's base classes (layout + expand/collapse arrows) and append Tailwind
// color utilities. The `!` prefix (important) is needed so our colors win over the
// library's own base-class colors regardless of stylesheet order.
export const jsonViewStyles = {
  ...defaultStyles,
  label: `${defaultStyles.label} !text-[#a21caf] font-medium`, // keys
  stringValue: `${defaultStyles.stringValue} !text-[#cb4b16]`, // "strings"
  numberValue: `${defaultStyles.numberValue} !text-[#268bd2]`, // numbers
  booleanValue: `${defaultStyles.booleanValue} !text-[#268bd2]`, // true/false
  nullValue: `${defaultStyles.nullValue} !text-[#93a1a1]`, // null
  undefinedValue: `${defaultStyles.undefinedValue} !text-[#93a1a1]`,
  punctuation: `${defaultStyles.punctuation} !text-[#657b83]`, // : , { } [ ]
};
