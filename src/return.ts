import { LiteralType } from "./token";

export class Return {
  readonly value: LiteralType;

  constructor(value: LiteralType) {
    this.value = value;
  }
}
