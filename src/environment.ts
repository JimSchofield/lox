import RuntimeError from "./runtimeError";
import Token from "./token";

export default class Environment {
  private enclosing: Environment | null;
  private values: Map<string, any> = new Map();

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing ? enclosing : null;
  }

  define(key: string, val: any):void {
    this.values.set(key, val);
  }

  get(name: Token): any {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme);
    }

    if (this.enclosing) {
      return this.enclosing.get(name);
    }

    throw new RuntimeError(name,
        "Undefined variable '" + name.lexeme + "'.");
  }

  assign(name: Token, value: any): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name,
        "Undefined variable '" + name.lexeme + "'.");
  }
}
