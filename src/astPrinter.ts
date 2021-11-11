/*import { Binary, Expr, Grouping, Literal, Unary, Visitor } from "./expr";
import Token from "./token";
import { TokenType } from "./tokenTypes";

export class AstPrinter implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }

  public visitBinaryExpr(expr: Binary): string {
    return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }

  public visitGroupingExpr(expr: Grouping): string {
    return this.parenthesize("group", expr.expression);
  }

  public visitLiteralExpr(expr: Literal): string {
    if (expr.value == null) {
      return "nil";
    }
    return expr.value.toString();
  }

  public visitUnaryExpr(expr: Unary): string {
    return this.parenthesize(expr.operator.lexeme, expr.right);
  }

  private parenthesize(name: string, ...exprs: Expr[]): string {
    let builder = "";

    builder += "(";
    builder += name;
    for (const expr of exprs) {
      builder += " ";
      builder += expr.accept(this);
    }
    builder += ")";

    return builder;
  }
}

class Test {
  constructor() {
    const expression = new Binary(
      new Unary(new Token(TokenType.MINUS, "-", null, 1), new Literal(123)),
      new Token(TokenType.STAR, "*", null, 1),
      new Grouping(new Literal(45.67))
    );

    console.log(new AstPrinter().print(expression));
  }
}

new Test();*/
