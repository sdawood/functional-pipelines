/* eslint-disable max-statements-per-line,semi,no-unused-expressions,no-extra-parens */
// functional debugging 101, peek into function names
/**
 * debugging decorator that logs function name when the decorated function is invoked
 * fn: can be a function defined with the `function` keyword, or `let foo = () => {}; foo = which(foo);`
 */
const which = (fn, {input = true, output = false, stringify = true} = {}) => (...args) => {
    console.log(`${fn.name || 'function'}(${input ? JSON.stringify(args, null, 0) : '...'})`);
    const result = fn(...args);
    if (output) console.log(`${fn.name || 'function'} :: (${input ? JSON.stringify(args, null, 0) : '...'}) -> ${stringify ? JSON.stringify(result, null, 0) || result : result}`);
    return result;
};

/**
 * debugging plug, insert within a pipe or compose pipeline to peek at the cascading argument
 * @param x
 * @returns {*}
 */
const peek = x => {
    console.log(x);
    return x;
};

const __ = {'@@functional/placeholder': true};
const _is__ = a => a != null && typeof a === 'object' && a['@@functional/placeholder'] === true;

const withOneSlot = fn => (...args) => {
    const slots = args.reduce((acc, a, index) => {
        if (_is__(a)) acc['__1'] = index;
        return acc;
    }, {});
    return (coin) => {
        args[slots['__1']] = coin;
        return fn(...args)
    };
};

/**
 * Functional building blocks with zero dependencies
 * identity, pipe, compose, empty, append, map, filter, reduce, transformers, transducers
 * NOTE: map, filter, reduce can handle iterator/generator, lodash and ramda currently don't
 * mapAsync, filterAsync, reduceAsync can handle async generators, lodash and ramda, transducers-js and transducers.js currently don't
 **/
// Combinators: https://gist.github.com/Avaq/1f0636ec5c8d6aed2e45
const I = x => x;
const K = x => y => x;
const A = f => x => f(x);
const T = x => f => f(x);
const W = f => x => f(x)(x);
const C = f => y => x => f(x)(y);
const B = f => g => x => f(g(x));
const S = f => g => x => f(x)(g(x));
const P = f => g => x => y => f(g(x))(g(y));
const Y = f => (g => g(g))(g => f(x => g(g)(x)));

const identity = I;
const identityAsync = x => Promise.resolve(x);
const lazy = K;

const empty = function* () {
};

const yrruc = fn => (...args) => x => fn(x, ...args); // reversed `curry`

const pipe = (...fns) => reduceRight((f, g) => (...args) => f(g(...args)), null, fns);

const pipes = (...fns) => pipe(reduceRight((f, g) => (...args) => {
    const result = g(...args);
    return isReduced(result) ? result['@@transducer/value'] : f(result);
}, null, fns), unreduced);
// const pipes = (...fns) => reduceRight((f, g) => (...args) => { const result = g(...args); return isReduced(result) ? result : f(result); }, null, fns);

const compose = (...fns) => reduce((f, g) => (...args) => f(g(...args)), null, fns);

// reduce/reduceRight now handle early termination protocol `reduced()` and use `unreduced` as a default result function
const composes = (...fns) => compose(unreduced, reduce((f, g) => (...args) => {
    const result = g(...args);
    return isReduced(result) ? result['@@transducer/value'] : f(result);
}, null, fns));
// const composes = (...fns) => reduce((f, g) => (...args) => { const result = g(...args); return isReduced(result) ? result : f(result); }, null, fns);

const composeAsync = (...fns) => reduceAsync((fn1, fn2) => async (...args) => fn1(await fn2(...args)), undefined, fns);

const flip = fn => (...args) => fn(...args.reverse());


/** ----- FUTURE ----- **/
// When the runtime supports async/generator functions without transpiling, we can check if a function is a generator or is async by using foo instanceof AsyncFunctionType for example
const GeneratorFunctionType = (function* () {
}).constructor;
const AsyncFunctionType = (async function () {
}).constructor;

/** ----- FUTURE ----- **/

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

/******************* [ Logic ] *******************/

/**
 * Creates a function that will process either the `onTrue` or the `onFalse`
 * function depending upon the result of the `condition` predicate.
 *
 * @func
 * @category Logic
 * @sig (*... -> Boolean) -> (*... -> *) -> (*... -> *) -> (*... -> *)
 * @param {Function} condition A predicate function
 * @param {Function} onTrue A function to invoke when the `condition` evaluates to a truthy value.
 * @param {Function} onFalse A function to invoke when the `condition` evaluates to a falsy value.
 * @return {Function} A new unary function that will process either the `onTrue` or the `onFalse`
 *                    function depending upon the result of the `condition` predicate.
 * @example
 *
 *      var incCount = ifElse(
 *        isEven,
 *        inc,
 *        dec
 *      );
 *      incCount(2);           //=> 3
 *      incCount(3); //=> 1
 */
const ifElse = predicate => (trueFn = identity) => (falseFn = identity) => (...args) => predicate(...args) ? trueFn(...args) : falseFn(...args);

/******************* [ Generators ] *******************/

/**
 * returns entries generator/iterator, with [key, value] pairs similar to Map.entries() or with [value, key] pairs, similar to Ramda.mapObjIndexed
 *
 * HINT: this is more flexible than https://lodash.com/docs/4.17.4#toPairs, also returns an iterator not a concrete Array, which is wasteful
 * @param o: object or object like reference
 * @param values: if true, returns a generator of values only, false (default) returns a generator of key-value pairs or value-key pairs
 * @param kv: if true, returns an iterator of [key, value] pairs similar to Map.entries()
 * if false, returns an iterator [value, key] pairs, similar to Ramda.mapObjIndexed
 * @default: true
 */
function* entries(o, values = false, kv = true) {
    const entryKeys = Object.keys(o);
    if (values) {
        yield* entryKeys.map(k => o[k]);
    } else {
        kv ? yield* zip(entryKeys, entryKeys.map(k => o[k])) : yield* zip(entryKeys.map(k => o[k]), entryKeys);
    }
}


// function* range(...args) {
//     switch (args.length) {
//         case 1: {
//             break;
//         }
//         case 2: {
//             break;
//         }
//
//     }
//     if (!isNumber(take) || !isNumber(start)) return;
//     while (take) {
//     }
// }

/**
 * zip generator that works with iterables, iterators and generators
 *
 * Lodash and ramda only support concrete arrays!
 *
 * @param enumerable1: enumerable, i.e. iterable, iterator or generator
 * @param enumerable2: enumerable, i.e. iterable, iterator or generator
 * @param fn: pair transform function of arity 2
 */
function* zipWithGen(enumerable1, enumerable2, fn = (x1, x2) => [x1, x2]) {
    let count = 0;
    enumerable1 = iterator(enumerable1);
    enumerable2 = iterator(enumerable2);
    for (const e1 of enumerable1) {
        const {value: e2, done} = enumerable2.next();
        if (done) return count;
        yield fn(e1, e2); // cater for mutable and immutable collections
        count++;
    }
}

const zipWith = (enumerable1, enumerable2, fn) => iterator(zipWithGen(enumerable1, enumerable2, fn));
const zip = (enumerable1, enumerable2) => zipWith(enumerable1, enumerable2);

function* takeGen(n, enumerable) {
    n = isNumber(n) ? n : Number.POSITIVE_INFINITY;
    enumerable = iterator(enumerable);

    let {value, done} = enumerable.next();
    while (!done && n-- > 0) {
        yield value;
        ({value, done} = enumerable.next());
    }
}

const take = (n, enumerable) => iterator(takeGen(n, enumerable)); // TODO: implement take as a stateful transformer/transducer for composability

function* skipGen(n, enumerable) {
    n = isNumber(n) ? n : 0;
    enumerable = iterator(enumerable);

    let done = false;
    while (!done && n-- > 0) {
        ({done} = enumerable.next());
    }
    yield* enumerable;
}

const skip = (n, enumerable) => iterator(skipGen(n, enumerable)); // TODO: implement take as a stateful transformer/transducer for composability

function* partitionBy(fn, enumerable) {
    const NONE = {};
    const iter = iterator(enumerable);
    let buffer = [];
    let memory = NONE;
    let lastResult;
    let newResult;
    for (const value of iter) {
        lastResult = memory;
        newResult = fn(value);
        memory = newResult;
        if ((lastResult === NONE) || (lastResult === newResult)) {
            buffer.push(value);
        } else {
            yield iterator(buffer, {metadata: lazy(lastResult)});
            buffer = [];
            buffer.push(value);
        }
    }
    if (buffer.length > 0) {
        yield iterator(buffer, {metadata: lazy(newResult)});
    }
}

// credits: https://stackoverflow.com/a/37580979/8316720
function* permute(...args) {
    const count = args.length;
    yield args.slice();
    const c = new Array(count).fill(0);
    let i = 1, k, p;

    while (i < count) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = args[i];
            args[i] = args[k];
            args[k] = p;
            ++c[i];
            i = 1;
            yield args.slice();
        } else {
            c[i] = 0;
            ++i;
        }
    }
}

/******************* [ Iterators ] *******************/

/**
 * Generator <-> Iterator compatibility corner case workaround
 *
 * when a generator (say of 10 values) is partially destructured, it prematurely terminates
 * example:
 * ```
 * const [a, b] = generator; // generator has more than two values
 * generator.next(); // {done: true, value: undefined}
 *
 * // while an iterator resumes as expected
 *
 * const [a, b] = iterator; // iterator has more than two values
 * iterator.next(); // {done: false, value: nextValue}
 * ```
 * @param generator
 * @returns {Iterator}
 */
function toIterator(generator, {indexed = false, kv = false} = {}) {
    return {
        [Symbol.iterator]() {
            return this;
        },
        next() {
            const {value, done} = generator.next();
            this.index = done ? this.index : this.index != null ? this.index + 1 : 0;
            return indexed ? {value: kv ? [this.index, value] : [value, this.index], done} : {value, done};
        }
    };
}

function iterator(o, {indexed = false, kv = false, metadata = lazy({})} = {}) {
    let iter;
    if (isNil(o)) {
        return empty();
    } else if (isGenerator(o)) { // generator only
        iter = toIterator(o, {indexed, kv});
    } else if (isIterator(o)) { // iterator (generator would have passed)
        iter = indexed ? toIterator(o, {indexed, kv}) : o;
    } else if (isIterable(o)) { // iterable (NOTE: iterator and generator would have passed the test as well)
        iter = indexed ? toIterator(o[Symbol.iterator](), {indexed, kv}) : o[Symbol.iterator]();
    } else if (isObject(o)) {
        iter = toIterator(entries(o, !indexed, kv));
    } else {
        iter = empty();
    }
    iter.metadata = isFunction(o.metadata) ? o.metadata : metadata; // pipe existing metadata() to the new supplied one?
    return iter;
}

const pmatch = o => {
    // let [[value, key]] = iterator(o, {indexed: true});
    // let [[value, key]] = o;
    o = isIterable(o) ? o : [];
    let [value, key] = o;
    return {key, value, 0: value, 1: key};
};


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
const sticky = (n, {when = identity, recharge = false} = {}) => fn => {
    let count = 0;
    let result;
    let memory;
    return (...args) => {
        if (!count) { // not repeating
            result = fn(...args);
            memory = result;
            const ctx = {n};
            count = when(result, memory, ctx) ? ctx.n : count; // currently when answers with a toggle yes/no, x/y
        } else { // repeating
            if (recharge) {
                result = fn(...args);
                const ctx = {n};
                count = when(result, memory, ctx) ? ctx.n + 1 : count; // recharge sticky counter with every new positive hit, (n + this once)
            }
            result = memory;
            count--;
        }
        return result;
    }
};


/******************* [ Transducers+ ] *******************/

const reduced = x => x && x['@@transducer/reduced'] ? x :
    {
        '@@transducer/value': x,
        '@@transducer/reduced': true
    };

const isReduced = x => x && x['@@transducer/reduced'];

const unreduced = result => isReduced(result) ? result['@@transducer/value'] : result;

/**
 * Implements reduce for iterables
 *
 * Uses the for-of to reduce an iterable, accepting a reducing function
 * @param iterable
 * @param reducingFn: function of arity 2, (acc, input) -> new acc
 * @param initFn: produces the initial value for the accumulator
 * @returns {Accumulator-Collection}
 */
function reduce(reducingFn, initFn, enumerable, resultFn) {
    if (isFunction(resultFn)) {
        resultFn = pipe(unreduced, resultFn);
    } else {
        resultFn = unreduced;
    }
    let result;
    const iter = iterator(enumerable);

    if (!initFn) {
        const [initValue] = iter;
        initFn = lazy(initValue);
    }
    result = initFn();

    for (const value of iter) {
        if (isReduced(result)) {
            break;
        }
        result = reducingFn(result, value);
    }
    return resultFn(result);
}

function reduceRight(reducingFn, initFn, array, resultFn) {
    if (isFunction(resultFn)) {
        resultFn = pipe(unreduced, resultFn);
    } else {
        resultFn = unreduced;
    }
    let result;
    const iter = iterator(array.slice().reverse());

    if (!initFn) {
        const [initValue] = iter;
        initFn = lazy(initValue);
    }
    result = initFn();

    for (const value of iter) {
        if (isReduced(result)) {
            break;
        }
        result = reducingFn(result, value);
    }
    return resultFn(result);
}

const flatten = enumerable => reduce(cat(), () => [], enumerable);

/**
 * Implements reduce for async-generators instead of iterables or reduce for an async reducingFn
 *
 * Uses the for-await-of to reduce an async-generator, accepting an async reducing function
 * @param enumerable: async-generator: async function* asyncGen(), or fall back to iterable/iterator if forAwait = false
 * @param reducingFn: async function of arity 2, (acc, input) -> new acc
 * @param initFn: produces the initial value for the accumulator
 * @param async: if true, iterator is considered to be an async-generator, instructs reduce to use for-await-of, else uses for-of
 * HINT: an async reducing function is won't complain if an iterator is passed in place of the enumerable
 * HINT: an async reducing function is a candidate trap for async-throttling/rate-limiting/quota-limiting
 * @returns {Promise<Accumulator-Collection>}
 */
const reduceAsync = async (reducingFn, initFn, enumerable, resultFn, reducedRejectedPromises = true) => {
    if (isFunction(resultFn)) {
        resultFn = pipe(unreduced, resultFn);
    } else {
        resultFn = unreduced;
    }
    let result;
    const isAsync = isAsyncGenerator(enumerable) || (!isIterable(enumerable) && !SymbolAsyncIterator); // https://github.com/babel/babel/issues/7467
    const iter = isAsync ? await enumerable : iterator(enumerable); // treat this argument as an iterable;

    const resolveValue = async (x, reducedRejectedPromises) => {
        try {
            return await x;
        } catch (error) {
            if (reducedRejectedPromises) {
                return reduced(error);
            } else {
                throw error;
            }
        }
    };

    if (!initFn) {
        if (isAsync) {
            initFn = lazy((await (await iter.next())).value);
        } else {
            const [initValue] = iter;
            initFn = lazy(initValue);
        }
    }

    result = initFn();
    if (isAsync) {
        let done = false;
        let value = undefined;
        ({value, done} = await iter.next());
        do {
            result = await resolveValue(result, reducedRejectedPromises);
            if (isReduced(result)) {
                break;
            }
            const resolvedValue = await resolveValue(value, reducedRejectedPromises);
            if (isReduced(resolvedValue)) {
                break;
            }
            result = await reducingFn(result, resolvedValue);

            ({value, done} = (await (await iter.next())));
        } while (!done)
    } else {
        for (let value of iter) {
            result = await resolveValue(result, reducedRejectedPromises);
            if (isReduced(result)) {
                break;
            }
            const resolvedValue = await resolveValue(value, reducedRejectedPromises);
            if (isReduced(resolvedValue)) {
                break;
            }
            result = await reducingFn(result, resolvedValue);
        }
    }
    return resultFn(result);
};

/**
 * append is a transducer fn
 * append:: fn -> acc -> x -> acc
 */
const append = (reducingFn, {factory = identity} = {}) => (acc, input) => factory([...acc, input]);

const appendAsync = (reducingFn, {factory = identity} = {}) =>
    async (acc, input) =>
        factory([...(await acc), input]); // `await acc` is just a precaution, reduceAsync() already await for previous result from the reducing function

/**
 * cat is a transducer fn
 * cat:: fn -> acc -> x -> acc
 */
const cat = (reducingFn, {factory = identity} = {}) => (acc, input) => factory([...acc, ...input]);

const catAsync = (reducingFn, {factory = identity} = {}) =>
    async (acc, input) =>
        factory([...(await acc), ...input]); // `await acc` is just a precaution, reduceAsync() already await for previous result from the reducing function
/**
 * mapcat is a transducer fn
 * mapcat:: fn -> acc -> x -> acc
 */
const mapcat = fn => compose(mapTransformer(fn), cat);

const mapcatAsync = fn => composeAsync(mapAsyncTransformer(fn), catAsync);

/**
 * update is a transducer fn
 * update:: fn -> acc -> x -> acc
 */
const update = (reducingFn, {factory = identity} = {}) => (acc, [value, key]) => factory({...acc, [key]: value});
const mapUpdate = (fn, iterable) => reduce(compose(mapTransformer(fn), update)(/*reducingFn*/), () => ({}), iterable);

/**
 * Implements map transform for iterables, stub for ramda.map, should be removed when ramda is introduced.
 *
 * Uses the for-of to map over an iterable, accepting a transform function
 * @param iterable
 * @param mappingFn: function of arity 1, x -> y
 * @param initFn: produces the initial value for the result collection
 * @returns {Accumulator-Collection}
 */
const mapTransformer = mappingFn => reducingFn => (acc, input) => reducingFn(acc, mappingFn(input));
const map = (fn, iterable) => reduce(compose(mapTransformer(fn), append)(/*reducingFn*/), () => [], iterable);

const mapAsyncTransformer = mappingFn => reducingFn => async (acc, input) => reducingFn(acc, await mappingFn(input));
const mapAsync = async (fn, enumerable) => reduceAsync(
    await (await composeAsync(mapAsyncTransformer(fn), appendAsync))(/*reducingFn*/),
    () => [],
    enumerable);

const filterTransformer = predicateFn => reducingFn => (acc, input) => predicateFn(input) ? reducingFn(acc, input) : acc;
const filter = (fn, iterable) => reduce(compose(filterTransformer(fn), append)(/*reducingFn*/), () => [], iterable);

const filterAsyncTransformer = predicateFn => reducingFn => async (acc, input) => await predicateFn(input) ? reducingFn(acc, input) : acc;
const filterAsync = async (fn, enumerable) => reduceAsync(
    await (await composeAsync(filterAsyncTransformer(fn), appendAsync))(/*reducingFn*/),
    () => [],
    enumerable);

/**
 * Not yet the full spec of http://ramdajs.com/docs/#into
 * @param collection
 * @param transducer
 * @param enumerable
 * @returns {*}
 */
const into = (container, transducer, enumerable) => {
    const reindex = xf => reducingFn => (acc, [v, k]) => {
        // const unpack = reducingFn => (acc, [v, k]) => reducingFn(acc, v);
        // const repack = reducingFn => (acc, v) => reducingFn(acc, [v, 'k?'])
        return compose(unpack, xf(identity), repack);
    };
    let result;
    let reducingFn;
    if (isContainer(container)) {
        reducingFn = isArray(container) ? append() : update();
        result = reduce(reindex(transducer)(which(reducingFn)), () => container, iterator(enumerable, {indexed: true}));
    } else {
        result = container;
    }
    return result;
};

/**
 * Implementation of Python's `slice` function... Get a cloned subsequence
 * of an iterable (collection with length property and array like indexs).
 * Will handle both strings and array.
 *
 * @param {None|Integer} from First index to include. If negative it will be indicies from end
 (i.e. -1 is last item). Omit or pass 0/null/undefined for 0.
 * @param {None|Integer} to Last index to include. If negative it will be indicies from end
 (i.e. -1 is last item). Omit or pass null/undefined for end.
 * @param {None|Intger} step Increments to increase by (non-1 will skip indicies). Negative values
 will reverse the output.
 * @param {Array|String} collection
 * @returns {Array|String} sliced array
 *
 * @example
 * const list = [1, 2, 3, 4, 5]
 * slice(list) // => [1, 2, 3, 4, 5]
 * slice(list, 2) // => [3, 4, 5]
 * slice(list, 2, 4) // => [3, 4]
 * slice(list, -2) // => [4, 5]
 * slice(list, null, -1) // => [1, 2, 3, 4]
 * slice(list, null, null, 2) // => [1, 3, 5]
 * slice(list, null, null, -2) // => [5, 3]
 */
const slice = (from, to, step) => list => {
    if (step === 0) throw Error("Slice step cannot be zero");
    const isstring = isString(list)
    if (isstring) {
        list = list.split("");
    }
    const len = list.length;
    let result = [];
    const empty = isstring ? "" : [];
    if (from == null) from = step < 0 ? len : 0;
    if (to == null) to = step < 0 ? 0 : len;
    if (!step) {
        result = list.slice(from, to);
        return isstring ? result.join("") : result;
    }
    // normalize negative values
    from = from < 0 ? len + from : from;
    to = to < 0 ? len + to : to;
    // return empty if extents are backwards
    if (step > 0 && to <= from) return empty;
    if (step < 0 && from <= to) return empty;
    if (from > to) {
        const _from = from;
        from = +to + Math.abs(step);
        to = +_from + Math.abs(step);
    }
    // since from, to are normalized, a good old efficient for loop can do the slice and the stepping in one pass with abs(step), negative step reverses the result
    for (let i = from; i < to; i += Math.abs(step)) {
        if (i >= len) break;
        if (i % step === 0) result.push(list[i]);
    }
    if (step < 0) result.reverse();
    // Return a string for input strings otherwise an array
    return isstring ? result.join('') : result;
};

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
