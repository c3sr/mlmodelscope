export default function MultipleSort(array, options) {
  return array?.sort((a, b) => {
    for (let i = 0; i < options.length; i++) {
      let [option, direction] = normalizeOption(options[i]);
      let aVal = getValue(option, a), bVal = getValue(option, b);

      if (aVal === bVal) continue;

      if (direction === ascending)
        return aVal > bVal ? 1 : -1;

      return bVal > aVal ? 1 : -1;
    }
  });
}

const getValue = (option, value) => {
  if (typeof (option) === "function") return option(value);

  return value[option];
};

export const ascending = "asc";
export const descending = "desc";

const normalizeOption = (opt) => {
  if (!Array.isArray(opt)) return [opt, ascending];

  let [option, direction] = opt;
  return [option, direction ?? ascending];
}

