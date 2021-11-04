import Token, { LiteralType } from "./token";

export interface Visitor<R> {
  visitBinaryExpr<R>(expr: Binary): R;
  visitGroupingExpr<R>(expr: Grouping): R;
  visitLiteralExpr<R>(expr: Literal): R;
  visitUnaryExpr<R>(expr: Unary): R;
}

abstract class Expr {
  abstract accept<R>(visitor: Visitor<R>): R;
}

export class Binary extends Expr {
  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBinaryExpr(this);
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

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGroupingExpr(this);
  }

  expression: Expr;
}

export class Literal extends Expr {
  constructor(value: LiteralType) {
    super();
    this.value = value;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLiteralExpr(this);
  }

  value: LiteralType;
}

export class Unary extends Expr {
  constructor(operator: Token, right: Expr) {
    super();
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitUnaryExpr(this);
  }

  operator: Token;
  right: Expr;
}
