import { argv } from "process";
import fs from "fs";
import readline from "readline";
import Scanner from "./scanner";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export default class Lox {
  static hadError = false;

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

    tokens.forEach((token) => console.log(token));
  }

  static error(line: number, message: string): void {
    this.report(line, "", message);
  }

  static report(line: number, where: string, message: string): void {
    console.log("[line " + line + "] Error" + where + ": " + message);
    this.hadError = true;
  }
}

new Lox();
