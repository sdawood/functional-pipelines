master|develop|npm
---|---|---
[![Build Status](https://travis-ci.org/sdawood/functional-pipelines.svg?branch=master)](https://travis-ci.org/sdawood/functional-pipelines)|[![Build Status](https://travis-ci.org/sdawood/functional-pipelines.svg?branch=develop)](https://travis-ci.org/sdawood/functional-pipelines)|[![npm version](https://badge.fury.io/js/functional-pipelines.svg)](https://badge.fury.io/js/functional-pipelines)

# functional-pipelines

What do you get out of functional-pipelines?
functional-pipelines gives you pipe, compose, pipeAsync and composeAsync to start with.

Once you have developed a taste for functional pipelines, you would want to use reduce and reduceRight, they also come in async flavours.

The best part is pure functional transducers that can pipe and compose transformers seamlessly without instantiating objects or implementing interfaces.

Transformer function, transducing functions and reducing functions are explained in more details below.

## Installation
```sh
npm install functional-pipelines --save
```

## map, filter, zip, take, skip, partitionBy

### map(fn, <object | iterable | iterator | generator | generatorOfPromises>)
`map` applies the first argument <fn> to the items of the enumerable (second argument)
`map` works with objects, where it enumerates own properties, it also handles iterables (e.g. array), iterators, generators and generators of promises (result from async generator)
The result of map is an array since it reduces the iterator result of a mapTransformer.
```javascript
const map = (fn, iterable) => reduce(compose(mapTransformer(fn), append)(/*reducingFn*/), () => [], iterable);
```
If you would prefer to process the results one at a time and avoid the allocation of an array, you will need to get familiar with `mapTransformer`, `mapCat` and `mapUpdate` discussed later.

### mapAsync(asyncFn, <object | iterable | iterator | generator | generatorOfPromises>)
Similar to map, but handles promises returned by the asyncFn (the mapping function)

### filter(predicateFn, <object | iterable | iterator | generator | generatorOfPromises>)
`filter` applies the first argument <predicateFn> to the items of the enumerable (second argument)
`filter` works with objects, where it enumerates own properties, it also handles iterables (e.g. array), iterators, generators and generators of promises (result from async generator)
The result of map is an array that includes only the items that evaluated to `true` when applying the predicateFn. It reduces the iterator result of a filterTransformer.
```javascript
const filter = (fn, iterable) => reduce(compose(filterTransformer(fn), append)(/*reducingFn*/), () => [], iterable);
```
If you would prefer to process the results one at a time and avoid the allocation of an array, you will need to get familiar with `filterTransformer` discussed later.

### filterAsync(predicateFn, <object | iterable | iterator | generator | generatorOfPromises>)
Similar to filter, but handles promises returned by the asyncFn (the filter function)

### zip(enumerator1, enumerator2)
`zip` combines two enumerators by selecting an element from each and produces an iterator of pairs.
```javascript
const zip = (enumerator1, enumerator2) => zipWith(enumerator1, enumerator2);
```
If you would want to construct the two elements into something other than a pair [e1, e2] you can use zipWith which accepts a fn with arity two that groups the elements together.
```javascript
const zipWith = (enumerator1, enumerator2, fn) => iterator(zipWithGen(enumerator1, enumerator2, fn));
```
Internally, `zipWith` uses `zipWithGen`, which defaults that implementation of the grouping function as follows:
```javascript
function* zipWithGen(enumerator1, enumerator2, fn = (x1, x2) => [x1, x2])
```
zip accepts iterators or generators
### take(n, enumerator)
`take` accepts a count and an iterator or generator, the result is an iterator of length n if enough elements can be yielded.

### skip
`skip` skips the first n items from an iterator or generator, the the result is an iterator of the rest of the elements in the input enumerator.

### partionBy(predicateFn, enumerator)
`partitionBy` yields a partition iterator every time the supplied function changes result.
```javascript
const data = [0, 1, 2, 'a', 'b', 'c', 3, 'd', 'e', 4, 5, 6, 7, 'f'];
const expectedResult = [[0, 1, 2], ["a", "b", "c"], [3], ["d", "e"], [4, 5, 6, 7], ["f"]];
const partitionGen = F.partitionBy(x => typeof x === 'string', data);
const result = F.map(iter => F.map(F.identity, iter), partitionGen);
expect(result).toEqual(expectedResult);
```
Note that the result iterators each contain a metadata function that return the evaluated result of the predicateFn.

## pipe, /** pipeAsync **/, compose, composeAsync

### pipe(...fns)
pipe works with both a list of sync or async functions, the pipeline executes the functions from left to right.
Notice that the functions would need to adhere to an arity of one (accept a single argument)

```javascript
const pipe = (...fns) => fns.reduceRight((f, g) => (...args) => f(g(...args)));
```

`Notice that pipe needs to perform a reduceRight, which is the opposite direction of a normal reduce.`

### compose(...fns)
compose works with a list of sync functions, the pipeline executes the functions from right to left.
Notice that the functions would need to adhere to an arity of one (accept a single argument)

```javascript
const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
```

To perform a composition pipeline on async functions, use composeAsync(...asyncFns)

Like compose, composeAsync works with a list of async functions, the pipeline executes the functions from right to left.
Notice that the functions would need to adhere to an arity of one (accept a single argument)

```javascript
const composeAsync = (...fns) => reduceAsync((fn1, fn2) => async (...args) => fn1(await fn2(...args)), undefined, fns);
```
`Notice that pipe needs to perform a reduceAsync, which is the a useful utility in functional-pipelines`

Aside from supporting composing functions, compose can also accept a pipeline of transformer(s)

# Transducers
For background information about transducers, a recommended starting point is [this medium article](https://medium.com/@roman01la/understanding-transducers-in-javascript-3500d3bd9624).
For specs of the transformer and transducer protocol check the [transducers-js git repo documentation](https://github.com/cognitect-labs/transducers-js#the-transducer-protocol)

Note that the two popular transducer implementations namely [cognitect-labs transducers-js](https://github.com/cognitect-labs/transducers-js) and [transcuders.js](https://github.com/jlongster/transducers.js) both use an OO implementation and overlook some details of the protocol like the transducer result() function.
This implementation is purely functional and supports early termination `the reduced protocol` for map/compose/reduce/reduceRight and their async counterparts.

Let's introduce some terminology first:
## Reducing Function
If you have used Java Script reduce, you are familiar with the signature of a reducing function. It accepts an accumulator and a new element and returns a new value for the accumulator.
```javascript
(acc, input) => acc'; // acc' denotes a possbibly new value for the accumulator
```

## Transducer Function
A Transducer Function is a function that accepts a reducing function and returns a reducing function.
```javascript
reducingFn => (acc, input) => {};
```

## Transformer
A Transformer is function that accepts a mapping function and returns a transducer function
```javascript
const mapTransformer = mappingFn => reducingFn => (acc, input) => reducingFn(acc, mappingFn(input));
```
Since a Transformer accepts a single argument `mappingFn` and returns a function that also accepts a single argument, Transformers are composable.

After composing as many Transformers using pipe or compose, you would have a transducer function, you can optionally pass it a reducing function e.g. append/concat/etc... and get a standard reducing function.
To run the transducer to an enumerator (iterator/generator) you would need to reduce the enumerator using the composed reducing function.
While running the transducer you get a chance to initialize the accumulator, trigger early termination using the `reduced` protocol or apply a final function to the resulting accumlator before returning the result to the user.

By convention, Transformer function names would start with the prefix `xf` or `xform`

#### NOTE:
Don't waste time scratching your head trying to debug the direction of composition, just know that when Transformers are `composed` they execute `left-to-right` as if they are `piped`.
If you examine the following example you can figure out that the right-most Transformer is now wrapped as the inner-most function and would indeed execute first, effectively reversing the order of compose to be 'left-to-right' instead of the normal compose 'right-to-left' execution order.

```javascript
const F = require('functional-pipelines')

const add10 = x => x + 10;
const square = x => x * x;
const predicateEven = x => x % 2 === 0;
const xfilterEven = F.filterTransformer(predicateEven); // Transformers can also filter

const xformAdd10 = F.mapTransformer(add10);
const xformSquare = F.mapTransformer(square);

// Note that the direction of execution would affect the result

// composes functions * right * to left
const composedFn = F.compose(add10, square);
const result = composedFn(5);
expect(result).toEqual(35);

// composes functions * right * to left
const composedFn = F.compose(square, add10);
const result = composedFn(5);
expect(result).toEqual(225);

// Transducers
const dataIterable = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// while composing transformers, the execution order is still left-to-right

const transducerFn = F.compose(xformAdd10, xformSquare, xfilterEven);
const reducingFn = transducerFn(F.append(/*reducingFn*/)); // append is a transducer fn that ignores its argument and returns a reducing function that appends to an array
const result = F.reduce(reducingFn, () => [], dataIterable);
expect(result).toEqual([144, 196, 256, 324, 400]);

```

## Reduce, ReduceRight, ReduceAsync
It's clear from the above section that transducers are effectively a reduce operation at the heart.
The clean protocol with the distinct signatures for a `Transformer`, a `transducer funtion` allow for composition and fit into the contract of `reduce`

```javascript
function reduce(reducingFn, initFn, enumerable, resultFn = unreduced)
```
* @param reducingFn: function of arity 2, (acc, input) -> new acc, can be a composed function of many Transformers
* @param initFn: produces the initial value for the accumulator, `() => []` would do in most cases
* @param enumerable: iterator or generator to be reduced
* @param: resultFn: applied to the final result, by default unpacks a reduced value if any

### mapCat
To understand transducers let's use a popular concatMap example, the functional name for that transducers is mapCat since it composes `map transducer function` with `cat transducer function`

```javascript
/**
 * cat is a transducer fn
 * cat:: fn -> acc -> x -> acc
 */
const cat = (reducingFn, {factory = identity} = {}) => (acc, input) => factory([...acc, ...input]);
```
Note: how cat adheres to the transducer function signature above, but ignores the `reducingFn` argument. While this is true, having `cat` implementing a transducer function means that it can be piped and composed with other Transformers functions transparently

```javascript
/**
 * mapcat is a transducer fn
 * mapcat:: fn -> acc -> x -> acc
 */
const mapcat = fn => compose(mapTransformer(fn), cat);

// any number of mapping or filtering Transformers can be composed
const mapcat = fn => compose(mapTransformer(fn), filterEvenTransformer, cat);
```

## Core Utilities

### which(fn)
For when you have an elaborate functional pipeline and you want to see the order of execution logged to console.
which would log the function name (if not anonymous) and the JSON.stringify of the arguments
### peek(fn)
peek would only log the function

### flip(...args)
When the order of arguments is not convenient
```javascript
const flip = fn => (...args) => fn(...args.reverse());
```

### `type of` functions
```javascript
const SymbolIterator = Symbol.iterator;
const SymbolAsyncIterator = Symbol.asyncIterator;

const isFunction = f => typeof f === 'function';
const isIterable = o => o && isFunction(o[SymbolIterator]);
const isIterator = o => o && isFunction(o['next']);
const isEnumerable = o => isIterable(o) || isIterator(o);
const isGenerator = o => isEnumerable(o) && isFunction(o['return']);
const isAsyncGenerator = o => o && isFunction(o[SymbolAsyncIterator]);

const isNil = x => x == null; // `==` works for null || undefined
// const isNumber = x => typeof x === 'number';
const objectTag = o => Object.prototype.toString.call(o);
const isDate = o => objectTag(o) === '[object Date]';
const isRegExp = o => objectTag(o) === '[object RegExp]';
const isError = o => objectTag(o) === '[object Error]';
const isBoolean = o => objectTag(o) === '[object Boolean]';
const isNumber = o => objectTag(o) === '[object Number]' && o == +o; // typeof NaN -> 'number' <WATT?!> `NaN` primitive is the only value that is not equal to itself.
const isString = o => objectTag(o) === '[object String]';
const isArray = Array.isArray || (o => objectTag(o) === '[object Array]');
const isObject = o => o && o.constructor === Object;

const isEmptyValue = x => isNil(x) || !isNumber(x) && !isFunction(x) && Object.keys(x).length === 0; // works for null, undefined, '', [], {}
// const isObject = o => o && (typeof o === 'object' || !isFunction(o));
// const isArray = o => Array.isArray(o);
const isContainer = o => isObject(o) || isArray(o);
const isLiteral = o => !isContainer(o);
```

### entries
When you are dealing with objects (POJOs), to retreive a generator of either keys, values or key/value pairs
```javascript
function* entries(o, values = false, kv = true)
```

### iterator
To get an iterator from object key/values or from an iterable or a generator
```javascript
function iterator(o, {indexed = false, kv = false, metadata = lazy({})} = {})
```
The metadata function allows you to attach a function to retrieve the iterator metadata. Usually is useful when the iterator is a result of a paginated API call that have some metadata values associated with it, like the consumed Capacity Units in the case of DynamoDB on AWS.

### partitionBy(fn, enumerable)
Yields a new iterator with the new partition when result from partitioning function changes.
Each iterator has a metadata() function attached to retrieve the partitioning function result associated with it.

### sticky(n, {when = identity, recharge = false} = {}) => partitioningFn => {}
```javascript
/**
 * stickiness decorator for a partitioning function
 *
 * Works with partitionBy to have some elements attract n subsequent elements into their same bucket
 *
 * @example: [cookie, monster, cookie, cookie, monster, cookie, cookie, cookie, monster, monster]
 * let n = 1, partitions into: [[cookie, monster], cookie, cookie, [monster, cookie], cookie, cookie, [monster, monster]]
 * @param n: number of items to repeat result, when we have a hit
 * @param when: (result, memory, context) -> true means we have a hit, context.n can be manipulated to interactively change stickiness
 * @param recharge: reboot n every time we have a hit, implies calling fn() for each item, otherwise the function call is skipped while repeating.
 */
```

### The full interface
```javascript
module.exports = {
    which,
    peek,
    __,
    withOneSlot,
    oneslot: withOneSlot,
    empty,
    identity,
    identityAsync,
    K,
    lazy: K,
    always: K,
    constant: K,
    yrruc,
    flip,
    ifElse,
    pipe,
    pipes,
    compose,
    composes,
    composeAsync,
    SymbolIterator,
    SymbolAsyncIterator,
    isNil,
    isEmptyValue,
    isString,
    isNumber,
    isObject,
    isArray,
    isFunction,
    isContainer,
    isLiteral,
    isIterable,
    isIterator,
    isEnumerable,
    isGenerator,
    isAsyncGenerator,
    iterator,
    toIterator,
    entries,
    permute,
    // walk,
    pmatch,
    zipWith,
    zip,
    take,
    skip,
    slice,
    partitionBy,
    flatten,
    sticky,
    memorizeWhen: sticky,
    append,
    appendAsync,
    cat,
    concat: cat,
    mapcat,
    concatMap: mapcat,
    catAsync,
    concatAsync: catAsync,
    mapcatAsync,
    concatMapAsync: mapcatAsync,
    update,
    mapUpdate,
    reduced,
    isReduced,
    unreduced,
    reduce,
    reduceRight,
    reduceAsync,
    into,
    mapTransformer,
    mapAsyncTransformer,
    map,
    mapAsync,
    filterTransformer,
    filterAsyncTransformer,
    filter,
    filterAsync
};

```

## Build Targets
Currently the following target build environments are configured for babel-preset-env plugin
```javascript
 "targets": {
   "node": 6.10,
   "browsers": ["last 10 versions", "ie >= 7"]
 }
```
In case this turns out to be not generous enough, more backward compatible babel transpilation targets would be added.
Note that Symbol.asyncIterator and `for await` are ES2018 features.

## Roadmap

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[MIT](LICENSE)
