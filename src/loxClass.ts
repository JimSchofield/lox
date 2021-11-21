import Interpreter from "./interpreter";
import { LoxCallable } from "./loxCallable";
import {LoxInstance} from "./loxInstance";
import { LiteralType } from "./token";

export class LoxClass implements LoxCallable {
  readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  public toString(): string {
    return this.name;
  }

  public loxCall(
    interpreter: Interpreter,
    args: LiteralType[]
  ): LiteralType {
    const instance = new LoxInstance(this);

    return instance;
  }

  public get arity(): number {
    return 0;
  }
}
