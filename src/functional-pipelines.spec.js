const F = require('./functional-pipelines');

const dataObject = {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10};
const dataIndexValuePairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]];
const dataKeyValuePairs = [["a", 1], ["b", 2], ["c", 3], ["d", 4], ["e", 5], ["f", 6], ["g", 7], ["h", 8], ["i", 9], ["j", 10]];

const dataObjects = {
    a: {name: 'name_a', value: 1},
    b: {name: 'name_b', value: 2},
    c: {name: 'name_c', value: 3},
    d: {name: 'name_d', value: 4},
    e: {name: 'name_e', value: 5},
    f: {name: 'name_f', value: 6},
    g: {name: 'name_g', value: 7},
    h: {name: 'name_h', value: 8},
    i: {name: 'name_i', value: 9},
    j: {name: 'name_j', value: 10}
};
const dataIterable = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const dataObjectsIterable = [{key: 'a', name: 'name_1', value: 1}, {key: 'b', name: 'name_2', value: 2}, {
    key: 'c',
    name: 'name_3',
    value: 3
}, {key: 'd', name: 'name_4', value: 4}, {key: 'e', name: 'name_5', value: 5}, {
    key: 'f',
    name: 'name_6',
    value: 6
}, {key: 'g', name: 'name_7', value: 7}, {key: 'h', name: 'name_8', value: 8}, {
    key: 'i',
    name: 'name_9',
    value: 9
}, {key: 'j', name: 'name_10', value: 10}];

const dataIterator = () => dataIterable[F.SymbolIterator]();

function* dataGenerator() {
    yield* dataIterator();
}

function* dataGeneratorOfPromises() {
    yield* dataIterable.map(F.identityAsync);
}

async function* dataAsyncGenerator() {
    yield* dataIterator();
}

async function* dataAsyncGeneratorOfPromises() {
    yield* dataIterable.map(F.identityAsync);
}

const fn1 = x => x + 10;
const fn2 = x => x * x;
// const fn1 = F.which(fn1);
// const fn2 = F.which(_fn2);

const fn1Box = x => [fn1(x)];
const fn2Box = x => [fn2(x)];

const fn1Async = x => F.identityAsync(fn1(x));
const fn2Async = x => F.identityAsync(fn2(x));

const fn1AsyncBox = x => F.identityAsync(fn1Box(x));
const fn2AsyncBox = x => F.identityAsync(fn2Box(x));

const predicateEven = x => x % 2 === 0;
// const predicateEven = F.which(predicateEven);

const predicateEvenAsync = x => F.identityAsync(predicateEven(x));

const resolveArgs = fn => async (...args) => {
    const resolvedArgs = [];
    for (const arg of args) {
        resolvedArgs.push(await arg);
    }
    return fn(...resolvedArgs);
};

// Transducers

const xformAdd10 = F.mapTransformer(fn1);
const xformSquare = F.mapTransformer(fn2);
const xfilterEven = F.filterTransformer(predicateEven);

const xformAdd10Box = F.mapTransformer(fn1Box);
const xformSquareBox = F.mapTransformer(fn2Box);

// Short Circuited Transduction

const predicateMax = n => x => x > n ? F.reduced(x) : x;
const xfMax = n => F.mapTransformer(predicateMax(n));

// Async Transducers

const xformAdd10Async = F.mapAsyncTransformer(fn1Async);
const xformSquareAsync = F.mapAsyncTransformer(fn2Async);
const xfilterEvenAsync = F.filterAsyncTransformer(predicateEvenAsync);

const xformAdd10AsyncBox = F.mapAsyncTransformer(fn1AsyncBox);
const xformSquareAsyncBox = F.mapAsyncTransformer(fn2AsyncBox);

describe('sync', () => {
    describe('iterator', () => {
        describe('iterator of values', () => {
            it('creates an iterator over an object', () => {
                const result = F.iterator(dataObject);
                expect([...result]).toEqual(dataIterable);
            });

            it('creates an iterator over an iterable', () => {
                const result = F.iterator(dataIterable);
                expect([...result]).toEqual(dataIterable);
            });

            it('creates an iterator over an iterator', () => {
                const result = F.iterator(dataIterator());
                expect([...result]).toEqual(dataIterable);
            });

            it('creates an iterator over a generator', () => {
                const result = F.iterator(dataGenerator());
                expect([...result]).toEqual(dataIterable);
            });

            it('creates an iterator over an empty value', () => {
                let result = F.iterator(null);
                expect([...result]).toEqual([]);

                result = F.iterator(undefined);
                expect([...result]).toEqual([]);
            });
        });
        describe('iterator of [key, value] pairs', () => {
            it('creates an iterator over an object', () => {
                const result = F.iterator(dataObject, {indexed: true, kv: true});
                expect([...result]).toEqual(dataKeyValuePairs);
            });

            it('creates an iterator over an iterable', () => {
                const result = F.iterator(dataIterable, {indexed: true, kv: true});
                expect([...result]).toEqual(dataIndexValuePairs);
            });

            it('creates an iterator over an iterator', () => {
                const result = F.iterator(dataIterator(), {indexed: true, kv: true});
                expect([...result]).toEqual(dataIndexValuePairs);
            });

            it('creates an iterator over a generator', () => {
                const result = F.iterator(dataGenerator(), {indexed: true, kv: true});
                expect([...result]).toEqual(dataIndexValuePairs);
            });

            it('creates an iterator over an empty value', () => {
                let result = F.iterator(null, {indexed: true, kv: true});
                expect([...result]).toEqual([]);

                result = F.iterator(undefined);
                expect([...result]).toEqual([], {indexed: true, kv: true});
            });
        });
    });

    describe('map', () => {
        it('maps a function over an enumerable -> object values', () => {
            const result = F.map(fn1, dataObject);
            expect(result).toEqual(dataIterable.map(fn1));
        });
        it('maps a function over an enumerable -> iterable', () => {
            const result = F.map(fn1, dataIterable);
            expect(result).toEqual(dataIterable.map(fn1));
        });
        it('maps a function over an enumerable -> iterator', () => {
            const result = F.map(fn1, dataIterator());
            expect(result).toEqual(dataIterable.map(fn1));
        });
        it('maps a function over an enumerable -> generator', () => {
            const result = F.map(fn1, dataGenerator());
            expect(result).toEqual(dataIterable.map(fn1));
        });
        it('maps a function over an enumerable -> generator of promises', async () => {
            const result = F.map(resolveArgs(fn1), dataGeneratorOfPromises());
            const results = await Promise.all(result);
            expect(results).toEqual(dataIterable.map(fn1));
        });
    });

    describe('filter', () => {
        it('maps a function over an enumerable -> object values', () => {
            const result = F.filter(predicateEven, dataObject);
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });
        it('filters a function over an enumerable -> iterable', () => {
            const result = F.filter(predicateEven, dataIterable);
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });
        it('filters a function over an enumerable -> iterator', () => {
            const result = F.filter(predicateEven, dataIterator());
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });
        it('filters a function over an enumerable -> generator', () => {
            const result = F.filter(predicateEven, dataGenerator());
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });

        /*
         * filters an predicate function over an enumerable -> async-generator of Promises
         * filter won't work because inside filterTransfomer predicateFn(input) would return a Promise not a boolean
         * see: filterAsync for details
         */
    });

    describe('zipWith, zip', () => {
        it('zips two enumerables into one iterator applying fn([item1, item2]) that can be reduced(append)', () => {
            const expectedResult = [["1", "11"], ["2", "12"], ["3", "13"], ["4", "14"], ["5", "15"], ["6", "16"], ["7", "17"], ["8", "18"], ["9", "19"], ["10", "20"]];
            const enumerable2 = F.iterator(F.map(fn1, dataIterator()));
            const combinedIterator = F.zipWith(dataGenerator(), enumerable2, (...args) => args.map(x => `${x}`));
            const result = F.reduce(F.append(), () => [], combinedIterator);
            expect(result).toEqual(expectedResult);
        });
        it('zips two enumerables into one iterator that can be reduced(append)', () => {
            const expectedResult = [[1, 11], [2, 12], [3, 13], [4, 14], [5, 15], [6, 16], [7, 17], [8, 18], [9, 19], [10, 20]];
            const enumerable2 = F.iterator(F.map(fn1, dataIterator()));
            const combinedIterator = F.zip(dataGenerator(), enumerable2);
            const result = F.reduce(F.append(), () => [], combinedIterator);
            expect(result).toEqual(expectedResult);
        });
        it('zips two enumerables into one iterator that can be reduced(concat)', () => {
            const expectedResult = [1, 11, 2, 12, 3, 13, 4, 14, 5, 15, 6, 16, 7, 17, 8, 18, 9, 19, 10, 20];
            const enumerable2 = F.iterator(F.map(fn1, dataIterator()));
            const combinedIterator = F.zip(dataGenerator(), enumerable2);
            const result = F.reduce(F.concat(), () => [], combinedIterator);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('take', () => {
        it('takes first n items from an enumerable', () => {
            const prefixEnumerable = F.take(5, dataGenerator());
            expect(F.reduce(F.append(), () => [], prefixEnumerable)).toEqual(dataIterable.slice(0, 5))
        });
        it('handles n = 0', () => {
            const prefixEnumerable = F.take(0, dataGenerator());
            expect(F.reduce(F.append(), () => [], prefixEnumerable)).toEqual([])
        });
        it('handles n < 0', () => {
            const prefixEnumerable = F.take(-1, dataGenerator());
            expect(F.reduce(F.append(), () => [], prefixEnumerable)).toEqual([])
        });
        it('handles n > sequence length', () => {
            const prefixEnumerable = F.take(100, dataGenerator());
            expect(F.reduce(F.append(), () => [], prefixEnumerable)).toEqual(dataIterable)
        });
        it('handles empty sequences', () => {
            const prefixEnumerable = F.take(5, F.empty());
            expect(F.reduce(F.append(), () => [], prefixEnumerable)).toEqual([])
        });
    });

    describe('skip', () => {
        it('skips first n items from an enumerable', () => {
            const suffixEnumerable = F.skip(5, dataGenerator());
            expect(F.reduce(F.append(), () => [], suffixEnumerable)).toEqual(dataIterable.slice(5))
        });
        it('handles n = 0', () => {
            const suffixEnumerable = F.skip(0, dataGenerator());
            expect(F.reduce(F.append(), () => [], suffixEnumerable)).toEqual(dataIterable)
        });
        it('handles n < 0', () => {
            const suffixEnumerable = F.skip(-1, dataGenerator());
            expect(F.reduce(F.append(), () => [], suffixEnumerable)).toEqual(dataIterable)
        });
        it('handles n > sequence length', () => {
            const suffixEnumerable = F.skip(100, dataGenerator());
            expect(F.reduce(F.append(), () => [], suffixEnumerable)).toEqual([])
        });
        it('handles empty sequences', () => {
            const suffixEnumerable = F.skip(5, F.empty());
            expect(F.reduce(F.append(), () => [], suffixEnumerable)).toEqual([])
        });
    });

    describe('slice', () => {
        const data = ['a', 'b', 'c', 'd', 'e', 'f'];

        it('no params yields copy', () => {
            expect(F.slice()(data)).toEqual(data);
        });

        it('no end param defaults to end', () => {
            expect(F.slice(2)(data)).toEqual(data.slice(2));
        });

        it('zero end param yields empty', () => {
            expect(F.slice(0, 0)(data)).toEqual([]);
        });

        it('first element with explicit params', () => {
            expect(F.slice(0, 1, 1)(data)).toEqual(['a']);
        });

        it('last element with explicit params', () => {
            expect(F.slice(-1, 6)(data)).toEqual(['f']);
        });

        it('empty extents and negative step reverses', () => {
            expect(F.slice(null, null, -1)(data)).toEqual(['f', 'e', 'd', 'c', 'b']);
        });

        it('meaningless negative step partial slice', () => {
            expect(F.slice(2, 4, -1)(data)).toEqual([]);
        });

        it('negative step partial slice no start defaults to end', () => {
            expect(F.slice(null, 2, -1)(data)).toEqual(F.slice(data.length, 2, -1)(data));
            expect(F.slice(null, 2, -1)(data)).toEqual(['f', 'e', 'd']);
        });

        it('extents clamped end', () => {
            expect(F.slice(null, 100)(data)).toEqual(data);
        });

        it('extents clamped beginning', () => {
            expect(F.slice(-100, 100)(data)).toEqual(data);
        });

        it('backwards extents yields empty', () => {
            expect(F.slice(2, 1)(data)).toEqual([]);
        });

        it('zero step gets shot down', () => {
            expect(() => {
                F.slice(null, null, 0)(data);
            }).toThrow();
        });

        it('slice with step > 1', () => {
            const results = F.slice(0, 4, 2)(data);
            expect(results).toEqual(['a', 'c']);
        });

        it('meaningless slice with start < end, step < 0', () => {
            const results = F.slice(0, 2, -1)(data);
            expect(results).toEqual([]);
        });

    });

    describe('partitionBy', () => {
        it('yields a partition iterator everytime the supplied function changes result', () => {
            const data = [0, 1, 2, 'a', 'b', 'c', 3, 'd', 'e', 4, 5, 6, 7, 'f'];
            const expectedResult = [[0, 1, 2], ["a", "b", "c"], [3], ["d", "e"], [4, 5, 6, 7], ["f"]];
            const partitionGen = F.partitionBy(x => typeof x === 'string', data);
            const result = F.map(iter => F.map(F.identity, iter), partitionGen);
            expect(result).toEqual(expectedResult);
        });
        it('yields a partition iterator with last-result metadata everytime the supplied function changes result', () => {
            const data = [0, 1, 2, 'a', 'b', 'c', 3, 'd', 'e', 4, 5, 6, 7, 'f'];
            const expectedResult = [false, true, false, true, false, true];
            const partitionGen = F.partitionBy(x => typeof x === 'string', data);
            const result = F.map(iter => iter.metadata(), partitionGen);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('sticky a.k.a memorizeWhen', () => {
        const data1 =                    [1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1];
        const expected1_2_recharge =     [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1]; // recharge: true, recharge sticky counter with every new positive hit
        const expected1_2_not_recharge = [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1]; // recharge: false, accidentally equal!!
        const data2 =                    [0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1];
        const expected2_2_recharge =     [0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1]; // recharge: true
        const expected2_2_not_recharge = [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1];
        const data3 =                    [0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1];
        const expected3_3_recharge =     [0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1]; // recharge: true
        const expected3_3_not_recharge = [0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1];

        describe('with recharge = true', () => {
            it('1) remembers the match-result n times, recharging the counter with every positive hit', () => {
                const stickyN = F.sticky(1, {when: x => x === 1, recharge: true})(F.identity);
                const result = F.map(stickyN, data1);
                expect(result).toEqual(expected1_2_recharge);
            });
            it('2) remembers the match-result n times, recharging the counter with every positive hit', () => {
                const stickyN = F.sticky(1, {when: x => x === 1, recharge: true})(F.identity);
                const result = F.map(stickyN, data2);
                expect(result).toEqual(expected2_2_recharge);
            });
            it('3) remembers the match-result n times, recharging the counter with every positive hit', () => {
                const stickyN = F.sticky(2, {when: x => x === 1, recharge: true})(F.identity);
                const result = F.map(stickyN, data3);
                expect(result).toEqual(expected3_3_recharge);
            });
        });

        describe('with recharge = false', () => {
            it('1) remembers the match-result n times, skipping the function invocation while in `repeat` mode', () => {
                const stickyN = F.sticky(1, {when: x => x === 1, recharge: false})(F.identity);
                const result = F.map(stickyN, data1);
                expect(result).toEqual(expected1_2_not_recharge);
            });
            it('2) remembers the match-result n times, skipping the function invocation while in `repeat` mode', () => {
                const stickyN = F.sticky(1, {when: x => x === 1, recharge: false})(F.identity);
                const result = F.map(stickyN, data2);
                expect(result).toEqual(expected2_2_not_recharge);
            });
            it('3) remembers the match-result n times, skipping the function invocation while in `repeat` mode', () => {
                const stickyN = F.sticky(2, {when: x => x === 1, recharge: false})(F.identity);
                const result = F.map(stickyN, data3);
                expect(result).toEqual(expected3_3_not_recharge);
            });
        });

        describe('with context adjusted n & recharge = false', () => {
            it('1) remembers the match-result n times, skipping the function invocation while in `repeat` mode', () => {
                const stickyN = F.sticky(10, {when: (r2, r1, ctx) => {ctx.n = 1; return r2 === 1}, recharge: false})(F.identity);
                const result = F.map(stickyN, data1);
                expect(result).toEqual(expected1_2_not_recharge);
            });
            it('2) remembers the match-result n times, skipping the function invocation while in `repeat` mode', () => {
                const stickyN = F.sticky(10, {when: (r2, r1, ctx) => {ctx.n = 1; return r2 === 1}, recharge: false})(F.identity);
                const result = F.map(stickyN, data2);
                expect(result).toEqual(expected2_2_not_recharge);
            });
            it('3) remembers the match-result n times, skipping the function invocation while in `repeat` mode', () => {
                const stickyN = F.sticky(10, {when: (r2, r1, ctx) => {ctx.n = 2; return r2 === 1}, recharge: false})(F.identity);
                const result = F.map(stickyN, data3);
                expect(result).toEqual(expected3_3_not_recharge);
            });
        });
    });

    describe('compose = step-function/append = reducing-function/reduce = pipeline-runner =~ transduce', () => {
        const expectedResult = [144, 196, 256, 324, 400];

        it('composes functions * right * to left', () => {
            const composedFn = F.compose(fn2, fn1);
            const result = composedFn(5);
            expect(result).toEqual(225);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> iterable', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            // NOTE: alternative composition (1)

            // const transducer = F.compose(xformAdd10, xformSquare, xfilterEven, F.append);
            // const reducingFn = transducer(/*reducingFn*/);
            const result = F.reduce(reducingFn, () => [], dataIterable);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> iterator', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataIterator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> generator', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataGenerator());
            expect(result).toEqual(expectedResult);
        });
    });

    describe('composes = step-function/append = reducing-function/reduce = pipeline-runner =~ transduce \= reduced() early termination', () => {
        const expectedResult = [144, 196, 256, 324, 400];

        /**
         * NOTE: for vanilla function compose()/pipe(), if early termination is required, we have to use the composes()/pipes() alternative, since it takes care of the reduced()/unreduced() behaviour
         */


        it('#1: composes() functions * right * to left', () => {
            const composedFn = F.composes(fn2, fn1, predicateMax(6));
            const result = composedFn(5);
            expect(result).toEqual(225);
        });

        it('#2: composes() functions * right * to left', () => {
            const composedFn = F.composes(fn2, predicateMax(15), fn1);
            const result = composedFn(5);
            expect(result).toEqual(225);
        });

        it('#1: composes() functions * right * to left stopping application when reduced()', () => {
            const composedFn = F.composes(fn2, fn1, predicateMax(6));
            const result = composedFn(7);
            expect(result).toEqual(7);
        });

        it('#2: composes() functions * right * to left stopping application when reduced()', () => {
            const composedFn = F.composes(fn2, predicateMax(15), fn1);
            const result = composedFn(6);
            expect(result).toEqual(16);
        });

        /**
         * NOTE: for transducers compose()/pipe(), since reduce()/reduceRight() handle reduced()/undreduced() on our behalf, using compose() or composes() yields the same effect, similarly for pipe()/pipes()
         */

        it('#1: compose():: transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.compose(xformAdd10, xfMax(15), xformSquare, xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult.slice(0, 2));
        });

        it('#1: composes():: transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.composes(xformAdd10, xfMax(15), xformSquare, xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult.slice(0, 2));
        });

        it('#2: compose():: transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfMax(200), xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult.slice(0, 2));
        });

        it('#2: composes():: transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.composes(xformAdd10, xformSquare, xfMax(200), xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult.slice(0, 2));
        });

        it('transduce using composed transducers * left * to right, over an enumerable -> iterable', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfMax(200), xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            // NOTE: alternative composition (1)

            // const transducer = F.compose(xformAdd10, xformSquare, xfilterEven, F.append);
            // const reducingFn = transducer(/*reducingFn*/);
            const result = F.reduce(reducingFn, () => [], dataIterable);
            expect(result).toEqual(expectedResult.slice(0, 2));
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> iterator', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfMax(200), xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataIterator());
            expect(result).toEqual(expectedResult.slice(0, 2));
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> generator', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfMax(200), xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataGenerator());
            expect(result).toEqual(expectedResult.slice(0, 2));
        });
    });

    describe('pipe = step-function/append = reducing-function/reduce = pipeline-runner =~ transduce', () => {
        const expectedResult = [144, 196, 256, 324, 400];

        it('pipes functions * left * to right', () => {
            const composedFn = F.pipe(fn1, fn2);
            const result = composedFn(5);
            expect(result).toEqual(225);
        });
        it('transduce using piped transducers * right * to left, over an enumerable -> object values', () => {
            const transducer = F.flip(F.pipe)(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using piped transducers * right * to left, over an enumerable -> iterable', () => {
            const transducer = F.flip(F.pipe)(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            // NOTE: alternative composition (1)

            // const transducer = F.compose(xformAdd10, xformSquare, xfilterEven, F.append);
            // const reducingFn = transducer(/*reducingFn*/);
            const result = F.reduce(reducingFn, () => [], dataIterable);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using piped transducers * right * to left, over an enumerable -> iterator', () => {
            const transducer = F.flip(F.pipe)(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataIterator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using piped transducers * right * to left, over an enumerable -> generator', () => {
            const transducer = F.flip(F.pipe)(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataGenerator());
            expect(result).toEqual(expectedResult);
        });
    });

    describe('pipes = step-function/append = reducing-function/reduce = pipeline-runner =~ transduce \= reduced() early termination', () => {
        const expectedResult = [144, 196, 256, 324, 400];

        /**
         * NOTE: for vanilla function compose()/pipe(), if early termination is required, we have to use the composes()/pipes() alternative, since it takes care of the reduced()/unreduced() behaviour
         */


        it('#1: composes() functions * right * to left', () => {
            const composedFn = F.pipes(predicateMax(6), fn1, fn2);
            const result = composedFn(5);
            expect(result).toEqual(225);
        });

        it('#2: composes() functions * right * to left', () => {
            const composedFn = F.pipes(fn1, predicateMax(15), fn2);
            const result = composedFn(5);
            expect(result).toEqual(225);
        });

        it('#1: composes() functions * right * to left stopping application when reduced()', () => {
            const composedFn = F.pipes(predicateMax(6), fn1, fn2);
            const result = composedFn(7);
            expect(result).toEqual(7);
        });

        it('#2: composes() functions * right * to left stopping application when reduced()', () => {
            const composedFn = F.pipes(fn1, predicateMax(15), fn2);
            const result = composedFn(6);
            expect(result).toEqual(16);
        });

        /**
         * NOTE: for transducers compose()/pipe(), since reduce()/reduceRight() handle reduced()/undreduced() on our behalf, using compose() or composes() yields the same effect, similarly for pipe()/pipes()
         */

        it('#1: compose():: transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.pipe(xfilterEven, xformSquare, xfMax(15), xformAdd10);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult.slice(0, 2));
        });

        it('#1: composes():: transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.pipes(xfilterEven, xformSquare, xfMax(15), xformAdd10);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult.slice(0, 2));
        });

        it('#2: compose():: transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.pipe(xfilterEven, xfMax(200), xformSquare, xformAdd10);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult.slice(0, 2));
        });

        it('#2: composes():: transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.pipes(xfilterEven, xfMax(200), xformSquare, xformAdd10);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult.slice(0, 2));
        });

        it('transduce using composed transducers * left * to right, over an enumerable -> iterable', () => {
            const transducer = F.pipe(xfilterEven, xfMax(200), xformSquare, xformAdd10);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            // NOTE: alternative composition (1)

            // const transducer = F.compose(xformAdd10, xformSquare, xfilterEven, F.append);
            // const reducingFn = transducer(/*reducingFn*/);
            const result = F.reduce(reducingFn, () => [], dataIterable);
            expect(result).toEqual(expectedResult.slice(0, 2));
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> iterator', () => {
            const transducer = F.pipe(xfilterEven, xfMax(200), xformSquare, xformAdd10);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataIterator());
            expect(result).toEqual(expectedResult.slice(0, 2));
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> generator', () => {
            const transducer = F.pipe(xfilterEven, xfMax(200), xformSquare, xformAdd10);
            const reducingFn = transducer(F.append(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataGenerator());
            expect(result).toEqual(expectedResult.slice(0, 2));
        });
    });

    describe('compose = step-function/concat = reducing-function/reduce = pipeline-runner =~ transduce', () => {
        const expectedResult = [144, 196, 256, 324, 400];

        it('composes functions * right * to left', () => {
            const composedFn = F.compose(fn2Box, fn1Box);
            const result = composedFn(5);
            expect(result).toEqual([225]);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.compose(xformAdd10Box, xformSquareBox, xfilterEven);
            const reducingFn = transducer(F.concat(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataObject);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> iterable', () => {
            const transducer = F.compose(xformAdd10Box, xformSquareBox, xfilterEven);
            const reducingFn = transducer(F.concat(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataIterable);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> iterator', () => {
            const transducer = F.compose(xformAdd10Box, xformSquareBox, xfilterEven);
            const reducingFn = transducer(F.concat(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataIterator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> generator', () => {
            const transducer = F.compose(xformAdd10Box, xformSquareBox, xfilterEven);
            const reducingFn = transducer(F.concat(/*reducingFn*/));
            const result = F.reduce(reducingFn, () => [], dataGenerator());
            expect(result).toEqual(expectedResult);
        });
    });

    describe('compose= step-function/sum = reducing-function/reduce= pipeline-runner =~ transduce', () => {
        const expectedResult = 1321;
        const sum = (a, b) => a + b;
        // const sum = F.which(_sum);

        it('transduce using composed transducers * left * to right, over an enumerable -> object values', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(sum);
            const result = F.reduce(reducingFn, undefined, dataObject);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> iterable', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(sum);
            const result = F.reduce(reducingFn, undefined, dataIterable);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> iterator', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(sum);
            const result = F.reduce(reducingFn, undefined, dataIterator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed transducers * left * to right, over an enumerable -> generator', () => {
            const transducer = F.compose(xformAdd10, xformSquare, xfilterEven);
            const reducingFn = transducer(sum);
            const result = F.reduce(reducingFn, undefined, dataGenerator());
            expect(result).toEqual(expectedResult);
        });
    });

    // describe('walk', () => {
    //    it('walks a document-tree DFT in-order', () => {
    //
    //    });
    // });
});

describe('async', () => {
    describe('mapAsync', () => {
        it('maps an async function over an enumerable -> object values', async () => {
            const result = await F.mapAsync(fn1Async, F.SymbolAsyncIterator ? dataObject : F.iterator(dataObject));
            expect(result).toEqual(dataIterable.map(fn1));
        });
        it('maps an async function over an enumerable -> iterable', async () => {
            const result = await F.mapAsync(fn1Async, dataIterable);
            expect(result).toEqual(dataIterable.map(fn1));
        });
        it('maps an async function over an enumerable -> iterator', async () => {
            const result = await F.mapAsync(fn1Async, dataIterator());
            expect(result).toEqual(dataIterable.map(fn1));
        });
        it('maps an async function over an enumerable -> generator', async () => {
            const result = await F.mapAsync(fn1Async, dataGenerator());
            expect(result).toEqual(dataIterable.map(fn1));
        });
        it('maps an async function over an enumerable -> async-generator of values', async () => {
            const result = await F.mapAsync(fn1Async, dataAsyncGenerator());
            expect(result).toEqual(dataIterable.map(fn1));
        });
        it('maps an async function over an enumerable -> async-generator of Promises', async () => {
            const result = await F.mapAsync(fn1Async, dataAsyncGeneratorOfPromises());
            expect(result).toEqual(dataIterable.map(fn1));
        });
    });

    describe('filterAsync', () => {
        it('maps an async function over an enumerable -> object values', async () => {
            const result = await F.filterAsync(predicateEvenAsync, F.SymbolAsyncIterator ? dataObject : F.iterator(dataObject));
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });
        it('filters an async function over an enumerable -> iterable', async () => {
            const result = await F.filterAsync(predicateEvenAsync, dataIterable);
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });
        it('filters an async function over an enumerable -> iterator', async () => {
            const result = await F.filterAsync(predicateEvenAsync, dataIterator());
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });
        it('filters an async function over an enumerable -> generator', async () => {
            const result = await F.filterAsync(predicateEvenAsync, dataGenerator());
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });
        it('filters an async function over an enumerable -> async-generator of values', async () => {
            const result = await F.filterAsync(predicateEvenAsync, dataAsyncGenerator());
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });
        it('filters an async function over an enumerable -> async-generator of Promises', async () => {
            const result = await F.filterAsync(predicateEvenAsync, dataAsyncGeneratorOfPromises());
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });
        it('filters a predicate function over an enumerable -> async-generator of Promises', async () => {
            const result = await F.filterAsync(predicateEven, dataAsyncGeneratorOfPromises());
            expect(result).toEqual(dataIterable.filter(predicateEven));
        });
    });

    describe('composeAsync = step-function/appendAsync = reducing-function/reduceAsync = pipeline-runner =~ transduce-async', () => {
        const expectedResult = [144, 196, 256, 324, 400];

        it('composes async functions * right * to left', async () => {
            const composedFn = await F.composeAsync(fn2Async, fn1Async);
            const result = await composedFn(5);
            expect(result).toEqual(225);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> object values', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.appendAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], F.SymbolAsyncIterator ? dataObject : F.iterator(dataObject));
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> iterable', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.appendAsync(/*reducingFn*/));
            // NOTE: alternative composition (1)

            // const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync, F.appendAsync);
            // const reducingFnAsync = await transducerAsync(/*reducingFn*/);
            const result = await F.reduceAsync(reducingFnAsync, () => [], dataIterable);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> iterator', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.appendAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], dataIterator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> generator', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.appendAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], dataGenerator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> async-generator of values', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.appendAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], dataAsyncGenerator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> async-generator of promises', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.appendAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], dataAsyncGeneratorOfPromises());
            expect(result).toEqual(expectedResult);
        });
    });

    describe('composeAsync = step-function/concatAsync = reducing-function/reduceAsync = pipeline-runner =~ transduce-async', () => {
        const expectedResult = [144, 196, 256, 324, 400];

        it('composes async functions * right * to left', async () => {
            const composedFn = await F.composeAsync(fn2AsyncBox, fn1AsyncBox);
            const result = await composedFn(5);
            expect(result).toEqual([225]);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> object values', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10AsyncBox, xformSquareAsyncBox, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.concatAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], F.SymbolAsyncIterator ? dataObject : F.iterator(dataObject));
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> iterable', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10AsyncBox, xformSquareAsyncBox, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.concatAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], dataIterable);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> iterator', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10AsyncBox, xformSquareAsyncBox, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.concatAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], dataIterator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> generator', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10AsyncBox, xformSquareAsyncBox, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.concatAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], dataGenerator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> async-generator of values', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10AsyncBox, xformSquareAsyncBox, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.concatAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], dataAsyncGenerator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> async-generator of promises', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10AsyncBox, xformSquareAsyncBox, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(F.concatAsync(/*reducingFn*/));
            const result = await F.reduceAsync(reducingFnAsync, () => [], dataAsyncGeneratorOfPromises());
            expect(result).toEqual(expectedResult);
        });
    });

    describe('composeAsync = step-function/sum = reducing-function/reduceAsync = pipeline-runner =~ transduce-async', () => {
        const expectedResult = 1321;
        const sum = (a, b) => a + b;
        // const sum = F.which(_sum);

        it('transduce using composed async transducers * left * to right, over an enumerable -> object values', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(sum);
            const result = await F.reduceAsync(reducingFnAsync, undefined, F.SymbolAsyncIterator ? dataObject : F.iterator(dataObject));
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> iterable', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(sum);
            const result = await F.reduceAsync(reducingFnAsync, undefined, dataIterable);
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> iterator', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(sum);
            const result = await F.reduceAsync(reducingFnAsync, undefined, dataIterator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> generator', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(sum);
            const result = await F.reduceAsync(reducingFnAsync, undefined, dataGenerator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> async-generator of values', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(sum);
            const result = await F.reduceAsync(reducingFnAsync, undefined, dataAsyncGenerator());
            expect(result).toEqual(expectedResult);
        });
        it('transduce using composed async transducers * left * to right, over an enumerable -> async-generator of promises', async () => {
            const transducerAsync = await F.composeAsync(xformAdd10Async, xformSquareAsync, xfilterEvenAsync);
            const reducingFnAsync = await transducerAsync(sum);
            const result = await F.reduceAsync(reducingFnAsync, undefined, dataAsyncGeneratorOfPromises());
            expect(result).toEqual(expectedResult);
        });
    });
});
