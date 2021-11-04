import Token, { LiteralType } from "./token";

abstract class Expr {}

export class Binary extends Expr {
  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  left: Expr;
  operator: Token;
  right: Expr;
}

export class Grouping extends Expr {
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  expression: Expr;
}

export class Literal extends Expr {
  constructor(value: LiteralType) {
    super();
    this.value = value;
  }

  value: LiteralType;
}

export class Unary extends Expr {
  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }

  operator: Token;
  right: Expr;
}
