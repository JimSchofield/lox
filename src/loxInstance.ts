import Lox from ".";
import { LoxClass } from "./loxClass";
import Token from "./token";

export class LoxInstance {
  private klass: LoxClass;
  private fields: Map<string, any> = new Map();

  constructor(loxClass: LoxClass) {
    this.klass = loxClass;
  }

  public toString(): string {
    return this.klass.name + " instance";
  }

  public get(name: Token): any {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme);
    }

    const method = this.klass.findMethod(name.lexeme);
    if (method) {
      return method;
    }

    throw Lox.errorWithToken(name, "Undefined property '" + name.lexeme + "'.");
  }

  public set(name: Token, value: any): void {
    this.fields.set(name.lexeme, value);
  }
}
