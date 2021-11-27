import { argv } from "process";
import fs from "fs";
import Scanner from "./scanner";
import readline from "readline";
import Token from "./token";
import { TokenType } from "./tokenTypes";
import { Parser } from "./parser";
import Interpreter from "./interpreter";
import { Resolver } from "./resolver";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export default class Lox {
  static hadError = false;
  interpreter = new Interpreter();
  constructor() {
    if (argv.length > 3) {
      console.log("Usage: jlox [script]");
      process.exit(1);
    } else if (argv.length == 3) {
      this.runFile(argv[2]);
    } else {
      this.runPrompt();
    }
  }

  runFile(file: string): void {
    console.log(`Running file: ${file}\n`);

    let contents: string;

    try {
      contents = fs.readFileSync(file, "utf-8");
    } catch (e) {
      Lox.hadError = true;

      console.error("\nError! Make sure the file exists\n");
      console.log(e);

      process.exit(1);
    }

    this.run(contents);
    process.exit(1);
  }

  runPrompt(): void {
    rl.question("> ", (value) => {
      if (!value) {
        process.exit(1);
      } else {
        this.run(value);

        Lox.hadError = false;

        this.runPrompt();
      }
    });
  }

  run(source: string): void {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    const parser = new Parser(tokens);
    const statements = parser.parse();

    const resolver = new Resolver(this.interpreter);
    resolver.resolve(statements);

    if (Lox.hadError) return;

    if (statements !== null) {
      this.interpreter.interpret(statements);
    }
  }

  static error(line: number, message: string): void {
    this.report(line, "", message);
  }

  static errorWithToken(token: Token, message: string): void {
    if (token.type == TokenType.EOF) {
      this.report(token.line, " at end", message);
    } else {
      this.report(token.line, " at '" + token.lexeme + "'", message);
    }
  }

  static report(line: number, where: string, message: string): void {
    console.log("[line " + line + "] Error" + where + ": " + message);
    this.hadError = true;
  }
}

new Lox();
