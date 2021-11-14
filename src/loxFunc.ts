import Environment from "./environment";
import Interpreter from "./interpreter";
import { LoxCallable } from "./loxCallable";
import { Func } from "./stmt";
import { LiteralType } from "./token";

export class LoxFunc implements LoxCallable {
  private readonly declaration: Func;
  constructor(declaration: Func) {
    this.declaration = declaration;
  }

  public get arity(): number {
    return this.declaration.params.length;
  }

  public loxCall(interpreter: Interpreter, args: LiteralType[]): LiteralType {
    const environment = new Environment(interpreter.globals);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(this.declaration.params[i].lexeme, args[i]);
    }

    interpreter.executeBlock(this.declaration.body, environment);

    return null;
  }

  public toString():string {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
