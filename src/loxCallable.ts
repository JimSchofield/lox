import Interpreter from "./interpreter";
import { LiteralType } from "./token";

export interface LoxCallable {
  get arity(): number;
  loxCall(interpreter: Interpreter, args: LiteralType[]): LiteralType;
}
