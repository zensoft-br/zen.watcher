export function normalize(z_req) {
  const bean = z_req.body.args.bean;
  const props = z_req.query.props.split(",").filter(e => e);
  for (const prop of props) {
    if (typeof bean[prop] === "string" || bean[prop] instanceof String) {
      bean[prop] = bean[prop]
        .split(" ")
        .map((e) => {
          if (z_req.query.case === "upperCase") {
            return e.toUpperCase();
          } else if (z_req.query.case === "lowerCase") {
            return e.toLowerCase();
          } else if (z_req.query.case === "titleCase") {
            return titleCase(e);
          }
          return e;
        })
        .filter(e => e)
        .join(" ");
    }
  }
  z_req.body.args.bean = bean;
}

function titleCase(s) {
  // Convert to lowerCase and then to titleCase
  const titleCased = s.toLowerCase().replace(
    /(^|\P{L})(\p{L})/gu,
    (match, prefix, letter) => prefix + letter.toUpperCase(),
  );

  // Split in words and keep reserved words in lowerCase
  const reservedWords = ["de", "da", "das", "do", "dos", "e", "a", "as", "o", "os", "na", "nas", "no", "nos"];
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
