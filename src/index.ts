import { argv } from "process";
import fs from "fs";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
    console.log(`Running file: ${file}\n`);

    try {
      const contents = fs.readFileSync(file, "utf-8");

      this.run(contents);
    } catch (e) {
      console.error("\nError! Make sure the file exists\n");
      console.log(e);
      process.exit(1);
    }
  }

  runPrompt() {
    rl.question("> ", (value) => {
      if (!value) {
        process.exit(1);
      } else {
        this.run(value);
        this.runPrompt();
      }
    });
  }

  run(script: string) {
    console.log(`running...${script}`);
  }
}

new Lox();
