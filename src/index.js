const { MagicSet } = require("./magic");

const a = new MagicSet([1, 2, 3]);
const b = new MagicSet([3, 4, 5]);

const c = MagicSet.overloaded(b - b * a);
console.log(c.toString());
