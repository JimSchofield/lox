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
      "Assign   : Token name, Expr value",
      "Binary   : Expr left, Token operator, Expr right",
      "Call     : Expr callee, Token paren, Expr[] args",
      "Get      : Expr object, Token name",
      "Grouping : Expr expression",
      "Literal  : LiteralType value",
      "Logical  : Expr left, Token operator, Expr right",
      "Set      : Expr object, Token name, Expr value",
      "Unary    : Token operator, Expr right",
      "Variable : Token name",
    ]);

    this.defineAst(outputDir, "Stmt", [
      "Block      : Stmt[] statements",
      "Class      : Token name, Func[] methods",
      "If         : Expr condition, Stmt thenBranch," +
                  " Stmt|null elseBranch",
      "Expression : Expr expression",
      "Func       : Token name, Token[] params," +
                  " Stmt[] body",
      "Print      : Expr expression",
      "Return     : Token keyword, Expr|null value",
      "Var        : Token name, Expr|null initializer",
      "While      : Expr condition, Stmt body",
    ]);
  }

  private defineAst(
    outputDir: string,
    baseName: string,
    types: string[]
  ): void {
    const destPath = path.join(outputDir, baseName.toLowerCase() + ".ts");

    const writer = fs.createWriteStream(destPath, "utf-8");

    writer.write(`import Token, { LiteralType } from "./token";\n\n`);
    this.defineVisitors(writer, baseName, types);
    writer.write(`export abstract class ${baseName} {\n`);
    writer.write(`  abstract accept<R>(visitor: Visitor<R>): R;\n`);
    writer.write(`}\n`, () => {
      for (const type of types) {
        const className = type.split(":")[0].trim();
        const fields = type.split(":")[1].trim();

        this.defineType(writer, baseName, className, fields);
      }

      writer.end();
    });
  }

  private defineVisitors(
    writer: fs.WriteStream,
    baseName: string,
    types: string[]
  ) {
    writer.write(`export interface Visitor<R> {\n`);
    for (const type of types) {
      const typeName = type.split(":")[0].trim();
      writer.write(
        `  visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): R;\n`
      );
    }
    writer.write(`}\n\n`);
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

    writer.write("  accept<R>(visitor: Visitor<R>): R {\n");
    writer.write(`    return visitor.visit${className}${baseName}(this);\n`);
    writer.write("  }\n\n");

    // Fields.
    for (const [type, name] of fieldPairs) {
      writer.write(`  ${name}: ${type};\n`);
    }

    writer.write("}\n");
  }
}

new GenerateAST();
