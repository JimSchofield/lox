import Environment from "./environment";
import Interpreter from "./interpreter";
import { LoxCallable } from "./loxCallable";
import {Return} from "./return";
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

    try {
      interpreter.executeBlock(this.declaration.body, environment);
    } catch (returnValue) {
      return (returnValue as Return).value;
    }

    return null;
  }

  public toString():string {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
