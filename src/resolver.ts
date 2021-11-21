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
  NONE,
  FUNCTION,
}

export class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private readonly interpreter: Interpreter;
  private readonly scopes: Map<string, boolean>[] = [];
  private currentFunction = FunctionType.NONE;


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
