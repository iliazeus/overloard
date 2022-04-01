type Operator = "+" | "-" | "*";

function reconstructReversePolishExpression(
  operandSequence: number[],
  result: number
): Array<number | Operator> {
  type State = {
    operandCount: number;
    stack: number[];
    expression: Array<number | Operator>;
  };

  const queue: State[] = [];

  if (operandSequence.length === 0) throw new Error();
  queue.push({
    operandCount: 1,
    stack: [operandSequence[0]],
    expression: [operandSequence[0]],
  });

  let state: State | undefined;
  while ((state = queue.shift())) {
    if (state.stack.length === 1 && state.stack[0] === result) {
      return state.expression;
    }

    if (state.stack.length >= 2) {
      const rest = [...state.stack];
      const b = rest.pop()!;
      const a = rest.pop()!;

      queue.push({
        operandCount: state.operandCount,
        stack: [...rest, a + b],
        expression: [...state.expression, "+"],
      });

      queue.push({
        operandCount: state.operandCount,
        stack: [...rest, a - b],
        expression: [...state.expression, "-"],
      });

      queue.push({
        operandCount: state.operandCount,
        stack: [...rest, a * b],
        expression: [...state.expression, "*"],
      });
    }

    if (state.operandCount < operandSequence.length) {
      queue.push({
        operandCount: state.operandCount + 1,
        stack: [...state.stack, operandSequence[state.operandCount]],
        expression: [...state.expression, operandSequence[state.operandCount]],
      });
    }
  }

  throw new Error();
}

interface Operators<T> {
  add(a: T, b: T): T;
  sub(a: T, b: T): T;
  mul(a: T, b: T): T;
}

function computeReversePolishExpression<T>(
  operators: Operators<T>,
  expression: Array<number | Operator>,
  operandMap: Map<number, T>
): T {
  const stack: T[] = [];

  for (const atom of expression) {
    if (typeof atom === "number") {
      const operand = operandMap.get(atom);
      if (operand === undefined) throw new Error();

      stack.push(operand);
      continue;
    }

    if (stack.length < 2) throw new Error();

    const b = stack.pop()!;
    const a = stack.pop()!;

    switch (atom) {
      case "+":
        stack.push(operators.add(a, b));
        break;

      case "-":
        stack.push(operators.sub(a, b));
        break;

      case "*":
        stack.push(operators.mul(a, b));
        break;
    }
  }

  if (stack.length !== 1) throw new Error();
  return stack[0];
}

export class MagicSet<T> {
  readonly items: ReadonlySet<T>;
  readonly _id: number;

  static _operandMap = new Map<number, MagicSet<any>>();
  static _usedOperands: number[] = [];

  constructor(items: Iterable<T>) {
    this.items = new Set(items);
    this._id = this.items.size === 0 ? 0 : Math.random();
    MagicSet._operandMap.set(this._id, this);
  }

  toString(): string {
    return "{ " + [...this.items].join(", ") + " }";
  }

  valueOf(): number {
    MagicSet._usedOperands.push(this._id);
    return this._id;
  }

  static add<T>(a: MagicSet<T>, b: MagicSet<T>): MagicSet<T> {
    return new MagicSet([...a.items, ...b.items]);
  }

  static sub<T>(a: MagicSet<T>, b: MagicSet<T>): MagicSet<T> {
    const items = new Set(a.items);
    for (const item of b.items) items.delete(item);
    return new MagicSet(items);
  }

  static mul<T>(a: MagicSet<T>, b: MagicSet<T>): MagicSet<T> {
    const items = new Set<T>();
    for (const item of a.items) {
      if (b.items.has(item)) items.add(item);
    }
    return new MagicSet(items);
  }

  static overloaded<T>(value: number): MagicSet<T> {
    const usedOperands = this._usedOperands;
    this._usedOperands = [];

    const expression = reconstructReversePolishExpression(usedOperands, value);
    const result = computeReversePolishExpression(MagicSet, expression, this._operandMap);

    return result;
  }
}
