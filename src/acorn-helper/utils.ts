import type { Node } from 'acorn'
import {
  NodeTypes,
  AwaitExpressionNode,
  BinaryExpressionNode,
  CallExpressionNode,
  ConditionalExpressionNode,
  ExpressionStatement,
  IdentifierNode,
  MemberExpressionNode,
  ThisExpressionNode,
  PropertyNode,
  LiteralNode,
} from './typing'
import * as escodegen from 'escodegen'
import type { ExpressionIdentifierOptions } from './index'

export const isAwaitExpressionNode = (node: Node): node is AwaitExpressionNode =>
  node.type === NodeTypes.AwaitExpression

export const isBinaryExpressionNode = (node: Node): node is BinaryExpressionNode => {
  return node.type === NodeTypes.BinaryExpression
}

export const isCallExpressionNode = (node: Node): node is CallExpressionNode => {
  return node.type === NodeTypes.CallExpression
}

export const isExpressionStatementNode = (node: Node): node is ExpressionStatement => {
  return node.type === NodeTypes.ExpressionStatement
}

/* We need these functions to typescript casts the nodes with the correct types */
export const isIdentifierNode = (node: Node): node is IdentifierNode => {
  return node.type === NodeTypes.Identifier
}

export const isMemberExpressionNode = (node: Node): node is MemberExpressionNode => {
  return node.type === NodeTypes.MemberExpression
}

export const isConditionalExpressionNode = (node: Node): node is ConditionalExpressionNode =>
  node.type === NodeTypes.ConditionalExpression

export const isThisExpressionNode = (node: Node): node is ThisExpressionNode => {
  return node.type === NodeTypes.ThisExpression
}

export const isPropertyNode = (node: Node): node is PropertyNode => {
  return node.type === NodeTypes.Property
}

export const isPositionWithinNode = (node: Node, pos: number) =>
  pos >= node.start && pos <= node.end

export const getExpressionStringAtPos = (
  node: Node,
  pos: number,
  options?: ExpressionIdentifierOptions,
  replaceThisExpression = true,
): string | undefined => {
  if (!isPositionWithinNode(node, pos)) return
  if (isMemberExpressionNode(node)) {
    return getExpressionAtPosFromMemberExpression(node, pos, options, replaceThisExpression)
  } else if (isExpressionStatementNode(node)) {
    return getExpressionAtPosFromExpressionStatement(node, pos, options)
  } else if (isCallExpressionNode(node)) {
    return getExpressionAtPosFromCallExpression(node, pos, options)
  } else if (isBinaryExpressionNode(node)) {
    return getExpressionAtPosFromBinaryExpression(node, pos, options)
  } else if (isAwaitExpressionNode(node)) {
    return getExpressionStringAtPos(node.argument, pos, options)
  } else if (isConditionalExpressionNode(node)) {
    return getExpressionAtPosFromConditionalExpression(node, pos, options)
  } else if (isIdentifierNode(node)) {
    return removeSemiColon(escodegen.generate(node))
  }
}

export const isLiteralNode = (node: Node): node is LiteralNode => {
  return node.type === NodeTypes.Literal
}

const getExpressionAtPosFromMemberExpression = (
  node: MemberExpressionNode,
  pos: number,
  options?: ExpressionIdentifierOptions,
  replaceThisExpression = true,
): string | undefined => {
  const objectNode = node.object
  if (isLocalVariableNode(node) || isLocalVariableNode(objectNode)) return
  if (replaceThisExpression && options?.thisExpressionReplacement) {
    node = replaceThisinMemberExpression(node, options)
  }
  // stop if objectNode is a function call -> needs evaluation
  if (isCallExpressionNode(objectNode)) return
  // position is within the object node
  if (pos <= objectNode.end) {
    return getExpressionStringAtPos(objectNode, pos, options, false)
  }
  // position is within the property node
  else {
    const propertyNode = node.property
    if (isMemberExpressionNode(propertyNode)) {
      return getExpressionAtPosFromMemberExpression(propertyNode, pos, options, false)
    }
    // generate string for the whole path
    return escodegen.generate(node)
  }
}

const getExpressionAtPosFromExpressionStatement = (
  node: ExpressionStatement,
  pos: number,
  options?: ExpressionIdentifierOptions,
): string | undefined => {
  if (isThisExpressionNode(node.expression) && options?.thisExpressionReplacement) {
    node.expression = thisReplacementNode(node.expression, options)
  }
  return getExpressionStringAtPos(node.expression, pos, options)
}

const getExpressionAtPosFromCallExpression = (
  node: CallExpressionNode,
  pos: number,
  options?: ExpressionIdentifierOptions,
): string | undefined => {
  let selectedNode: Node | undefined
  // function call -> needs evaluation
  // if (isPositionWithinNode(node.callee, pos)) {
  //   selectedNode = node.callee;
  // }
  if (node.arguments.length > 0) {
    const argumentNode = node.arguments.find((node) => isPositionWithinNode(node, pos))
    if (argumentNode) {
      selectedNode = argumentNode
    }
  }
  return selectedNode && getExpressionStringAtPos(selectedNode, pos, options)
}

const getExpressionAtPosFromConditionalExpression = (
  node: ConditionalExpressionNode,
  pos: number,
  options?: ExpressionIdentifierOptions,
): string | undefined => {
  let selectedNode: Node | undefined
  if (isPositionWithinNode(node.test, pos)) {
    selectedNode = node.test
  } else if (isPositionWithinNode(node.consequent, pos)) {
    selectedNode = node.consequent
  } else if (isPositionWithinNode(node.alternate, pos)) {
    selectedNode = node.alternate
  }
  return selectedNode && getExpressionStringAtPos(selectedNode, pos, options)
}

const getExpressionAtPosFromBinaryExpression = (
  node: BinaryExpressionNode,
  pos: number,
  options?: ExpressionIdentifierOptions,
): string | undefined => {
  let selectedNode: Node | undefined
  if (isPositionWithinNode(node.left, pos)) {
    selectedNode = node.left
  } else if (isPositionWithinNode(node.right, pos)) {
    selectedNode = node.right
  }
  return selectedNode && getExpressionStringAtPos(selectedNode, pos, options)
}

export const replaceThisinMemberExpression = (
  node: MemberExpressionNode,
  options: ExpressionIdentifierOptions,
): MemberExpressionNode => {
  if (isMemberExpressionNode(node.object)) {
    node.object = replaceThisinMemberExpression(node.object, options)
  } else if (isThisExpressionNode(node.object)) {
    node.object = thisReplacementNode(node.object, options)
  }
  return node
}

// replace "this" node with the provided replacement
const thisReplacementNode = (node: Node, options: ExpressionIdentifierOptions) => {
  return {
    ...node,
    type: NodeTypes.Identifier,
    name: options.thisExpressionReplacement,
  } as IdentifierNode
}

const removeSemiColon = (value: string) =>
  value.slice(-1) === ';' ? value.slice(0, value.length - 1) : value

const isLocalVariableNode = (node: Node) =>
  isMemberExpressionNode(node) && node.computed && isIdentifierNode(node.property)
