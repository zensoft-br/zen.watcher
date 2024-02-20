export function normalize(z_req) {
  const bean = z_req.body.args.bean;
  const props = z_req.query.props.split(",").filter(e => e);
  for (const prop of props) {
    if (typeof bean[prop] === "string" || bean[prop] instanceof String) {
      bean[prop] = bean[prop]
        .split(" ")
        .map((e, i) => {
          if (z_req.query.case === "upperCase") {
            return e.toUpperCase();
          } else if (z_req.query.case === "lowerCase") {
            return e.toLowerCase();
          } else if (z_req.query.case === "titleCase") {
            e = e.toLowerCase();
            const reservedWords = ["de", "da", "das", "do", "dos", "e", "a", "o", "as", "os", "na", "no", "nas", "nos"];
            if (reservedWords.includes(e) && i !== 0) {
              return e;
            }
            return e.charAt(0).toUpperCase() + e.slice(1);
          }
          return e;
        })
        .filter(e => e)
        .join(" ");
    }
  }
  z_req.body.args.bean = bean;
}