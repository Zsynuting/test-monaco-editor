import { SourceLocation, Node } from 'acorn'

export enum NodeTypes {
  Identifier = 'Identifier',
  AssignmentPattern = 'AssignmentPattern',
  Literal = 'Literal',
  Property = 'Property',
  // Declaration - https://github.com/estree/estree/blob/master/es5.md#declarations
  FunctionDeclaration = 'FunctionDeclaration',
  ExportDefaultDeclaration = 'ExportDefaultDeclaration',
  VariableDeclarator = 'VariableDeclarator',
  // Expression - https://github.com/estree/estree/blob/master/es5.md#expressions
  MemberExpression = 'MemberExpression',
  FunctionExpression = 'FunctionExpression',
  ArrowFunctionExpression = 'ArrowFunctionExpression',
  ObjectExpression = 'ObjectExpression',
  ArrayExpression = 'ArrayExpression',
  ThisExpression = 'ThisExpression',
  CallExpression = 'CallExpression',
  BinaryExpression = 'BinaryExpression',
  ExpressionStatement = 'ExpressionStatement',
  BlockStatement = 'BlockStatement',
  ConditionalExpression = 'ConditionalExpression',
  AwaitExpression = 'AwaitExpression',
}

type Pattern = IdentifierNode | AssignmentPatternNode
type Expression = Node

export type ArgumentTypes =
  | LiteralNode
  | ArrowFunctionExpressionNode
  | ObjectExpression
  | MemberExpressionNode
  | CallExpressionNode
  | BinaryExpressionNode
  | BlockStatementNode
  | IdentifierNode
// doc: https://github.com/estree/estree/blob/master/es5.md#memberexpression
export interface MemberExpressionNode extends Node {
  type: NodeTypes.MemberExpression
  object: MemberExpressionNode | IdentifierNode | CallExpressionNode
  property: IdentifierNode | LiteralNode
  computed: boolean
  // doc: https://github.com/estree/estree/blob/master/es2020.md#chainexpression
  optional?: boolean
}

export interface BinaryExpressionNode extends Node {
  type: NodeTypes.BinaryExpression
  left: BinaryExpressionNode | IdentifierNode
  right: BinaryExpressionNode | IdentifierNode
}

// doc: https://github.com/estree/estree/blob/master/es5.md#identifier
export interface IdentifierNode extends Node {
  type: NodeTypes.Identifier
  name: string
}

// doc: https://github.com/estree/estree/blob/master/es5.md#functions
interface Function extends Node {
  id: IdentifierNode | null
  params: Pattern[]
}

// doc: https://github.com/estree/estree/blob/master/es5.md#functiondeclaration
export interface FunctionDeclarationNode extends Node, Function {
  type: NodeTypes.FunctionDeclaration
}

// doc: https://github.com/estree/estree/blob/master/es5.md#functionexpression
export interface FunctionExpressionNode extends Expression, Function {
  type: NodeTypes.FunctionExpression
  async: boolean
}

export interface ArrowFunctionExpressionNode extends Expression, Function {
  type: NodeTypes.ArrowFunctionExpression
  async: boolean
}

export interface ObjectExpression extends Expression {
  type: NodeTypes.ObjectExpression
  properties: Array<PropertyNode>
}

// doc: https://github.com/estree/estree/blob/master/es2015.md#assignmentpattern
interface AssignmentPatternNode extends Node {
  type: NodeTypes.AssignmentPattern
  left: Pattern
}

// doc: https://github.com/estree/estree/blob/master/es5.md#literal
export interface LiteralNode extends Node {
  type: NodeTypes.Literal
  value: string | boolean | null | number | RegExp
  raw: string
}

export interface CallExpressionNode extends Node {
  type: NodeTypes.CallExpression
  callee: CallExpressionNode | IdentifierNode | MemberExpressionNode
  arguments: ArgumentTypes[]
}

// https://github.com/estree/estree/blob/master/es5.md#thisexpression
export interface ThisExpressionNode extends Expression {
  type: 'ThisExpression'
}

// https://github.com/estree/estree/blob/master/es5.md#conditionalexpression
export interface ConditionalExpressionNode extends Expression {
  type: 'ConditionalExpression'
  test: Expression
  alternate: Expression
  consequent: Expression
}

// https://github.com/estree/estree/blob/master/es2017.md#awaitexpression
export interface AwaitExpressionNode extends Expression {
  type: 'AwaitExpression'
  argument: Expression
}

export interface BlockStatementNode extends Node {
  type: 'BlockStatement'
  body: [Node]
}

// https://github.com/estree/estree/blob/master/es5.md#property
export interface PropertyNode extends Node {
  type: NodeTypes.Property
  key: LiteralNode | IdentifierNode
  value: Node
  kind: 'init'
}

export interface ExpressionStatement extends Node {
  type: 'ExpressionStatement'
  expression: Expression
}

export interface Program extends Node {
  type: 'Program'
  body: [Directive | Statement]
}

export type Statement = Node

export interface Directive extends ExpressionStatement {
  expression: LiteralNode
  directive: string
}

export interface ExportDefaultDeclarationNode extends Node {
  declaration: Node
}

// Node with location details
export type NodeWithLocation<NodeType> = NodeType & {
  loc: SourceLocation
}
