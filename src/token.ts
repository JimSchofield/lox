import { TokenType } from "./tokenTypes";

export default class Token {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly literal: number | string;
  readonly line: number;

  constructor(
    type: TokenType,
    lexeme: string,
    literal: number | string,
    line: number
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  public toString(): string {
    return this.type + " " + this.lexeme + " " + this.literal;
  }
}
