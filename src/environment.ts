import RuntimeError from "./runtimeError";
import Token from "./token";

export default class Environment {
  private enclosing?: Environment;
  private values: Map<string, any> = new Map();

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing;
  }

  define(key: string, val: any):void {
    this.values.set(key, val);
  }

  ancestor(distance: number): Environment {
    let environment: Environment = this;
    for (let i = 0; i < distance; i++) {
      // technically could have undefined, but not in nested closures
      environment = environment.enclosing as Environment; 
    }

    return environment;
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

  getAt(distance: number, name: string): any {
    return this.ancestor(distance).values.get(name);
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

  assignAt(distance: number, name: Token, value: any): void {
    this.ancestor(distance).values.set(name.lexeme, value);
  }
}
