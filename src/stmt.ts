import { Expr } from "./expr";
import Token from "./token";

export interface Visitor<R> {
  visitBlockStmt(stmt: Block): R;
  visitClassStmt(stmt: Class): R;
  visitIfStmt(stmt: If): R;
  visitExpressionStmt(stmt: Expression): R;
  visitFuncStmt(stmt: Func): R;
  visitPrintStmt(stmt: Print): R;
  visitReturnStmt(stmt: Return): R;
  visitVarStmt(stmt: Var): R;
  visitWhileStmt(stmt: While): R;
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

export class Class extends Stmt {
  constructor(name: Token, methods: Func[]) {
    super();
    this.name = name;
    this.methods = methods;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitClassStmt(this);
  }

  name: Token;
  methods: Func[];
}

export class If extends Stmt {
  constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null) {
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
  elseBranch: Stmt | null;
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

export class Func extends Stmt {
  constructor(name: Token, params: Token[], body: Stmt[]) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitFuncStmt(this);
  }

  name: Token;
  params: Token[];
  body: Stmt[];
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

export class Return extends Stmt {
  constructor(keyword: Token, value: Expr | null) {
    super();
    this.keyword = keyword;
    this.value = value;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitReturnStmt(this);
  }

  keyword: Token;
  value: Expr | null;
}

export class Var extends Stmt {
  constructor(name: Token, initializer: Expr | null) {
    super();
    this.name = name;
    this.initializer = initializer;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitVarStmt(this);
  }

  name: Token;
  initializer: Expr | null;
}

export class While extends Stmt {
  constructor(condition: Expr, body: Stmt) {
    super();
    this.condition = condition;
    this.body = body;
  }

  accept<R>(visitor: Visitor<R>): R {
    return visitor.visitWhileStmt(this);
  }

  condition: Expr;
  body: Stmt;
}
