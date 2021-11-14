import Environment from "./environment";
import Interpreter from "./interpreter";
import { LoxCallable } from "./loxCallable";
import { Return } from "./return";
import { Func } from "./stmt";
import { LiteralType } from "./token";

export class LoxFunc implements LoxCallable {
  private readonly declaration: Func;
  private readonly closure: Environment;

  constructor(declaration: Func, closure: Environment) {
    this.declaration = declaration;
    this.closure = closure;
  }

  public get arity(): number {
    return this.declaration.params.length;
  }

  public loxCall(interpreter: Interpreter, args: LiteralType[]): LiteralType {
    const environment = new Environment(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      return (returnValue as Return).value;
    }

    return null;
  }

  public toString(): string {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
