import Lox from ".";
import Environment from "./environment";
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
import { LoxCallable } from "./loxCallable";
import { LoxClass } from "./loxClass";
import { LoxFunc } from "./loxFunc";
import { LoxInstance } from "./loxInstance";
import { Return } from "./return";
import RuntimeError from "./runtimeError";
import {
  Block,
  Class as ClassStmt,
  Expression as ExprStmt,
  Func as FuncStmt,
  If as IfStmt,
  Print as PrintStmt,
  Return as ReturnStmt,
  Stmt,
  Var,
  Visitor as StmtVisitor,
  While as WhileStmt,
} from "./stmt";
import Token, { LiteralType } from "./token";
import { TokenType } from "./tokenTypes";

export default class Interpreter
  implements ExprVisitor<LiteralType>, StmtVisitor<void>
{
  readonly globals = new Environment();
  public environment = this.globals;
  private readonly locals = new Map<Expr, number>();

  constructor() {
    // TODO: Investigate why are we defining clock on the fly?
    this.globals.define(
      "clock",
      new (class implements LoxCallable {
        public get arity() {
          return 0;
        }

        public loxCall(interpreter: Interpreter, args: LiteralType[]) {
          return Date.now() / 1000.0;
        }

        public toString(): string {
          return "<native fn>";
        }
      })()
    );
  }

  public visitLiteralExpr(expr: Literal): LiteralType {
    return expr.value;
  }

  public visitLogicalExpr(expr: Logical): LiteralType {
    const left = this.evaluate(expr.left);

    if (expr.operator.type == TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expr.right);
  }

  public visitSetExpr(expr: SetExpr) {
    const object = this.evaluate(expr.object);

    if (!(object instanceof LoxInstance)) {
      throw new RuntimeError(expr.name, "Only instances have fields.");
    }

    const value = this.evaluate(expr.value);
    object.set(expr.name, value);
    return value;
  }

  public visitSuperExpr(expr: Super) {
    let distance = this.locals.get(expr);

    if (distance) {
      const superclass = this.environment.getAt(distance, "super");

      const object = this.environment.getAt(distance - 1, "this");

      const method = superclass.findMethod(expr.method.lexeme);

      if (!method) {
        throw new Error("Undefined property '" + expr.method.lexeme + "' on superclass.");
      }
      
      return method.bind(object);
    } else {
      throw new Error("Distance is undefined in `visitSuperExpr`");
    }
  }

  public visitThisExpr(expr: This): any {
    return this.lookUpVariable(expr.keyword, expr);
  }

  public visitGroupingExpr(expr: Grouping): LiteralType {
    return this.evaluate(expr.expression);
  }

  private evaluate(expr: Expr): LiteralType {
    return expr.accept(this);
  }

  public visitBlockStmt(stmt: Block): void {
    this.executeBlock(stmt.statements, new Environment(this.environment));
  }

  public visitClassStmt(stmt: ClassStmt): void {
    let superclass = null;
    if (stmt.superclass) {
      superclass = this.evaluate(stmt.superclass);
      if (!(superclass instanceof LoxClass)) {
        throw new RuntimeError(stmt.superclass.name, "Superclass must be a class.");
      }
    }

    this.environment.define(stmt.name.lexeme, null);

    if (stmt.superclass) {
      this.environment = new Environment(this.environment);
      this.environment.define("super", superclass);
    }

    const methods = new Map<string, LoxFunc>();
    for (const method of stmt.methods) {
      const func = new LoxFunc(method, this.environment, method.name.lexeme === "init");
      methods.set(method.name.lexeme, func);
    }

    // const klass = new LoxClass(stmt.name.lexeme, methods);
    const klass = new LoxClass(stmt.name.lexeme, superclass, methods);

    if (superclass) {
      // At this point type should be narrowed to not be undefined
      this.environment = this.environment.enclosing as Environment;
    }

    this.environment.assign(stmt.name, klass);
  }

  public executeBlock(statements: Stmt[], environment: Environment) {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (const statement of statements) {
        this.execute(statement);
      }
    } finally {
      this.environment = previous;
    }
  }

  public visitAssignExpr(expr: Assign): LiteralType {
    const value = this.evaluate(expr.value);

    const distance = this.locals.get(expr);
    if (distance) {
      this.environment.assignAt(distance, expr.name, value);
    } else {
      this.globals.assign(expr.name, value);
    }

    this.environment.assign(expr.name, value);
    return value;
  }

  public visitVarStmt(stmt: Var): void {
    let value = null;
    if (stmt.initializer != null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  public visitWhileStmt(stmt: WhileStmt): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  public visitVariableExpr(expr: Variable): any {
    return this.lookUpVariable(expr.name, expr);
  }

  private lookUpVariable(name: Token, expr: Expr): any {
    const distance = this.locals.get(expr);
    if (typeof distance === 'number') {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }

  public visitUnaryExpr(expr: Unary): LiteralType {
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(right);
      case TokenType.MINUS:
        return -Number(right);
    }

    // Unreachable.
    return null;
  }

  private isTruthy(obj: LiteralType): boolean {
    if (obj == null) {
      return false;
    }
    if (typeof obj === "boolean") {
      return obj;
    }
    return Boolean(obj);
  }

  public visitBinaryExpr(expr: Binary): LiteralType {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        return this.isEqual(left, right);
      case TokenType.GREATER:
        this.checkNumberOperands(expr.operator, left, right);
        // @ts-ignore: need native coersion
        return left > right;
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        // @ts-ignore: need native coersion
        return left >= right;
      case TokenType.LESS:
        this.checkNumberOperands(expr.operator, left, right);
        // @ts-ignore: need native coersion
        return left < right;
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expr.operator, left, right);
        // @ts-ignore: need native coersion
        return left <= right;
      case TokenType.MINUS:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) - Number(right);
      case TokenType.PLUS:
        if (typeof left === "number" && typeof right === "number") {
          return Number(left) + Number(right);
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }
        if (
          (typeof left === "string" && typeof right === "number") ||
          (typeof left === "number" && typeof right === "string")
        ) {
          return left.toString() + right.toString();
        }

        throw new RuntimeError(
          expr.operator,
          "Can only (+) numbers and strings"
        );
        break;
      case TokenType.SLASH:
        this.checkNumberOperands(expr.operator, left, right);

        if (right === 0) {
          throw new RuntimeError(expr.operator, "Cannot divide by 0");
        }

        return Number(left) / Number(right);
      case TokenType.STAR:
        this.checkNumberOperands(expr.operator, left, right);
        return Number(left) * Number(right);
    }

    // Unreachable.
    return null;
  }

  public visitCallExpr(expr: Call): LiteralType {
    const callee = this.evaluate(expr.callee);

    const args: LiteralType[] = [];
    for (const arg of expr.args) {
      args.push(this.evaluate(arg));
    }

    // @ts-ignore We need the runtime check
    if (!(callee instanceof LoxFunc) && !(callee instanceof LoxClass)) {
      throw new RuntimeError(
        expr.paren,
        "Can only call functions and classes."
      );
    }

    // casting to callable despite being literal type
    // At this point, it is callable
    const func = callee as unknown as LoxCallable;

    if (args.length != func.arity) {
      throw new RuntimeError(
        expr.paren,
        "Expected " + func.arity + " arguments but got " + args.length + "."
      );
    }

    return func.loxCall(this, args);
  }

  public visitGetExpr(expr: Get): LiteralType {
    const object = this.evaluate(expr.object);
    if (object instanceof LoxInstance) {
      return object.get(expr.name);
    }

    throw new RuntimeError(expr.name, "Only instances have properties.");
  }

  private isEqual(a: LiteralType, b: LiteralType): boolean {
    if (a == null && b == null) {
      return true;
    }
    if (a == null) {
      return false;
    }

    return a == b;
  }

  private checkNumberOperands(
    operator: Token,
    left: LiteralType,
    right: LiteralType
  ): void {
    if (typeof left === "number" && typeof right === "number") return;

    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  public interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      Lox.errorWithToken(
        (error as RuntimeError).token,
        (error as RuntimeError).message
      );
    }
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
  }

  public resolve(expr: Expr, depth: number) {
    this.locals.set(expr, depth);
  }

  private stringify(obj: LiteralType): string {
    if (obj == null) return "nil";

    if (typeof obj === "number") {
      return obj.toString();
    }

    return obj.toString();
  }

  public visitExpressionStmt(stmt: ExprStmt): void {
    this.evaluate(stmt.expression);
  }

  public visitFuncStmt(stmt: FuncStmt): void {
    const func = new LoxFunc(stmt, this.environment, false);
    this.environment.define(stmt.name.lexeme, func);
  }

  public visitIfStmt(stmt: IfStmt): void {
    if (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.execute(stmt.elseBranch);
    }

    return;
  }

  public visitPrintStmt(stmt: PrintStmt): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }

  public visitReturnStmt(stmt: ReturnStmt): void {
    let value = null;
    if (stmt.value !== null) {
      value = this.evaluate(stmt.value);
    }

    throw new Return(value);
  }
}
