# Lox lang in Typescript

This is an implemenation of the Lox language in Typescript.  See www.craftinginterpreters.com


## Getting started

You will need to clone and run `npm install`.

- Running REPL: `npm run start`.
- Running a `.lox` file: `npm run start -- <file>`


## Notes:
 - The book has us run an expression and statment AST generator that I put in tools.  This will require the following syntax if you want to run it in this project: `npm run generate-ast src`.  Also, you will need to clean up imports for each file when run.
 - I stored example Lox scripts for testing in `/testFiles`.
