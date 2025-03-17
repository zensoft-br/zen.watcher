import { titleCase } from "../src/normalize.js";

test("", () => {
  expect(titleCase("foo bar")).toBe("Foo Bar");
  expect(titleCase("FOO BAR")).toBe("Foo Bar");
  expect(titleCase("a casa de papel")).toBe("A Casa de Papel");
  expect(titleCase("A CASA DE PAPEL")).toBe("A Casa de Papel");
  expect(titleCase("15km")).toBe("15km");
  expect(titleCase("15KM")).toBe("15km");
  expect(titleCase("de mim para você")).toBe("De Mim para Você");
  expect(titleCase("DE MIM PARA VOCÊ")).toBe("De Mim para Você");
  expect(titleCase("um e dois")).toBe("Um e Dois");
  expect(titleCase("UM E DOIS")).toBe("Um e Dois");
  expect(titleCase("acme importaçao e exportaçao ltda.")).toBe("Acme Importaçao e Exportaçao Ltda.");
  expect(titleCase("ACME IMPORTAÇAO E EXPORTAÇAO LTDA.")).toBe("Acme Importaçao e Exportaçao Ltda.");
});
