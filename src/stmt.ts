import {Expr} from "./expr";
import Token, { LiteralType } from "./token";

export interface Visitor<R> {
  visitBlockStmt(stmt: Block): R;
  visitIfStmt(stmt: If): R;
  visitExpressionStmt(stmt: Expression): R;
  visitPrintStmt(stmt: Print): R;
  visitVarStmt(stmt: Var): R;
}

export abstract class Stmt {
  abstract accept<R>(visitor: Visitor<R>): R;
}

export class Block extends Stmt {
  constructor(statements: Stmt[]) {
    super();
    this.statements = statements;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitBlockStmt(this);
  }

  statements: Stmt[];
}

export class If extends Stmt {
  constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitIfStmt(this);
  }

  condition: Expr;
  thenBranch: Stmt;
  elseBranch: Stmt;
}

export class Expression extends Stmt {
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitExpressionStmt(this);
  }

  expression: Expr;
}

export class Print extends Stmt {
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitPrintStmt(this);
  }

  expression: Expr;
}

export class Var extends Stmt {
  constructor(name: Token, initializer: Expr|null) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVarStmt(this);
  }

  name: Token;
  initializer: Expr|null;
}
