import Interpreter from "./interpreter";
import { LoxCallable } from "./loxCallable";
import { LoxFunc } from "./loxFunc";
import { LoxInstance } from "./loxInstance";
import { LiteralType } from "./token";

export class LoxClass implements LoxCallable {
  readonly name: string;
  private readonly methods: Map<string, LoxFunc>;

  constructor(name: string, methods: Map<string, LoxFunc>) {
    this.name = name;
    this.methods = methods;
  }

  public toString(): string {
    return this.name;
  }

  public loxCall(interpreter: Interpreter, args: LiteralType[]): LiteralType {
    const instance = new LoxInstance(this);

    return instance;
  }

  public get arity(): number {
    return 0;
  }

  public findMethod(name: string) {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }
  }
}
