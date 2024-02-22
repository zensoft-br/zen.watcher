export function normalize(zenReq) {
  for (const key of Object.keys(zenReq.body.args ?? {})) {
    const arg = zenReq.body.args[key];
    const props = zenReq.query.props.split(",").filter(e => e);
    for (const prop of props) {
      if (typeof arg[prop] === "string" || arg[prop] instanceof String) {
        arg[prop] = arg[prop]
          .split(" ")
          .map((e) => {
            if (zenReq.query.case === "upperCase") {
              return e.toUpperCase();
            } else if (zenReq.query.case === "lowerCase") {
              return e.toLowerCase();
            } else if (zenReq.query.case === "titleCase") {
              return titleCase(e);
            }
            return e;
          })
          .filter(e => e)
          .join(" ");
      }
    }
    zenReq.body.args[key] = arg;
  }
}

function titleCase(s) {
  // Convert to lowerCase and then to titleCase
  const titleCased = s.toLowerCase().replace(
    /(^|\P{L})(\p{L})/gu,
    (match, prefix, letter) => prefix + letter.toUpperCase(),
  );

  // Split in words and keep reserved words in lowerCase
  const reservedWords = ["de", "da", "das", "do", "dos", "e", "a", "as", "o", "os", "na", "nas", "no", "nos", "para"];
  return titleCased.split(" ")
    .map(word => {
      const lowerWord = word.toLowerCase();
      if (reservedWords.includes(lowerWord)) {
        return lowerWord;
      }
      return word;
    })
    .join(" ");
}
