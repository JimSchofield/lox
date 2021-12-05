import Environment from "./environment";
import Interpreter from "./interpreter";
import { LoxCallable } from "./loxCallable";
import {LoxInstance} from "./loxInstance";
import { Return } from "./return";
import { Func } from "./stmt";
import { LiteralType } from "./token";

export class LoxFunc implements LoxCallable {
  private readonly declaration: Func;
  private readonly closure: Environment;
  private readonly isInitializer: boolean;

  constructor(declaration: Func, closure: Environment, isInitializer: boolean) {
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
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
      if (this.isInitializer) return this.closure.getAt(0, "this");

      return (returnValue as Return).value;
    }

    if (this.isInitializer) return this.closure.getAt(0, "this");


    return null;
  }

  public bind(instance: LoxInstance): LoxFunc {
    const environment = new Environment(this.closure);
    environment.define("this", instance);
    const newReturn = new LoxFunc(this.declaration, environment, this.isInitializer);
    return newReturn;
  }

  public toString(): string {
    return "<fn " + this.declaration.name.lexeme + ">";
  }
}
