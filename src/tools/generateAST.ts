import fs from "fs";
import path from "path";

class GenerateAST {
  constructor() {
    if (process.argv.length != 3) {
      console.log("Usage: generate-ast <output-directory>");
      process.exit(1);
    }

    const outputDir = process.argv[2];

    this.defineAst(outputDir, "Expr", [
      "Binary   : Expr left, Token operator, Expr right",
      "Grouping : Expr expression",
      "Literal  : LiteralType value",
      "Unary    : Token operator, Expr right",
    ]);
  }

  private defineAst(
    outputDir: string,
    baseName: string,
    types: string[]
  ): void {
    const destPath = path.join(outputDir, baseName.toLowerCase() + ".ts");

    const writer = fs.createWriteStream(destPath, "utf-8");

    writer.write(`import Token, { LiteralType } from "./token";\n\n`, () => {
      writer.write(`abstract class ${baseName} {}\n`);
      for (const type of types) {
        const className = type.split(":")[0].trim();
        const fields = type.split(":")[1].trim();

        this.defineType(writer, baseName, className, fields);
      }

      writer.end();
    });
  }

  private defineType(
    writer: fs.WriteStream,
    baseName: string,
    className: string,
    fieldList: string
  ): void {
    writer.write(`\nexport class ${className} extends ${baseName} {\n`);

    // Store parameters in fields.
    const fields = fieldList.split(", ");

    // Separate types and field names [type, fieldname]
    const fieldPairs = fields.map((field) => {
      return field.split(" ");
    });

    const fieldListForTypescript = fieldPairs
      .map(([type, name]) => {
        return `${name}: ${type}`;
      })
      .join(", ");

    // Constructor.
    writer.write(`  constructor(${fieldListForTypescript}) {\n`);
    writer.write(`    super();\n`);

    for (const fieldPair of fieldPairs) {
      const name = fieldPair[1];
      writer.write(`    this.${name} = ${name};\n`);
    }
    writer.write("  }\n");

    writer.write("\n");

    // Fields.
    for (const [type, name] of fieldPairs) {
      writer.write(`  ${name}: ${type};\n`);
    }

    writer.write("}\n");
  }
}

new GenerateAST();
