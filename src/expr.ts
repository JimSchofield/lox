import Token, { LiteralType } from "./token";

export interface Visitor<R> {
  visitAssignExpr(expr: Assign): R;
  visitBinaryExpr(expr: Binary): R;
  visitCallExpr(expr: Call): R;
  visitGetExpr(expr: Get): R;
  visitGroupingExpr(expr: Grouping): R;
  visitLiteralExpr(expr: Literal): R;
  visitLogicalExpr(expr: Logical): R;
  visitSetExpr(expr: Set): R;
  visitSuperExpr(expr: Super): R;
  visitThisExpr(expr: This): R;
  visitUnaryExpr(expr: Unary): R;
  visitVariableExpr(expr: Variable): R;
}

export abstract class Expr {
  abstract accept<R>(visitor: Visitor<R>): R;
}

export class Assign extends Expr {
  constructor(name: Token, value: Expr) {
    super();
    this.name = name;
    this.value = value;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitAssignExpr(this);
  }

  name: Token;
  value: Expr;
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

export class Call extends Expr {
  constructor(callee: Expr, paren: Token, args: Expr[]) {
    super();
    this.callee = callee;
    this.paren = paren;
    this.args = args;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitCallExpr(this);
  }

  callee: Expr;
  paren: Token;
  args: Expr[];
}

export class Get extends Expr {
  constructor(object: Expr, name: Token) {
    super();
    this.object = object;
    this.name = name;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitGetExpr(this);
  }

  object: Expr;
  name: Token;
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

export class Logical extends Expr {
  constructor(left: Expr, operator: Token, right: Expr) {
    super();
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitLogicalExpr(this);
  }

  left: Expr;
  operator: Token;
  right: Expr;
}

export class Set extends Expr {
  constructor(object: Expr, name: Token, value: Expr) {
    super();
    this.object = object;
    this.name = name;
    this.value = value;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSetExpr(this);
  }

  object: Expr;
  name: Token;
  value: Expr;
}

export class Super extends Expr {
  constructor(keyword: Token, method: Token) {
    super();
    this.keyword = keyword;
    this.method = method;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitSuperExpr(this);
  }

  keyword: Token;
  method: Token;
}

export class This extends Expr {
  constructor(keyword: Token) {
    super();
    this.keyword = keyword;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitThisExpr(this);
  }

  keyword: Token;
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

export class Variable extends Expr {
  constructor(name: Token) {
    super();
    this.name = name;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVariableExpr(this);
  }

  name: Token;
}
