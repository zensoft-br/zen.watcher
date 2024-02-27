export function normalize(zenReq) {
  const zenRes = {
    statusCode: 200,
    body: {
      args: {},
    },
  };

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
    zenRes.body.args[key] = arg;
  }

  return zenRes;
}

export function titleCase(s) {
  // Convert to lowerCase and then to titleCase
  const titleCased = s.toLowerCase().replace(
    // /(^|\P{L})(\p{L})/gu,
    /(^|[^\p{L}\p{Nd}])([\p{L}\p{Nd}])/gu,
    (match, prefix, letter) => prefix + letter.toUpperCase(),
  );

  // Split in words and keep reserved words in lowerCase
  const reservedWords = ["com", "de", "da", "das", "do", "dos", "e", "em", "a", "as", "o", "os", "na", "nas", "no", "nos", "para"];
  return titleCased.split(" ")
    .map((word, i) => {
      if (i > 0) {
        const lowerWord = word.toLowerCase();
        if (reservedWords.includes(lowerWord)) {
          return lowerWord;
        }}
      return word;
    })
    .join(" ");
}
