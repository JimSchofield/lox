import { argv } from "process";
import fs from "fs";

class Lox {
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

  runFile(file: string) {
    console.log(`Running file: ${file}`);

    const contents = fs.readFileSync(file, "utf-8");

    this.run(contents);
  }

  runPrompt() {
    console.log("Running prompt");
  }

  run(script: string) {
    console.log(script);
  }
}

new Lox();
