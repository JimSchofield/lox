import Interpreter from "./interpreter";
import { LoxCallable } from "./loxCallable";
import { LoxFunc } from "./loxFunc";
import { LoxInstance } from "./loxInstance";
import { LiteralType } from "./token";

export class LoxClass implements LoxCallable {
  readonly name: string;
  private readonly methods: Map<string, LoxFunc>;
  private superclass: LoxClass | null;

  constructor(name: string, superclass: LoxClass | null, methods: Map<string, LoxFunc>) {
    this.name = name;
    this.superclass = superclass;
    this.methods = methods;
  }

  public toString(): string {
    return this.name;
  }

  public loxCall(interpreter: Interpreter, args: LiteralType[]): LiteralType {
    const instance = new LoxInstance(this);

    const initializer = this.findMethod("init");
    if (initializer) {
      initializer.bind(instance).loxCall(interpreter, args);
    }

    return instance;
  }

  public get arity(): number {
    const initializer = this.findMethod("init");
    if (!initializer) return 0;
    return initializer.arity;
  }

  public findMethod(name: string): LoxFunc | undefined {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }

    if (this.superclass) {
      return this.superclass.findMethod(name);
    }
  }
}
