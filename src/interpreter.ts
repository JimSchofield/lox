import Lox from ".";
import Environment from "./environment";
import { Assign, Binary, Expr, Grouping, Literal, Unary, Variable, Visitor as ExprVisitor } from "./expr";
import RuntimeError from "./runtimeError";
import { Block, Expression as ExprStmt, Print as PrintStmt, Stmt, Var, Visitor as StmtVisitor } from "./stmt";
import Token, { LiteralType } from "./token";
import { TokenType } from "./tokenTypes";

export default class Interpreter implements ExprVisitor<LiteralType>, StmtVisitor<void> {
  private environment = new Environment();

  public visitLiteralExpr(expr: Literal): LiteralType {
    return expr.value;
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
    this.environment.assign(expr.name, value);
    return value;
  }

  public visitVarStmt(stmt: Var ): void {
    let value = null;
    if (stmt.initializer != null) {
      value = this.evaluate(stmt.initializer);
    }

    this.environment.define(stmt.name.lexeme, value);
  }

  public visitVariableExpr(expr: Variable): any {
    return this.environment.get(expr.name);
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

        throw new RuntimeError(expr.operator, "Can only (+) two numbers or two strings")
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

  private isEqual(a: LiteralType, b: LiteralType): boolean {
    if (a == null && b == null) {
      return true;
    }
    if (a == null) {
      return false;
    }

    return a == b;
  }

  private checkNumberOperands(operator: Token, left: LiteralType, right: LiteralType): void {
    if (typeof left === "number"&& typeof right === "number") return;
    
    throw new RuntimeError(operator, "Operands must be numbers.");
  }

  public interpret(statements: Stmt[]): void {
    try {
      for (const statement of statements) {
        this.execute(statement);
      }
    } catch (error) {
      Lox.errorWithToken((error as RuntimeError).token, (error as RuntimeError).message);
    }
  }

  private execute(stmt: Stmt): void {
    stmt.accept(this);
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

  public visitPrintStmt(stmt: PrintStmt): void {
    const value = this.evaluate(stmt.expression);
    console.log(this.stringify(value));
  }
}
