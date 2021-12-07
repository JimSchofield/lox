import Interpreter from "./interpreter";
import {
  Assign,
  Binary,
  Call,
  Expr,
  Get,
  Grouping,
  Literal,
  Logical,
  Set as SetExpr,
  Super,
  This,
  Unary,
  Variable,
  Visitor as ExprVisitor,
} from "./expr";
import {
  Visitor as StmtVisitor,
  Block as BlockStmt,
  Var as VarStmt,
  Stmt,
  Func as FuncStmt,
  Expression as ExpressionStmt,
  If as IfStmt,
  Print as PrintStmt,
  Return as ReturnStmt,
  While as WhileStmt,
  Class,
} from "./stmt";
import Token from "./token";
import Lox from ".";

enum FunctionType {
  NONE = "NONE",
  FUNCTION = "FUNCTION",
  INITIALIZER = "INITIALIZER",
  METHOD = "METHOD",
}

enum ClassType {
  NONE = "NONE",
  CLASS = "CLASS",
  SUBCLASS = "SUBCLASS",
}

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private readonly interpreter: Interpreter;
  private readonly scopes: Map<string, boolean>[] = [];
  private currentFunction = FunctionType.NONE;
  private currentClass = ClassType.NONE;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  public visitBlockStmt(stmt: BlockStmt): void {
    this.beginScope();
    this.resolve(stmt.statements);
    this.endScope();
  }

  public visitClassStmt(stmt: Class): void {
    this.declare(stmt.name);

    this.define(stmt.name);

    if (stmt.superclass && stmt.name.lexeme === stmt.superclass.name.lexeme) {
      Lox.errorWithToken(
        stmt.superclass.name,
        "A class can't inherit from itself."
      );
    }

    if (stmt.superclass) {
      this.currentClass = ClassType.SUBCLASS;
      this.resolve(stmt.superclass);
    }

    if (stmt.superclass) {
      this.beginScope();
      this.scopes[this.scopes.length - 1].set("super", true);
    }

    this.beginScope();
    const scope = this.scopes[this.scopes.length - 1];
    scope.set("this", true);

    for (const method of stmt.methods) {
      let declaration = FunctionType.METHOD;
      if (method.name.lexeme === "init") {
        declaration = FunctionType.INITIALIZER;
      }
      this.resolveFunction(method, declaration);
    }

    if (stmt.superclass) {
      this.endScope();
    }

    this.endScope();
  }

  public visitExpressionStmt(stmt: ExpressionStmt): void {
    this.resolve(stmt.expression);
  }

  public visitFuncStmt(stmt: FuncStmt): void {
    this.declare(stmt.name);
    this.define(stmt.name);

    this.resolveFunction(stmt, FunctionType.FUNCTION);
  }

  public visitIfStmt(stmt: IfStmt): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.thenBranch);
    if (stmt.elseBranch !== null) this.resolve(stmt.elseBranch);
  }

  public visitPrintStmt(stmt: PrintStmt): void {
    this.resolve(stmt.expression);
  }

  resolve(arg: Stmt[] | Stmt | Expr): void {
    if (Array.isArray(arg)) {
      for (const statement of arg) {
        this.resolve(statement);
      }
    } else if (arg instanceof Stmt) {
      arg.accept(this);
    } else if (arg instanceof Expr) {
      arg.accept(this);
    }
  }

  private resolveFunction(func: FuncStmt, type: FunctionType): void {
    const enclosingFunction = this.currentFunction;

    this.currentFunction = type;

    this.beginScope();
    for (const param of func.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolve(func.body);
    this.endScope();

    this.currentFunction = enclosingFunction;
  }

  private beginScope(): void {
    this.scopes.push(new Map<string, boolean>());
  }

  private endScope(): void {
    this.scopes.pop();
  }

  private declare(name: Token): void {
    if (this.scopes.length === 0) return;

    const scope = this.scopes[this.scopes.length - 1];

    if (scope.has(name.lexeme)) {
      Lox.errorWithToken(
        name,
        "Already a variable with this name in this scope."
      );
    }

    scope.set(name.lexeme, false);
  }

  public visitReturnStmt(stmt: ReturnStmt): void {
    if (this.currentFunction === FunctionType.NONE) {
      Lox.errorWithToken(stmt.keyword, "Can't return outside of a function");
    }

    if (stmt.value !== null) {
      this.resolve(stmt.value);
    }

    if (this.currentFunction === FunctionType.INITIALIZER) {
      Lox.errorWithToken(
        stmt.keyword,
        "Can't return a value from an initializer."
      );
    }
  }

  private define(name: Token): void {
    if (this.scopes.length === 0) return;
    this.scopes[this.scopes.length - 1].set(name.lexeme, true);
  }

  public visitVarStmt(stmt: VarStmt): void {
    this.declare(stmt.name);
    if (stmt.initializer !== null) {
      this.resolve(stmt.initializer);
    }
    this.define(stmt.name);
  }

  public visitWhileStmt(stmt: WhileStmt): void {
    this.resolve(stmt.condition);
    this.resolve(stmt.body);
  }

  public visitAssignExpr(expr: Assign): void {
    this.resolve(expr.value);
    this.resolveLocal(expr, expr.name);
  }

  public visitBinaryExpr(expr: Binary): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  public visitCallExpr(expr: Call): void {
    this.resolve(expr.callee);

    for (let arg of expr.args) {
      this.resolve(arg);
    }
  }

  public visitGetExpr(expr: Get): void {
    this.resolve(expr.object);
  }

  public visitGroupingExpr(expr: Grouping): void {
    this.resolve(expr.expression);
  }

  public visitLiteralExpr(expr: Literal): void {}

  public visitLogicalExpr(expr: Logical): void {
    this.resolve(expr.left);
    this.resolve(expr.right);
  }

  public visitSetExpr(expr: SetExpr): void {
    this.resolve(expr.value);
    this.resolve(expr.object);
  }

  public visitSuperExpr(expr: Super): void {
    if (this.currentClass === ClassType.NONE) {
      Lox.errorWithToken(expr.keyword, "Can't use 'super' outside of a class.");
    } else if (this.currentClass !== ClassType.SUBCLASS) {
      Lox.errorWithToken(
        expr.keyword,
        "Can't use 'super' in a class with no superclass."
      );
    }

    this.resolveLocal(expr, expr.keyword);
  }

  public visitThisExpr(expr: This): void {
    this.resolveLocal(expr, expr.keyword);
  }

  public visitUnaryExpr(expr: Unary): void {
    this.resolve(expr.right);
  }

  public visitVariableExpr(expr: Variable): void {
    if (
      this.scopes.length !== 0 &&
      this.scopes[this.scopes.length - 1].has(expr.name.lexeme) === false
    ) {
      Lox.errorWithToken(
        expr.name,
        "Can't read local variable in its own initializer."
      );
    }

    this.resolveLocal(expr, expr.name);
  }

  private resolveLocal(expr: Expr, name: Token): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
        return;
      }
    }
  }
}
