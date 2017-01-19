/**
 * @developers Greg Miller, Larry Buzi, Vitaliy Lee, Scott Norland
 *
 * WHAT IS Mojo:
 *
 * Mojo is a web application javascript framework for managing large scale, flow based applications.
 * It is a completely client-side web runtime framework that drives your customer experiences through configuration based flows.
 * At a high level, it could be considered a finite state machine...
 * but it is so much more. Mojo also facilitates the customer experience by abstracting complex UI paradigms into understandable HTML attributes so robust functionality can be coded by
 * non engineers and other content providers. No need to be JavaScript guru.
 *
 * In Mojo, you define your views in simple HTML and add Mojo specific attributes to DOM elements to hook up feature rich functionality such as two-way data-binding,
 * input formatting and validation, and navigation. No special tools are required to create your views. You can hand-code them if you are so inclined, or use some off the shelf tool for
 * development or templating. Mojo provides the facility to present your views to the customer and binds input data from the customer to models which can be persisted and managed.
 *
 * Hooking it all together is the Mojo Flow Controller. A configuration driven state machine that takes references to your views and strings them together in page to page flows.
 * You provide the transition logic in a simple configuration file, and Mojo handles the rest.
 *
 *
 * WHY USE Mojo:
 *
 * With the push to create rich, interactive user experiences quickly and easily across multiple platforms, the use of html and javascript is fast becoming a popular solution.
 * So it seems to be the latest craze to develop javascript based frameworks that facilitate creating these experiences and abstract away the extreme complexity involved in doing yourself.
 * That's a good thing, right. And there's a lot of really good frameworks out there.
 * So you are probably asking yourself, "Sheesh, another javascript framework.... REALLY?!"
 * In this case, YES, REALLY!
 *
 * Customer experiences in web apps can become extremely complex and hard to maintain using existing static routing mechanisms.  And the need for dynamic routing to drive
 * the personalized experiences your customers deserve does not exist in other frameowrks.
 * There is no other client-side framework out there anywhere that solves for the configuration driven
 * state-machine and flow control that Mojo has implemented. If you want this sort of functionality, you have to incorporate server side code like Struts,
 * or Spring WebFlow and pay a contractor big bucks to support it.
 *
 * Mojo was built on the premise that it would be a one stop shop for creating a highly interactive, scalable, robust web applications so that you don't need to be a javascript guru to get up and running.
 * You won't need to incorporate 3-5 different frameworks to accomplish your vision. Nor would you need to write any server side code.
 *
 * Mojo JavaScript MVC Framework
 *
 **/

    // strict mode may cause exceptions in Safari 6.0
"use strict"; // jshint ignore:line
var X = (function (name) {
    var _version = "1.13.0";

    var _X = window[name] = {

        // ===============================================================
        // Define Core Namespaces
        // ===============================================================
        constants : {},
        interfaces : {},
        components : {},
        registry : {},
        events : {},
        loaders : {},
        utils : {},

        // other

        getVersion : function () {
            return _version;
        },


        /**
         * setOptions
         *      Set a bunch of options
         * @param config - object that contains name/value pairs of options to set
         *
         */
        setOptions : function (config) {

            // if users dont specify resolver options, they can just have them pre-defined in
            // the global namespace
            config = config || {};

            // Copy the properties into the X.options
            // It will filter out all the crap
            X._.each(config, function (value, key) {
                X.setOption(key, value);
            });
        },

        /**
         * setOption
         *      Set an option
         * @param key - option key to set
         * @param value - value to set
         *
         */
        setOption : function (key, value) {
            var allowNewProperties = (key === "viewportOptions");
            if (!X._.has(X.options, key)) {
                X.trace("Invalid Option: " + key + " - ignoring", ["OPTIONS"], X.log.WARN);
                return;
            }
            if (X._.isObject(value)) {
                X.options[key] = X.utils.mergeObjects(X.options[key], value, !allowNewProperties);
            }
            else if (X._.isArray(X.options[key])) {
                X.options[key] = X._.union(X.options[key], value);
            }
            else {
                X.options[key] = value;
            }
            X.publish(X.constants.events.kOptions + "." + key, value);

        },


        //----------------------------------------------
        // Dependency Injection Strategy
        //----------------------------------------------

        // Register an named object/component that you want to get a handle to later. Can be used for dependency injection
        registerComponent : function (name, componentImpl, dontOverwrite) {
            return X.registry.registerComponent(name, componentImpl, dontOverwrite);
        },
        getComponent : function (name) {
            return X.registry.getComponent(name);
        },


        //-------------------------------------------
        // Error handling
        //-------------------------------------------

        trace : function () {  // replaced in debug module
            if (X._.isObject(console) && X.options.logToConsole) {
                console.log.apply(console, arguments);
            }
        },


        /**
         *
         * @param inData - data to be resolved - any javascript type, objects and arrays will have their elements resolved
         * @param outModelRefs - if set, output of object containing the model references and their resolved values
         * @param addlTokens  - additional data passed to expression resolution as parameters
         * @returns {*}
         */
        resolveDynamicData : function (inData, outModelRefs, addlTokens) {
            outModelRefs = outModelRefs || {};
            return X.getComponent(X.constants.interfaces.kDataResolver).resolveDynamicData(inData, outModelRefs, addlTokens);
        }

    };

    return _X;

})("Mojo");





//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
/* jshint ignore:start */
(function (root) {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `exports` on the server.
    //    var root = this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

    // Create quick reference variables for speed access to core prototypes.
    var
        push = ArrayProto.push,
        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
        nativeForEach = ArrayProto.forEach,
        nativeMap = ArrayProto.map,
        nativeReduce = ArrayProto.reduce,
    //        nativeReduceRight  = ArrayProto.reduceRight,
        nativeFilter = ArrayProto.filter,
        nativeEvery = ArrayProto.every,
        nativeSome = ArrayProto.some,
        nativeIndexOf = ArrayProto.indexOf,
    //        nativeLastIndexOf  = ArrayProto.lastIndexOf,
        nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind;

    // Create a safe reference to the Underscore object for use below.
    var _ = function (obj) {
        if (obj instanceof _) {
            return obj;
        }
        if (!(this instanceof _)) {
            return new _(obj);
        }
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    //if (typeof exports !== 'undefined') {
    //    if (typeof module !== 'undefined' && module.exports) {
    //        exports = module.exports = _;
    //    }
    //    exports._ = _;
    //} else {
    root._ = _;
    //    }

    // Current version.
    _.VERSION = '1.6.0';

    // Collection Functions
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles objects with the built-in `forEach`, arrays, and raw objects.
    // Delegates to **ECMAScript 5**'s native `forEach` if available.
    var each = _.each = _.forEach = function (obj, iterator, context) {
        if (obj == null) {
            return obj;
        }
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        }
        else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) {
                    return;
                }
            }
        }
        else {
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) {
                    return;
                }
            }
        }
        return obj;
    };

    // Return the results of applying the iterator to each element.
    // Delegates to **ECMAScript 5**'s native `map` if available.
    _.map = _.collect = function (obj, iterator, context) {
        var results = [];
        if (obj == null) {
            return results;
        }
        if (nativeMap && obj.map === nativeMap) {
            return obj.map(iterator, context);
        }
        each(obj, function (value, index, list) {
            results.push(iterator.call(context, value, index, list));
        });
        return results;
    };

    var reduceError = 'Reduce of empty array with no initial value';

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
    _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) {
            obj = [];
        }
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) {
                iterator = _.bind(iterator, context);
            }
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function (value, index, list) {
            if (!initial) {
                memo = value;
                initial = true;
            }
            else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        if (!initial) {
            throw new TypeError(reduceError);
        }
        return memo;
    };

    // The right-associative version of reduce, also known as `foldr`.
    // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
    //    _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    //        var initial = arguments.length > 2;
    //        if (obj == null) obj = [];
    //        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
    //            if (context) iterator = _.bind(iterator, context);
    //            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    //        }
    //        var length = obj.length;
    //        if (length !== +length) {
    //            var keys = _.keys(obj);
    //            length = keys.length;
    //        }
    //        each(obj, function(value, index, list) {
    //            index = keys ? keys[--length] : --length;
    //            if (!initial) {
    //                memo = obj[index];
    //                initial = true;
    //            } else {
    //                memo = iterator.call(context, memo, obj[index], index, list);
    //            }
    //        });
    //        if (!initial) throw new TypeError(reduceError);
    //        return memo;
    //    };

    // Return the first value which passes a truth test. Aliased as `detect`.
    //    _.find = _.detect = function(obj, predicate, context) {
    //        var result;
    //        any(obj, function(value, index, list) {
    //            if (predicate.call(context, value, index, list)) {
    //                result = value;
    //                return true;
    //            }
    //        });
    //        return result;
    //    };

    // Return all the elements that pass a truth test.
    // Delegates to **ECMAScript 5**'s native `filter` if available.
    // Aliased as `select`.
    _.filter = _.select = function (obj, predicate, context) {
        var results = [];
        if (obj == null) {
            return results;
        }
        if (nativeFilter && obj.filter === nativeFilter) {
            return obj.filter(predicate, context);
        }
        each(obj, function (value, index, list) {
            if (predicate.call(context, value, index, list)) {
                results.push(value);
            }
        });
        return results;
    };

    // Return all the elements for which a truth test fails.
    //    _.reject = function(obj, predicate, context) {
    //        return _.filter(obj, function(value, index, list) {
    //            return !predicate.call(context, value, index, list);
    //        }, context);
    //    };

    // Determine whether all of the elements match a truth test.
    // Delegates to **ECMAScript 5**'s native `every` if available.
    // Aliased as `all`.
    _.every = _.all = function (obj, predicate, context) {
        predicate || (predicate = _.identity);
        var result = true;
        if (obj == null) {
            return result;
        }
        if (nativeEvery && obj.every === nativeEvery) {
            return obj.every(predicate, context);
        }
        each(obj, function (value, index, list) {
            if (!(result = result && predicate.call(context, value, index, list))) {
                return breaker;
            }
        });
        return !!result;
    };

    // Determine if at least one element in the object matches a truth test.
    // Delegates to **ECMAScript 5**'s native `some` if available.
    // Aliased as `any`.
    var any = _.some = _.any = function (obj, predicate, context) {
        predicate || (predicate = _.identity);
        var result = false;
        if (obj == null) {
            return result;
        }
        if (nativeSome && obj.some === nativeSome) {
            return obj.some(predicate, context);
        }
        each(obj, function (value, index, list) {
            if (result || (result = predicate.call(context, value, index, list))) {
                return breaker;
            }
        });
        return !!result;
    };

    // Determine if the array or object contains a given value (using `===`).
    // Aliased as `include`.
    _.contains = _.include = function (obj, target) {
        if (obj == null) {
            return false;
        }
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
            return obj.indexOf(target) != -1;
        }
        return any(obj, function (value) {
            return value === target;
        });
    };

    // Invoke a method (with arguments) on every item in a collection.
    //    _.invoke = function(obj, method) {
    //        var args = slice.call(arguments, 2);
    //        var isFunc = _.isFunction(method);
    //        return _.map(obj, function(value) {
    //            return (isFunc ? method : value[method]).apply(value, args);
    //        });
    //    };

    // Convenience version of a common use case of `map`: fetching a property.
    _.pluck = function (obj, key) {
        return _.map(obj, _.property(key));
    };

    // Convenience version of a common use case of `filter`: selecting only objects
    // containing specific `key:value` pairs.
    //    _.where = function(obj, attrs) {
    //        return _.filter(obj, _.matches(attrs));
    //    };

    // Convenience version of a common use case of `find`: getting the first object
    // containing specific `key:value` pairs.
    //    _.findWhere = function(obj, attrs) {
    //        return _.find(obj, _.matches(attrs));
    //    };

    // Return the maximum element or (element-based computation).
    // Can't optimize arrays of integers longer than 65,535 elements.
    // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
    //    _.max = function(obj, iterator, context) {
    //        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
    //            return Math.max.apply(Math, obj);
    //        }
    //        var result = -Infinity, lastComputed = -Infinity;
    //        each(obj, function(value, index, list) {
    //            var computed = iterator ? iterator.call(context, value, index, list) : value;
    //            if (computed > lastComputed) {
    //                result = value;
    //                lastComputed = computed;
    //            }
    //        });
    //        return result;
    //    };

    // Return the minimum element (or element-based computation).
    //    _.min = function(obj, iterator, context) {
    //        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
    //            return Math.min.apply(Math, obj);
    //        }
    //        var result = Infinity, lastComputed = Infinity;
    //        each(obj, function(value, index, list) {
    //            var computed = iterator ? iterator.call(context, value, index, list) : value;
    //            if (computed < lastComputed) {
    //                result = value;
    //                lastComputed = computed;
    //            }
    //        });
    //        return result;
    //    };

    // Shuffle an array, using the modern version of the
    // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisherâ€“Yates_shuffle).
    //    _.shuffle = function(obj) {
    //        var rand;
    //        var index = 0;
    //        var shuffled = [];
    //        each(obj, function(value) {
    //            rand = _.random(index++);
    //            shuffled[index - 1] = shuffled[rand];
    //            shuffled[rand] = value;
    //        });
    //        return shuffled;
    //    };

    // Sample **n** random values from a collection.
    // If **n** is not specified, returns a single random element.
    // The internal `guard` argument allows it to work with `map`.
    //    _.sample = function(obj, n, guard) {
    //        if (n == null || guard) {
    //            if (obj.length !== +obj.length) obj = _.values(obj);
    //            return obj[_.random(obj.length - 1)];
    //        }
    //        return _.shuffle(obj).slice(0, Math.max(0, n));
    //    };

    // An internal function to generate lookup iterators.
    var lookupIterator = function (value) {
        if (value == null) {
            return _.identity;
        }
        if (_.isFunction(value)) {
            return value;
        }
        return _.property(value);
    };

    // Sort the object's values by a criterion produced by an iterator.
    _.sortBy = function (obj, iterator, context) {
        iterator = lookupIterator(iterator);
        return _.pluck(_.map(obj, function (value, index, list) {
            return {
                value : value,
                index : index,
                criteria : iterator.call(context, value, index, list)
            };
        }).sort(function (left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0) {
                    return 1;
                }
                if (a < b || b === void 0) {
                    return -1;
                }
            }
            return left.index - right.index;
        }), 'value');
    };

    // An internal function used for aggregate "group by" operations.
    //    var group = function(behavior) {
    //        return function(obj, iterator, context) {
    //            var result = {};
    //            iterator = lookupIterator(iterator);
    //            each(obj, function(value, index) {
    //                var key = iterator.call(context, value, index, obj);
    //                behavior(result, key, value);
    //            });
    //            return result;
    //        };
    //    };

    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    //    _.groupBy = group(function(result, key, value) {
    //        _.has(result, key) ? result[key].push(value) : result[key] = [value];
    //    });

    // Indexes the object's values by a criterion, similar to `groupBy`, but for
    // when you know that your index values will be unique.
    //    _.indexBy = group(function(result, key, value) {
    //        result[key] = value;
    //    });

    // Counts instances of an object that group by a certain criterion. Pass
    // either a string attribute to count by, or a function that returns the
    // criterion.
    //    _.countBy = group(function(result, key) {
    //        _.has(result, key) ? result[key]++ : result[key] = 1;
    //    });

    // Use a comparator function to figure out the smallest index at which
    // an object should be inserted so as to maintain order. Uses binary search.
    //    _.sortedIndex = function(array, obj, iterator, context) {
    //        iterator = lookupIterator(iterator);
    //        var value = iterator.call(context, obj);
    //        var low = 0, high = array.length;
    //        while (low < high) {
    //            var mid = (low + high) >>> 1;
    //            iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    //        }
    //        return low;
    //    };

    // Safely create a real, live array from anything iterable.
    //    _.toArray = function(obj) {
    //        if (!obj) return [];
    //        if (_.isArray(obj)) return slice.call(obj);
    //        if (obj.length === +obj.length) return _.map(obj, _.identity);
    //        return _.values(obj);
    //    };

    // Return the number of elements in an object.
    _.size = function (obj) {
        if (obj == null) {
            return 0;
        }
        return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
    };

    // Array Functions
    // ---------------

    // Get the first element of an array. Passing **n** will return the first N
    // values in the array. Aliased as `head` and `take`. The **guard** check
    // allows it to work with `_.map`.
    _.first = _.head = _.take = function (array, n, guard) {
        if (array == null) {
            return void 0;
        }
        if ((n == null) || guard) {
            return array[0];
        }
        if (n < 0) {
            return [];
        }
        return slice.call(array, 0, n);
    };

    // Returns everything but the last entry of the array. Especially useful on
    // the arguments object. Passing **n** will return all the values in
    // the array, excluding the last N. The **guard** check allows it to work with
    // `_.map`.
    //    _.initial = function(array, n, guard) {
    //        return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
    //    };

    // Get the last element of an array. Passing **n** will return the last N
    // values in the array. The **guard** check allows it to work with `_.map`.
    _.last = function (array, n, guard) {
        if (array == null) {
            return void 0;
        }
        if ((n == null) || guard) {
            return array[array.length - 1];
        }
        return slice.call(array, Math.max(array.length - n, 0));
    };

    // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
    // Especially useful on the arguments object. Passing an **n** will return
    // the rest N values in the array. The **guard**
    // check allows it to work with `_.map`.
    //    _.rest = _.tail = _.drop = function(array, n, guard) {
    //        return slice.call(array, (n == null) || guard ? 1 : n);
    //    };

    // Trim out all falsy values from an array.
    //    _.compact = function(array) {
    //        return _.filter(array, _.identity);
    //    };

    // Internal implementation of a recursive `flatten` function.
    var flatten = function (input, shallow, output) {
        if (shallow && _.every(input, _.isArray)) {
            return concat.apply(output, input);
        }
        each(input, function (value) {
            if (_.isArray(value) || _.isArguments(value)) {
                shallow ? push.apply(output, value) : flatten(value, shallow, output);
            }
            else {
                output.push(value);
            }
        });
        return output;
    };

    // Flatten out an array, either recursively (by default), or just one level.
    _.flatten = function (array, shallow) {
        return flatten(array, shallow, []);
    };

    // Return a version of the array that does not contain the specified value(s).
    _.without = function (array) {
        return _.difference(array, slice.call(arguments, 1));
    };

    // Split an array into two arrays: one whose elements all satisfy the given
    // predicate, and one whose elements all do not satisfy the predicate.
    //    _.partition = function(array, predicate) {
    //        var pass = [], fail = [];
    //        each(array, function(elem) {
    //            (predicate(elem) ? pass : fail).push(elem);
    //        });
    //        return [pass, fail];
    //    };

    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // Aliased as `unique`.
    _.uniq = _.unique = function (array, isSorted, iterator, context) {
        if (_.isFunction(isSorted)) {
            context = iterator;
            iterator = isSorted;
            isSorted = false;
        }
        var initial = iterator ? _.map(array, iterator, context) : array;
        var results = [];
        var seen = [];
        each(initial, function (value, index) {
            if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
                seen.push(value);
                results.push(array[index]);
            }
        });
        return results;
    };

    // Produce an array that contains the union: each distinct element from all of
    // the passed-in arrays.
    _.union = function () {
        return _.uniq(_.flatten(arguments, true));
    };

    // Produce an array that contains every item shared between all the
    // passed-in arrays.
    //    _.intersection = function(array) {
    //        var rest = slice.call(arguments, 1);
    //        return _.filter(_.uniq(array), function(item) {
    //            return _.every(rest, function(other) {
    //                return _.contains(other, item);
    //            });
    //        });
    //    };

    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    _.difference = function (array) {
        var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
        return _.filter(array, function (value) {
            return !_.contains(rest, value);
        });
    };

    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    //    _.zip = function() {
    //        var length = _.max(_.pluck(arguments, 'length').concat(0));
    //        var results = new Array(length);
    //        for (var i = 0; i < length; i++) {
    //            results[i] = _.pluck(arguments, '' + i);
    //        }
    //        return results;
    //    };

    // Converts lists into objects. Pass either a single array of `[key, value]`
    // pairs, or two parallel arrays of the same length -- one of keys, and one of
    // the corresponding values.
    //    _.object = function(list, values) {
    //        if (list == null) return {};
    //        var result = {};
    //        for (var i = 0, length = list.length; i < length; i++) {
    //            if (values) {
    //                result[list[i]] = values[i];
    //            } else {
    //                result[list[i][0]] = list[i][1];
    //            }
    //        }
    //        return result;
    //    };

    // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
    // we need this function. Return the position of the first occurrence of an
    // item in an array, or -1 if the item is not included in the array.
    // Delegates to **ECMAScript 5**'s native `indexOf` if available.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    //    _.indexOf = function(array, item, isSorted) {
    //        if (array == null) return -1;
    //        var i = 0, length = array.length;
    //        if (isSorted) {
    //            if (typeof isSorted == 'number') {
    //                i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
    //            } else {
    //                i = _.sortedIndex(array, item);
    //                return array[i] === item ? i : -1;
    //            }
    //        }
    //        if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    //        for (; i < length; i++) if (array[i] === item) return i;
    //        return -1;
    //    };

    // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
    //    _.lastIndexOf = function(array, item, from) {
    //        if (array == null) return -1;
    //        var hasIndex = from != null;
    //        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
    //            return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    //        }
    //        var i = (hasIndex ? from : array.length);
    //        while (i--) if (array[i] === item) return i;
    //        return -1;
    //    };

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    //    _.range = function(start, stop, step) {
    //        if (arguments.length <= 1) {
    //            stop = start || 0;
    //            start = 0;
    //        }
    //        step = arguments[2] || 1;
    //
    //        var length = Math.max(Math.ceil((stop - start) / step), 0);
    //        var idx = 0;
    //        var range = new Array(length);
    //
    //        while(idx < length) {
    //            range[idx++] = start;
    //            start += step;
    //        }
    //
    //        return range;
    //    };

    // Function (ahem) Functions
    // ------------------

    // Reusable constructor function for prototype setting.
    var ctor = function () {
    };

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
    // available.
    _.bind = function (func, context) {
        var args, bound;
        if (nativeBind && func.bind === nativeBind) {
            return nativeBind.apply(func, slice.call(arguments, 1));
        }
        if (!_.isFunction(func)) {
            throw new TypeError;
        }
        args = slice.call(arguments, 2);
        return bound = function () {
            if (!(this instanceof bound)) {
                return func.apply(context, args.concat(slice.call(arguments)));
            }
            ctor.prototype = func.prototype;
            var self = new ctor;
            ctor.prototype = null;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) {
                return result;
            }
            return self;
        };
    };

    // Partially apply a function by creating a version that has had some of its
    // arguments pre-filled, without changing its dynamic `this` context. _ acts
    // as a placeholder, allowing any combination of arguments to be pre-filled.
    //    _.partial = function(func) {
    //        var boundArgs = slice.call(arguments, 1);
    //        return function() {
    //            var position = 0;
    //            var args = boundArgs.slice();
    //            for (var i = 0, length = args.length; i < length; i++) {
    //                if (args[i] === _) args[i] = arguments[position++];
    //            }
    //            while (position < arguments.length) args.push(arguments[position++]);
    //            return func.apply(this, args);
    //        };
    //    };

    // Bind a number of an object's methods to that object. Remaining arguments
    // are the method names to be bound. Useful for ensuring that all callbacks
    // defined on an object belong to it.
    //    _.bindAll = function(obj) {
    //        var funcs = slice.call(arguments, 1);
    //        if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    //        each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    //        return obj;
    //    };

    // Memoize an expensive function by storing its results.
    //    _.memoize = function(func, hasher) {
    //        var memo = {};
    //        hasher || (hasher = _.identity);
    //        return function() {
    //            var key = hasher.apply(this, arguments);
    //            return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    //        };
    //    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    //    _.delay = function(func, wait) {
    //        var args = slice.call(arguments, 2);
    //        return setTimeout(function(){ return func.apply(null, args); }, wait);
    //    };

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    //    _.defer = function(func) {
    //        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    //    };

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    //    _.throttle = function(func, wait, options) {
    //        var context, args, result;
    //        var timeout = null;
    //        var previous = 0;
    //        options || (options = {});
    //        var later = function() {
    //            previous = options.leading === false ? 0 : _.now();
    //            timeout = null;
    //            result = func.apply(context, args);
    //            context = args = null;
    //        };
    //        return function() {
    //            var now = _.now();
    //            if (!previous && options.leading === false) previous = now;
    //            var remaining = wait - (now - previous);
    //            context = this;
    //            args = arguments;
    //            if (remaining <= 0) {
    //                clearTimeout(timeout);
    //                timeout = null;
    //                previous = now;
    //                result = func.apply(context, args);
    //                context = args = null;
    //            } else if (!timeout && options.trailing !== false) {
    //                timeout = setTimeout(later, remaining);
    //            }
    //            return result;
    //        };
    //    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    //    _.debounce = function(func, wait, immediate) {
    //        var timeout, args, context, timestamp, result;
    //
    //        var later = function() {
    //            var last = _.now() - timestamp;
    //            if (last < wait) {
    //                timeout = setTimeout(later, wait - last);
    //            } else {
    //                timeout = null;
    //                if (!immediate) {
    //                    result = func.apply(context, args);
    //                    context = args = null;
    //                }
    //            }
    //        };
    //
    //        return function() {
    //            context = this;
    //            args = arguments;
    //            timestamp = _.now();
    //            var callNow = immediate && !timeout;
    //            if (!timeout) {
    //                timeout = setTimeout(later, wait);
    //            }
    //            if (callNow) {
    //                result = func.apply(context, args);
    //                context = args = null;
    //            }
    //
    //            return result;
    //        };
    //    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    _.once = function (func) {
        var ran = false, memo;
        return function () {
            if (ran) {
                return memo;
            }
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
        };
    };

    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    //    _.wrap = function(func, wrapper) {
    //        return _.partial(wrapper, func);
    //    };

    // Returns a function that is the composition of a list of functions, each
    // consuming the return value of the function that follows.
    //    _.compose = function() {
    //        var funcs = arguments;
    //        return function() {
    //            var args = arguments;
    //            for (var i = funcs.length - 1; i >= 0; i--) {
    //                args = [funcs[i].apply(this, args)];
    //            }
    //            return args[0];
    //        };
    //    };

    // Returns a function that will only be executed after being called N times.
    //    _.after = function(times, func) {
    //        return function() {
    //            if (--times < 1) {
    //                return func.apply(this, arguments);
    //            }
    //        };
    //    };

    // Object Functions
    // ----------------

    // Retrieve the names of an object's properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    _.keys = function (obj) {
        if (!_.isObject(obj)) {
            return [];
        }
        if (nativeKeys) {
            return nativeKeys(obj);
        }
        var keys = [];
        for (var key in obj) if (_.has(obj, key)) {
            keys.push(key);
        }
        return keys;
    };

    // Retrieve the values of an object's properties.
    _.values = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var values = new Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    };

    // Convert an object into a list of `[key, value]` pairs.
    //    _.pairs = function(obj) {
    //        var keys = _.keys(obj);
    //        var length = keys.length;
    //        var pairs = new Array(length);
    //        for (var i = 0; i < length; i++) {
    //            pairs[i] = [keys[i], obj[keys[i]]];
    //        }
    //        return pairs;
    //    };

    // Invert the keys and values of an object. The values must be serializable.
    //    _.invert = function(obj) {
    //        var result = {};
    //        var keys = _.keys(obj);
    //        for (var i = 0, length = keys.length; i < length; i++) {
    //            result[obj[keys[i]]] = keys[i];
    //        }
    //        return result;
    //    };

    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`
    _.functions = _.methods = function (obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) {
                names.push(key);
            }
        }
        return names.sort();
    };

    // Extend a given object with all the properties in passed-in object(s).
    _.extend = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };

    // Return a copy of the object only containing the whitelisted properties.
    _.pick = function (obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        each(keys, function (key) {
            if (key in obj) {
                copy[key] = obj[key];
            }
        });
        return copy;
    };

    // Return a copy of the object without the blacklisted properties.
    _.omit = function (obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        for (var key in obj) {
            if (!_.contains(keys, key)) {
                copy[key] = obj[key];
            }
        }
        return copy;
    };

    // Fill in a given object with default properties.
    _.defaults = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    if (obj[prop] === void 0) {
                        obj[prop] = source[prop];
                    }
                }
            }
        });
        return obj;
    };

    // Create a (shallow-cloned) duplicate of an object.
    _.clone = function (obj) {
        if (!_.isObject(obj)) {
            return obj;
        }
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };

    // Invokes interceptor with the obj, and then returns obj.
    // The primary purpose of this method is to "tap into" a method chain, in
    // order to perform operations on intermediate results within the chain.
    //    _.tap = function(obj, interceptor) {
    //        interceptor(obj);
    //        return obj;
    //    };

    // Internal recursive comparison function for `isEqual`.
    var eq = function (a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) {
            return a !== 0 || 1 / a == 1 / b;
        }
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) {
            return a === b;
        }
        // Unwrap any wrapped objects.
        if (a instanceof _) {
            a = a._wrapped;
        }
        if (b instanceof _) {
            b = b._wrapped;
        }
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) {
            return false;
        }
        switch (className) {
            // Strings, numbers, dates, and booleans are compared by value.
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return a == String(b);
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
                // other numeric values.
                return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a == +b;
            // RegExps are compared by their source patterns and flags.
            case '[object RegExp]':
                return a.source == b.source &&
                       a.global == b.global &&
                       a.multiline == b.multiline &&
                       a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != 'object' || typeof b != 'object') {
            return false;
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] == a) {
                return bStack[length] == b;
            }
        }
        // Objects with different constructors are not equivalent, but `Object`s
        // from different frames are.
        var aCtor = a.constructor, bCtor = b.constructor;
        if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
            _.isFunction(bCtor) && (bCtor instanceof bCtor))
            && ('constructor' in a && 'constructor' in b)) {
            return false;
        }
        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);
        var size = 0, result = true;
        // Recursively compare objects and arrays.
        if (className == '[object Array]') {
            // Compare array lengths to determine if a deep comparison is necessary.
            size = a.length;
            result = size == b.length;
            if (result) {
                // Deep compare the contents, ignoring non-numeric properties.
                while (size--) {
                    if (!(result = eq(a[size], b[size], aStack, bStack))) {
                        break;
                    }
                }
            }
        }
        else {
            // Deep compare objects.
            for (var key in a) {
                if (_.has(a, key)) {
                    // Count the expected number of properties.
                    size++;
                    // Deep compare each member.
                    if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) {
                        break;
                    }
                }
            }
            // Ensure that both objects contain the same number of properties.
            if (result) {
                for (key in b) {
                    if (_.has(b, key) && !(size--)) {
                        break;
                    }
                }
                result = !size;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return result;
    };

    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function (a, b) {
        return eq(a, b, [], []);
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    _.isEmpty = function (obj) {
        if (obj == null) {
            return true;
        }
        if (_.isArray(obj) || _.isString(obj)) {
            return obj.length === 0;
        }
        for (var key in obj) if (_.has(obj, key)) {
            return false;
        }
        return true;
    };

    // Is a given value a DOM element?
    //    _.isElement = function(obj) {
    //        return !!(obj && obj.nodeType === 1);
    //    };

    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    _.isArray = nativeIsArray || function (obj) {
            return toString.call(obj) == '[object Array]';
        };

    // Is a given variable an object?
    _.isObject = function (obj) {
        return obj === Object(obj);
    };

    _.isPlainObject = function (obj) {
        return typeof obj == 'object' && obj.constructor == Object;
    };

    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
    each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function (name) {
        _['is' + name] = function (obj) {
            return toString.call(obj) == '[object ' + name + ']';
        };
    });

    // Define a fallback version of the method in browsers (ahem, IE), where
    // there isn't any inspectable "Arguments" type.
    if (!_.isArguments(arguments)) {
        _.isArguments = function (obj) {
            return !!(obj && _.has(obj, 'callee'));
        };
    }

    // Optimize `isFunction` if appropriate.
    if (typeof (/./) !== 'function') {
        _.isFunction = function (obj) {
            return typeof obj === 'function';
        };
    }

    // Is a given object a finite number?
    //    _.isFinite = function(obj) {
    //        return isFinite(obj) && !isNaN(parseFloat(obj));
    //    };

    // Is the given value `NaN`? (NaN is the only number which does not equal itself).
    //    _.isNaN = function(obj) {
    //        return _.isNumber(obj) && obj != +obj;
    //    };

    // Is a given value a boolean?
    _.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
    };

    // Is a given value equal to null?
    _.isNull = function (obj) {
        return obj === null;
    };

    // Is a given variable undefined?
    _.isUndefined = function (obj) {
        return obj === void 0;
    };

    // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
    _.has = function (obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    // Utility Functions
    // -----------------

    // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
    // previous owner. Returns a reference to the Underscore object.
    _.noConflict = function () {
        root._ = previousUnderscore;
        return this;
    };

    // Keep the identity function around for default iterators.
    //    _.identity = function(value) {
    //        return value;
    //    };

    //    _.constant = function(value) {
    //        return function () {
    //            return value;
    //        };
    //    };

    _.property = function (key) {
        return function (obj) {
            return obj[key];
        };
    };

    // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
    //    _.matches = function(attrs) {
    //        return function(obj) {
    //            if (obj === attrs) return true; //avoid comparing an object to itself.
    //            for (var key in attrs) {
    //                if (attrs[key] !== obj[key])
    //                    return false;
    //            }
    //            return true;
    //        }
    //    };

    // Run a function **n** times.
    //    _.times = function(n, iterator, context) {
    //        var accum = Array(Math.max(0, n));
    //        for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    //        return accum;
    //    };

    // Return a random integer between min and max (inclusive).
    //    _.random = function(min, max) {
    //        if (max == null) {
    //            max = min;
    //            min = 0;
    //        }
    //        return min + Math.floor(Math.random() * (max - min + 1));
    //    };

    // A (possibly faster) way to get the current timestamp as an integer.
    //    _.now = Date.now || function() { return new Date().getTime(); };

    // List of HTML entities for escaping.
    //    var entityMap = {
    //        escape: {
    //            '&': '&amp;',
    //            '<': '&lt;',
    //            '>': '&gt;',
    //            '"': '&quot;',
    //            "'": '&#x27;'
    //        }
    //    };
    //    entityMap.unescape = _.invert(entityMap.escape);
    //
    //    // Regexes containing the keys and values listed immediately above.
    //    var entityRegexes = {
    //        escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    //        unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
    //    };
    //
    //    // Functions for escaping and unescaping strings to/from HTML interpolation.
    //    _.each(['escape', 'unescape'], function(method) {
    //        _[method] = function(string) {
    //            if (string == null) return '';
    //            return ('' + string).replace(entityRegexes[method], function(match) {
    //                return entityMap[method][match];
    //            });
    //        };
    //    });

    // If the value of the named `property` is a function then invoke it with the
    // `object` as context; otherwise, return it.
    //    _.result = function(object, property) {
    //        if (object == null) return void 0;
    //        var value = object[property];
    //        return _.isFunction(value) ? value.call(object) : value;
    //    };

    // Add your own custom functions to the Underscore object.
    _.mixin = function (obj) {
        each(_.functions(obj), function (name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function () {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result.call(this, func.apply(_, args));
            };
        });
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
        evaluate : /<%([\s\S]+?)%>/g,
        interpolate : /<%=([\s\S]+?)%>/g,
        escape : /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'" : "'",
        '\\' : '\\',
        '\r' : 'r',
        '\n' : 'n',
        '\t' : 't',
        '\u2028' : 'u2028',
        '\u2029' : 'u2029'
    };

    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    _.template = function (text, data, settings) {
        var render;
        settings = _.defaults({}, settings, _.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = new RegExp([
                                     (settings.escape || noMatch).source,
                                     (settings.interpolate || noMatch).source,
                                     (settings.evaluate || noMatch).source
                                 ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset)
                .replace(escaper, function (match) {
                    return '\\' + escapes[match];
                });

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) {
            source = 'with(obj||{}){\n' + source + '}\n';
        }

        source = "var __t,__p='',__j=Array.prototype.join," +
                 "print=function(){__p+=__j.call(arguments,'');};\n" +
                 source + "return __p;\n";

        try {
            render = new Function(settings.variable || 'obj', '_', source);
        }
        catch (e) {
            e.source = source;
            throw e;
        }

        if (data) {
            return render(data, _);
        }
        var template = function (data) {
            return render.call(this, data, _);
        };

        // Provide the compiled function source as a convenience for precompilation.
        template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

        return template;
    };

    // Add a "chain" function, which will delegate to the wrapper.
    //    _/ = function(obj) {
    //        return _(obj).chain();
    //    };

    // OOP
    // ---------------
    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.

    // Helper function to continue chaining intermediate results.
    var result = function (obj) {
        return this._chain ? _(obj).chain() : obj;
    };

    // Add all of the Underscore functions to the wrapper object.
    _.mixin(_);

    // Add all mutator Array functions to the wrapper.
    each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name == 'shift' || name == 'splice') && obj.length === 0) {
                delete obj[0];
            }
            return result.call(this, obj);
        };
    });

    // Add all accessor Array functions to the wrapper.
    each(['concat', 'join', 'slice'], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            return result.call(this, method.apply(this._wrapped, arguments));
        };
    });

    _.extend(_.prototype, {

        // Start chaining a wrapped Underscore object.
        chain : function () {
            this._chain = true;
            return this;
        },

        // Extracts the result from a wrapped and chained object.
        value : function () {
            return this._wrapped;
        }

    });

    // AMD registration happens at the end for compatibility with AMD loaders
    // that may not enforce next-turn semantics on modules. Even though general
    // practice for AMD registration is to be anonymous, underscore registers
    // as a named module because, like jQuery, it is a base library that is
    // popular enough to be bundled in a third party lib, but not be part of
    // an AMD load request. Those cases could generate an error when an
    // anonymous define() is called outside of a loader request.
    //    if (typeof define === 'function' && define.amd) {
    //        define('underscore', [], function() {
    //            return _;
    //        });
    //    }
})(X);
/* jshint ignore:end */

/* Zepto v1.1.3-10-gf4129d5 - zepto data ajax deferred callbacks selector event fx fx_methods - zeptojs.com/license */

/* jshint ignore:start */
X.$ = (function () {
    var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
        document = window.document,
        elementDisplay = {}, classCache = {},
        cssNumber = {'column-count' : 1, 'columns' : 1, 'font-weight' : 1, 'line-height' : 1, 'opacity' : 1, 'z-index' : 1, 'zoom' : 1},
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        rootNodeRE = /^(?:body|html)$/i,
        capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

        adjacencyOperators = ['after', 'prepend', 'before', 'append'],
        table = document.createElement('table'),
        tableRow = document.createElement('tr'),
        containers = {
            'tr' : document.createElement('tbody'),
            'tbody' : table, 'thead' : table, 'tfoot' : table,
            'td' : tableRow, 'th' : tableRow,
            '*' : document.createElement('div')
        },
        readyRE = /complete/,
        simpleSelectorRE = /^[\w-]*$/,
        class2type = {},
        toString = class2type.toString,
        zepto = {},
        camelize, uniq,
        tempParent = document.createElement('div'),
        propMap = {
            'tabindex' : 'tabIndex',
            'readonly' : 'readOnly',
            'for' : 'htmlFor',
            'class' : 'className',
            'maxlength' : 'maxLength',
            'cellspacing' : 'cellSpacing',
            'cellpadding' : 'cellPadding',
            'rowspan' : 'rowSpan',
            'colspan' : 'colSpan',
            'usemap' : 'useMap',
            'frameborder' : 'frameBorder',
            'contenteditable' : 'contentEditable'
        },
        isArray = Array.isArray ||
                  function (object) {
                      return object instanceof Array
                  }

    zepto.matches = function (element, selector) {
        if (!selector || !element || element.nodeType !== 1) {
            return false
        }
        var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                              element.oMatchesSelector || element.matchesSelector
        if (matchesSelector) {
            return matchesSelector.call(element, selector)
        }
        // fall back to performing a selector:
        var match, parent = element.parentNode, temp = !parent
        if (temp) {
            (parent = tempParent).appendChild(element)
        }
        match = ~zepto.qsa(parent, selector).indexOf(element)
        temp && tempParent.removeChild(element)
        return match
    }

    function type (obj) {
        return obj == null ? String(obj) :
        class2type[toString.call(obj)] || "object"
    }

    function isFunction (value) {
        return type(value) == "function"
    }

    function isWindow (obj) {
        return obj != null && obj == obj.window
    }

    function isDocument (obj) {
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE
    }

    function isObject (obj) {
        return type(obj) == "object"
    }

    function isPlainObject (obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }

    function likeArray (obj) {
        return typeof obj.length == 'number'
    }

    function compact (array) {
        return filter.call(array, function (item) {
            return item != null
        })
    }

    function flatten (array) {
        return array.length > 0 ? $.fn.concat.apply([], array) : array
    }

    camelize = function (str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : ''
        })
    }
    function dasherize (str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase()
    }

    uniq = function (array) {
        return filter.call(array, function (item, idx) {
            return array.indexOf(item) == idx
        })
    }

    function classRE (name) {
        return name in classCache ?
            classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
    }

    function maybeAddPx (name, value) {
        return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
    }

    function defaultDisplay (nodeName) {
        var element, display
        if (!elementDisplay[nodeName]) {
            element = document.createElement(nodeName)
            document.body.appendChild(element)
            display = getComputedStyle(element, '').getPropertyValue("display")
            element.parentNode.removeChild(element)
            display == "none" && (display = "block")
            elementDisplay[nodeName] = display
        }
        return elementDisplay[nodeName]
    }

    function children (element) {
        return 'children' in element ?
            slice.call(element.children) :
            $.map(element.childNodes, function (node) {
                if (node.nodeType == 1) {
                    return node
                }
            })
    }

    // `$.zepto.fragment` takes a html string and an optional tag name
    // to generate DOM nodes nodes from the given html string.
    // The generated DOM nodes are returned as an array.
    // This function can be overriden in plugins for example to make
    // it compatible with browsers that don't support the DOM fully.
    zepto.fragment = function (html, name, properties) {
        var dom, nodes, container

        // A special case optimization for a single tag
        if (singleTagRE.test(html)) {
            dom = $(document.createElement(RegExp.$1))
        }

        if (typeof dom === 'undefined' || !dom) {
            if (html.replace) {
                html = html.replace(tagExpanderRE, "<$1></$2>")
            }
            if (name === undefined) {
                name = fragmentRE.test(html) && RegExp.$1
            }
            if (!(name in containers)) {
                name = '*'
            }

            container = containers[name]
            container.innerHTML = '' + html
            dom = $.each(slice.call(container.childNodes), function () {
                container.removeChild(this)
            })
        }

        if (typeof dom !== 'undefined' && isPlainObject(properties)) {
            nodes = $(dom)
            $.each(properties, function (key, value) {
                if (methodAttributes.indexOf(key) > -1) {
                    nodes[key](value)
                }
                else {
                    // Check if the browser is IE10 or older.
                    if (document.all && document.documentMode) {
                        nodes[key] = value;
                    }
                    else {
                        nodes.attr(key, value)
                    }
                }
            })
        }

        return dom
    }

    // `$.zepto.Z` swaps out the prototype of the given `dom` array
    // of nodes with `$.fn` and thus supplying all the Zepto functions
    // to the array. Note that `__proto__` is not supported on Internet
    // Explorer. This method can be overriden in plugins.
    zepto.Z = function (dom, selector) {
        dom = dom || []
        dom.__proto__ = $.fn
        dom.selector = selector || ''
        return dom
    }

    // `$.zepto.isZ` should return `true` if the given object is a Zepto
    // collection. This method can be overriden in plugins.
    zepto.isZ = function (object) {
        return object instanceof zepto.Z
    }

    // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
    // takes a CSS selector and an optional context (and handles various
    // special cases).
    // This method can be overriden in plugins.
    zepto.init = function (selector, context) {
        var dom
        // If nothing given, return an empty Zepto collection
        if (!selector) {
            return zepto.Z()
        }
        // Optimize for string selectors
        else if (typeof selector == 'string') {
            selector = selector.trim()
            // If it's a html fragment, create nodes from it
            // Note: In both Chrome 21 and Firefox 15, DOM error 12
            // is thrown if the fragment doesn't begin with <
            if (selector[0] == '<' && fragmentRE.test(selector)) {
                dom = zepto.fragment(selector, RegExp.$1, context), selector = null
            }
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) {
                return $(context).find(selector)
            }
            // If it's a CSS selector, use it to select nodes.
            else {
                dom = zepto.qsa(document, selector)
            }
        }
        // If a function is given, call it when the DOM is ready
        else if (isFunction(selector)) {
            return $(document).ready(selector)
        }
        // If a Zepto collection is given, just return it
        else if (zepto.isZ(selector)) {
            return selector
        }
        else {
            // normalize array if an array of nodes is given
            if (isArray(selector)) {
                dom = compact(selector)
            }
            // Wrap DOM nodes.
            else if (isObject(selector)) {
                dom = [selector], selector = null
            }
            // If it's a html fragment, create nodes from it
            else if (fragmentRE.test(selector)) {
                dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
            }
            // If there's a context, create a collection on that context first, and select
            // nodes from there
            else if (context !== undefined) {
                return $(context).find(selector)
            }
            // And last but no least, if it's a CSS selector, use it to select nodes.
            else {
                dom = zepto.qsa(document, selector)
            }
        }
        // create a new Zepto collection from the nodes found
        return zepto.Z(dom, selector)
    }

    // `$` will be the base `Zepto` object. When calling this
    // function just call `$.zepto.init, which makes the implementation
    // details of selecting nodes and creating Zepto collections
    // patchable in plugins.
    $ = function (selector, context) {
        // Check if the browser is IE10 or older; reference jQuery for support.
        if (document.all && document.documentMode) {
            if (typeof jQuery !== 'undefined') {
                jQuery.noConflict();

                return jQuery(selector, context);
            }
            else {
                return zepto.init(selector, context)
            }
        }
        else {
            return zepto.init(selector, context)
        }
    }

    function extend (target, source, deep) {
        for (key in source)
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                    target[key] = {}
                }
                if (isArray(source[key]) && !isArray(target[key])) {
                    target[key] = []
                }
                extend(target[key], source[key], deep)
            }
            else if (source[key] !== undefined) {
                target[key] = source[key]
            }
    }

    // Copy all but undefined properties from one or more
    // objects to the `target` object.
    $.extend = function (target) {
        var deep, args = slice.call(arguments, 1)
        if (typeof target == 'boolean') {
            deep = target
            target = args.shift()
        }
        args.forEach(function (arg) {
            extend(target, arg, deep)
        })
        return target
    }

    // `$.zepto.qsa` is Zepto's CSS selector implementation which
    // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
    // This method can be overriden in plugins.
    zepto.qsa = function (element, selector) {
        var found,
            maybeID = selector[0] == '#',
            maybeClass = !maybeID && selector[0] == '.',
            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
            isSimple = simpleSelectorRE.test(nameOnly)
        return (isDocument(element) && isSimple && maybeID) ?
            ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
            (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
                slice.call(
                    isSimple && !maybeID ?
                        maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
                            element.getElementsByTagName(selector) : // Or a tag
                        element.querySelectorAll(selector) // Or it's not simple, and we need to query all
                )
    }

    function filtered (nodes, selector) {
        return selector == null ? $(nodes) : $(nodes).filter(selector)
    }

    $.contains = function (parent, node) {
        if (node) {
            while ((node = node.parentNode)) {
                if (node === parent) {
                    return true;
                }
            }
        }
        return false;
        // IE 11 fails this check
        //return parent !== node && parent.contains(node)
    }

    function funcArg (context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg
    }

    function setAttribute (node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
    }

    // access className property while respecting SVGAnimatedString
    function className (node, value) {
        var klass = node.className,
            svg = klass && klass.baseVal !== undefined

        if (value === undefined) {
            return svg ? klass.baseVal : klass
        }
        svg ? (klass.baseVal = value) : (node.className = value)
    }

    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    function deserializeValue (value) {
        var num
        try {
            return value ?
            value == "true" ||
            ( value == "false" ? false :
                value == "null" ? null :
                    !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
                        /^[\[\{]/.test(value) ? $.parseJSON(value, true) :
                            value )
                : value
        }
        catch (e) {
            return value
        }
    }

    $.type = type
    $.isFunction = isFunction
    $.isWindow = isWindow
    $.isArray = isArray
    $.isPlainObject = isPlainObject

    $.isEmptyObject = function (obj) {
        var name
        for (name in obj) return false
        return true
    }

    $.inArray = function (elem, array, i) {
        return emptyArray.indexOf.call(array, elem, i)
    }

    $.camelCase = camelize
    $.trim = function (str) {
        return str == null ? "" : String.prototype.trim.call(str)
    }

    // plugin compatibility
    $.uuid = 0
    $.support = {}
    $.expr = {}

    $.map = function (elements, callback) {
        var value, values = [], i, key
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i)
                if (value != null) {
                    values.push(value)
                }
            }
        }
        else {
            for (key in elements) {
                value = callback(elements[key], key)
                if (value != null) {
                    values.push(value)
                }
            }
        }
        return flatten(values)
    }

    $.each = function (elements, callback) {
        var i, key
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++)
                if (callback.call(elements[i], i, elements[i]) === false) {
                    return elements
                }
        }
        else {
            for (key in elements)
                if (callback.call(elements[key], key, elements[key]) === false) {
                    return elements
                }
        }

        return elements
    }

    $.grep = function (elements, callback) {
        return filter.call(elements, callback)
    }

    $.parseJSON = function (jsonString, nonStrict) {
        return X.utils.jsonSerializer.toJSON (jsonString, nonStrict);
    };


    // Populate the class2type map
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase()
    })

    // Define methods that will be available on all
    // Zepto collections
    $.fn = {
        // Because a collection acts like an array
        // copy over these useful array functions.
        forEach : emptyArray.forEach,
        reduce : emptyArray.reduce,
        push : emptyArray.push,
        sort : emptyArray.sort,
        indexOf : emptyArray.indexOf,
        concat : emptyArray.concat,

        // `map` and `slice` in the jQuery API work differently
        // from their array counterparts
        map : function (fn) {
            return $($.map(this, function (el, i) {
                return fn.call(el, i, el)
            }))
        },
        slice : function () {
            return $(slice.apply(this, arguments))
        },

        ready : function (callback) {
            // need to check if document.body exists for IE as that browser reports
            // document ready when it hasn't yet created the body element
            if (readyRE.test(document.readyState) && document.body) {
                callback($)
            }
            else {
                document.addEventListener('DOMContentLoaded', function () {
                    callback($)
                }, false)
            }
            return this
        },
        get : function (idx) {
            return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
        },
        toArray : function () {
            return this.get()
        },
        size : function () {
            return this.length
        },
        remove : function () {
            return this.each(function () {
                if (this.parentNode != null) {
                    this.parentNode.removeChild(this)
                }
            })
        },
        each : function (callback) {
            emptyArray.every.call(this, function (el, idx) {
                return callback.call(el, idx, el) !== false
            })
            return this
        },
        filter : function (selector) {
            if (isFunction(selector)) {
                return this.not(this.not(selector))
            }
            return $(filter.call(this, function (element) {
                return zepto.matches(element, selector)
            }))
        },
        add : function (selector, context) {
            return $(uniq(this.concat($(selector, context))))
        },
        is : function (selector) {
            return this.length > 0 && zepto.matches(this[0], selector)
        },
        not : function (selector) {
            var nodes = []
            if (isFunction(selector) && selector.call !== undefined) {
                this.each(function (idx) {
                    if (!selector.call(this, idx)) {
                        nodes.push(this)
                    }
                })
            }
            else {
                var excludes = typeof selector == 'string' ? this.filter(selector) :
                    (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
                this.forEach(function (el) {
                    if (excludes.indexOf(el) < 0) {
                        nodes.push(el)
                    }
                })
            }
            return $(nodes)
        },
        has : function (selector) {
            return this.filter(function () {
                return isObject(selector) ?
                    $.contains(this, selector) :
                    $(this).find(selector).size()
            })
        },
        eq : function (idx) {
            return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
        },
        first : function () {
            var el = this[0]
            return el && !isObject(el) ? el : $(el)
        },
        last : function () {
            var el = this[this.length - 1]
            return el && !isObject(el) ? el : $(el)
        },
        find : function (selector) {
            var result, $this = this
            if (!selector) {
                result = []
            }
            else if (typeof selector == 'object') {
                result = $(selector).filter(function () {
                    var node = this
                    return emptyArray.some.call($this, function (parent) {
                        return $.contains(parent, node)
                    })
                })
            }
            else if (this.length == 1) {
                result = $(zepto.qsa(this[0], selector))
            }
            else {
                result = this.map(function () {
                    return zepto.qsa(this, selector)
                })
            }
            return result
        },
        closest : function (selector, context) {
            var node = this[0], collection = false
            if (typeof selector == 'object') {
                collection = $(selector)
            }
            while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector))) {
                node = node !== context && !isDocument(node) && node.parentNode
            }
            return $(node)
        },
        parents : function (selector) {
            var ancestors = [], nodes = this
            while (nodes.length > 0) {
                nodes = $.map(nodes, function (node) {
                    if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node)
                        return node
                    }
                })
            }
            return filtered(ancestors, selector)
        },
        parent : function (selector) {
            return filtered(uniq(this.pluck('parentNode')), selector)
        },
        children : function (selector) {
            return filtered(this.map(function () {
                return children(this)
            }), selector)
        },
        contents : function () {
            return this.map(function () {
                return slice.call(this.childNodes)
            })
        },
        siblings : function (selector) {
            return filtered(this.map(function (i, el) {
                return filter.call(children(el.parentNode), function (child) {
                    return child !== el
                })
            }), selector)
        },
        empty : function () {
            return this.each(function () {
                this.innerHTML = ''
            })
        },
        // `pluck` is borrowed from Prototype.js
        pluck : function (property) {
            return $.map(this, function (el) {
                return el[property]
            })
        },
        show : function () {
            return this.each(function () {
                this.style.display == "none" && (this.style.display = '')
                if (getComputedStyle(this, '').getPropertyValue("display") == "none") {
                    this.style.display = defaultDisplay(this.nodeName)
                }
            })
        },
        replaceWith : function (newContent) {
            return this.before(newContent).remove()
        },
        wrap : function (structure) {
            var func = isFunction(structure)
            if (this[0] && !func) {
                var dom = $(structure).get(0),
                    clone = dom.parentNode || this.length > 1
            }

            return this.each(function (index) {
                $(this).wrapAll(
                    func ? structure.call(this, index) :
                        clone ? dom.cloneNode(true) : dom
                )
            })
        },
        wrapAll : function (structure) {
            if (this[0]) {
                $(this[0]).before(structure = $(structure))
                var children
                // drill down to the inmost element
                while ((children = structure.children()).length) {
                    structure = children.first()
                }
                $(structure).append(this)
            }
            return this
        },
        wrapInner : function (structure) {
            var func = isFunction(structure)
            return this.each(function (index) {
                var self = $(this), contents = self.contents(),
                    dom = func ? structure.call(this, index) : structure
                contents.length ? contents.wrapAll(dom) : self.append(dom)
            })
        },
        unwrap : function () {
            this.parent().each(function () {
                $(this).replaceWith($(this).children())
            })
            return this
        },
        clone : function () {
            return this.map(function () {
                return this.cloneNode(true)
            })
        },
        hide : function () {
            return this.css("display", "none")
        },
        toggle : function (setting) {
            return this.each(function () {
                var el = $(this)
                    ;
                (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
            })
        },
        prev : function (selector) {
            return $(this.pluck('previousElementSibling')).filter(selector || '*')
        },
        next : function (selector) {
            return $(this.pluck('nextElementSibling')).filter(selector || '*')
        },
        html : function (html) {
            return arguments.length === 0 ?
                (this.length > 0 ? this[0].innerHTML : null) :
                this.each(function (idx) {
                    var originHtml = this.innerHTML
                    $(this).empty().append(funcArg(this, html, idx, originHtml))
                })
        },
        text : function (text) {
            return arguments.length === 0 ?
                (this.length > 0 ? this[0].textContent : null) :
                this.each(function () {
                    this.textContent = (text === undefined) ? '' : '' + text
                })
        },
        attr : function (name, value) {
            var result
            return (typeof name == 'string' && value === undefined) ?
                (this.length == 0 || this[0].nodeType !== 1 ? undefined :
                        (name == 'value' && this[0].nodeName == 'INPUT') ? this.val() :
                            (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
                ) :
                this.each(function (idx) {
                    if (this.nodeType !== 1) {
                        return
                    }
                    if (isObject(name)) {
                        for (key in name) setAttribute(this, key, name[key])
                    }
                    else {
                        setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
                    }
                })
        },
        removeAttr : function (name) {
            return this.each(function () {
                this.nodeType === 1 && setAttribute(this, name)
            })
        },
        prop : function (name, value) {
            name = propMap[name] || name
            return (value === undefined) ?
                (this[0] && this[0][name]) :
                this.each(function (idx) {
                    this[name] = funcArg(this, value, idx, this[name])
                })
        },
        data : function (name, value) {
            var data = this.attr('data-' + name.replace(capitalRE, '-$1').toLowerCase(), value)
            return data !== null ? deserializeValue(data) : undefined
        },
        val : function (value) {
            return arguments.length === 0 ?
                (this[0] && (this[0].multiple ?
                        $(this[0]).find('option').filter(function () {
                            return this.selected
                        }).pluck('value') :
                        this[0].value)
                ) :
                this.each(function (idx) {
                    this.value = funcArg(this, value, idx, this.value)
                })
        },
        offset : function (coordinates) {
            if (coordinates) {
                return this.each(function (index) {
                    var $this = $(this),
                        coords = funcArg(this, coordinates, index, $this.offset()),
                        parentOffset = $this.offsetParent().offset(),
                        props = {
                            top : coords.top - parentOffset.top,
                            left : coords.left - parentOffset.left
                        }

                    if ($this.css('position') == 'static') {
                        props['position'] = 'relative'
                    }
                    $this.css(props)
                })
            }
            if (this.length == 0) {
                return null
            }
            var obj = this[0].getBoundingClientRect()
            return {
                left : obj.left + window.pageXOffset,
                top : obj.top + window.pageYOffset,
                width : Math.round(obj.width),
                height : Math.round(obj.height)
            }
        },
        css : function (property, value) {
            if (arguments.length < 2) {
                var element = this[0], computedStyle = getComputedStyle(element, '')
                if (!element) {
                    return
                }
                if (typeof property == 'string') {
                    return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
                }
                else if (isArray(property)) {
                    var props = {}
                    $.each(isArray(property) ? property : [property], function (_, prop) {
                        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
                    })
                    return props
                }
            }

            var css = ''
            if (type(property) == 'string') {
                if (!value && value !== 0) {
                    this.each(function () {
                        this.style.removeProperty(dasherize(property))
                    })
                }
                else {
                    css = dasherize(property) + ":" + maybeAddPx(property, value)
                }
            }
            else {
                for (key in property)
                    if (!property[key] && property[key] !== 0) {
                        this.each(function () {
                            this.style.removeProperty(dasherize(key))
                        })
                    }
                    else {
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
                    }
            }

            return this.each(function () {
                this.style.cssText += ';' + css
            })
        },
        index : function (element) {
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
        },
        hasClass : function (name) {
            if (!name) {
                return false
            }
            return emptyArray.some.call(this, function (el) {
                return this.test(className(el))
            }, classRE(name))
        },
        addClass : function (name) {
            if (!name) {
                return this
            }
            return this.each(function (idx) {
                classList = []
                var cls = className(this), newName = funcArg(this, name, idx, cls)
                newName.split(/\s+/g).forEach(function (klass) {
                    if (!$(this).hasClass(klass)) {
                        classList.push(klass)
                    }
                }, this)
                classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
            })
        },
        removeClass : function (name) {
            return this.each(function (idx) {
                if (name === undefined) {
                    return className(this, '')
                }
                classList = className(this)
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                    classList = classList.replace(classRE(klass), " ")
                })
                className(this, classList.trim())
            })
        },
        toggleClass : function (name, when) {
            if (!name) {
                return this
            }
            return this.each(function (idx) {
                var $this = $(this), names = funcArg(this, name, idx, className(this))
                names.split(/\s+/g).forEach(function (klass) {
                    (when === undefined ? !$this.hasClass(klass) : when) ?
                        $this.addClass(klass) : $this.removeClass(klass)
                })
            })
        },
        scrollTop : function (value) {
            if (!this.length) {
                return
            }
            var hasScrollTop = 'scrollTop' in this[0]
            if (value === undefined) {
                return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
            }
            return this.each(hasScrollTop ?
                function () {
                    this.scrollTop = value
                } :
                function () {
                    this.scrollTo(this.scrollX, value)
                })
        },
        scrollLeft : function (value) {
            if (!this.length) {
                return
            }
            var hasScrollLeft = 'scrollLeft' in this[0]
            if (value === undefined) {
                return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
            }
            return this.each(hasScrollLeft ?
                function () {
                    this.scrollLeft = value
                } :
                function () {
                    this.scrollTo(value, this.scrollY)
                })
        },
        position : function () {
            if (!this.length) {
                return
            }

            var elem = this[0],
            // Get *real* offsetParent
                offsetParent = this.offsetParent(),
            // Get correct offsets
                offset = this.offset(),
                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {top : 0, left : 0} : offsetParent.offset()

            // Subtract element margins
            // note: when an element has margin: auto the offsetLeft and marginLeft
            // are the same in Safari causing offset.left to incorrectly be 0
            offset.top -= parseFloat($(elem).css('margin-top')) || 0
            offset.left -= parseFloat($(elem).css('margin-left')) || 0

            // Add offsetParent borders
            parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
            parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

            // Subtract the two offsets
            return {
                top : offset.top - parentOffset.top,
                left : offset.left - parentOffset.left
            }
        },
        offsetParent : function () {
            return this.map(function () {
                var parent = this.offsetParent || document.body
                while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static") {
                    parent = parent.offsetParent
                }
                return parent
            })
        }
    }

    // for now
    //$.fn.detach = $.fn.remove

        // Generate the `width` and `height` functions
    ;
    ['width', 'height'].forEach(function (dimension) {
        var dimensionProperty =
            dimension.replace(/./, function (m) {
                return m[0].toUpperCase()
            })

        $.fn[dimension] = function (value) {
            var offset, el = this[0]
            if (value === undefined) {
                return isWindow(el) ? el['inner' + dimensionProperty] :
                    isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
                    (offset = this.offset()) && offset[dimension]
            }
            else {
                return this.each(function (idx) {
                    el = $(this)
                    el.css(dimension, funcArg(this, value, idx, el[dimension]()))
                })
            }
        }
    })

    function traverseNode (node, fun) {
        fun(node)
        for (var key in node.childNodes) traverseNode(node.childNodes[key], fun)
    }

    // Generate the `after`, `prepend`, `before`, `append`,
    // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
    adjacencyOperators.forEach(function (operator, operatorIndex) {
        var inside = operatorIndex % 2 //=> prepend, append

        $.fn[operator] = function () {
            // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
            var argType, nodes = $.map(arguments, function (arg) {
                    argType = type(arg)
                    return argType == "object" || argType == "array" || arg == null ?
                        arg : zepto.fragment(arg)
                }),
                parent, copyByClone = this.length > 1
            if (nodes.length < 1) {
                return this
            }

            return this.each(function (_, target) {
                parent = inside ? target : target.parentNode

                // convert all methods to a "before" operation
                target = operatorIndex == 0 ? target.nextSibling :
                    operatorIndex == 1 ? target.firstChild :
                        operatorIndex == 2 ? target :
                            null

                nodes.forEach(function (node) {
                    if (copyByClone) {
                        node = node.cloneNode(true)
                    }
                    else if (!parent) {
                        return $(node).remove()
                    }

                    traverseNode(parent.insertBefore(node, target), function (el) {
                        if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                            (!el.type || el.type === 'text/javascript') && !el.src) {
                            window['eval'].call(window, el.innerHTML)
                        }
                    })
                })
            })
        }

        // after    => insertAfter
        // prepend  => prependTo
        // before   => insertBefore
        // append   => appendTo
        $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
            $(html)[operator](this)
            return this
        }
    })

    zepto.Z.prototype = $.fn

    // Export internal API functions in the `$.zepto` namespace
    zepto.uniq = uniq
    zepto.deserializeValue = deserializeValue
    $.zepto = zepto

    return $
})();


(function ($) {
    var data = {}, dataAttr = $.fn.data, camelize = $.camelCase,
        exp = $.expando = 'Zepto' + (+new Date()), emptyArray = []

    // Get value from node:
    // 1. first try key as given,
    // 2. then try camelized key,
    // 3. fall back to reading "data-*" attribute.
    function getData (node, name) {
        var id = node[exp], store = id && data[id]
        if (name === undefined) {
            return store || setData(node)
        }
        else {
            if (store) {
                if (name in store) {
                    return store[name]
                }
                var camelName = camelize(name)
                if (camelName in store) {
                    return store[camelName]
                }
            }
            return dataAttr.call($(node), name)
        }
    }

    // Store value under camelized key on node
    function setData (node, name, value) {
        var id = node[exp] || (node[exp] = ++$.uuid),
            store = data[id] || (data[id] = attributeData(node))
        if (name !== undefined) {
            store[camelize(name)] = value
        }
        return store
    }

    // Read all "data-*" attributes from a node
    function attributeData (node) {
        var store = {}
        $.each(node.attributes || emptyArray, function (i, attr) {
            if (attr.name.indexOf('data-') == 0) {
                store[camelize(attr.name.replace('data-', ''))] =
                    $.zepto.deserializeValue(attr.value)
            }
        })
        return store
    }

    $.fn.data = function (name, value) {
        return value === undefined ?
            // set multiple values via object
            $.isPlainObject(name) ?
                this.each(function (i, node) {
                    $.each(name, function (key, value) {
                        setData(node, key, value)
                    })
                }) :
                // get value from first element
                this.length == 0 ? undefined : getData(this[0], name) :
            // set value on all elements
            this.each(function () {
                setData(this, name, value)
            })
    }

    $.fn.removeData = function (names) {
        if (typeof names == 'string') {
            names = names.split(/\s+/)
        }
        return this.each(function () {
            var id = this[exp], store = id && data[id]
            if (store) {
                $.each(names || store, function (key) {
                    delete store[names ? camelize(this) : key]
                })
            }
        })
    }

        // Generate extended `remove` and `empty` functions
    ;
    ['remove', 'empty'].forEach(function (methodName) {
        var origFn = $.fn[methodName]
        $.fn[methodName] = function () {
            var elements = this.find('*')
            if (methodName === 'remove') {
                elements = elements.add(this)
            }
            elements.removeData()
            return origFn.call(this)
        }
    })
})(X.$);


(function ($) {
    var jsonpID = 0,
        document = window.document,
        key,
        name,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/

    // trigger a custom event and return false if it was cancelled
    function triggerAndReturn (context, eventName, data) {
        var event = X.$.Event(eventName)

        try {
            X.$(context).trigger(event, data)
        }
        catch (e) {
        }

        return !event.isDefaultPrevented()
    }

    // trigger an Ajax "global" event
    function triggerGlobal (settings, context, eventName, data) {
        if (settings.global) {
            return triggerAndReturn(context || document, eventName, data)
        }
    }

    // Number of active Ajax requests
    $.active = 0

    function ajaxStart (settings) {
        if (settings.global && $.active++ === 0) {
            triggerGlobal(settings, null, 'ajaxStart')
        }
    }

    function ajaxStop (settings) {
        if (settings.global && !(--$.active)) {
            triggerGlobal(settings, null, 'ajaxStop')
        }
    }

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend (xhr, settings) {
        var context = settings.context
        if (settings.beforeSend.call(context, xhr, settings) === false ||
            triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false) {
            return false
        }

        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }

    function ajaxSuccess (data, xhr, settings, deferred) {
        var context = settings.context, status = 'success'
        settings.success.call(context, data, status, xhr)
        if (deferred) {
            deferred.resolveWith(context, [data, status, xhr])
        }
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
        ajaxComplete(status, xhr, settings)
    }

    // type: "timeout", "error", "abort", "parsererror"
    function ajaxError (error, type, xhr, settings, deferred) {
        var context = settings.context
        settings.error.call(context, xhr, type, error)
        if (deferred) {
            deferred.rejectWith(context, [xhr, type, error])
        }
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
        ajaxComplete(type, xhr, settings)
    }

    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete (status, xhr, settings) {
        var context = settings.context
        settings.complete.call(context, xhr, status)
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
        ajaxStop(settings)
    }

    // Empty function, used as default callback
    function empty () {
    }

    $.ajaxJSONP = function (options, deferred) {
        if (!('type' in options)) {
            return $.ajax(options)
        }

        var _callbackName = options.jsonpCallback,
            callbackName = ($.isFunction(_callbackName) ?
                    _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
            script = document.createElement('script'),
            originalCallback = window[callbackName],
            responseData,
            abort = function (errorType) {
                $(script).triggerHandler('error', errorType || 'abort')
            },
            xhr = {abort : abort}, abortTimeout

        if (deferred) {
            deferred.promise(xhr)
        }

        $(script).on('load error', function (e, errorType) {
            clearTimeout(abortTimeout)
            $(script).off().remove()

            if (e.type == 'error' || !responseData) {
                ajaxError(null, errorType || 'error', xhr, options, deferred)
            }
            else {
                ajaxSuccess(responseData[0], xhr, options, deferred)
            }

            window[callbackName] = originalCallback
            if (responseData && $.isFunction(originalCallback)) {
                originalCallback(responseData[0])
            }

            originalCallback = responseData = undefined
        })

        if (ajaxBeforeSend(xhr, options) === false) {
            abort('abort')
            return xhr
        }

        window[callbackName] = function () {
            responseData = arguments
        }

        script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
        document.head.appendChild(script)

        if (options.timeout > 0) {
            abortTimeout = setTimeout(function () {
                abort('timeout')
            }, options.timeout)
        }

        return xhr
    }

    $.ajaxSettings = {
        // Default type of request
        type : 'GET',
        // Callback that is executed before request
        beforeSend : empty,
        // Callback that is executed if the request succeeds
        success : empty,
        // Callback that is executed the the server drops error
        error : empty,
        // Callback that is executed on request complete (both: error and success)
        complete : empty,
        // The context for the callbacks
        context : null,
        // Whether to trigger "global" Ajax events
        global : true,
        // Transport
        xhr : function () {
            return new window.XMLHttpRequest()
        },
        // MIME types mapping
        // IIS returns Javascript as "application/x-javascript"
        accepts : {
            script : 'text/javascript, application/javascript, application/x-javascript',
            json : jsonType,
            xml : 'application/xml, text/xml',
            html : htmlType,
            text : 'text/plain'
        },
        // Whether the request is to another domain
        crossDomain : false,
        // Default timeout
        timeout : 0,
        // Whether data should be serialized to string
        processData : true,
        // Whether the browser should be allowed to cache GET responses
        cache : true
    }

    function mimeToDataType (mime) {
        if (mime) {
            mime = mime.split(';', 2)[0]
        }
        return mime && ( mime == htmlType ? 'html' :
                mime == jsonType ? 'json' :
                    scriptTypeRE.test(mime) ? 'script' :
               xmlTypeRE.test(mime) && 'xml' ) || 'text'
    }

    function appendQuery (url, query) {
        if (query == '') {
            return url
        }
        return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

    // serialize payload and append it to the URL for GET requests
    function serializeData (options) {
        if (options.processData && options.data && $.type(options.data) != "string") {
            options.data = $.param(options.data, options.traditional)
        }
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) {
            options.url = appendQuery(options.url, options.data), options.data = undefined
        }
    }

    $.ajax = function (options) {
        var settings = $.extend({}, options || {}),
            deferred = $.Deferred && $.Deferred()
        for (key in $.ajaxSettings) if (settings[key] === undefined) {
            settings[key] = $.ajaxSettings[key]
        }

        ajaxStart(settings)

        if (!settings.crossDomain) {
            settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
                                   RegExp.$2 != window.location.host
        }

        if (!settings.url) {
            settings.url = window.location.toString()
        }
        serializeData(settings)
        if (settings.cache === false) {
            settings.url = appendQuery(settings.url, '_=' + Date.now())
        }

        var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder) {
                settings.url = appendQuery(settings.url,
                    settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
            }
            return $.ajaxJSONP(settings, deferred)
        }

        var mime = settings.accepts[dataType],
            headers = {},
            setHeader = function (name, value) {
                headers[name.toLowerCase()] = [name, value]
            },
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = settings.xhr(),
            nativeSetHeader = xhr.setRequestHeader,
            abortTimeout

        if (deferred) {
            deferred.promise(xhr)
        }

        if (!settings.crossDomain) {
            setHeader('X-Requested-With', 'XMLHttpRequest')
        }
        setHeader('Accept', mime || '*/*')
        if (mime = settings.mimeType || mime) {
            if (mime.indexOf(',') > -1) {
                mime = mime.split(',', 2)[0]
            }
            xhr.overrideMimeType && xhr.overrideMimeType(mime)
        }
        if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET')) {
            setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')
        }

        if (settings.headers) {
            for (name in settings.headers) setHeader(name, settings.headers[name])
        }
        xhr.setRequestHeader = setHeader

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                xhr.onreadystatechange = empty
                clearTimeout(abortTimeout)
                var result, error = false
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
                    result = xhr.responseText

                    try {
                        //// http://perfectionkills.com/global-eval-what-are-the-options/
                        if (dataType == 'script') {
                            $.globalEval(result);
                        }
                        else if (dataType == 'json') {
                            result = $.parseJSON(result)
                        }
                        else if (dataType == 'xml') {
                            result = xhr.responseXML
                        }
                    }
                    catch (e) {
                        error = e
                    }

                    if (error) {
                        ajaxError(error, 'parsererror', xhr, settings, deferred)
                    }
                    else {
                        ajaxSuccess(result, xhr, settings, deferred)
                    }
                }
                else {
                    ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
                }
            }
        }

        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort()
            ajaxError(null, 'abort', xhr, settings, deferred)
            return xhr
        }

        if (settings.xhrFields) {
            for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]
        }

        var async = 'async' in settings ? settings.async : true
        xhr.open(settings.type, settings.url, async, settings.username, settings.password)

        for (name in headers) nativeSetHeader.apply(xhr, headers[name])

        if (settings.timeout > 0) {
            abortTimeout = setTimeout(function () {
                xhr.onreadystatechange = empty
                xhr.abort()
                ajaxError(null, 'timeout', xhr, settings, deferred)
            }, settings.timeout)
        }

        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null)
        return xhr
    }

    // handle optional data/success arguments
    function parseArguments (url, data, success, dataType) {
        if ($.isFunction(data)) {
            dataType = success, success = data, data = undefined
        }
        if (!$.isFunction(success)) {
            dataType = success, success = undefined
        }
        return {
            url : url, data : data, success : success, dataType : dataType
        }
    }

    $.get = function (/* url, data, success, dataType */) {
        return $.ajax(parseArguments.apply(null, arguments))
    }

    $.post = function (/* url, data, success, dataType */) {
        var options = parseArguments.apply(null, arguments)
        options.type = 'POST'
        return $.ajax(options)
    }

    $.getJSON = function (/* url, data, success */) {
        var options = parseArguments.apply(null, arguments)
        options.dataType = 'json'
        return $.ajax(options)
    }

    $.fn.loadHTML = function (url, data, success) {
        if (!this.length) {
            return this
        }
        var self = this, parts = url.split(/\s/), selector,
            options = parseArguments(url, data, success),
            callback = options.success
        if (parts.length > 1) {
            options.url = parts[0], selector = parts[1]
        }
        options.success = function (response) {
            self.html(selector ?
                $('<div>').html(response.replace(rscript, "")).find(selector)
                : response)
            callback && callback.apply(self, arguments)
        }
        $.ajax(options)
        return this
    }

    var escape = encodeURIComponent

    function serialize (params, obj, traditional, scope) {
        var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
        $.each(obj, function (key, value) {
            type = $.type(value)
            if (scope) {
                key = traditional ? scope :
                scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
            }
            // handle data in serializeArray() format
            if (!scope && array) {
                params.add(value.name, value.value)
            }
            // recurse into nested objects
            else if (type == "array" || (!traditional && type == "object")) {
                serialize(params, value, traditional, key)
            }
            else {
                params.add(key, value)
            }
        })
    }

    $.param = function (obj, traditional) {
        var params = []
        params.add = function (k, v) {
            this.push(escape(k) + '=' + escape(v))
        }
        serialize(params, obj, traditional)
        return params.join('&').replace(/%20/g, '+')
    }
})(X.$);


(function ($) {
    var slice = Array.prototype.slice

    function Deferred (func) {
        var tuples = [
                // action, add listener, listener list, final state
                ["resolve", "done", $.Callbacks({once : 1, memory : 1}), "resolved"],
                ["reject", "fail", $.Callbacks({once : 1, memory : 1}), "rejected"],
                ["notify", "progress", $.Callbacks({memory : 1})]
            ],
            state = "pending",
            promise = {
                state : function () {
                    return state
                },
                always : function () {
                    deferred.done(arguments).fail(arguments)
                    return this
                },
                then : function (/* fnDone [, fnFailed [, fnProgress]] */) {
                    var fns = arguments
                    return Deferred(function (defer) {
                        $.each(tuples, function (i, tuple) {
                            var fn = $.isFunction(fns[i]) && fns[i]
                            deferred[tuple[1]](function () {
                                var returned = fn && fn.apply(this, arguments)
                                if (returned && $.isFunction(returned.promise)) {
                                    returned.promise()
                                        .done(defer.resolve)
                                        .fail(defer.reject)
                                        .progress(defer.notify)
                                }
                                else {
                                    var context = this === promise ? defer.promise() : this,
                                        values = fn ? [returned] : arguments
                                    defer[tuple[0] + "With"](context, values)
                                }
                            })
                        })
                        fns = null
                    }).promise()
                },

                promise : function (obj) {
                    return obj != null ? $.extend(obj, promise) : promise
                }
            },
            deferred = {}

        $.each(tuples, function (i, tuple) {
            var list = tuple[2],
                stateString = tuple[3]

            promise[tuple[1]] = list.add

            if (stateString) {
                list.add(function () {
                    state = stateString
                }, tuples[i ^ 1][2].disable, tuples[2][2].lock)
            }

            deferred[tuple[0]] = function () {
                deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments)
                return this
            }
            deferred[tuple[0] + "With"] = list.fireWith
        })

        promise.promise(deferred)
        if (func) {
            func.call(deferred, deferred)
        }
        return deferred
    }

    $.when = function (sub) {
        var resolveValues = slice.call(arguments),
            len = resolveValues.length,
            i = 0,
            remain = len !== 1 || (sub && $.isFunction(sub.promise)) ? len : 0,
            deferred = remain === 1 ? sub : Deferred(),
            progressValues, progressContexts, resolveContexts,
            updateFn = function (i, ctx, val) {
                return function (value) {
                    ctx[i] = this
                    val[i] = arguments.length > 1 ? slice.call(arguments) : value
                    if (val === progressValues) {
                        deferred.notifyWith(ctx, val)
                    }
                    else if (!(--remain)) {
                        deferred.resolveWith(ctx, val)
                    }
                }
            }

        if (len > 1) {
            progressValues = new Array(len)
            progressContexts = new Array(len)
            resolveContexts = new Array(len)
            for (; i < len; ++i) {
                if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
                    resolveValues[i].promise()
                        .done(updateFn(i, resolveContexts, resolveValues))
                        .fail(deferred.reject)
                        .progress(updateFn(i, progressContexts, progressValues))
                }
                else {
                    --remain
                }
            }
        }
        if (!remain) {
            deferred.resolveWith(resolveContexts, resolveValues)
        }
        return deferred.promise()
    }

    $.Deferred = Deferred
})(X.$);


(function ($) {
    // Create a collection of callbacks to be fired in a sequence, with configurable behaviour
    // Option flags:
    //   - once: Callbacks fired at most one time.
    //   - memory: Remember the most recent context and arguments
    //   - stopOnFalse: Cease iterating over callback list
    //   - unique: Permit adding at most one instance of the same callback
    $.Callbacks = function (options) {
        options = $.extend({}, options)

        var memory, // Last fire value (for non-forgettable lists)
            fired,  // Flag to know if list was already fired
            firing, // Flag to know if list is currently firing
            firingStart, // First callback to fire (used internally by add and fireWith)
            firingLength, // End of the loop when firing
            firingIndex, // Index of currently firing callback (modified by remove if needed)
            list = [], // Actual callback list
            stack = !options.once && [], // Stack of fire calls for repeatable lists
            fire = function (data) {
                memory = options.memory && data
                fired = true
                firingIndex = firingStart || 0
                firingStart = 0
                firingLength = list.length
                firing = true
                for (; list && firingIndex < firingLength; ++firingIndex) {
                    if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                        memory = false
                        break
                    }
                }
                firing = false
                if (list) {
                    if (stack) {
                        stack.length && fire(stack.shift())
                    }
                    else if (memory) {
                        list.length = 0
                    }
                    else {
                        Callbacks.disable()
                    }
                }
            },

            Callbacks = {
                add : function () {
                    if (list) {
                        var start = list.length,
                            add = function (args) {
                                $.each(args, function (_, arg) {
                                    if (typeof arg === "function") {
                                        if (!options.unique || !Callbacks.has(arg)) {
                                            list.push(arg)
                                        }
                                    }
                                    else if (arg && arg.length && typeof arg !== 'string') {
                                        add(arg)
                                    }
                                })
                            }
                        add(arguments)
                        if (firing) {
                            firingLength = list.length
                        }
                        else if (memory) {
                            firingStart = start
                            fire(memory)
                        }
                    }
                    return this
                },
                remove : function () {
                    if (list) {
                        $.each(arguments, function (_, arg) {
                            var index
                            while ((index = $.inArray(arg, list, index)) > -1) {
                                list.splice(index, 1)
                                // Handle firing indexes
                                if (firing) {
                                    if (index <= firingLength) {
                                        --firingLength
                                    }
                                    if (index <= firingIndex) {
                                        --firingIndex
                                    }
                                }
                            }
                        })
                    }
                    return this
                },
                has : function (fn) {
                    return !!(list && (fn ? $.inArray(fn, list) > -1 : list.length))
                },
                empty : function () {
                    firingLength = list.length = 0
                    return this
                },
                disable : function () {
                    list = stack = memory = undefined
                    return this
                },
                disabled : function () {
                    return !list
                },
                lock : function () {
                    stack = undefined;
                    if (!memory) {
                        Callbacks.disable()
                    }
                    return this
                },
                locked : function () {
                    return !stack
                },
                fireWith : function (context, args) {
                    if (list && (!fired || stack)) {
                        args = args || []
                        args = [context, args.slice ? args.slice() : args]
                        if (firing) {
                            stack.push(args)
                        }
                        else {
                            fire(args)
                        }
                    }
                    return this
                },
                fire : function () {
                    return Callbacks.fireWith(this, arguments)
                },
                fired : function () {
                    return !!fired
                }
            }

        return Callbacks
    }
})(X.$);


(function ($) {
    var zepto = $.zepto, oldQsa = zepto.qsa, oldMatches = zepto.matches

    function visible (elem) {
        elem = $(elem)
        return !!(elem.width() || elem.height()) && elem.css("display") !== "none"
    }

    // Implements a subset from:
    // http://api.jquery.com/category/selectors/jquery-selector-extensions/
    //
    // Each filter function receives the current index, all nodes in the
    // considered set, and a value if there were parentheses. The value
    // of `this` is the node currently being considered. The function returns the
    // resulting node(s), null, or undefined.
    //
    // Complex selectors are not supported:
    //   li:has(label:contains("foo")) + li:has(label:contains("bar"))
    //   ul.inner:first > li
    var filters = $.expr[':'] = {
        visible : function () {
            if (visible(this)) {
                return this
            }
        },
        hidden : function () {
            if (!visible(this)) {
                return this
            }
        },
        enabled : function () {
            if (!this.disabled) {
                return this
            }
        },
        disabled : function () {
            if (this.disabled) {
                return this
            }
        },
        selected : function () {
            if (this.selected) {
                return this
            }
        },
        checked : function () {
            if (this.checked) {
                return this
            }
        },
        parent : function () {
            return this.parentNode
        },
        first : function (idx) {
            if (idx === 0) {
                return this
            }
        },
        last : function (idx, nodes) {
            if (idx === nodes.length - 1) {
                return this
            }
        },
        eq : function (idx, _, value) {
            if (idx === value) {
                return this
            }
        },
        contains : function (idx, _, text) {
            if ($(this).text().indexOf(text) > -1) {
                return this
            }
        },
        has : function (idx, _, sel) {
            if (zepto.qsa(this, sel).length) {
                return this
            }
        }
    }

    var filterRe = new RegExp('(.*):(\\w+)(?:\\(([^)]+)\\))?$\\s*'),
        childRe = /^\s*>/,
        classTag = 'Zepto' + (+new Date())

    function process (sel, fn) {
        // quote the hash in `a[href^=#]` expression
        sel = sel.replace(/=#\]/g, '="#"]')
        var filter, arg, match = filterRe.exec(sel)
        if (match && match[2] in filters) {
            filter = filters[match[2]], arg = match[3]
            sel = match[1]
            if (arg) {
                var num = Number(arg)
                if (isNaN(num)) {
                    arg = arg.replace(/^["']|["']$/g, '')
                }
                else {
                    arg = num
                }
            }
        }
        return fn(sel, filter, arg)
    }

    zepto.qsa = function (node, selector) {
        return process(selector, function (sel, filter, arg) {
            try {
                var taggedParent
                if (!sel && filter) {
                    sel = '*'
                }
                else if (childRe.test(sel))
                // support "> *" child queries by tagging the parent node with a
                // unique class and prepending that classname onto the selector
                {
                    taggedParent = $(node).addClass(classTag), sel = '.' + classTag + ' ' + sel
                }

                var nodes = oldQsa(node, sel)
            }
            catch (e) {
                console.error('error performing selector: %o', selector)
                throw e
            }
            finally {
                if (taggedParent) {
                    taggedParent.removeClass(classTag)
                }
            }
            return !filter ? nodes :
                zepto.uniq($.map(nodes, function (n, i) {
                    return filter.call(n, i, nodes, arg)
                }))
        })
    }

    zepto.matches = function (node, selector) {
        return process(selector, function (sel, filter, arg) {
            return (!sel || oldMatches(node, sel)) &&
                   (!filter || filter.call(node, null, arg) === node)
        })
    }
})(X.$);


(function ($) {
    var _zid = 1, undefined,
        slice = Array.prototype.slice,
        isFunction = $.isFunction,
        isString = function (obj) {
            return typeof obj == 'string'
        },
        handlers = {},
        specialEvents = {},
        focusinSupported = 'onfocusin' in window,
        focus = {focus : 'focusin', blur : 'focusout'},
        hover = {mouseenter : 'mouseover', mouseleave : 'mouseout'}

    specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

    function zid (element) {
        return element._zid || (element._zid = _zid++)
    }

    function findHandlers (element, event, fn, selector) {
        event = parse(event)
        if (event.ns) {
            var matcher = matcherFor(event.ns)
        }
        return (handlers[zid(element)] || []).filter(function (handler) {
            return handler
                   && (!event.e || handler.e == event.e)
                   && (!event.ns || matcher.test(handler.ns))
                   && (!fn || zid(handler.fn) === zid(fn))
                   && (!selector || handler.sel == selector)
        })
    }

    function parse (event) {
        var parts = ('' + event).split('.')
        return {e : parts[0], ns : parts.slice(1).sort().join(' ')}
    }

    function matcherFor (ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
    }

    function eventCapture (handler, captureSetting) {
        return handler.del &&
               (!focusinSupported && (handler.e in focus)) || !!captureSetting
    }

    function realEvent (type) {
        return hover[type] || (focusinSupported && focus[type]) || type
    }

    function add (element, events, fn, data, selector, delegator, capture) {
        var id = zid(element), set = (handlers[id] || (handlers[id] = []))
        events.split(/\s/).forEach(function (event) {
            if (event == 'ready') {
                return $(document).ready(fn)
            }
            var handler = parse(event)
            handler.fn = fn
            handler.sel = selector
            // emulate mouseenter, mouseleave
            if (handler.e in hover) {
                fn = function (e) {
                    var related = e.relatedTarget
                    if (!related || (related !== this && !$.contains(this, related))) {
                        return handler.fn.apply(this, arguments)
                    }
                }
            }
            handler.del = delegator
            var callback = delegator || fn
            handler.proxy = function (e) {
                e = compatible(e)
                if (e.isImmediatePropagationStopped()) {
                    return
                }
                e.data = data
                var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
                if (result === false) {
                    e.preventDefault(), e.stopPropagation()
                }
                return result
            }
            handler.i = set.length
            set.push(handler)
            if ('addEventListener' in element) {
                element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
            }
        })
    }

    function remove (element, events, fn, selector, capture) {
        var id = zid(element)
            ;
        (events || '').split(/\s/).forEach(function (event) {
            findHandlers(element, event, fn, selector).forEach(function (handler) {
                delete handlers[id][handler.i]
                if ('removeEventListener' in element) {
                    element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
                }
            })
        })
    }

    $.event = {add : add, remove : remove}

    $.proxy = function (fn, context) {
        if (isFunction(fn)) {
            var proxyFn = function () {
                return fn.apply(context, arguments)
            }
            proxyFn._zid = zid(fn)
            return proxyFn
        }
        else if (isString(context)) {
            return $.proxy(fn[context], fn)
        }
        else {
            throw new TypeError("expected function")
        }
    }

    $.fn.bind = function (event, data, callback) {
        return this.on(event, data, callback)
    }
    $.fn.unbind = function (event, callback) {
        return this.off(event, callback)
    }
    $.fn.one = function (event, selector, data, callback) {
        return this.on(event, selector, data, callback, 1)
    }

    var returnTrue = function () {
            return true
        },
        returnFalse = function () {
            return false
        },
        ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
        eventMethods = {
            preventDefault : 'isDefaultPrevented',
            stopImmediatePropagation : 'isImmediatePropagationStopped',
            stopPropagation : 'isPropagationStopped'
        }

    function compatible (event, source) {
        if (source || !event.isDefaultPrevented) {
            source || (source = event)

            $.each(eventMethods, function (name, predicate) {
                var sourceMethod = source[name]
                event[name] = function () {
                    this[predicate] = returnTrue
                    return sourceMethod && sourceMethod.apply(source, arguments)
                }
                event[predicate] = returnFalse
            })

            if (source.defaultPrevented !== undefined ? source.defaultPrevented :
                    'returnValue' in source ? source.returnValue === false :
                    source.getPreventDefault && source.getPreventDefault()) {
                event.isDefaultPrevented = returnTrue
            }
        }
        return event
    }

    function createProxy (event) {
        var key, proxy = {originalEvent : event}
        for (key in event)
            if (!ignoreProperties.test(key) && event[key] !== undefined) {
                proxy[key] = event[key]
            }

        return compatible(proxy, event)
    }

    $.fn.delegate = function (selector, event, callback) {
        return this.on(event, selector, callback)
    }
    $.fn.undelegate = function (selector, event, callback) {
        return this.off(event, selector, callback)
    }

    $.fn.live = function (event, callback) {
        $(document.body).delegate(this.selector, event, callback)
        return this
    }
    $.fn.die = function (event, callback) {
        $(document.body).undelegate(this.selector, event, callback)
        return this
    }

    $.fn.on = function (event, selector, data, callback, one) {
        var autoRemove, delegator, $this = this;
        if (event && !isString(event)) {
            $.each(event, function (type, fn) {
                $this.on(type, selector, data, fn, one)
            })
            return $this
        }

        if (!isString(selector) && !isFunction(callback) && callback !== false) {
            callback = data, data = selector, selector = undefined
        }
        if (isFunction(data) || data === false) {
            callback = data, data = undefined
        }

        if (callback === false) {
            callback = returnFalse
        }

        return $this.each(function (_, element) {
            if (one) {
                autoRemove = function (e) {
                    remove(element, e.type, callback)
                    return callback.apply(this, arguments)
                }
            }

            if (selector) {
                delegator = function (e) {
                    var evt, match = $(e.target).closest(selector, element).get(0)
                    if (match && match !== element) {
                        evt = $.extend(createProxy(e), {currentTarget : match, liveFired : element})
                        return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
                    }
                }
            }

            add(element, event, callback, data, selector, delegator || autoRemove)
        })
    }
    $.fn.off = function (event, selector, callback) {
        var $this = this
        if (event && !isString(event)) {
            $.each(event, function (type, fn) {
                $this.off(type, selector, fn)
            })
            return $this
        }

        if (!isString(selector) && !isFunction(callback) && callback !== false) {
            callback = selector, selector = undefined
        }

        if (callback === false) {
            callback = returnFalse
        }

        return $this.each(function () {
            remove(this, event, callback, selector)
        })
    }

    $.fn.trigger = function (event, args) {
        event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
        event._args = args
        return this.each(function () {
            //// handle focus(), blur() by calling them directly
            //if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
            //// items in the collection might not be DOM elements
            //else if ('dispatchEvent' in this) this.dispatchEvent(event)
            /*else*/
            $(this).triggerHandler(event, args)
        })
    }

    // triggers event handlers on current element just as if an event occurred,
    // doesn't trigger an actual event, doesn't bubble
    $.fn.triggerHandler = function (event, args) {
        var e, result
        this.each(function (i, element) {
            e = createProxy(isString(event) ? $.Event(event) : event)
            e._args = args
            e.target = element
            $.each(findHandlers(element, event.type || event), function (i, handler) {
                result = handler.proxy(e)
                if (e.isImmediatePropagationStopped()) {
                    return false
                }
            })
        })
        return result
    }

        // shortcut methods for `.bind(event, fn)` for each event type
    ;
    ('focusin focusout load resize scroll unload click dblclick ' +
     'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
     'change select keydown keypress keyup error').split(' ').forEach(function (event) {
        $.fn[event] = function (callback) {
            return callback ?
                this.bind(event, callback) :
                this.trigger(event)
        }
    })

    ;
    ['focus', 'blur'].forEach(function (name) {
        $.fn[name] = function (callback) {
            if (callback) {
                this.bind(name, callback)
            }
            else {
                this.each(function () {
                    try {
                        this[name]()
                    }
                    catch (e) {
                    }
                })
            }
            return this
        }
    })

    $.Event = function (type, props) {
        if (!isString(type)) {
            props = type, type = props.type
        }
        var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
        if (props) {
            for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
        }
        event.initEvent(type, bubbles, true)
        return compatible(event)
    }

})(X.$);


(function ($, undefined) {
    var prefix = '', eventPrefix, endEventName, endAnimationName,
        vendors = {Webkit : 'webkit', Moz : '', O : 'o'},
        document = window.document, testEl = document.createElement('div'),
        supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
        transform,
        transitionProperty, transitionDuration, transitionTiming, transitionDelay,
        animationName, animationDuration, animationTiming, animationDelay,
        cssReset = {}

    function dasherize (str) {
        return str.replace(/([a-z])([A-Z])/, '$1-$2').toLowerCase()
    }

    function normalizeEvent (name) {
        return eventPrefix ? eventPrefix + name : name.toLowerCase()
    }

    $.each(vendors, function (vendor, event) {
        if (testEl.style[vendor + 'TransitionProperty'] !== undefined) {
            prefix = '-' + vendor.toLowerCase() + '-'
            eventPrefix = event
            return false
        }
    })

    transform = prefix + 'transform'
    cssReset[transitionProperty = prefix + 'transition-property'] =
        cssReset[transitionDuration = prefix + 'transition-duration'] =
            cssReset[transitionDelay = prefix + 'transition-delay'] =
                cssReset[transitionTiming = prefix + 'transition-timing-function'] =
                    cssReset[animationName = prefix + 'animation-name'] =
                        cssReset[animationDuration = prefix + 'animation-duration'] =
                            cssReset[animationDelay = prefix + 'animation-delay'] =
                                cssReset[animationTiming = prefix + 'animation-timing-function'] = ''

    $.fx = {
        off : (eventPrefix === undefined && testEl.style.transitionProperty === undefined),
        speeds : {_default : 400, fast : 200, slow : 600},
        cssPrefix : prefix,
        transitionEnd : normalizeEvent('TransitionEnd'),
        animationEnd : normalizeEvent('AnimationEnd')
    }

    $.fn.animate = function (properties, duration, ease, callback, delay) {
        if ($.isFunction(duration)) {
            callback = duration, ease = undefined, duration = undefined
        }
        if ($.isFunction(ease)) {
            callback = ease, ease = undefined
        }
        if ($.isPlainObject(duration)) {
            ease = duration.easing, callback = duration.complete, delay = duration.delay, duration = duration.duration
        }
        if (duration) {
            duration = (typeof duration == 'number' ? duration :
                    ($.fx.speeds[duration] || $.fx.speeds._default)) / 1000
        }
        if (delay) {
            delay = parseFloat(delay) / 1000
        }
        return this.anim(properties, duration, ease, callback, delay)
    }

    $.fn.anim = function (properties, duration, ease, callback, delay) {
        var key, cssValues = {}, cssProperties, transforms = '',
            that = this, wrappedCallback, endEvent = $.fx.transitionEnd,
            fired = false

        if (duration === undefined) {
            duration = $.fx.speeds._default / 1000
        }
        if (delay === undefined) {
            delay = 0
        }
        if ($.fx.off) {
            duration = 0
        }

        if (typeof properties == 'string') {
            // keyframe animation
            cssValues[animationName] = properties
            cssValues[animationDuration] = duration + 's'
            cssValues[animationDelay] = delay + 's'
            cssValues[animationTiming] = (ease || 'linear')
            endEvent = $.fx.animationEnd
        }
        else {
            cssProperties = []
            // CSS transitions
            for (key in properties)
                if (supportedTransforms.test(key)) {
                    transforms += key + '(' + properties[key] + ') '
                }
                else {
                    cssValues[key] = properties[key], cssProperties.push(dasherize(key))
                }

            if (transforms) {
                cssValues[transform] = transforms, cssProperties.push(transform)
            }
            if (duration > 0 && typeof properties === 'object') {
                cssValues[transitionProperty] = cssProperties.join(', ')
                cssValues[transitionDuration] = duration + 's'
                cssValues[transitionDelay] = delay + 's'
                cssValues[transitionTiming] = (ease || 'linear')
            }
        }

        wrappedCallback = function (event) {
            if (typeof event !== 'undefined') {
                if (event.target !== event.currentTarget) {
                    return
                } // makes sure the event didn't bubble from "below"
                $(event.target).unbind(endEvent, wrappedCallback)
            }
            else {
                $(this).unbind(endEvent, wrappedCallback)
            } // triggered by setTimeout

            fired = true
            $(this).css(cssReset)
            callback && callback.call(this)
        }
        if (duration > 0) {
            this.bind(endEvent, wrappedCallback)
            // transitionEnd is not always firing on older Android phones
            // so make sure it gets fired
            setTimeout(function () {
                if (fired) {
                    return
                }
                wrappedCallback.call(that)
            }, (duration * 1000) + 25)
        }

        // trigger page reflow so new elements can animate
        this.size() && this.get(0).clientLeft

        this.css(cssValues)

        if (duration <= 0) {
            setTimeout(function () {
                that.each(function () {
                    wrappedCallback.call(this)
                })
            }, 0)
        }

        return this
    }

    testEl = null
})(X.$);


(function ($, undefined) {
    var document = window.document, docElem = document.documentElement,
        origShow = $.fn.show, origHide = $.fn.hide, origToggle = $.fn.toggle

    function anim (el, speed, opacity, scale, callback) {
        if (typeof speed == 'function' && !callback) {
            callback = speed, speed = undefined
        }
        var props = {opacity : opacity}
        if (scale) {
            props.scale = scale
            el.css($.fx.cssPrefix + 'transform-origin', '0 0')
        }
        return el.animate(props, speed, null, callback)
    }

    function hide (el, speed, scale, callback) {
        return anim(el, speed, 0, scale, function () {
            origHide.call($(this))
            callback && callback.call(this)
        })
    }

    $.fn.show = function (speed, callback) {
        origShow.call(this)
        if (speed === undefined) {
            speed = 0
        }
        else {
            this.css('opacity', 0)
        }
        return anim(this, speed, 1, '1,1', callback)
    }

    $.fn.hide = function (speed, callback) {
        if (speed === undefined) {
            return origHide.call(this)
        }
        else {
            return hide(this, speed, '0,0', callback)
        }
    }

    $.fn.toggle = function (speed, callback) {
        if (speed === undefined || typeof speed == 'boolean') {
            return origToggle.call(this, speed)
        }
        else {
            return this.each(function () {
                var el = $(this)
                el[el.css('display') == 'none' ? 'show' : 'hide'](speed, callback)
            })
        }
    }

    $.fn.fadeTo = function (speed, opacity, callback) {
        return anim(this, speed, opacity, null, callback)
    }

    $.fn.fadeIn = function (speed, callback) {
        var target = this.css('opacity')
        if (target > 0) {
            this.css('opacity', 0)
        }
        else {
            target = 1
        }
        return origShow.call(this).fadeTo(speed, target, callback)
    }

    $.fn.fadeOut = function (speed, callback) {
        return hide(this, speed, null, callback)
    }

    $.fn.fadeToggle = function (speed, callback) {
        return this.each(function () {
            var el = $(this)
            el[
                (el.css('opacity') == 0 || el.css('display') == 'none') ? 'fadeIn' : 'fadeOut'
                ](speed, callback)
        })
    }

    /* SlideDown */
    $.fn.slideDown = function (duration) {

        // get the element position to restore it then
        var position = this.css('position');

        // show element if it is hidden
        this.show();

        // place it so it displays as usually but hidden
        this.css({
            position : 'absolute',
            visibility : 'hidden'
        });

        // get naturally height, margin, padding
        var marginTop = this.css('margin-top');
        var marginBottom = this.css('margin-bottom');
        var paddingTop = this.css('padding-top');
        var paddingBottom = this.css('padding-bottom');
        var height = this.css('height');

        // set initial css for animation
        this.css({
            position : position,
            visibility : 'visible',
            overflow : 'hidden',
            height : 0,
            marginTop : 0,
            marginBottom : 0,
            paddingTop : 0,
            paddingBottom : 0
        });

        // animate to gotten height, margin and padding
        this.animate({
            height : height,
            marginTop : marginTop,
            marginBottom : marginBottom,
            paddingTop : paddingTop,
            paddingBottom : paddingBottom
        }, duration);

    };

    /* SlideUp */
    $.fn.slideUp = function (duration) {

        // active the function only if the element is visible
        if (this.height() > 0) {

            var target = this;

            // get the element position to restore it then
            var position = target.css('position');

            // get the element height, margin and padding to restore them then
            var height = target.css('height');
            var marginTop = target.css('margin-top');
            var marginBottom = target.css('margin-bottom');
            var paddingTop = target.css('padding-top');
            var paddingBottom = target.css('padding-bottom');

            // set initial css for animation
            this.css({
                visibility : 'visible',
                overflow : 'hidden',
                height : height,
                marginTop : marginTop,
                marginBottom : marginBottom,
                paddingTop : paddingTop,
                paddingBottom : paddingBottom
            });

            // animate element height, margin and padding to zero
            target.animate({
                    height : 0,
                    marginTop : 0,
                    marginBottom : 0,
                    paddingTop : 0,
                    paddingBottom : 0
                },
                {
                    // callback : restore the element position, height, margin and padding to original values
                    duration : duration,
                    queue : false,
                    complete : function () {
                        target.hide();
                        target.css({
                            visibility : 'visible',
                            overflow : 'hidden',
                            height : height,
                            marginTop : marginTop,
                            marginBottom : marginBottom,
                            paddingTop : paddingTop,
                            paddingBottom : paddingBottom
                        });
                    }
                });
        }
    };

    /* SlideToggle */
    $.fn.slideToggle = function (duration) {

        // if the element is hidden, slideDown !
        if (this.height() == 0) {
            this.slideDown(duration);
        }
        // if the element is visible, slideUp !
        else {
            this.slideUp(duration);
        }
    };


})(X.$);


// Extensions to Zepto that it doesn't
(function ($) {

    $.fn.extend = function (obj) {
        $.extend($.fn, obj);
    };

    //    $.getScript = function(/* url, data, success, dataType */){
    //        return $.ajax(parseArguments.apply(null, arguments))
    //    }
    //
    //    $.getScript = function (src, func) {
    //        var script = document.createElement('script');
    //        script.async = "async";
    //        script.src = src;
    //        if (func) {
    //            script.onload = func;
    //        }
    //        document.getElementsByTagName("head")[0].appendChild(script);
    //    };

    // Evaluates a script in a global context
    // Workarounds based on findings by Jim Driscoll
    // http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
    $.globalEval = function (code) {
        var script,
            indirect = eval;
        code = $.trim(code);

        if (code) {
            //// Solve for IE < 11
            //if (window.execScript) {
            //    return window["eval"].call(window, code);
            //}

            // If the code includes a valid, prologue position
            // strict mode pragma, execute code by injecting a
            // script tag into the document.
            if (code.indexOf("use strict") === 1) {
                script = document.createElement("script");
                script.text = code;
                document.head.appendChild(script).parentNode.removeChild(script);
            }
            else {
                // Otherwise, avoid the DOM node creation, insertion
                // and removal by using an indirect global eval
                indirect(code);
            }
        }
    };

    $.ready = function (callback) {
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", function (event) {
                callback(event);
            }, false);
        }
        else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState === "complete") {
                    document.detachEvent("onreadystatechange", window);
                    callback(event);
                }
            });
        }
    }

})(X.$);
/* jshint ignore:end */

X.constants = {

    events : {
        kInitialize : "initialize",
        kOptions : "options", // setOptions call is made /* payload is the new options */
        kException : "exception",
        kConsoleEnabled : "debugConsoleEnabled",
        kConsoleDisabled : "debugConsoleDisabled",
        kProfile : "profile" /* profiling is finished  - publishers should publish the X.utils.profiler object */
    },

    interfaces : {
        kABTestResolver : "abTestResolver",
        kDataResolver : "dataResolver"
    },

    jqEvents : {
    },

    scopes : {
        kApplicationScope : "APPLICATION_SCOPE",
        kFlowScope : "FLOW_SCOPE",
        kViewScope : "VIEW_SCOPE"
    },

    log : {
        INFO : "INFO",
        WARN : "WARN",
        ERROR : "ERROR",
        CRITICAL : "CRITICAL",
        DEPRECATED : "DEPRECATED"
    },

    registry : {
        kComponents : "components",
        kInterfaces : "interfaces"
    },

    kWildCard : "*",

    functionRegex : /^(.*?)(\((.*?)\))?$/,

    nameSpaceRegex : /^([^\s\r\n\'\"]+)\.([^\s\r\n\'\"]+)$/,


    scriptRegex : /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // regex to match scripts in an html page (source: jquery)

    expressionRegexPattern : /\@\{(.*?)\}/g,

    eventSeparatorMatch : /[^\s,]+/g
};
X.log = X.constants.log;

// class: Options

X.options = {
    appId : null, // Id of the application (used for logging and exporting functionality back into YOUR namespace)

    ABTestConfig : {},

    // logging options --------------------------
    logToConsole : true,
    alertOnExceptions : true,
    exceptionAlerts : [X.log.CRITICAL, X.log.ERROR, X.log.WARN/*, X.log.INFO, X.log.DEPRECATED*/] //show alert messages for execptions thrown in X.  For non-prod only I hope
};




/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * Inspired by base2 and Prototype
 * MIT Licensed.
 *
 * LB: Modified to be strict-mode compliant
 */

(function () {
    /* This is just a quick & dirty way to check if "function decompilation" works.
     * The RegExp.prototype.test method will take the argument and it will convert it to String, the 'xyz' reference inside the function is never evaluated.
     *
     * Why would you have to check this?
     *
     * Because the Function.prototype.toString method returns an implementation-dependent representation of a function,
     * and in some implementations, such older Safari versions, Mobile Opera, and some Blackberry browsers, they don't actually return anything useful.
     *
     */
    var fnTest = /xyz/.test(function () {
        return "xyz";
    }) ? /\b_super\b/ : /.*/;
    var initializing = false;

    // The base Class implementation (does nothing)
    X.Class = function () {
    };

    // Create a new Class that inherits from this class
    X.Class.extend = function extend (prop) {  // LB: name the function so we don't have to refer to callee to make the class extendable
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                              typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) : prop[name];  // jshint ignore:line
        }

        // The dummy class constructor
        function Class () {
            if (!initializing) {
                // All construction is actually done in the 'construct' method
                if (this.construct) {
                    this.construct.apply(this, arguments);
                }
            }
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extend-able
        Class.extend = extend;

        return Class;
    };
})();

X.registry = {
    _register : function (nameSpace, name, componentImpl, dontReplace) {
        var ns = this._createOrFindNameSpace(nameSpace);
        if (X._.has(ns, name)) {
            if (dontReplace) {
                X.trace("registerComponent: Component '" + name + "' already exists. Not replacing", "Registry", X.log.INFO);
                return ns[name];
            }
            X.publishException("X.registry", "Replacing component named: " + name, X.log.INFO);

            delete ns[name];
        }

        ns[name] = componentImpl;

        return componentImpl;
    },

    _get : function (nameSpace, name) {
        if (!this._registry[nameSpace]) {
            X.trace("Request for " + nameSpace + " : " + name + " does not exist", "Registry", X.log.INFO);
            return null;
        }
        else {
            if (!X._.isUndefined(name)) {
                return this._registry[nameSpace][name] || null;
            }
            else {
                return null;
            }
        }
    },

    _getAll : function (nameSpace) {
        if (!this._registry[nameSpace]) {
            return null;
        }
        else {
            return this._registry[nameSpace];
        }
    },

    _getNames : function (nameSpace) {
        if (!this._registry[nameSpace]) {
            return [];
        }
        else {
            return X._.keys(this._registry[nameSpace]);
        }
    },


    _remove : function (nameSpace, name) {
        if (this._registry[nameSpace]) {
            delete this._registry[nameSpace][name];
        }
    },

    _has : function (nameSpace, name) {
        if (this._registry[nameSpace]) {
            return this._registry[nameSpace][name] ? true : false;
        }
        else {
            return false;
        }
    },

    _createOrFindNameSpace : function (nameSpace) {
        if (!this._registry[nameSpace]) {
            this._registry[nameSpace] = {};
        }

        return this._registry[nameSpace];

    },

    _publishException : function (msg) {
        X.publishException("Registry", msg, X.log.WARN);
    },

    _registry : {}
};


X._.extend(X.registry, {


    /**
     * Register any Object and give it a name;
     * This function will export the registered object into YOUR namespace using the value you supplied as your appId
     *
     * @param name
     * @param componentImpl
     * @returns {*} - the registered Object
     */
    registerComponent : function (name, componentImpl, dontReplace) {
        return this._register(X.constants.registry.kComponents, name, componentImpl, dontReplace);
    },

    getComponent : function (name) {
        return this._get(X.constants.registry.kComponents, name);
    }
});
/**
 * Default Data resolver that does nothing
 */
X.registerComponent(X.constants.interfaces.kDataResolver,
    {
        resolveDynamicData : function (inData) {
            return inData;
        }
    }, false);
// class: JSONSerializer
// about:
// Convert a javascript object to a string for sending over the wire as a message
X.utils.jsonSerializer = (function () {
    var _impl = {

        // -------------------------------
        // Function: toString
        // Convert Object to String
        //
        // Parameters:
        //    obj - the object
        // -------------------------------
        toString : function (obj) {

            if (X._.isString(obj)){
                return obj;
            }
            if (window.JSON) {
                return JSON.stringify(obj);
            }

            var t = typeof (obj);
            if (t != "object" || obj === null) {
                // simple data type
                if (t == "string") {
                    obj = '"' + obj + '"';
                }
                return String(obj);
            }
            else {
                // recurse array or object
                var n, v, json = [], arr = (obj && obj.constructor == Array);

                for (n in obj) {
                    v = obj[n];
                    t = typeof(v);
                    if (t == "string") {
                        v = '"' + v + '"';
                    }
                    else if (t == "object" && v !== null) {
                        v = this.toString(v);
                    }
                    else if (t == "function") {
                        continue;
                    }
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }

                return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
            }
        },

        // -------------------------------
        // Function: toJSON
        // Convert String to Object
        //  - nonstrict allows for input that does not conform strictly to the JSON standard
        //    i.e. single quotes or no quotes around names
        //
        // Parameters:
        //    jsonString - the JSON string
        //    nonStrict - boolean value to allow for non-strict parsing
        //    decodeStrings - boolean value to indicate to recursively iterate throught the object decoding strings that may have been encoded
        //
        // Returns
        //  JSON object if passed in string is valid
        //  empty object if passed in string is invalid
        //  the passed in string if it is not an string or empty
        // -------------------------------
        toJSON : function (jsonString, nonStrict, decodeStrings) {

            if (typeof jsonString !== "string" || !jsonString) {
                return jsonString;
            }

            var json = {};

            // Make sure leading/trailing whitespace is removed (IE can't handle it)
            // For some odd reason, Mozilla barf on a null character at the end of a request.
            // This'll need to be fixed, but in the interum we'll just strip it.
            jsonString.trim();
            jsonString = jsonString.replace(/\0$/, "");

            try {
                // Attempt to parse using the native JSON parser first
                if (window.JSON && !nonStrict) {
                    json = JSON.parse(jsonString);
                }
                else {
                    json = ( new Function("return " + jsonString) )();  // jshint ignore:line
                }
            }
            catch (ex) {
                X.publishException("X.utils.jsonSerializer", "Invalid JSON\n" + jsonString, X.log.ERROR, ex);
            }

            if (decodeStrings) {
                return X.utils.jsonSerializer.decodeJSONObj(json);
            }
            else {
                return json;
            }

        }

    };


    return _impl;
})();
	
   

X._.extend(X.utils, {
    /**
     }
     * get the element as a X.$
     */
    get$ : function (container) {
        if (X.$.zepto.isZ(container)) {
            return container;
        }
        else if (typeof jQuery != 'undefined' && container instanceof jQuery) { /* jshint ignore:line */
            return X.$(container[0]);
        }
        else if (X._.isString(container)) {
            return X.$("#" + container);
        }
        else {
            return X.$(container);
        }
    },

    extend_$ : function (extObj) {
        X.$.fn.extend(extObj);
        if (typeof jQuery != 'undefined') {
            jQuery.fn.extend(extObj); /* jshint ignore:line */
        }
    }
});
// NB some code from diveintohtml5.org <http://diveintohtml5.org/>
// extend X.$.support functionality for input types and attributes
(function ($) {
    $.extend($.support, (function () {
        var i, j;
        var input = document.createElement('input'),
            inputtypes = 'search number range color tel url email date month week time datetime datetime-local',
            inputattrs = 'autocomplete autofocus list placeholder max min multiple pattern required step';

        return {
            inputtypes : (function () {
                var types = inputtypes.split(' '),
                    ret = {};
                for (i = 0, j = types.length; i < j; i++) {
                    input.setAttribute('type', types[i]);
                    ret[types[i]] = (input.type !== 'text');
                }
                return ret;
            })(),

            input : (function () {
                var attrs = inputattrs.split(' '),
                    ret = {};

                for (i = 0, j = attrs.length; i < j; i++) {
                    ret[attrs[i]] = !!(attrs[i] in input);
                }
                return ret;
            })()
        };
    })());

})(X.$);

X.utils.extend_$({
    scrollTo : function (to, duration){
        var $el = this;
        var start = $el.scrollTop(),
            change = to - start,
            increment = 20;

        var animateScroll = function(elapsedTime) {
            elapsedTime += increment;
            var position = _easeInOut(elapsedTime, start, change, duration);
            $el.scrollTop(position);
            if (elapsedTime < duration) {
                setTimeout(function() {
                    animateScroll(elapsedTime);
                }, increment);
            }
        };

        animateScroll(0);

        function _easeInOut(currentTime, start, change, duration) {
            currentTime /= duration / 2;
            if (currentTime < 1) {
                return change / 2 * currentTime * currentTime + start;
            }
            currentTime -= 1;
            return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
        }
    },

    isTextInput : function () {
        var texttypes = 'text password hidden search number color tel url email date month week time datetime datetime-local'.split(" "),
            $el = X.$(this);
        if ($el.is("textarea")) {
            return true;
        }
        else if ($el.is("input") && X._.contains(texttypes, $el.attr("type"))) {
            return true;
        }
        return false;
    },
    isUserInputElement : function () {
        var $el = X.$(this);
        return ($el.is("input") || $el.is("select") || $el.is("textarea") );
    },

    //Helper Function for Caret positioning
    caret : function (begin, end) {
        var range;

        // check to see if the dom element supports selection
        var ok = (/text|password|search|tel|url/).test(this[0].type);
        if (!ok) {
            return {begin : 0, end : 0};
        }

        if (this.length === 0 || this.is(":hidden")) {
            return;
        }

        if (typeof begin == 'number') {
            var _end = (typeof end === 'number') ? end : begin;
            return this.each(function () {
                if (this.setSelectionRange) {
                    this.setSelectionRange(begin, _end);
                }
                else if (this.createTextRange) {
                    range = this.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', _end);
                    range.moveStart('character', begin);
                    range.select();
                }
            });
        }
        else {
            if (this[0].setSelectionRange) {
                begin = this[0].selectionStart;
                end = this[0].selectionEnd;
            }
            else if (document.selection && document.selection.createRange) {
                range = document.selection.createRange();
                begin = 0 - range.duplicate().moveStart('character', -100000);
                end = begin + range.text.length;
            }
            return { begin : begin, end : end };
        }
    },

    /**
     * Un bind from Xinch.$ events and Xinch events to avoid memory leaks
     * @param excludeSelf - [boolean]
     */
    detach : function (excludeSelf) {
        var container = this.get(0);
        X.unsubscribeIf(function (context) {
                if (context) {
                    if (context.nodeType === 1 || context.nodeType === 3) {  // element node or text node

                        if (excludeSelf && X.$.contains(container, context) && container !== context) {
                            X.$(context).off();
                            return true;
                        }

                        else if (!excludeSelf && (X.$.contains(container, context) || (context === container))) {
                            X.$(context).off();
                            return true;
                        }

                    }

                }
                return false;
            }
        );
    }
});
/*
 // Events module from Backbone.Events
 // Original author: Jeremy Ashkenas.
 // Modified at Intuit: added namespaced event support, removed space-separated multi-event and event-map stuff
 // ---------------
 //
 // A module that can be mixed in to *any object* in order to provide it with
 // custom events. You may bind with `on` or remove with `off` callback
 // functions to an event; `trigger`-ing an event fires all callbacks in
 // succession.
 //
 //     var object = {};
 //     _.extend(object, X.utils.events);
 //     object.on('expand', function(){ alert('expanded'); });
 //     object.trigger('expand');
 * ---------------
 *
 * namespaces are created by adding a period after the event type.
 *
 * for example, a listener that subscribes to "change.aaa.bbb" will be called when any of these are triggered:
 *      "change", "change.aaa", "change.aaa.bbb", "change.aaa.bbb.ccc", etc.
 * that same listener will NOT be called when these are triggered:
 *      "change.bbb", "change.bbb.aaa", "change.ccc"
 *
 * note the slight difference between X.$ event namespaces and the way they are treated here.
 * in X.$, "change.bbb.aaa" is considered the same as "change.aaa.bbb".  in this case they're considered different.
 *
 */

X.events.Events = (function () {
    var _ = X._;
    var Events = {

        // Bind an event to a `callback` function. Passing `"all"` will bind
        // the callback to all events fired.
        on : function (name, callback, context, param) {
            var self = this;
            if (!name || !callback) {
                X.publishException("PubSub", "Invalid subscribe: missing event name or callback ");

                return self;
            }
            var evts = name.match(X.constants.eventSeparatorMatch);

            _.each(evts, function (evt) {
                var onEvent = _parseEventName(evt);

                self._events = self._events || {};
                if (!self._events[onEvent.type]) {
                    self._events[onEvent.type] = [];
                }
                self._events[onEvent.type].push(
                    {
                        type : onEvent.type,
                        namespace : onEvent.namespace,
                        callback : callback,
                        context : context,
                        ctx : context || self,
                        param : param
                    });
            });
            return self;
        },

        // Remove one or many callbacks. If `context` is null, removes all
        // callbacks with that function. If `callback` is null, removes all
        // callbacks for the event. If `name` is null, removes all bound
        // callbacks for all events.
        off : function (name, callback, context) {
            var retain, ev, events, types, type, i, l, j, k;
            if (!this._events) {
                return this;
            }
            if (!name && !callback && !context) {
                this._events = {};
                return this;
            }

            var self = this;
            var eventList = name ? name.match(X.constants.eventSeparatorMatch) : _.keys(this._events);

            _.each(eventList, function (evt) {
                var offEvent = _parseEventName(evt);

                type = [offEvent.type];
                events = self._events[type];
                if (events) {
                    self._events[type] = retain = [];
                    for (j = 0, k = events.length; j < k; j++) {
                        ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                            (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                        else if (offEvent.namespace &&
                                 (!ev.namespace || (ev.namespace + '.').indexOf(offEvent.namespace + '.') < 0)) {
                            retain.push(ev);
                        }
                    }
                    if (!retain.length) {
                        delete self._events[type];
                    }
                }

            });

            return this;
        },


        // passes each event object to the optional function.
        // returns the total event count.
        debug : function (fn) {
            var totalEvents = 0;
            _.each(this._events, function (eventsForType, type) {
                totalEvents += eventsForType.length;
                //console.log(type + ": ", eventsForType.length);
                if (_.isFunction(fn)) {
                    _.each(eventsForType, function (ev) {
                        fn(ev);
                    });
                }
            });

            return totalEvents;
        },

        // Bind an event to only be triggered a single time. After the first time
        // the callback is invoked, it will be removed.
        once : function (name, callback, context, param) {
            if (!callback) {
                return this;
            }
            var self = this;
            var once = _.once(function () {
                self.off(name, once);
                callback.apply(this, arguments);
            });
            once._callback = callback;
            return this.on(name, once, context, param);
        },


        offIfContextCondition : function (fn) {
            var events, types, eventType;

            if (!_.isFunction(fn) || !this._events) {
                return this;
            }

            types = _.keys(this._events);
            for (var idx = 0; idx < types.length; idx++) {
                eventType = types[idx];

                events = this._events[eventType];
                if (events) {

                    // based on the context, keep all the events in the list that don't match the condition passed in.
                    this._events[eventType] = X._.filter(this._events[eventType], function (ev) {
                        var remove = fn(ev.context);
                        return !remove;
                    }); // jshint ignore:line

                    // if the list is empty after all of this, remove it. Its just noise at this point.
                    if (!this._events[eventType]) {
                        delete this._events[eventType];
                    }
                }
            }

            return this;
        },

        // Trigger one or many events, firing all bound callbacks. Callbacks are
        // passed the same arguments as `trigger` is, apart from the event name
        // (unless you're listening on `"all"`, which will cause your callback to
        // receive the true name of the event as the first argument).
        trigger : function (name) {
            //console.log("trigger:", name);
            var events;
            if (!this._events) {
                return this;
            }
            var payload_s = [].slice.call(arguments, 1);

            var trigEvent = _parseEventName(name);
            if (trigEvent.namespace) {
                // if triggered event has a namespace, find all the events that match it (those that start with the same namespace)
                events = _.filter(this._events[trigEvent.type], function (e) {
                    return !e.namespace || (trigEvent.namespace + '.').indexOf(e.namespace + '.') === 0;
                });
            }
            else {
                // no namespace in triggered event: only listeners that have no namespace will be triggered
                events = _.filter(this._events[trigEvent.type], function (e) {
                    return !e.namespace;
                });
            }

            var allEvents = this._events.all;
            if (events) {
                _triggerEvents(events, payload_s);
            }
            if (allEvents) {
                _triggerEvents(allEvents, arguments);
            }
            return this;
        },

        // Tell this object to stop listening to either specific events ... or
        // to every object it's currently listening to.
        stopListening : function (obj, name, callback) {
            var listeners = this._listeners;
            if (!listeners) {
                return this;
            }
            var deleteListener = !name && !callback;
            if (typeof name === 'object') {
                callback = this;
            }
            if (obj) {
                (listeners = {})[obj._listenerId] = obj;
            }
            for (var id in listeners) {
                listeners[id].off(name, callback, this);
                if (deleteListener) {
                    delete this._listeners[id];
                }
            }
            return this;
        }

    };


    // A difficult-to-believe, but optimized internal dispatch function for
    // triggering events. Tries to keep the usual cases speedy (most internal
    // Events have 1 or 2 arguments).
    var _triggerEvents = function (events, customArgs) {
        var ev, eventIndex = -1, numEvents = events.length, a1 = customArgs[0], a2 = customArgs[1], a3 = customArgs[2];
        switch (customArgs.length) {
            case 0:
                while (++eventIndex < numEvents) {
                    ev = events[eventIndex];
                    if (ev.param) {
                        ev.callback.call(ev.ctx, ev.param);
                    }
                    else {
                        ev.callback.call(ev.ctx);
                    }
                }
                return;
            case 1:
                while (++eventIndex < numEvents) {
                    ev = events[eventIndex];
                    if (ev.param) {
                        ev.callback.call(ev.ctx, a1, ev.param);
                    }
                    else {
                        ev.callback.call(ev.ctx, a1);
                    }
                }
                return;
            case 2:
                while (++eventIndex < numEvents) {
                    ev = events[eventIndex];
                    if (ev.param) {
                        ev.callback.call(ev.ctx, a1, a2, ev.param);
                    }
                    else {
                        ev.callback.call(ev.ctx, a1, a2);
                    }
                }
                return;
            default:
                while (++eventIndex < numEvents) {
                    ev = events[eventIndex];
                    if (ev.param) {
                        var evArgs = (customArgs.slice()).concat(ev.param);
                        ev.callback.apply(ev.ctx, evArgs);
                    }
                    else {
                        ev.callback.apply(ev.ctx, customArgs);
                    }
                }
        }
    };

    // split an event name into a type and a namespace.
    // the namespace is everything after the first '.' if it exists.
    var _parseEventName = function (name) {
        var dotIndex, type, namespace;
        if (name === undefined) {
            return {};
        }
        if (!_.isString(name)) {
            name = name.toString();
        }
        dotIndex = name.indexOf('.');
        if (dotIndex >= 0) {
            namespace = name.substr(dotIndex);
            type = name.substr(0, dotIndex);
        }
        else {
            namespace = undefined;
            type = name;
        }
        return {type : type, namespace : namespace};
    };

    var listenMethods = {listenTo : 'on', listenToOnce : 'once'};

    // Inversion-of-control versions of `on` and `once`. Tell *this* object to
    // listen to an event in another object ... keeping track of what it's
    // listening to.
    _.each(listenMethods, function (implementation, method) {
        Events[method] = function (obj, name, callback) {
            var listeners = this._listeners || (this._listeners = {});
            var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
            listeners[id] = obj;
            if (typeof name === 'object') {
                callback = this;
            }
            obj[implementation](name, callback, this);
            return this;
        };
    });

    return Events;
})();

//============================================================================
// class: Exception
// about:
//  Object to encapsulate Errors generated in the Mojo Framework
//
// Copyright <c> 2012-2013 Intuit, Inc. All rights reserved
//============================================================================

X.events.exception = X.Class.extend({
    // -------------------------------
    // Function: construct
    // construct the exception
    //
    // Parameters:
    //   component - a string to identify the component
    //   msg - the string error message
    //   type - the string error type
    //   ex - the optional exception to be thrown
    // -------------------------------
    construct: function (component/*string*/, msg /*string*/, type/*string*/, ex /*optional - exception thrown*/) {
        this.component = component;
        this.msg = msg;
        this.logType = type ? type : X.log.ERROR;
        this.exeptionObj = ex;
        this.context = [];
    },

    // -------------------------------
    // Function: addContext
    // set the context
    //
    // Parameters:
    //   ctx - the context to set
    // -------------------------------
    addContext: function (ctx) {
        this.context.push(ctx);
    },

    // output a string representation of the exception.
    // this function is needed in order to see a meaningful error in the browser's console
    toString: function() {
        return "Exception: " + this.msg;
    }
});

X.Exception = X.events.exception;

/* class: EventPubSub
 *
 * about:
 * 	This is a singleton javascript class that
 *  provides functionality for managing the publication/subscription model for UI related events
 *
 *  Notes:
 *      Garbage collection in JS is reference counted so a JS object wont get collected if there is a reference to it here in the pub/sub
 *      We have to unsubscribe it so it removes the reference and it can be collected.
 */
X.events.pubsub = (function () {
    var _dispatcher = X._.clone(X.events.Events);

    var _exports = {

        /***********************************************************************
         * subscribe to the event; sign up for notification that an event has occurred
         *
         * @param type - the event to subscribe to
         * @param callback - the callback function
         * @param context - the context (value of 'this' when callback is called)
         * @param param - optional parameter that gets passed as the last arg to the callback
         */
        subscribe : function (type, callback, context, param) {
            _dispatcher.off(type, callback, context);  // prevent duplicate subscriptions
            _dispatcher.on(type, callback, context, param);
        },

        /***********************************************************************
         * Bind an event to only be triggered a single time. After the first time
         * the callback is invoked, it will be removed.
         *
         * @param type - the event to subscribe to
         * @param callback - the callback function
         * @param context - the context (value of 'this' when callback is called)
         * @param param - optional parameter that gets passed as the last arg to the callback
         */
        once : function (type, callback, context, param) {
            _dispatcher.once(type, callback, context, param);
        },

        /***********************************************************************
         * unsubscribe;
         *      If the first parameter is passed and its an object or function, we'll assume its context.
         *          Remove all listeners that have the given context
         *      If more than one parameter is passed the first one will the the event type.
         *          Remove one or many callbacks. If `context` is null, removes all
         *          callbacks with that function. If `callback` is null, removes all
         *          callbacks for the event. If `name` is null, removes all bound
         *          callbacks for all events.
         * @param typeOrContext
         * @param callback
         * @param context
         */
        unsubscribe : function (typeOrContext, callback, context) {
            if (typeOrContext) {
                // its context that was passed, remove all listeners from that context
                if (X._.isObject(typeOrContext)) { // object or function
                    _dispatcher.off(null, null, typeOrContext);
                }
                // unsubscribe from the event accordingly
                else {
                    _dispatcher.off(typeOrContext, callback, context);
                }
            }

        },


        /***********************************************************************
         * Used for unsubscribing listeners based whether their context meets certain criteria.
         * For example, a function could be passed in to test whether the context is an html element,
         * and if so whether it's still attached to the DOM.
         *
         * @param fn - the condition to test the context for
         *             the fn will be passed the context as a parameter
         */
        unsubscribeIf : function (fn) {
            if (typeof fn === "function") {
                _dispatcher.offIfContextCondition(fn);
            }
        },


        /***********************************************************************
         * publish Event; notify all subscribers that an event has happened
         *
         * @param type - the event to publish
         * @param arg1, arg2, arg3,... - optional arguments
         */
        publish : function (type) {
            var arr = [].slice.call(arguments); // arr includes type and optional args
            _dispatcher.trigger.apply(_dispatcher, arr);
            X.trace("Event published: " + arguments[0], "EVENT");
        },

        /***********************************************************************
         *   Debug
         */
        debug : function (fn) {
            return _dispatcher.debug(fn);
        }
    };

    return _exports;
})();


/*
 *    The main API to the pubsub module
 */

// set up pubsub namespaces
X.events = X.events || {};

// Extend the core with the pubsub API
X._.extend(X, X.events.pubsub);
X._.extend(X, {
    /**
     * Publish an exception
     *
     * @param component
     * @param msg
     * @param logType
     * @param ex - optional javascript exception
     */
    publishException : function (component, msg, logType, ex) {
        if (component instanceof X.Exception) {
            X.publish(X.constants.events.kException, component);
        }
        else {
            X.publish(X.constants.events.kException, new X.Exception(component, msg, logType || X.log.ERROR, ex));
        }
    },

    // support legacy
    publishEvent : function () {
        X.publish.call(X.events.pubsub, arguments);
    },
    subscribeForEvent : function () {
        X.subscribe.call(X.events.pubsub, arguments);
    }

});


// Set up listeners for events
X.subscribe(X.constants.events.kException,
    /**
     * Handle exceptions that are thrown in the application.
     * @param exception
     */
    function handleException (exception /*X.Exception Obj*/) {
        if (!exception) {
            X.trace("Exception thrown with no data.");
            return;
        }

        var message = "Application (" + X.options.appId + ") " + exception.logType + ": Component=" +
                      exception.component + " Msg=" + exception.msg;

        if (exception.exeptionObj) {
            message += "\nCaused by:\n" + exception.exeptionObj.message;
        }

        if (X.options.alertOnExceptions && X._.contains(X.options.exceptionAlerts, exception.logType)) {
            alert(message);
        }
    }, X);

/***
 *  Css Loader: dynamically loads css files
 *    will check if it's already loaded
 *  EXAMPLE:
 *      new CssLoader("CSS/TTWFramework.css", function (response) {
 *          ... response true if successful ...
 *      });
 *  NOTE:
 *      not a singleton like most of our other stuff
 *      allows independent tracking of multiple load requests simultaneously
 *  WARNING:
 *      This doesn't not currently handle 404s appropriately
 */
    // TODO: write unit tests for this using phantom js
X.loaders.CssLoader = (function () {

    var _instance = {
        /**
         * Dynamically load a javascript file
         *    - if file is already in memory, it will not load it again
         *    - will publish an exception if the file cannot be found or if the file cannot be parsed as a valid script
         *
         * @param pathToCSS – URI to find the css file
         * @param fileId – id to assign to the css file [optional]
         * @param media – media tyle to assign to the CSS file [optional] - defaults to 'screen'
         *
         *@returns nothing
         */
        load : function (/*css file name*/filePath, id, media) {

            // Check if the file has already been loaded
            if (!_isStyleLoaded(filePath)) {
                // method found here: http://www.backalleycoder.com/2011/03/20/link-tag-css-stylesheet-load-event/
                var head = document.getElementsByTagName('head')[0], // reference to document.head for appending/ removing link nodes
                    link = document.createElement('link');           // create the link node
                link.setAttribute('href', filePath);
                link.setAttribute('rel', 'stylesheet');
                link.setAttribute('type', 'text/css');
                link.setAttribute('id', id ? id : "");
                link.setAttribute('media', media ? media : "screen");


                head.appendChild(link);
                X.trace("CSS Loaded: " + filePath, "CssLoader");

// TODO - check for 404
//                var img = document.createElement('img');
//                img.onerror = function () {
//                    (X._.isFunction(callBack)) ? callBack(_isStyleLoaded(filePath)) : '';
//                };
//                img.src = filePath;
            }
            else {
                X.trace("CSS Already Loaded: " + filePath, "CssLoader");
            }

            return X.$.Deferred().resolve().promise();
        }
    };


    /**
     * check if the stylesheet was loaded
     * - WARNING: if the file is not found the browser still adds it to the document.styleSheet array
     * @returns {boolean}
     */
    function _isStyleLoaded (filePath) {
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i].href;
            var cleanFilePath = filePath.replace(new RegExp("\\.\\./", "g"), "");
            if (sheet && sheet.indexOf(cleanFilePath) !== -1) {
                return true;
            }
        }
        return false;
    }

    return _instance;
})();
/***
 *  HTML Loader: dynamically loads html files
 */
X.loaders.HTMLLoader = (function () {

    var _instance = {

        /***
         * Load a specific html file from the server and execute the provided callback function.
         * @param url  View Reference.
         * @param hash load the snippet of the HTML associated with the hash #
         *
         * @return promise, resolved with raw HTML, rejected with an Exception
         */
        load : function (url, hash) {
            var promise = X.$.Deferred();

            // Make sure a valid viewReference is passed in and resolve the passed view reference.

            // Use X.$ to get the HTML from the server.
            X.$.ajax({
                url : url,
                success : function (data) {
                    if (hash) {
                        var htmlSnippet,
                            $el = X.$(data);
                        if ($el.attr('id') === hash) {
                            htmlSnippet = $el;
                        }
                        else {
                            htmlSnippet = $el.find("#" + hash).filter("#" + hash);
                        }
                        if (htmlSnippet.length > 0) {
                            data = htmlSnippet[0].outerHTML;
                        }
                        else {
                            _publishError("Error loading HTML: '" + url + "' could not find the Hash: '" + hash +
                                          "' in Page: " + url);
                        }
                    }
                    promise.resolve(data);
                },
                error : function (xhr, textStatus, error) {

                    var ex = new X.Exception("HTMLLoader", "Error Details: " + "Error loading HTML page: " + url + "  Status: " + xhr.status + " Details: " +
                                                                         textStatus, X.log.ERROR);

                    _publishError("Error loading HTML page: " + url + "  Status: " + xhr.status + " Details: " +
                                  textStatus, error);

                    promise.reject(ex);
                }
            });


            return promise.promise();
        },

        /***
         * Function to take in raw html, strip out and add all javascript to global.  Then load the clean html into the provided container.
         * @param {Object} paramObject -  An object that should contain the following:
         *  - html: Raw html to be processed.
         *  - container: DOM container to load the html in.
         *  - ref: View Reference (Used for error logging).
         */
        injectHTML : function (paramObject) {
            var $container,
                rawHTML = paramObject.html;

            // Pull out the scripts
            // We'll do it here because some older browsers can't do it using X.$'s html() function.
            var htmlWithoutScripts = rawHTML.replace(X.constants.scriptRegex, "");
            var scripts = rawHTML.match(X.constants.scriptRegex);

            _evaluatePageScripts(scripts, paramObject.ref);

            // Inject the HTML without the scripts if there is a provided container.
            if (paramObject.container) {
                $container = X.utils.get$(paramObject.container);
                $container.html(htmlWithoutScripts);
            }
        }

    };

    //------- PRIVATE -------------------------------------------

    /***
     * Evaluate any scripts on a page.
     * Do this because X.$ struggles getting it to work with old android devices, IOS4, and some safari browsers
     * @param scripts
     * @param htmlPage
     * @private
     */
    function _evaluatePageScripts (scripts, htmlPage) {

        X._.each(scripts, function (script) {
            try {
                if (_isExternScript(script) || !_isJavaScript(script)) {
                    // Append external scripts and non-javascript so the browser can handle those
                    // First check for and remove a previous copy of the script that might have been appended already
                    var $script = X.$(script);
                    var scriptId = $script.attr('id');
                    if (scriptId) {
                        var existingScript = document.getElementById(scriptId);
                        if (existingScript && (existingScript.nodeName === $script.get(0).nodeName) && (existingScript.type === $script.get(0).type)) {
                            existingScript.parentNode.removeChild(existingScript);
                        }
                    }
                    X.$("body").append(script);
                }
                else {
                    // Extract and evaluate the script inside the <script> tag
                    var scriptText = script.substring(script.indexOf(">") + 1, script.lastIndexOf("<"));
                    X.$.globalEval(scriptText);
                }
            }
            catch (ex) {
                _publishError("Failed to evaluate scripts in: " + htmlPage, ex);
            }
        }, this); // jshint ignore:line

    }

    /***
     * determine if the script is a JavaScript, as opposed to a template or something else
     * @param script
     * @private
     */
    function _isJavaScript (script) {
        var openTag = script.substring(0, script.indexOf(">") + 1);
        return (!/ type/i.test(openTag) || /javascript/i.test(openTag) || (/ecmascript/i.test(openTag)));
    }

    /***
     * determine if a script is external
     * @param script
     * @private
     */
    function _isExternScript (script) {
        var openTag = script.substring(0, script.indexOf(">") + 1);
        return (/ src\s*=/i.test(openTag));
    }

    /***
     * Publish an Exception with message.
     * @param msg - Error Message
     * @param ex - Exception
     * @private
     */
    function _publishError (msg, ex) {
        X.publishException("HTMLLoader", "Error Details: " + msg, X.log.ERROR, ex);
    }


    return _instance;

})();
/***
 *  JSON Loader: dynamically loads json files
 *
 */
    // TODO: write unit tests for this using phantom js
X.loaders.JSONLoader = (function () {

    var _instance = {
        /**
         * Dynamically load a javascript file
         *    - if file is already in memory, it will not load it again
         *    - will publish an exception if the file cannot be found or if the file cannot be parsed as a valid script
         *
         * @param fullPath – URI to find the css file
         *
         *@ returns promise, resoved with JSON object, rejected with an Exception
         */
        load : function (/*json file name*/fullPath) {
            var promise = X.$.Deferred();
            X.$.ajax({
                url : fullPath,
                dataType : "json",
                success : function (data) {
                    /*
                     * if the server sends a response header of application/json, the data will already be a json object.
                     * otherwise, it needs to be parsed before sending to the callback.
                     */
                    var JSONobj;
                    if (typeof(data) === "string") {
                        JSONobj = X.utils.jsonSerializer.toJSON(data);
                    }
                    else {
                        JSONobj = data;
                    }
                    promise.resolve(JSONobj);
                },
                error : function (xhr, status, statusTxt) {
                    var ex;
                    if ("parsererror" === status) {
                        ex = new X.Exception("JSONLoader", "Parse Error: " + fullPath + " - Context: " + statusTxt, X.log.ERROR);
                    }

                    else {
                        ex = new X.Exception("JSONLoader", "Load Error: " + fullPath + " - Context: " + statusTxt, X.log.ERROR);
                    }
                    promise.reject(ex);
                }
            });


            return promise.promise();
        }
    };

    return _instance;
})();
/* X.loaders.JSLoader
 * 	This is a singleton javascript class that
 *  provides functionality for dynamically loading javascript files into the DOM
 *
 *   -- This class loads the JS file ASYNCRONOUSLY.
 *	 -- It will not load a file if it is already in memory
 *   -- NOTE: Safari webkit has some wierdities dynamically evaling a function directly into the DOM
 *     - some notes for creating dynamicly loaded js files for safari
 *        - dont use use the 'var' keyword when defining variables
 *        - use the  foo = function () ...  instead of function foo () to define functions
 *
 */

X.loaders.JSLoader = (function () {

    var _instance = {
        /**
         * Dynamically load a javascript file
         *    - if file is already in memory, it will not load it again
         *    - will publish an exception if the file cannot be found or if the file cannot be parsed as a valid script
         *
         * @param fullPath – URI to find the javascript file
         *
         *@returns promise
         */
        load : function (fullPath) {
            var DO = X.$.Deferred();
            var alreadyLoaded = false;

            if (!_initialized) {
                _init();
            }

            // Check if the file has already been loaded
            for (var i = 0; i < _scriptNames.length; i++) {
                var fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1, fullPath.length);
                // If the specified script is already loaded, call the callback method and exit function
                if (_scriptNames[i] == fileName) {
                    X.trace("Script Already Loaded: " + fullPath, "JSLoader");
                    alreadyLoaded = true;
                    DO.resolve(true);
                    break;
                }
            }

            if (!alreadyLoaded) {
                X.$.ajax({
                    type : "GET",
                    url : fullPath,
                    dataType : "script",
                    success : function (scriptText, textStatus, jqxhr) {
                        try {
                            //eval it for us
//                            X.$.globalEval(scriptText);
                            X.trace("Script Loaded: " + fullPath, "JSLoader");
                            _scriptNames.push(fullPath);
                            DO.resolve(true);
                        }
                        catch (ex) {
                            X.publishException("JSLoader", "Failed to execute loaded script: " + fullPath, X.log.ERROR, ex);
                            DO.reject();
                        }

                    },
                    error : function (jqxhr, status, exception) {
                        X.publishException("JSLoader", "Failed to load script: " + fullPath, X.log.ERROR, exception);
                        DO.reject();
                    }
                });
            }


            return DO.promise();

        }
    };

    //-------------------------------------------------------------------------------------
    // PRIVATE STUFF  - dont look below this line for your API!
    //		- not included in the public API returned in the _instance Object
    //-------------------------------------------------------------------------------------

    var _scriptNames = [];
    var _initialized = false;

    //-----------------------------------------------------------------------------------
    function _init () {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++)
            if (scripts[i].src.length > 0) {
                var s = scripts[i].src;
                s = s.substring(s.lastIndexOf('/') + 1, s.length);
                _scriptNames.push(s);
            }
        _initialized = true;
    }

    // Return our Singleton
    return _instance;
})();



//---------------------------------------
// class: ObjectExtensions
// about:
// Extend existing javascript primitives
//
//  !!NOTE : Do me a favor and dont extend the Array object
//           It adds enumerable properties to the array that get processed in 'for in' loops
//           Using Object.defineProperty wont work in all IE versions, so lets just stay away from extending the Array class.
//---------------------------------------

//------------------------------------------------
// Function:  Date.prototype.yyyymmdd
// add additional attributes to the Date
//------------------------------------------------
Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
};

//------------------------------------------------
// Function: String.prototype.toNum
// String: converts a string to num
//
// Parameters:
//    bEmptyAsValid - boolean to treat null and empty as 0
//------------------------------------------------
String.prototype.toNum = function (/*treat null+empty as 0*/bEmptyAsValid) {
    if (this && this.length > 0) {
        // remove all crap
        var isNeg = this.charAt(0) === "-";
        var nVal = this.replace(/[^0-9.]/gi, "");
        nVal = parseFloat(nVal);
        if (isNaN(nVal)) {
            return NaN; // don't return null, isNaN(null) returns false (so is null a Number???)
        }
        else {
            return (isNeg) ? 0 - nVal : nVal;
        }
    }

    return bEmptyAsValid ? 0 : null;
};


//------------------------------------------------
// Function: String.prototype.toDate
// String: try and convert a formatted string to a Date object
// Use the mask to figure out how the value is formatted
// Can return an invalid date if not formatted properly
//------------------------------------------------
String.prototype.toDate = function () {
    // MM/DD/YYYY or MM-DD-YYYY
    var parts = this.match(/(\d{2})[\/|\-](\d{2})[\/|\-](\d{4})/);
    if (parts) {
        return new Date(parts[3], parts[1] - 1, parts[2]);
    }
    // YYYY-MM-DD or YYYY/MM/DD
    parts = this.match(/(\d{4})[\/|\-](\d{2})[\/|\-](\d{4})/);
    if (parts) {
        return new Date(parts[1], parts[2] - 1, parts[3]);
    }
    // MM/YYYY or MM-YYYY
    parts = this.match(/(\d{2})[\/|\-](\d{4})/);
    if (parts) {
        return new Date(parts[2], parts[1] - 1, 1);
    }

    // MM/YY or MM-YY
    parts = this.match(/(\d{2})[\/|\-](\d{2})/);
    if (parts) {
        return new Date("20" + parts[2], parts[1] - 1, 1);
    }

    // YYYY
    if (this.match(/\d{4}/)) {
        return new Date(this, 0, 1);
    }

    return new Date(this); // Try and convert, may be invalid
};

//------------------------------------------------
// If trim is not supported
if (!String.prototype.trim) {
    // Function: String.prototype.trim
    // String: gets rid of leading and trailing spaces
    String.prototype.trim = function () {

        if (this && this.length > 0) {
            return this.replace(/^[\s]+|[\s]+$/g, "");
        }

        return "";
    };
}

//------------------------------------------------
// Function: String.prototype.removeQuotes
// String: remove surrounding quote marks
//------------------------------------------------
String.prototype.removeQuotes = function () {
    if (this.length === 0) {
        return;
    }
    return this.replace(/^["|'](.*?)["|']$/, "$1");
};



X.utils.Profiler = function (profileName) {

    var _instance = {

        reset : function () {
            _start = new Date();
            _marks = {};
            _data = {};
        },

        mark : function (markName, inTime /*if passed in, use it instead of new date */) {
            _marks[markName] = inTime ? inTime : new Date();
        },

        captureTimeFromMark : function (captureName, markName) {
            if (markName)
                _data[captureName] = new Date() - _marks[markName];
            else
                _data[captureName] = new Date() - _start;
        },

        getCapture : function (captureName) {
            return _data[captureName];
        },

        setName : function (name) {
            _profileName = name;
        },

        getName : function () {
            return _profileName;
        },

        serialize : function () {
            return _profileName + " : " + X.utils.jsonSerializer.toString(_data);
        }
    };

    var _profileName = profileName,
        _marks = {},
        _data = {},
        _start = new Date();

    return _instance;
};
// This blows in IE (of course) but not consistently (of course)
// X.utils.uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}
X._.extend(X.utils, {

    uuid : function (lastSignificant) {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        var parts = uuid.split("-");
        return lastSignificant ? parts[parts.length - 1] : uuid;
    }
});
/**
 * Utility library
 */
X._.extend(X.utils, {

    //------------------------------------------------------
    // Utility function to covert a string into an
    // existing class function
    // May return null if no function exists in the namespace
    //------------------------------------------------------
    stringToFunction : function (str, context) {
        var arr = str.split(".");

        var fn = (context || window);
        for (var i = 0, len = arr.length; i < len; i++) {
            fn = fn[arr[i]];
            if (typeof fn === 'undefined') {
                return undefined;
            }
        }
        return fn;
    },


    // -------------------------------
    // Function: evaluateSimpleOperand
    // Figure out what type of operands we're dealing with
    // This version does NOT support operands that are themselves expressions using action expression syntax
    // If it is a reference to a model value, get it
    // If it is an array, turn it into one,
    // Otherwise
    // See if we can convert it to a number, if so do it
    // otherwise treat is as a string
    //
    // Parameters:
    // operand - the argument to be evaluated to its primitive type
    // -------------------------------
    evaluateSimpleOperand : function (operand) {

        // Does the string represent an object
        var _isObject = function (inString) {
            return inString.match(/^\[(.*?)\]$/) || inString.match(/^\{(.*?)\}$/);
        };

        if (!operand) {
            return operand;
        }

        var v = operand; // default for object, boolean, string

        // Resolve any dynamic text/model refs and turn into an object if need be
        v = X.resolveDynamicData(v);

        if (X._.isString(v) && _isObject(v)) {
            v = X.utils.jsonSerializer.toJSON(v, true);

        }

        // turn true | false strings into booleans
        if (v === "true") {
            return true;
        }
        if (v === "false") {
            return false;
        }

        if (v && typeof v === "string") {
            try {
                v = decodeURIComponent(v); // unescape anything that may have been put in there
            }
            catch (ex) {
                // will fail if v has '%' but not a valid encoded string - leave it as is
            }
            // Turn the value into a number if applicable
            if (!isNaN(v.replace(/\,/g, ""))) {
                return parseFloat(v.replace(/\,/g, ""));
            }
            else {
                // strip thr surrounding quotes, if found
                var inQuotes = v.match(/^'(.*)'$/) || v.match(/^"(.*)"$/);
                return inQuotes ? inQuotes[1] : v;
            }
        }

        // if we got this far, it could be a number or an empty string
        return v;
    },

    /**
     * Replace a character that appears within parenthesis in a given string
     * @param str - the string to search and replace within
     * @param charToReplace - the character to replace
     * @param replacement - the replacement for the character
     * @return - the new string
     */
    replaceCharWithinParenthesis : function (str, charToReplace, replacement) {
        var newStr = "";
        var parenCount = 0;
        for (var i = 0; i < str.length; i++) {
            var currChar = str.charAt(i);
            if (currChar === "(") {
                parenCount += 1;
            }
            else if (currChar === ")") {
                parenCount = Math.max(parenCount - 1, 0);  // decrement, but not less than zero
            }
            if (currChar === charToReplace && parenCount > 0) {
                newStr += replacement;
            }
            else {
                newStr += currChar;
            }
        }
        return newStr;
    },

    // extract an array of arguments form comma separated values within parenthesis
    // arguments will be resolved to their native form and model references will be resolved
    //-----------------------------------------------------------------------------
    getArrayOfArgs : function (argsStr) {

        if (!argsStr || argsStr.length === 0) {
            return [];
        }
        // ensure commas within quotes are treated as part of the string, not as arg separators
        argsStr = _replaceCommasWithinQuotes(argsStr);

        // remove spaces around commas, and leading & trailing spaces
        argsStr = argsStr.replace(/\s*,\s*/g, ",").replace(/^\s*/, "").replace(/\s*$/, "");
        if (argsStr.length === 0) {
            return null;
        }
        var args = argsStr.split(",");

        // evaluate each argument to get into its native form (array, string, number, or another expression)
        for (var i = 0; i < args.length; i++) {
            args[i] = args[i].replace(/_comma_/g, ",");  // restore commas that might have been replaced above
            args[i] = X.utils.evaluateSimpleOperand(args[i]);
        }

        // replace commas within single or double quotes, so we can split arguments on remaining commas
        //---------------------------------------------------------------------------------------------
        function _replaceCommasWithinQuotes (str) {
            var newStr = "";
            var quoteCount = 0;
            var dblQuoteCount = 0;
            for (var i = 0; i < str.length; i++) {
                var currChar = str.charAt(i);
                if (currChar === "'" && dblQuoteCount === 0) {
                    quoteCount = 1 - quoteCount;
                }
                else if (currChar === '"' && quoteCount === 0) {
                    dblQuoteCount = 1 - dblQuoteCount;
                }
                if (currChar === "," && (quoteCount > 0 || dblQuoteCount > 0)) {
                    newStr += "_comma_";
                }
                else {
                    newStr += currChar;
                }
            }
            return newStr;
        }

        return args;
    }

});


X._.extend(X.utils, {

    // Check to see whether a DOM element is completely in view in the browser
    isElementCompletelyInView : function ($el) {
        var el = X.utils.get$($el)[0];

        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
        );
    },


    // Check to see whether a DOM element is at least partly visible in the browser
    isElementInView : function ($el) {
        var el = X.utils.get$($el)[0];
        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
            rect.left >= 0
        );
    },

    // Check to see whether a DOM element is at least partly visible in the browser
    isElementTopInView : function ($el) {
        var el = X.utils.get$($el)[0];
        var rect = el.getBoundingClientRect();

        return rect.top >= 0;
    },

    htmlEscape : function (str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    htmlUnescape : function (value) {
        return String(value)
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
    }
});
X._.extend(X.utils, {
    //-------------
    // Utility function to deep merge into target obj where source takes precedence
    // returns a new merged object
    mergeObjects : function (target, source, dontAllowNewKeysInTarget) {
        var newObj = X._.extend({}, target);

        X._.each(source, function (p, idx) {

            try {
                // Property in destination object set; update its value.
                if (X._.isObject(p) && !X._.isArray(p) && !X._.isFunction(p) && !X._.isRegExp(p)) {
                    newObj[idx] = X.utils.mergeObjects(newObj[idx], p, dontAllowNewKeysInTarget);
                }
                else {
                    newObj[idx] = p;
                }
            }
            catch (e) { // Property in target object not set; create it and set its value.

                if (!dontAllowNewKeysInTarget) {
                    newObj[idx] = p;
                }
            }
        });


        return newObj;

    },

    /**
     * Manipulate the strings in a json object - using a deep nested decoding methodology
     *
     * Takes an object that could have string properties that have strings that need to be normalized in some manner, nested anywhere within the object.
     * Replaces those original strings with the value returned from your supplied manipulation function.
     *
     *
     * @param json the input object, which could get modified
     * @param manipulationFunc - function to perform against string values in the object takes
     * @return json - the input object, which might have been modified
     *
     */
    manipulateStringsInObj : function (json, manipulationFunc) {
        X._.each(json, function (value, key, obj) {
            obj[key] = _decode(obj[key]);
        });

        function _decode (value) {
            if (X._.isObject(value)) {
                X._.each(value, function (_value, _key, _obj) {
                    _obj[_key] = _decode(_obj[_key]);
                });

                return value;

            }
            else if (X._.isString(value)) {
                return manipulationFunc(value);
            }
            else {
                return value;
            }
        }

        return json;
    },


    /**
     * Decode the strings in a json object - using a deep nested decoding methodology
     *
     * Takes an object that could have string properties that have strings that may be encoded, nested anywhere within the object.
     * Replaces those encoded strings with the decoded ones.
     *
     * For example, you could pass in an object such as:
     * obj = {"x":5, "y":{"a":3, "b":"foo%22%22bar"}}
     * After the function returns, obj.y.b will contain the decoded value of foo""bar
     *
     * @param json the input object, which could get modified
     * @return json - the input object, which might have been modified
     *
     */
    decodeJSONObj : function (json) {
        this.manipulateStringsInObj(json, function (value) {
            return decodeURIComponent(value);
        });
    }
});

/**
 *
 * About:
 * This class is used to keep track of the current set of AB tests and configurations.
 * Based on the current set of tests, the getABTestPage and getABTestFlow methods will return views and flows that should be used instead of the defaults.
 * The directory structure and file names for the AB Test versions of the flows and views are the same as the default versions, but they are preceded by this directory structure:
 * <ABTestRoot>/test_name/recipe_name/
 *
 * If mainRoot is specified, and the default flow or view path starts with that path, then it will be omitted from the A/B test version of the path.
 * For example, if
 * mainRoot = "main",
 * testRoot = "abtest",
 * and the default path to a view is "main/html/views/someView.html",
 * then the path to that file while in test1, recipe b, would be: "abtest/test1/b/html/views/someView.html"  (note that 'main' was omitted.)
 *
 * Below is an example of an A/B test configuration.  In this example the <ABTestRoot> shown above is set to "abtest".
 * Each of the tests has 2 recipes called a and b.  The views and flows that are overwritten for those tests are enumerated in the views and flows arrays.
 *
 * In addition, certain variables can be set for each of the tests.  The variables in the vars object for the active recipes are accessible at run time
 * as properties of a model called ABTest.  By using the properties of the ABTest model, the default views can behave slightly differently, without needing custom views for small changes.
 *
 * Care must be taken to ensure that conflicting variable values are not set.
 * In the example below, if the application is in (test1, recipe a) and at the same time in (test2, recipe b), then conflicting values are defined for 'testVar' and 'otherTestVar'.
 * Similarly, there are conflicting views defined for databinding.Pg1 if multiple tests are enabled.  In these cases, the first value found in the configuration file is the one that's used.
 *
 *
 * var abtestConfig = {
    testRoot : "abtest",
    mainRoot : "main",
    tests : {
        test1:{
            a:{
                views:["databinding.Pg1"],
                flows:[],
                vars:{
                    testVar : "testValue1a",
                    otherTestVar : "otherValue1a"
                }
            },
            b:{
                views:["databinding.Pg1"],
                flows:["subflow"],
                vars:{}
            }
        },
        test2:{
            a:{
                views:["databinding.Pg1"],
                flows:[],
                vars:{
                    value1:"First Test Value",
                    value2:"Second Test Value"
                }
            },
            b:{
                views:["databinding.Pg1"],
                flows:[],
                vars:{
                    testVar : "testValue2b",
                    otherTestVar : "otherValue2b"
                }
            }
        }
    }
  };
 *
 */

X.components.ABTestResolver = function () {

    // -------------------------------
    // Function: setABTests
    // sets the current set of tests and recipe for each
    //
    // Parameters:
    //    values - object containing ABTestName:RecipeName pairs
    //             or query string of A/B test values i.e. test=recipe&test2=recipe2&...
    // -------------------------------
    this.setABTests = function (values) {
        var testVars = {};
        var testVals = X._.isObject(values) ? values : {};

        // Delete the ABTest model
        // in case a previous test model exists from a different set of tests
        X.removeModel("ABTest");

        _active = false;

        if (X._.isString(values)) {
            var _tmp = values.split('&');
            X._.each(_tmp, function (currentABTestPair) {
                var currentABTestPairArr = currentABTestPair.split("=");
                if (currentABTestPairArr.length === 2) {
                    testVals[currentABTestPairArr[0]] = currentABTestPairArr[1];
                }
            });
        }
        _abTests = {};
        if (!_abtestConfig.tests) {
            return;
        }
        X._.each(testVals, function (recipe, abtest) {
            _abTests[abtest] = recipe;
            if (_abtestConfig.tests[abtest] && _abtestConfig.tests[abtest][recipe]) {
                _active = true;  // active if any test is set for which there is a configuration
                X._.each(_abtestConfig.tests[abtest][recipe].vars, function (value, key) {
                    if (testVars[key]) {
                        X.publishException("abTestResolver", "Conflicting ABTest variable: " + key);
                    }
                    else {
                        testVars[key] = value;
                    }
                });
            }
        });

        // if the data package is present, create a ABTest model
        if (X.data.ABTestModel) {
            X.registry.registerModel(new X.data.ABTestModel(testVars));
        }
    };

    // -------------------------------
    // Function: getABTestPage
    // return the path to the page under the current test conditions
    //
    // Parameters:
    //    pageRef - the page reference
    //    defaultPagePath - the default (non-test) path to the page
    // -------------------------------
    this.getABTestPage = function (pageRef, defaultPagePath) {
        if (!_active) {
            return null;
        }

        var rootPath = _abtestConfig.testRoot || "";
        var pageFound = null;

        // iterate through all of the abtest key/value pairs in the model
        // and look for the corresponding value in the config
        X._.each(_abTests, function (recipe, test) {
            if (_abtestConfig.tests[test] && _abtestConfig.tests[test][recipe] && X._.isArray(_abtestConfig.tests[test][recipe].views)) {
                var testViews = _abtestConfig.tests[test][recipe].views;
                if (X._.contains(testViews, pageRef) && !pageFound) {
                    pageFound = rootPath + "/" + test + "/" + recipe + "/" + _stripDefaultRoot(defaultPagePath);
                }
            }

        });

        return pageFound;
    };

    // -------------------------------
    // Function: getABTestFlow
    // return the path to the flow definition file, given the current set of active tests
    //
    // Parameters:
    //    flowRef - the flow reference
    //    defaultFlowPath - the default (non-test) path to the flow
    // -------------------------------
    this.getABTestFlow = function (flowRef, defaultFlowPath) {
        if (!_active) {
            return null;
        }

        var rootPath = _abtestConfig.testRoot || "";
        var flowFound = null;

        // iterate through all of the abtest key/value pairs in the model
        // and look for the corresponding value in the config
        X._.each(_abTests, function (recipe, test) {
            if (_abtestConfig.tests[test] && _abtestConfig.tests[test][recipe] && X._.isArray(_abtestConfig.tests[test][recipe].flows)) {
                var testFlows = _abtestConfig.tests[test][recipe].flows;
                if (X._.contains(testFlows, flowRef) && !flowFound) {
                    flowFound = rootPath + "/" + test + "/" + recipe + "/" + _stripDefaultRoot(defaultFlowPath);
                }
            }
        });
        return flowFound;
    };

    // -------------\\
    // -- PRIVATE -- \\
    //----------------\\

    var _abTests = {},
        _abtestConfig = X.options.ABTestConfig || {},
        _active = false;


    //-------------------------------
    // take the default path returned by the flow or view resolver, and remove the root part
    //
    //-------------------------------
    var _stripDefaultRoot = function (path) {
        var defaultRoot = _abtestConfig.mainRoot;
        if (!defaultRoot || defaultRoot.length === 0) {
            return path;
        }

        // add trailing slash if it's not already there
        /\/$/.test(defaultRoot) || (defaultRoot += "/");  // jshint ignore:line
        if (path.indexOf(defaultRoot) !== 0) {
            return path;
        }
        else {
            return path.substr(defaultRoot.length);
        }
    };

    // listen for changes to the config.
    X.subscribe(X.constants.events.kOptions + ".ABTestConfig", function () {
        _abtestConfig = X.options.ABTestConfig;
    }, this);

};

// Self register after the document is loaded
X.$.ready(function () {
    X.registerComponent(X.constants.interfaces.kABTestResolver, new X.components.ABTestResolver(), true);
});


// Extend the core

// set up namespaces
X.flow = X.flow || {}; // have this here as well as the flow module because the flow API does not get included in the application build
X.application = {};
X.view = {
    binder : {}
};
X.ui = {};
X.uiComponents = {};
X.debug = {};

X._.extend(X, {

    /**
     *  Register a uiWidget class as a template for re-use in your views
     * @param name
     * @param componentClass
     * @returns {*}
     */
    registerUIComponentClass : function (name, componentClass) {
        return X.registry.registerUIComponentClass(name, componentClass);
    },


    /**
     * Register a custom binding function that will be called when Mojo renders a page
     * Binders will be called with the parameters ($container, options) where options are page options
     * @param name - name of your binder
     * @param binderFunc
     * @param preBinder - boolean: execute before any Mojo binders are run (false means run after)
     * @returns {*}
     */
    registerCustomBinder : function (name, binderFunc, preBinder) {
        return X.registry.registerCustomBinder(name, binderFunc, preBinder);
    },

    /**
     * Register a viewport
     *
     * @param viewportId id of the viewport element
     * @param options - viewport options
     *          - dontScroll
     * @param dontReplace - dont replace existing viewport of the same name
     */
    registerViewport : function (viewportId, options, dontReplace) {
        return X.registry.registerViewport(viewportId, new X.view.ViewController(viewportId, options), dontReplace);
    },

    /**
     * Get the containing viewport of the requested element
     *
     * @param element - X.$ element or element id
     * @returns the name of the viewport that element is contained in.
     */
    getContainingViewport : function (element) {
        var $el = X.utils.get$(element);
        return X.application.Controller.getContainingViewport($el);
    },


    /**
     * Set A/B test values into the system so that flows and views can be tested
     *
     * @param testVals - object containing ABTestName:RecipeName pairs
     *                   or query string of A/B test values i.e. test=recipe&test2=recipe2&...
     */
    setABTests : function (testVals) {
        var abtestResolver = X.getComponent(X.constants.interfaces.kABTestResolver);

        if (!abtestResolver) {
            abtestResolver = X.registerComponent(X.constants.interfaces.kABTestResolver,
                new X.components.ABTestResolver());

        }
        abtestResolver.setABTests(testVals);
    },


    // Flow

    /**
     *  Start up the flow controller and return the first view to the user
     *
     *  @param flowName [string]  - name of the flow reference to load
     *  @param  args [object]      - [optional] all arguments are optional
     *                  * modal [object]
     *                          - closeButton [boolean] - put a close button on the modal window
     *                  * viewport [string] - load the flow into the specified viewport, will use default viewport specified in application options if
     *                                        none is specified
     *                  * inputVars [object] - name value pairs to be injected into the flow. Will be available via the <span>F</span>LOW_SCOPE model
     *                  * complete : [function] - callback when flow is finished
     *                  * error : [function] - callback if the flow (or contained subflows) errors out
     * @return : none
     */
    getSome : function (flowName, args) {
        // Initialize (register bind main page and register viewports
        // if not done so already
        X.init();
        return X.application.Controller.startFlow(flowName, args);
    },


    /**
     *  Load a view (not as part of a flow)
     *
     *  @param pgReference [string] - reference to the view to load
     *  @param args [object] - [optional] all arguments are optional
     *                  * modal [object]
     *                          - closeButton [boolean] - put a close button on the modal window
     *                          - closeEvent : [string] - event to listen for to close the modal if clients want other ways to close than the close button
     *                          - closeCallback : [function] - function to call when the modal closes
     *                  * scrollTo - DOM element Id to scroll to once the page is finished loading
     *                  * viewport [string] - load the view into the specified viewport, will use viewport specified in application options if none
     *                                        specified
     *                  * success [function] - callback if success loading page
     *                  * error [function] - callback if error loading page
     *                  * complete [function] - callback when page navigated away from (using data-nav)
     * @return : none
     */
    loadPage : function (pgReference, args) {
        // Initialize (register bind main page and register viewports
        // if not done so already
        X.init();
        return X.application.Controller.loadPage(pgReference, args);
    },


    /**
     * show a modal window
     *
     * @param pgReference - page/view reference
     * @param args
     *  - closeButton : [boolean] - show close button (default is false)
     *  - closeEvent : [string] - event to listen for to close the modal if clients want other ways to close than the close button
     *  - closeCallback : [function] - function to call when the modal closes
     */
    showModal : function (pgReference, args) {
        args = args || {};
        var opts = {};
        opts.modal = args;
        // Initialize (register bind main page and register viewports
        // if not done so already
        X.init();
        X.application.Controller.loadPage(pgReference, opts);
    },


    /**
     * Advance to the next state in the flow
     *
     * @param val - (string) navigation value to pass to the controller
     * @param options - navigation options
     *  -  viewport - perform navigation in the specified viewport, default viewport used if none specified
     */
    doNext : function (val, options) {
        options = options || {};
        options.nav = val;
        var vp = options.viewport || X.options.defaultViewport;
        X.publish(X.constants.events.kNavigation + '.' + vp, options);
    },


    /**
     * Jump to another state, possibly in a different flow
     *
     * @param path - (string) path value to pass to the controller ('~' delimited set of nodenames)
     * @param options - navigation options
     *  -  viewport - perform navigation in the specified viewport, default viewport used if none specified
     */
    doJump : function (path, options) {
        options = options || {};
        options.jump = path;

        var vp = options.viewport || X.options.defaultViewport;
        X.publish(X.constants.events.kNavigation + '.' + vp, options);
    },


    /*********************************************************
     // Bind to an any loaded data models and set up 2 way binding of values set from other elements
     // Bind events to "a" tags
     // Set up formatters and validators
     //
     // Parameters:
     //    containerId - the dom element identifier
     //                  or a X.$ element
     //    options - supports these boolean options
     //         viewport - containing viewport name
     //         silent - don't dispatch kBindingsApplied event
     **********************************************************/
    applyBindings : function (containerId, options) {
        return X.bindings.bindContainer(containerId, options);
    },

    /**
     * Unbind from X.$ and internal events so that memory can be cleaned up
     *
     * @param domElement
     * @param excludeSelf
     */
    unbind : function (domElement, excludeSelf) {
        X.bindings.unbindContainer(domElement, excludeSelf);

        X.publish(X.constants.events.kBindingsRemoved);
    }
});

// set up aliases
X.startFlow = X.getSome;





X.constants = X.utils.mergeObjects(X.constants, {

    eventDirectives : ["data-nav", "data-jump", "data-event", "data-loadflow", "data-loadpage", "data-set", "data-href"],
    appDirectives : ["data-mojo-app", "data-viewport", "data-bind", "data-validate", "data-format", "data-listen", "data-repeat", "data-template"],

    events : {
        kNavigation : "navigation",
        kBeforePageLoad : "beforePageLoad", /* new page is about to be loaded */
        kPageLoaded : "pageLoaded", /* new page is loaded */
        kPageFinalized : "pagefinal", /* new page is completed loading and all processing is done */
        kBeforePageUnload : "endPage", /* page is about to be blown away */
        kBindingsApplied : "bindingsApplied", /* bindings have been applied to the new page*/
        kBindingsRemoved : "bindingsRemoved",
        kTemplateReady : "templateReady",
        kEndViewController : "endViewController"
        //kStartModalFlow : "startModalFlow",
        //kEndModalFlow : "endModalFlow",
    },

    interfaces : {
        kViewResolver : "viewResolver",
        kTemplateEngine : "templateEngine",
        kScreenTransitioner : "screenTransitioner",
        kModalWindow : "modalWindow"
    },

    registry : {
        kViewports : "viewports",
        kUIComponents : "uiComponents",
        kTemplates : "templates",
        kCustomBinderPre : "customBinderPre",
        kCustomBinderPost : "customBinderPost"
    }

});
// combine the app and event directives
// then add the -options to the list of all directives
X.constants.allDirectives = X._.union(X.constants.appDirectives, X.constants.eventDirectives);
X.constants.allOptions = X._.map(X.constants.allDirectives, function (str) {
    return str + "-options";
});
X.constants.allDirectives = X._.union(X.constants.allDirectives ,X.constants.allOptions);
X._.extend(X.options, {

    viewResolverOptions : {
        pathToViews : {"default" : "views"},
        aliasMap : {
            "*" : ".html"
        },
        cacheParam : null
    },

    // VIEWPORT options --------------------------
    defaultViewport : null, // name of the data-viewport that will be used as the default viewport
    viewportOptions : {
        "default" : {
            scrollToTop : true, // scroll to the top of the browser on page navigation.
            scrollOptions : {
                toViewport: false, // scroll the top of the viewport into view upon navigation.
                isAnimated: false, // slide the view or instantly jump.
                animationDuration: 100
            },
            setFocusOnFirstInput : true , // set focus on the first visible input element on page when it renders
            setFocusInputTypes : ["input", "select", "textarea", "button"], // list of valid input types to automatically set focus on
            screenTransitionerClass : "X.components.ScreenTransitioner",
            viewportHistory : {
                enableTracking : false, // Tell all viewports to manage their history
                autoBackNavigationEvent : null,  // KEY navigation value used in data-nav that will trigger a "back" using the history to figure out where to go
                historySize : null, // maximum number of views (or flow nodes) that will be tracked in the history, null for unlimited
                allowDuplicates : false // allow for the a screen to be put on the history if the current screen is the same (to prevent backing up to the same page)
            },
            validationOptions : {}, // to be set by the validation/formatting module
            formatOptions : {} // to be set by the validation/formatting module
        }
    },

    // application debug alerting
    enableTraceConsole : true // Set up the debugging console

});

// when ready, set the default viewport to use the main validation and formatting options
X.$.ready(function () {
    var _o = X.options;
    _o.viewportOptions["default"].validationOptions = _o.validationOptions;
    _o.viewportOptions["default"].formatOptions = _o.formatOptions;
});

/**
 * Interface:
 * X.view.I_UiComponent
 *
 * @interface
 *
 * Implementing classes will override the 'create' function
 * which knows how to render the control and returns the X.$ element
 *
 * Note : The create function MUST return a X.$ element that represents the widget
 *
 */
X.view.I_UiComponent = X.Class.extend({
    interfaceType : "uiComponent", // Don't override

    // create a jquery DOM element that represents the component
    // Return the X.$ element
    create : function ($component, data) {
        throw new X.Exception("X.view.I_UiComponent", "must implement 'create' function: ", X.log.ERROR);
    },

    // run the equation expressed by the arguments.
    update : function (data) {
        throw new X.Exception("X.view.I_UiComponent", "must implement 'update' function: ", X.log.ERROR);
    },

    // copy the data attributes from one X.$ element to another
    // Also copy some key attributes like ID and Name
    _copyDataAttributes : function ($from, $to) {
        for (var i = 0; i < $from[0].attributes.length; i++) {
            var a = $from[0].attributes[i];
            // IE 7 has trouble setting the following attributes. Skip them!
            if (a.name != 'name' && a.name != 'data' && a.name != "dataFormatAs" && a.name != "implementation") {
                $to.attr(a.name, a.value);
            }
        }
        //IE 7 also seems to like to disable input attributes that have attributes copied over in this fashion.
        //so remove the disabled attr if it's not on the source element
        if ($from.attr("disabled") !== "disabled") {
            $to.removeAttr('disabled');
        }
    }
});

/*************************************************************************************
 * class:
 * Console
 *
 * about:
 * public APIs
 *    - enable()  // the first method that should be called to initialize the debug console
 *                // need a path to a css file so the console won't look ugly and messed up
 *    - disable()
 *    - openWindow()   // opens the debug console
 *    - closeWindow()  // closes the debug console
 *    - toggleWindow() // toggles the debug console on and off
 *    - send()    // logs a user message, can contain an array of components/classnames
 *                // which will get shown in different colors. Also these components will
 *                // be added an internal list of components, which the user can use to turn
 *                // on and off
 *    - addPanel()     // adds a DOM element into the debug window, the newly added DOM element
 *                     // will have its own tab
 *    - clearWindow()  // clear all of the existing logs
 *    - sendDelimeter()   // adds a delimiter in the logs window(aka viewport)
 *
 *************************************************************************************/
X.debug.console = (function () {
    var _commands = {};

    var _impl = {

        // -------------------------------
        // Function: enable
        // initialize the debug console
        // -------------------------------
        enable : function (bEnable) {
            _enabled = X._.isUndefined(bEnable) ? true : !!bEnable;

            if (_enabled) {
                _attach();
                X.publish(X.constants.events.kConsoleEnabled);
                X.subscribe(X.constants.events.kException, _impl.handleXException, _impl);
            }
            else {
                X.publish(X.constants.events.kConsoleDisabled);
                X.$(_window).hide();
                X.unsubscribe(X.constants.events.kException, _impl.handleXException, _impl);
            }

        },


        // -------------------------------
        // Function: openWindow
        // open the window
        // -------------------------------
        openWindow : function () {
            if (!_enabled) {
                return;
            }

            X.$("#debug_console_body").slideDown(500);

            _open = true;
            X.$("#debug_console_toggle_button").text("close");
        },

        // -------------------------------
        // Function: closeWindow
        // kill the window
        // -------------------------------
        closeWindow : function () {
            if (!_enabled || !_created) {
                return;
            }

            X.$("#debug_console_body").slideUp(500);

            _open = false;
            X.$("#debug_console_toggle_button").text("debug");
        },

        // -------------------------------
        // Function: toggleWindow
        // open/close the window
        // -------------------------------
        toggleWindow : function () {
            if (_open) {
                this.closeWindow();
            }
            else {
                this.openWindow();
            }
        },

        // -------------------------------
        // Function: addCommand
        // add a command
        //
        // Parameters:
        //    cmdName - the name of the command
        //    cmdFunc - the function for the command
        // -------------------------------
        addCommand : function (cmdName, cmdFunc) {
            _commands[cmdName] = cmdFunc;
        },

        // -------------------------------
        // Function: removeCommand
        // delete the command
        //
        // Parameters:
        //    cmdName - the name of the command
        // -------------------------------
        removeCommand : function (cmdName) {
            delete _commands[cmdName];
        },

        // -------------------------------
        // Function: send
        // send data to the window
        //
        // Parameters:
        //    text - the string data
        //    components - optional, array of components
        //    logLevel - optional log level
        // -------------------------------
        send : function (text, components, logLevel) {
            if (!_enabled) {
                return;
            }


            // write out to the console if we can
            try {
                if (logLevel && typeof console === "object" && X.options.logToConsole) {
                    switch (logLevel) {
                        case X.log.WARN:
                            console.warn ? console.warn(text, components) : console.log(text, components); // jshint ignore:line
                            break;
                        case X.log.DEPRECATED:
                            console.warn ? console.warn("DEPRECATED: " + text, components) : console.log(text, components);  // jshint ignore:line
                            break;
                        case X.log.ERROR:
                        case X.log.CRITICAL:
                            console.error ? console.error(text, components) : console.log(text, components);   // jshint ignore:line
                            break;
                        case X.log.INFO:
                            console.info ? console.info(text, components) : console.log(text, components);   // jshint ignore:line
                            break;
                        default:
                            //console.log(text);  // gets chatty if enabled
                            break;
                    }
                }
            }
            catch (ex) {
            }

            text = text + "<br />";

            if (components && components.length > 0) {
                if (typeof components === "string") {
                    components = components.split(",");
                }

                if (X._.contains(_allComponents, components[0])) {
                    var currentComponent = components[0];
                    var formattedComponentId = currentComponent.replace(/ /g, "_");
                    // this component doesn't exist in our registered components list, add it
                    _allComponents.push(components[0]);

                    // add it to the COMPONENT_LIST
                    X.$("<div style='padding:4px 10px;border-width:0 0 1px;border-style:solid;border-color:#222;background-color:#333;margin-top:1px;'><input type='checkbox' id='" +
                           formattedComponentId + "_checkbox' data-component-name='" + currentComponent +
                           "' checked /><label for='" + formattedComponentId + "_checkbox' style='padding-left:5px;'>" +
                           currentComponent + "</label></div>").appendTo("#debug_console_component_list");

                    // when the component checkbox's value changes, update _disallowedComponents array
                    X.$("#" + formattedComponentId + "_checkbox").change(function () {
                        var checked = X.$(this).prop("checked");
                        var componentName = X.$(this).attr("data-component-name");

                        if (checked) {
                            // allow this component to be logged
                            _allowLoggingForComponent(componentName);
                        }
                        else {
                            // don't allow this component to be logged
                            _disallowLoggingForComponent(componentName);
                        }
                    });
                }

                // check to see if trace should be allowed (the components array are matched against the _allowedComponents array)
                if (_isTraceAllowed(components)) {
                    // append the prefixes if it's defined
                    text = '<span style="color:green;">[' + components.join("][") + ']</span> ' + text;
                }
                else {
                    // trace is not allowed because the component is not in the allowed list
                    return;
                }
            }

            if (logLevel) {
                // if logLevel is specified, indicate it in the UI by displaying different colors
                switch (logLevel) {
                    case X.log.WARN:
                        text = '<span style="color:orange;">- WARNING -</span> ' + text;
                        break;
                    case X.log.ERROR:
                        text = '<span style="color:red;">- ERROR -</span> ' + text;
                        break;
                    case X.log.INFO:
                        text = '<span style="color:blue;">- INFO -</span> ' + text;
                        break;
                    case X.log.CRITICAL:
                        text = '<span style="color:#ff2aec;">- CRITICAL -</span> ' + text;
                        break;
                    case X.log.DEPRECATED:
                        text = '<span style="color:yellow;">- DEPRECATED -</span> ' + text;
                        break;
                    default:
                        break;

                }
            }

            /* for performance reasons, buffer the text and output it to the console at most once every 500 ms */
            _buffer = text + _buffer;

            if (_trace !== null) {  /* just keep in the buffer if the viewport has not yet been built */
                if (_delayedPrint === -1) {   // if timer is not already set set
                    _delayedPrint = setTimeout(function () {
                        try {
                            var newContent = X.$('<span>' + _buffer + '</span>');
                            _trace.prepend(newContent);
                            _buffer = "";   // clear the buffer
                            _delayedPrint = -1;  // set flag indicating the timer is no longer set
                        }
                        catch (e) {
                        }
                    }, 500);
                }
            }
        },

        // -------------------------------
        // Function: clearWindow
        // clear the window
        // -------------------------------
        clearWindow : function () {
            _clearWindow();
        },

        // -------------------------------
        // Function: sendDelimeter
        // send the delimeter (line of dashes)
        // -------------------------------
        sendDelimeter : function () {
            _sendDelimeter();
        },

        /************************************************
         * Function: addPanel
         * append new panel
         *
         * Parameters:
         * options - can have the following properties
         *     - label (display name of the panel, required)
         *     - id (id of the panel, required)
         *     - htmlPage - url to the resource on the server
         *     - $el - X.$ element to inject as a panel
         *     - bind - boolean to apply bindings once the panel is added
         *     - setAsDefault - default the panel to on when attached
         *
         ************************************************/
        addPanel : function (options) {

            if (!options) {
                throw new X.Exception("debugConsole", "cannot add panel without options", X.log.WARN);
            }

            var label = options.label,
                id = options.id,
                htmlpage = options.htmlpage || options.htmlPage,
                $el = options.$el;


            if (!label || !id) {
                throw new X.Exception("debugConsole", "cannot add panel without label and id", X.log.WARN);
            }
            if (!htmlpage && !$el) {
                throw new X.Exception("debugConsole", "cannot add panel without a dom element or fileName", X.log.WARN);
            }

            // if this dom element already exists don't add it again
            if (X.$("#" + id).length > 0) {
                return;
            }

            // append the new menu button
            var newPanelButton = X.$('<button id="' + id + '_button" class="debug_tab">' +
                                        label + '</button>');
            _window.find("#debug_menu_bar").append(newPanelButton);
            newPanelButton.on("click", _impl.onMenuButtonClick);

            // append the dom element to the debug_content div
            var $newPanel =  X.$('<div id="' + id + '" class="debug_panel_off"></div>');
            _window.find("#debug_content").append($newPanel);
            if ($el) {
                $newPanel.append($el);
//                _window.find("#debug_content").append(X.$('<div id="' + id + '" class="debug_panel_off"></div>').append($el));
            }
            else {
                //var $newPanel = X.$('<div id="' + id + '" class="debug_panel_off"></div>');
                // IE fix w/ jQuery
                if (document.all && document.documentMode && !X._.isUndefined(jQuery)) { // jshint ignore:line
                    $newPanel.load(htmlpage);
                } else {
                    $newPanel.loadHTML(htmlpage);
                }
            }

            if (options.bind) {
                X.applyBindings($newPanel);
            }
            if (options.setAsDefault) {
                newPanelButton.click();
            }

        },


        // -------------------------------
        // Function: onMenuButtonClick
        // handles the event where the user clicks on one of the menu buttons inside the console
        //
        // Parameters:
        //     event - the event to trigger
        // -------------------------------
        onMenuButtonClick : function (event) {
            var target = event.target;
            var buttonId = X.$(target).attr("id");
            var panelId = buttonId.replace(/_button/g, "");

            // toggle the buttons
            X.$(".debug_tab_on").removeClass("debug_tab_on");
            X.$(target).addClass("debug_tab_on");

            // toggle the panels
            X.$(".debug_panel_on").removeClass("debug_panel_on").addClass("debug_panel_off");
            X.$("#" + panelId).addClass("debug_panel_on").removeClass("debug_panel_off");

        },

        handleXException : function (exception /*X.Exception Obj*/) {
            if (exception && _enabled) {
                var message = "Component=" + exception.component + " Msg=" + exception.msg;

                if (exception.exeptionObj) {
                    message += "\nCaused by:\n" + exception.exeptionObj.message;
                }
                _impl.send(message, null, exception.logType);
            }
        }

    };

    /*
     Initialize the debug module in response to the init event
     */
    X.subscribe(X.constants.events.kInitialize, function () {
        // The console does not like bindings applied to it.
        _impl.enable((document.all && document.documentMode) ? false : X.options.enableTraceConsole);

    });

    /****************************************************************
     * Group: Private
     * Private API
     ***************************************************************/
    var _enabled = false,
        _created = false,
        _open = false,
        _window = null,
        _trace = null,
        _tracePanel = null,

        _buffer = '',
        _delayedPrint = -1;   // timer ID for delayed printing.  use -1 to mean it's not set.

    // list of all components we have logged so far,
    // and a list of allowed components (only allowed components will be shown in the console)
    var _allComponents = [],
        _disallowedComponents = [];

    // -------------------------------
    // Function: enableResize
    // allow window to be resized; adds click events to window
    // -------------------------------
    function enableResize () {
        var clicking = false;

        X.$(document).on('mousedown', "#debug_menu_bar", function (e) {
            clicking = true;
            e.preventDefault();
        });

        X.$(document).on('mouseup', function () {
            clicking = false;
        });

        X.$(window).on('mousemove', function (e) {
            if (clicking === false) {
                return;
            }
            //window.getSelection().removeAllRanges();

            // Mouse click + moving logic//
            // Browser Viewport
            var winHeight = X.$(window).height();
            // Height of mouse from bottom
            var mousePosnY = winHeight - e.clientY;

            X.$('#debug_console_body').height(mousePosnY);
            X.$('#debug_console_viewport').height(mousePosnY - 80);
        });
    }

    if (!(document.all && document.documentMode) && X.options.enableTraceConsole)  {
        enableResize();
    }


    // -------------------------------
    // Function: _disallowLoggingForComponent
    // do not log data for component
    //
    // Parameters:
    //    component - the component
    // -------------------------------
    function _disallowLoggingForComponent (component) {
        _disallowedComponents.push(component);
    }

    // -------------------------------
    // Function: _allowLoggingForComponent
    // allow data to be logged for component
    //
    // Parameters:
    //    component - the component
    // -------------------------------
    function _allowLoggingForComponent (component) {
        var index = X.$.inArray(component, _disallowedComponents);
        if (index != -1) {
            _disallowedComponents.splice(index, 1);
        }
    }

    // -------------------------------
    // Function: _isTraceAllowed
    // checks to see if this trace with the specified components is allowed
    //
    // Parameters:
    //    components - the array of components
    // -------------------------------
    function _isTraceAllowed (components) {
        var allowed = true;
        for (var i = 0; i < _disallowedComponents.length; i++) {
            if (_disallowedComponents[i] === "*" || X._.contains(components, _disallowedComponents[i])) {
                // this component is in the allowed list, show it
                return false;
            }
        }

        return true;
    }

    // -------------------------------
    // create the window - ready for use
    // -------------------------------
    (function _createWindow () {

        var dbg = '<div id="debug_console_wrapper">' +
                   '<span id="debug_console_toggle_button" title="Toggle" onclick="X.debug.console.toggleWindow()">debug</span>' +
                   '<div id="debug_console_body">' +
                        '<div id="debug_menu_bar">' +

                        '</div>' +
                        '<div id="debug_content">' +

                        '</div>' +
                   '</div>' +
                   '</div>';
        _window = X.$(dbg);

        var trc = '<span id="debug_console_viewport"> ' +
                  '</span>' +

                  '<span id="debug_help">' +
                  '<div id="debug_help_inner_container">' +
                  '<b>Top-level Components:</b>' +
                  '<div id="debug_console_component_list">' +
                  '</div>' +
                  '</div>' +
                  '</span>' +
                  '<div class="debug_clear"></div>' +
                  '<div id="debug_console_tools">' +
                  '<span class="debug_console_button" title="Add a Delimeter" onclick="X.debug.console.sendDelimeter()">Delimit</span>' +
                  '<span class="debug_console_button" title="Add a Delimeter" onclick="X.debug.console.clearWindow()">Clear</span>' +
                  '<div class="debug_clear"></div>' +
                  '</div>';
        _tracePanel = X.$(trc);

    })();

    // -------------------------------
    // Function: attach
    // attach the console to the current document body
    // -------------------------------
    function _attach () {
        if (!_created) {
            X.$('body').append(_window);
            _impl.addPanel({
                label : "Mojo Trace",
                id : "debugconsole_menu",
                $el : _tracePanel,
                setAsDefault : true

            });
            _trace = X.$('#debug_console_viewport');
            _created = true;
        }
        X.$(_window).show();

    }

    // -------------------------------
    // Function: _sendDelimeter
    // send a delimeter to the window
    // -------------------------------
    function _sendDelimeter () {
        _impl.send('<span class="delimiter">---------------------------------------------------</span>');
    }

    // -------------------------------
    // Function: _clearWindow
    // send a delimeter to the window
    // -------------------------------
    function _clearWindow () {
        _trace.empty();
    }

    return _impl;

})();



// set up the debug namespace
X.debug = X.debug || {};

X._.extend(X, {

    // export API's
    enableTraceConsole : X.debug.console.enable,
    openConsole : X.debug.console.openWindow,
    closeConsole : X.debug.console.closeWindow,
    addDebugPanel : X.debug.console.addPanel,
    trace : X.debug.console.send
});
//-------------------------------------------------------------------------------------
// class: Application Controller Class
//
//  About : This class manages the flows and views and the navigation events posted by the application to that drive those flows.
//
//
//  Note : Modal functionality - the way that I implemented this is that waaaay down in a flow, if a node is marked as "modal", it will 'pause' itself.
//              Then it will call the X.getSome (for a modal flow) or X.loadPage (for a single page).  This class will then create a brand new flow controller to handle the modal flow.
//              When the modal flow is finished it will reinistigate the original flowcontroller and call the supplied callback passing the response from the modal flow.
//              The flow can then decide to resume of stay on the current page.
//
//
//-------------------------------------------------------------------------------------

X.application.Controller = (function () {

    // Set scoped shortened variables
    var _ = X._;

    var _application = {

        init : function () {
            // Create our session id
            _sessionId = X.utils.uuid();
            _modalWindow = X.getComponent(X.constants.interfaces.kModalWindow);

            // Create an application scope model
            X.addModel(X.constants.scopes.kApplicationScope);
        },

        //-------------------------------------------
        // return the id of the viewport that contains the given element
        //-------------------------------------------
        getContainingViewport : function ($element) {
            var vid = $element.attr("data-viewport");
            var viewportIds = X.registry._getNames(X.constants.registry.kViewports);
            if (vid && _.contains(viewportIds, vid)) {
                return vid;
            }
            var viewportsSelector = _.map(viewportIds, function (id) {
                return ("[data-viewport='" + id + "']");
            }).join(',');
            var nearestViewport = $element.closest(viewportsSelector);
            vid = nearestViewport ? nearestViewport.attr("data-viewport") : null;
            return vid;
        },


        //-------------------------------------------
        // Function: start
        // Start 'r up
        //   and load the first page of a flow
        //   /*options, inputVars, viewport, success, error*/
        //-------------------------------------------
        startFlow : function (flowName, args) {
            args = args || {};
            args.options = args.options || {};
            var view;

            // Set up for modal if we get an indicator that this page is modal
            //=========================================================
            if (args.modal) {
                // Save off the current flow context so we can restore it when the modal closes
                var _oldContext = _currentContext;
                // set up the modal to close on 'endFlow' event
                // and then pass control back to the calling code to deal with the response
                // in the case of an embedded modal flow in a flow, the caller is the viewport.
                args.modal.closeEvent = X.constants.events.kEndViewController + "." + _modalWindow.getViewPortId();
                args.modal.closeCallback = function (flowResp) {
                    _currentContext = _oldContext;
                    // kill the flow controller in the modal view
                    // if closed by close button (i.e. no flowResp)
                    if (!flowResp) {
                        view.forceEnd();
                    }

                    flowResp = flowResp || {}; // may be null due to a close button click
                    if (flowResp.error) {
                        if (_.isFunction(args.error)) {
                            args.error(flowResp.response);
                        }
                    }
                    // get us back to our previous state and let the flow get to right node
                    if (_.isFunction(args.complete)) {
                        args.complete(flowResp.response);
                    }
                };

                // Show the modal window
                _startModal(args.modal);

                // set the viewport to the modal window and start the flow in it
                args.viewport = _modalWindow.getViewPortId();
                view = _getView(args.viewport);
                // Don't pass ALL arguments to the modal flow because well get double complete callbacks called
                view.startFlow(flowName,
                    {
                        modal : true,
                        options : args.options || {},
                        inputVars : args.inputVars
                    });

            }
            //=========================================================
            // End Modal functionality
            else {
                // Get the right view
                view = _getView(args.viewport);
                view.startFlow(flowName,
                    {
                        modal : false,
                        options : args.options,
                        inputVars : args.inputVars,
                        complete : args.complete,
                        error : args.error
                    });

            }
        },


        //--------------------------------------
        // Load a page - this will mess up the flow controller
        //  If one is running in the viewport
        //--------------------------------------
        loadPage : function (pageRef, args) {
            var view;
            args = args || {};

            // Set up for modal if we get an indicator that this page is modal
            //=========================================================
            if (args.modal) {

                // if we got here from a modal view in a flow
                // set up the modal to close on 'navigation' events
                // and then pass control back to the calling viewport to deal with the response
                if (args._flowNode) {
                    args.modal.closeEvent = X.constants.events.kNavigation;
                    args.modal.closeCallback = function (navObj) {
                        if (_.isFunction(args.complete)) {
                            args.complete(navObj);
                        }
                    };
                }

                // Show the modal window
                _startModal(args.modal);

                // set the viewport to the modal window and load the page in it
                args.viewport = _modalWindow.getViewPortId();
                view = _getView(args.viewport);
                view.loadPage(pageRef, args);
                if (args.modal.autoClose && args.modal.autoClose.time) {
                    setTimeout(function () {
                        _modalWindow.hide({nav : args.modal.autoClose.nav});
                    }, args.modal.autoClose.time);
                }
            }
            //=========================================================
            // End Modal functionality
            else {
                // Get the right view
                view = _getView(args.viewport);
                view.loadPage(pageRef, args);
            }

        },

        inModal : function () {
            return _inModal;
        },

        //-------------------------------------------
        // Function: forceEnd
        // Allow an outside influence the ability to stop the controller and end it
        //-------------------------------------------
        forceEnd : function (viewport) {
            if (!viewport) {
                _handleException(new X.Exception("X.application.Controller", "forceEnd: No viewport specified in options - using default", X.log.INFO));
                viewport = X.options.viewPortId;
            }
            var view = _getView(viewport);
            view.forceEnd();
        },

        //-------------------------------------------
        // Function: getSessionId
        // get a flow scoped variable out of the current flow
        //  - may return null or undefined
        //
        // Parameters:
        //   name - the name of the variable to get
        //-------------------------------------------
        getSessionId : function () {
            return _sessionId;
        },

        //-------------------------------------------
        // Function: getCurrentFlowVariable
        // get a flow scoped variable out of the current flow
        //  - may return null or undefined
        //
        // Parameters:
        //   name - the name of the variable to get
        //-------------------------------------------
        getCurrentFlowVariable : function (viewport, name) {
            var vp = viewport || _currentContext;
            var view = _getView(vp);
            return view.getCurrentFlowVariable(name);
        },

        //-------------------------------------------
        // Function: getCurrentFlowScopeName
        // get the name of the current flow scope
        //  - may return null or undefined
        //
        //-------------------------------------------
        getCurrentFlowScopeName : function (viewport) {
            var vp = viewport || _currentContext;
            var view = _getView(vp);
            if (!view) {
                return;
            }
            var fs = view.getCurrentFlowScopeName();
            if (!fs) {
                view = _getView();
                fs = view.getCurrentFlowScopeName();
            }
            return fs;

        },

        //-------------------------------------------
        // Function: getCurrentViewScopeName
        // get the name of the current view scope
        //  - may return null or undefined
        //
        //-------------------------------------------
        getCurrentViewScopeName : function (viewport) {
            var vp = viewport || _currentContext;
            var view = _getView(vp);
            return view.getCurrentViewScopeName();
        }

    };

    //=====================================================
    // Private
    //=====================================================
    var _sessionId = null,
        _modalWindow = null,
        _inModal = false,
        _currentContext = null;

    function _getView (viewId) {
        // If the viewport is not registered, use the default one
        if (!viewId) {
            viewId = X.options.defaultViewport;
        }

        var vp = X.registry.getViewport(viewId);
        if (!vp) {
            _handleException(new X.Exception("X.application.Controller", "No default viewport specified in options", X.log.ERROR));
        }
        _currentContext = viewId;
        return vp;

    }

    //--------------------------------------
    // Group: Modal Functionality
    //--------------------------------------
    // Function: startModal
    function _startModal (options) {
        var opts = options || {};
        var cb = options.closeCallback;
        opts.closeCallback = function (data /*from close event*/) {
            _inModal = false;
            if (_.isFunction(cb)) {
                cb(data /*from close event*/);
            }
        };
        _modalWindow.show(opts);
        _inModal = true;
    }


    // Function: _handleException
    //-----------------------------------
    function _handleException (ex) {
        var xex;
        if (ex instanceof X.Exception) {
            xex = ex;
        }
        else {
            xex = new X.Exception("UNKNOWN EXCEPTION", ex.type + " " + ex.message, X.log.ERROR, ex);
        }

        X.publishException(xex);

    }


    return _application;
})();

(function () {

    // ===============================================================
    // Auto-init Mojo if data-Mojo-app attribute is found on body
    // set the timeout so that if applications are initilializing on document.ready
    // they'll go first
    // ===============================================================
    X.$.ready(function () {
        _domReady = true;
        setTimeout(function () {
            var $x = X.$("[data-mojo-app]");
            if ($x.length) {
                var appName = $x.attr("data-mojo-app");
                var options = $x.attr("data-mojo-app-options");

                var _opts = {};

                if (options) {
                    _opts = X.utils.stringToFunction(options);
                    if (!X._.isObject(_opts)) {
                        X.publishException("X.application", "Invalid or missing Options file specified in data-mojo-app-options: " +
                                                                  options + ".  Using default options");
                        _opts = {};
                    }
                }
                _opts.appId = appName || _opts.appId;

                // Init ourselves
                X.init(_opts);
            }
            else {
                X.init();
            }

        }, 0);
    });

    //------------------------------------------------------------
    //  Function : init
    //  - registers all comonents and applies
    //    initial bindings the the html element of the page.
    //    Parameters : options - name value pairs that match X.options
    //
    //  Returns a promise
    //------------------------------------------------------------
    X.init = function (options) {

        // Always set options if passed
        if (options && !X._.isObject(options)) {
            X.publishException("X.application", "Init. Invalid Options file: must be an object");
            options = null;
        }

        // set options if we have any
        if (options) {
            X.setOptions(options);
        }

        // If the DOM is loaded, then we can init.
        // Will get called when/if the document is ready so we can bind to the HTML
        if (_domReady) {
            // don't double bind!
            if (_initialized) {
                return _initPromise.resolve();
            }
            _initialized = true;

            X.application.Controller.init();

            X.publish(X.constants.events.kInitialize);
            X.applyBindings(X.$("html"));


            return _initPromise.resolve();
        }


        // If called externally, we'll resolve when the DOM is ready and our internal init is called.
        return _initPromise.promise();

    };

    var _initialized = false;
    var _domReady = false;
    var _initPromise = X.$.Deferred();


})();
/*
 * class: Binder
 * about:
 * Functional implementation of binding a DOM element to html attributes
 */
X.bindings = (function () {
    // Set scoped shortened variables
    var $ = X.$;

    var _exports = {

        /*********************************************************
         // Bind to an any loaded data models and set up 2 way binding of values set from other elements
         // Bind events to "a" tags
         // Set up formatters and validators
         //
         // Parameters:
         //    containerId - the dom element identifier
         //                  or a $ element
         //    options - supports these boolean options
         //         viewport - containing viewport name
         //         silent - don't dispatch kBindingsApplied event
         //         viewscope - the current viewscope instance requesting the binding
         //         flowscope - the current flowscope instance requesting the binding
         **********************************************************/
        bindContainer : function (containerId, options) {
            options = options || {};
            var _deferred = $.Deferred();
            var $container = X.utils.get$(containerId);


            // Execute any registerd prebinders first
            X.view.binder.executeCustomBinders($container, true, options);

            X.view.binder.bindRepeater($container, options).then(function () {
                X.view.binder.bindTemplate($container, options).then(function () {
                    X.view.binder.bindViewports($container, options);
                    X.view.binder.bindComponents($container, options);
                    X.view.binder.bindEvents($container, options);
                    X.data.binder.bindAttributes($container, options);
                    X.data.binder.bindText($container, options);
                    X.data.binder.bindData($container, options);
                    X.validation.binder.bindValidators($container, options.validationOptions);
                    X.validation.binder.bindFormatters($container, options.formatOptions);

                    // Execute any registerd post binders
                    X.view.binder.executeCustomBinders($container, false, options);

                    if (!options.silent) {
                        X.publish(X.constants.events.kBindingsApplied, options);
                    }

                    _deferred.resolve();
                });
            });

            return _deferred.promise();
        },


        /**********************************************************************************
         * Clean up of memory by unbinding all events associated with children of the DOM element
         *    - should be called BEFORE removing a container from the DOM
         *    - unsubscribe from all events
         *    - remove all viewports in the container
         *
         * @param containerId - the DOM element id or the $ element who's children to unbind
         * @param excludeSelf - don't unbind the passed in parent container, just the children
         */
        unbindContainer : function (containerId, excludeSelf) {
            var $container = X.utils.get$(containerId);
            $container.detach(excludeSelf);

            $("*[data-viewport]", $container).each(function (idx, el) {
                var $el = $(el);
                var vid = $el.attr("data-viewport");
                X.registry.removeViewport(vid);
            });
        }

    };


    return _exports;

})();

X.components.ModalWindow = function () {

    var _viewportId = "x_modal_window",
        _selfCloseEvent = "_selfClose",
        _$modalBg = X.$("#modalBgContainer"),
        _closeCB,
        _closeEvt,
        _blockCloseWhenErrors;

    if (!_$modalBg[0]) {
        // Add the modal background,
        // break the event loop to allow the browser to finish what its doing
        // before we try to attach the background - I.E. barfs if we dont
        setTimeout(function () {
            X.$("<div></div>", {
                id : "modalBgContainer"
            }).appendTo("body").hide();
        }, 0);
    }


    //------------------------------------------
    // Displays the modal window.
    // Contains logic to center and position the
    //      args -
    //          closeButton : [boolean]
    //          closeCallback : [function]
    //          closeEvent : [string]
    //-------------------------------------------
    this.show = function (args) {
        var self = this;
        args = args || {};

        // Create our DOM elements if we need to
        X.registerViewport(this.getViewPortId());
        this.create();
        _closeCB = args.closeCallback;


        var $modal = X.$("#modalContainer"),
            $modalClose = X.$("#modalClose"),
            $modalBg = X.$("#modalBgContainer"),
            $window = X.$(window);

        if (args.closeButton) {
            $modalClose.on("click", function () {
                self.hide(_selfCloseEvent);
            });
            $modalClose.show(0);
        }
        else {
            $modalClose.off("click");
            $modalClose.hide(0);
        }

        if ($modal.is(":hidden")) {

            var viewportHeight = parseInt($window.height(), 10),
                modalHeight = parseInt($modal.height(), 10),
                newTop = parseInt((viewportHeight / 2) - (modalHeight * 2), 10);

            if (newTop < 5) {
                newTop = 5;
            }
            //            $modal.css({'position' : 'relative', 'top' : newTop});
            $modal.fadeIn().removeClass('xModalHide').addClass('xModalShow');
            $modalBg.css({display : 'block'});
        }

        if (args.closeEvent) {
            _closeEvt = args.closeEvent;
            X.subscribe(args.closeEvent, this.hide, this);
        }

        _blockCloseWhenErrors = args.blockCloseWhenErrors;

    };

    //------------------------------------------
    // Hides the modal window.
    //-------------------------------------------
    this.hide = function (data /*from close event*/) {
        var $modalWrapper = X.$("#modalContainer"),
            $modalClose = X.$("#modalClose"),
            $modalBg = X.$("#modalBgContainer");

        if (_blockCloseWhenErrors && data != _selfCloseEvent) {
            // get the viewport and validate
            var _vp = X.registry.getViewport(this.getViewPortId());
            if (_vp && !_vp.validate()) {
                return;
            }

        }
        else {
            _removeErrorTips();
        }

        // unsubscribe from our close event
        // do it here in case the closeCB fires the same event again
        X.unsubscribe(this);
        X.registry.removeViewport(this.getViewPortId());

        // Entirely remove the modal window from the DOM
        // So it can be re-used with different styles if necessary.
        $modalClose.off("click");
        $modalWrapper.remove();
        $modalBg.hide();
        if (X._.isFunction(_closeCB)) {
            _closeCB(data);
        }
        _closeCB = null;
    };

    //------------------------------------------
    // Hides the modal window.
    //-------------------------------------------
    this.create = function () {
        var $modal = X.$("#modalContainer");
        if ($modal[0]) {
            return;
        }

        // Set up the modal container
        $modal = X.$("<div />", {
            id : "modalContainer"
        }).appendTo("body").hide();

        // Add the inner viewport
        X.$("<div data-viewport='" + _viewportId + "'></div>").appendTo($modal);

        // Add the close button
        X.$("<div></div>", {
            id : "modalClose"
        }).appendTo($modal).hide();

    };

    //-------------------------------------------------------
    // Get the id of the div we want to use as the viewport
    //-------------------------------------------------------
    this.getViewPortId = function () {
        return _viewportId;
    };

    var _removeErrorTips = function () {
        X.removeErrorTips(_viewportId);
    };

};


X.registerComponent(X.constants.interfaces.kModalWindow,
    new X.components.ModalWindow(), true);
/**
 * class: X.components.screenTransitioner
 *
 * Transition a screen in or out of view, based on bShow flag, and call the callback when done
 * .
 * The transitionScreen function receives options (see below) which contain the key/value pairs specified in the data-nav-options attribute of the html.
 * Those options can be used to vary the type of transition effect based on the current circumstances.
 * For example, one could specify in the html data-nav-options="{transition:"vertical",speed:"slow"}
 * This baseline implementation of the ScreenTransitioner doesn't use the options,
 * but it's easy to extend this implementation and register a different version using this syntax at the start of the application:
 * X.registerInterface(new MyEnhancedScreenTransitioner());  // MyEnhancedScreenTransitioner must extend X.flow.I_ScreenTransitioner.extend
 *
 */
X.components.ScreenTransitioner = function () {

    /**
     * The main method of the ScreenTransitioner.  This method is responsible for transitioning a given screen into or out of view,
     * and calling the callback when the transition is complete.
     *
     * @param args - an object containing the following properties
     *      $target - jquery container which holds the screen that's to be transitioned
     *      callback - function which must be called when the transition is complete
     *      options - contains key/value pairs specified in the data-nav-options attribute.  These can be used to vary the transition effect based on the circumstance.
     */
    this.show = function (args) {
        var callback = args.callback;
        var options = args.options || {};
        if (args.$target) {
            args.$target.fadeIn(200, callback);
        }
        else if (callback) {
            callback();
        }
    };

    this.hide = function (args) {
        var self = this,
            options = args.options || {};

        if (args.$target) {
            args.$target.fadeOut(200, function () {
                if (args.callback) {
                    args.callback();
                }
            });
        }
        else if (args.callback) {
            args.callback();
        }

    };

};
X._.extend(X.registry, {

    /**
     * Register a viewport
     *
     * @param name
     * @param viewport
     * @returns {*} - the registered viewport
     */
    registerViewport : function (name, viewport, dontReplace) {
        // Component must implement a Viewport
        //        if (!(viewport instanceof X.view.ViewController)) {
        //            throw new X.Exception("X.registry", "registerViewport: view must be a X.view.ViewController: ", X.log.ERROR);
        //        }
        var vp = this.getViewport(name);
        if (vp && !dontReplace) {
            X.trace("Viewport: " + name + " already registered -- deleting old one");
            vp.deinitilaize();
        }
        if (vp && dontReplace) {
            return vp;
        }
        // this call will delete the viewport if it exitsts then add a new one
        vp = this._register(X.constants.registry.kViewports, name, viewport, dontReplace);
        vp.init();

        return vp;

    },


    getViewport : function (name) {
        return this._get(X.constants.registry.kViewports, name);
    },

    removeViewport : function (name) {
        var vp = this._get(X.constants.registry.kViewports, name);
        if (!vp) {
            return;
        }
        vp.deinitilaize();
        this._remove(X.constants.registry.kViewports, name);

    },

    /**
     * @param name - name of the binder to register
     * @param binderFunc - [function] to execute as part of bindings, the container will be passed as the argument of the function
     * @param preBinder - [boolean] true will execute the function BEFORE any of the bindings, false will execute the function AFTER the bindings
     */
    registerCustomBinder : function (name, binderFunc, preBinder) {
        this._register(preBinder ? X.constants.registry.kCustomBinderPre : X.constants.registry.kCustomBinderPost, name, binderFunc);
    },

    getCustomBinders : function (preBinder) {
        return this._getAll(preBinder ? X.constants.registry.kCustomBinderPre : X.constants.registry.kCustomBinderPost);
    }


});
//-------------------------------------------------------------------------------------
// class: Viewport Controller Class
//
//  About : This class manages the flows and views of in a specific viewport and the navigation events posted by the application to that drive those flows.
//
//  Events :
//      X.constants.events.kBeforePageUnload : page is about to be unloaded
//          {"pageAlias" : <page reference>}
//
//      X.constants.events.kBeforePageLoad : After the page has been resolved, but before the page has loaded;
//          {"pageAlias" : <page reference>, "customerProfile" : <customer profile information - how long they were on the page>}
//
//      X.constants.events.kPageLoaded : after a page is finished loading - before bindings applied to page
//          {"pageAlias": <page reference>}
//
//      X.constants.events.kPageFinalized : after a page is finished loading - and all processing is complete
//          {"pageAlias": <page reference>, "pageProfile" : <page profile information>}
//
//      X.constants.events.kEndFlow : ran off the end of the controller, no more pages
//          X.flow.flowResponse that contains information about the last node
//
//-------------------------------------------------------------------------------------

X.view.ViewController = function (viewId, options) {
    // Set scoped shortened variables
    var _ = X._,
        $ = X.$;

    var _viewport = {

        init : function () {
            // Now see if we got a directive to start up a flow or page
            var flow = X.resolveDynamicData(_options.getSome || _options.loadFlow);
            var flowOptions = _options.loadFlowOptions || _options.getSomeOptions;
            var page = _options.loadPage;
            var pageOptions = _options.loadPageOptions;
            _.omit(_options, ['getSome', 'loadFlow', 'loadPage', 'getSomeOptions', 'loadPageOptions', 'loadFlowOptions']);


            // set up options based on default settings, config overrides, and passed in settings
            _setOptions();

            // Gen up our history if necessary
            var history = _options.viewportHistory || {};
            // see if we need to track history for this viewport
            if (history.enableTracking) {
                _autoBackNavEvent = history.autoBackNavigationEvent;
                if (_autoBackNavEvent) {
                    _history = new X.view.ViewportHistory(_name, history);
                    _history.start();
                }
                else {
                    _publishError("History enabled but no back event specified");
                }
            }

            // set up our screen transitioner
            if (_options.screenTransitionerClass) {
                var STConstructor = X.utils.stringToFunction(_options.screenTransitionerClass);
                _pageTransitoner = new STConstructor();
            }

            X.subscribe(X.constants.events.kNavigation + "." + _name, _handleNavEvent, _viewport);

            setTimeout(function () {
                if (flow) {
                    _viewport.startFlow(flow, flowOptions);
                }
                else if (page) {
                    _viewport.loadPage(page, pageOptions);
                }
            }, 0);


        },

        deinitilaize : function () {
            X.unsubscribe(_viewport);
            _onControllerEnd();
            if (_history) {
                _history.stop();
                _history = null;
            }
        },

        isBusy : function () {
            return _flowController ? _flowController.isBusy() : false;
        },


        //========================================
        // START A FLOW - creates a new controller
        //    args - options
        //         - inputVars
        //         - complete
        //         - error
        //========================================
        startFlow : function (flowName, args) {
            args = args || {};
            args.options = args.options || {};
            _isModal = args.modal;

            // if we're already running, clean up the current controller before starting a new one
            if (_flowController) {
                X.trace("Starting flow with existing controller - deleting current flow", X.log.INFO);
                _onControllerEnd(null, _startFlow);
            }
            else {
                _startFlow();
            }

            // start a new controller
            function _startFlow () {
                _flowController = new X.flow.Controller({
                    context : _name,
                    onEndCB : function (resp) {
                        _onControllerEnd(resp, function () {
                            if (_.isFunction(args.complete)) {
                                args.complete(resp);
                            }
                        });
                    },
                    onErrorCB : function (resp) {
                        _onControllerError(resp, function () {
                            if (_.isFunction(args.error)) {
                                args.error(resp);
                            }
                        });
                    },
                    onModalCB : _onControllerModal

                });


                // jump to the first page
                _viewport.doJump(flowName, args.options, args.inputVars);
            }

        },

        //========================================
        // LOAD A PAGE - does not require a controller
        // args -
        //      options
        //      success
        //      error

        //========================================
        loadPage : function (pageRef, args) {
            args = args || {};
            _isModal = args.modal;
            args._samePage = (pageRef == _currentPage);
            _flowscopeNameForNonFlows = args._flowscopeName;
            // If we are currently on a page, clean it up
            _endCurrentPage(args, function () {
                _isBusy = true;
                _loadContent(pageRef, args, function (err, results) {
                    _isBusy = false;
                    if (err && args.error) {
                        return args.error(err);
                    }
                    else if (args.success) {
                        args.success(results);
                    }
                });

            });
        },

        //========================================
        // GET NEXT PAGE - in a flow
        //========================================
        doNext : function (response, options) {
            var self = this;

            // If we are currently on a page, clean it up
            _endCurrentPage(options, function () {
                if (_flowController) {
                    _isBusy = true;
                    var _expectingAnotherPage = false;
                    var __loadContent = function (flowResp) {
                        _loadContent(flowResp.value, options, function (err, results) {
                            _autoNavHandler.handleAutoNav(flowResp.autoNav, options);
                        });
                    };

                    _flowController.getNextView(response, function (flowResp) {
                        if (_expectingAnotherPage) {
                            // end the current page to clean up
                            _endCurrentPage(options, function () {
                                __loadContent(flowResp);
                            });
                        }
                        else {
                            __loadContent(flowResp);
                        }
                        _expectingAnotherPage = flowResp.data.messageNode;
                    });
                }

            });
        },

        //========================================
        // JUMP - in a flow
        //========================================
        doJump : function (path, options, inputVars) {
            if (!path) {
                _publishError("doJump: No path specified");
                return;
            }
            // If we are currently on a page, clean it up
            _endCurrentPage(options, function () {
                if (typeof path === "string") {
                    path = path.split(X.flow.constants.kNavigationSeperator);
                    _.each(path, function (itm, idx) {
                        if (0 === idx) {
                            path[idx] = new X.flow.NavigationObject(itm, inputVars, options);
                        }
                        else {
                            path[idx] = new X.flow.NavigationObject(itm);
                        }
                    });
                }

                _isBusy = true;
                var _expectingAnotherPage = false;
                var __loadContent = function (flowResp) {
                    _loadContent(flowResp.value, options, function (err, results) {
                        _autoNavHandler.handleAutoNav(flowResp.autoNav, options);
                    });
                };
                _flowController.navigateTo(path, function (flowResp) {
                    if (_expectingAnotherPage) {
                        // end the current page to clean up
                        _endCurrentPage(options, function () {
                            __loadContent(flowResp);
                        });
                    }
                    else {
                        __loadContent(flowResp);
                    }
                    _expectingAnotherPage = flowResp.data.messageNode;

                });
            });

        },

        //========================================
        // Validation of screen elements in this view
        //========================================
        validate : function () {
            var valid = true;
            if (!_options.validationOptions.useValidator) {
                return valid;
            }

            var _validationEngine = X.validation.engine;

            // If we need to validate this form then validate and return true if no errors are present
            // Init the form with default settings (this could be placed in the section where each form is loaded)
            var options = _.extend({}, _options.validationOptions);
            if (window[_currentViewScope] && window[_currentViewScope].validationOptions) {
                options = _.extend(options, window[_currentViewScope].validationOptions);
            }

            // call the validationEngine's validateAll() method which will loop through all of the input fields with "validator" attribute and apply validation logic on them
            valid = _validationEngine.validateAll(_$viewPort, options);

            // CHeck to see if the view scope has an onValidate function that may prevent navigation
            // call it if field validation passed and it exists
            if (valid && window[_currentViewScope] && typeof window[_currentViewScope].onValidate === "function") {
                try {
                    X.trace("Calling onValidate for page: " + _currentPage);
                    valid = window[_currentViewScope].onValidate();
                }
                catch (ex) {
                    _publishError("Page: '" + _currentPage + "' threw an exception onValidate", ex);
                }
            }

            return valid;

        },

        //-------------------------------------------
        // Function: getCurrentFlowVariable
        // get a flow scoped variable out of the current flow
        //  - may return null or undefined
        //
        // Parameters:
        //   name - the name of the variable to get
        //-------------------------------------------
        getCurrentFlowVariable : function (name) {
            if (_flowController) {
                return _flowController.getCurrentFlowVariable(name);
            }
        },

        //-------------------------------------------
        // Function: getCurrentFlowScopeName
        // get the name of the current flow scope
        //  - may return null or undefined
        //
        //-------------------------------------------
        getCurrentFlowScopeName : function () {
            if (_flowController) {
                return _flowController.getCurrentFlowScopeName();
            }
            else if (_flowscopeNameForNonFlows) {
                return _flowscopeNameForNonFlows;
            }

        },

        //-------------------------------------------
        // Function: getCurrentViewScopeName
        // get the name of the current view scope
        //  - may return null or undefined
        //
        //-------------------------------------------
        getCurrentViewScopeName : function () {
            return _currentViewScope;
        },


        //-------------------------------------------
        // Function: forceEnd
        // Force the controller into a premature ending state
        //
        //-------------------------------------------
        forceEnd : function (callback) {
            _onControllerEnd(null, callback);
        }
    };

    //----------------------------------------------------------------------------------------
    // Private
    //----------------------------------------------------------------------------------------

    var _flowController = null,
        _viewResolver = X.getComponent(X.constants.interfaces.kViewResolver),
        _options = options || {},
        _history = null,
        _flowscopeNameForNonFlows = null,// used for modal views as part of a flow.  The view needs access to the current flowscope
        _$viewPort, // = $("[data-viewport='" + viewId + "']"),
        _name = viewId,
        _currentViewScope = null,
        _currentPage = null,
        _isModal = false,
        _autoBackNavEvent = null,
        _pageProfiler = new X.utils.Profiler("VIEW_PROFILE"),
        _customerTimeProfiler = new X.utils.Profiler("CUSTOMER_TIME"),
        _pageTransitoner = null,
        _isBusy = false;


    if (!_viewResolver) {
        _publishError("Missing view resolver");
    }

    //-------------------------------------------
    // Navigation functionality
    //  Listener for navigation events
    //-------------------------------------------
    function _handleNavEvent (options) {
        options = options || {};
        options.currentPage = _currentPage;
        var _vo = _options.validationOptions;

        // Get the right view
        if (_viewport.isBusy()) {
            X.trace("Not navigating while Flow Controller is busy");
            return;
        }

        //----------------------------------------
        // Do any validation on the current viewport
        //----------------------------------------
        var doValidate = true;
        if (options.hasOwnProperty('validate') && options.validate === false) {
            doValidate = false;
        }
        if (options.nav &&
            (options.nav === 'back' || options.nav === _autoBackNavEvent) &&
            options.hasOwnProperty('validate') === false) {
            doValidate = _vo.validateOnBack;
        }
        else if (options.jump && options.hasOwnProperty('validate') === false) {
            doValidate = _vo.validateOnJump;
        }
        else if (options.load && options.hasOwnProperty('validate') === false) {
            doValidate = _vo.validateOnJump;
        }
        else if (options.flow && options.hasOwnProperty('validate') === false) {
            doValidate = _vo.validateOnJump;
        }
        if (doValidate && !_viewport.validate()) {
            return;
        }

        // Now navigate to the next page
        if (options.nav) {
            // got an auto-back event, use the history to go back
            if (_history && options.nav === _autoBackNavEvent) {
                var navEvt = _history.processBack(options);
                _viewport.doJump(navEvt.jump, navEvt);
            }

            else {
                _viewport.doNext(options.nav, options);
            }
        }
        else if (options.jump) {
            _viewport.doJump(options.jump, options);
        }
        else if (options.load) {
            _viewport.loadPage(options.load, options);
        }
        else if (options.flow) {
            _viewport.startFlow(options.flow, options);
        }
    }


    //------------------------------------------
    // Function: _loadContent
    //  1) load the content from the server
    //  2) put the content in a document fragment so we can do manipulation really quickly
    //  3) then bind any data to the input
    //  4) then attach the document fragment to the viewport
    // optional callback when content is loaded
    //-------------------------------------------
    function _loadContent (pageAlias, options, callback) {
        options = options || {};

        // if the viewport hasn't been defined yet (due to it being loaded as part of a document fragment
        // create it here.
        _$viewPort = _$viewPort || $("[data-viewport='" + viewId + "']");

        _pageProfiler.captureTimeFromMark("navTime", "nav");


        // we should be in the midst of navigating if we get here
        if (!_isBusy) {
            X.trace("_loadContent returning without loading page because the busy flag is not set");
            return;
        }

        // Set up before the page loads - get an ID for the VIEW_SCOPE
        _onBeforePageLoad(pageAlias, options);

        _pageProfiler.mark("load");

        // Load the page off the server into memory.
        _viewResolver.resolve(pageAlias).then(
            function (rawHTML) {
                var htmlToLoad = rawHTML;

                // Replace VIEW_SCOPE and FLOW_SCOPE with their IDs to enable multiple ones going on.
                // This needs to be done prior to actually loading the HTML into the DOM.
                htmlToLoad = htmlToLoad.replace(/FLOW_SCOPE/g, _viewport.getCurrentFlowScopeName());
                htmlToLoad = htmlToLoad.replace(/VIEW_SCOPE/g, _currentViewScope);

                // Load the HTML into a temporary container.
                // which essentially creates a document fragment
                // BIND PAGE's Mojo bindings to the document fragment,
                // its tons faster to work on a document fragment rather than the actual document
                var frag = $("<div></div>");
                X.loaders.HTMLLoader.injectHTML({container : frag, html : htmlToLoad, ref : pageAlias});

                _pageProfiler.captureTimeFromMark("loadTime", "load");

                _currentPage = pageAlias;

                // Do any page setup that is necessary
                _beginPage(pageAlias, options);

                //  BIND PAGE's Mojo ATTRIBUTES to the document fragment,
                //  its tons faster to work on a document fragment rather than the actual document
                try {
                    _pageProfiler.mark("bind");
                    X.applyBindings(frag, _.extend(_options, {viewscope : _currentViewScope, flowscope : _viewport.getCurrentFlowScopeName()})).then(function () {
                        _pageProfiler.captureTimeFromMark("bindTime", "bind");
                        __pageFragmentReady(frag);
                    });
                }
                catch (ex) {
                    _publishError("Error binding page", ex);
                    __pageFragmentReady(frag);
                }

            },
            function (ex) {
                callback(ex);
            }
        );

        //---------------------------------------------------
        // Function: once the page is loaded in the DOM
        //---------------------------------------------------
        function __pageFragmentReady (frag) {

            // now attach the fragment to the document and off we go
            _$viewPort.empty().append(frag.contents());

            // show the page
            _doTransition(true, options);


            // Do any processing when the page is completely ready by X.
            _pageReady(pageAlias, options);


            // if there is an anchor, scroll to it
            var scrollTo = options.scrollTo;
            if (scrollTo) {
                var $el = $("#" + scrollTo);
                if ($el[0]) {
                    $el.scrollTo(0, 200);
                }
                else {
                    _publishError("Page Request: '" + pageAlias + "' could not find the Hash: '" + scrollTo);
                }
            }

            // Now profile
            _pageProfiler.captureTimeFromMark("total");
            X.trace("Navigation Time: " + _pageProfiler.getCapture("navTime") +
                    "ms, Load Time: " + _pageProfiler.getCapture("loadTime") +
                    "ms, Binding Time: " + _pageProfiler.getCapture("bindTime") +
                    "ms, Total Time: " + _pageProfiler.getCapture("total") + "ms", ["PROFILE", pageAlias]);

            _pageProfiler.setName(pageAlias);
            X.publish(X.constants.events.kProfile, _pageProfiler);

            _customerTimeProfiler.reset();
            _customerTimeProfiler.setName(pageAlias);
            _customerTimeProfiler.mark("timeOnPage");

            callback(null, {});

        }

    }

    // ------------------------------------------------
    // Invoke the screen transitioner
    function _doTransition (show, opts, cb) {
        if (!_pageTransitoner) {
            return;
        }
        if (show) {
            _pageTransitoner.show({$target : _$viewPort, options : opts, callback : cb});
        }
        else {
            _pageTransitoner.hide({$target : _$viewPort, options : opts, callback : cb});
        }
    }

    // Do any necessary page initialization before the page has loaded into the window scope
    //------------------------------------------------------
    function _onBeforePageLoad (pgAlias, options) {

        // publish an event
        X.publish(X.constants.events.kBeforePageLoad, {"pageAlias" : pgAlias});

        // create a VIEW_SCOPE namespace
        _currentViewScope = X.constants.scopes.kViewScope + "_" + X.utils.uuid(true);

        // Create a default VIEW_SCOPE
        window[_currentViewScope] = {};

        // Add the VIEW_SCOPE model
        X.addModel(_currentViewScope);

    }

    // Do any necessary page initialization
    // After the page has loaded into the window scope
    // But before the bindings
    //------------------------------------------------------
    function _beginPage (pageAlias, options) {

        // if the newly loaded page has an onStart() function, call it in the view name space
        if (window[_currentViewScope]) {
            // set the VIEW_SCOPE object as the value of the model
            // This way we don't have confusing VIEW_SCOPE objects and VIEW_SCOPE models.  They are both the same thing
            var vsm = X.getModel(_currentViewScope);
            if (vsm) {
                vsm._model = window[_currentViewScope];
            }

            if (typeof window[_currentViewScope].onStart === "function") {
                try {
                    X.trace("Calling onStart for page: " + pageAlias);
                    window[_currentViewScope].onStart();
                }
                catch (ex) {
                    _publishError("Page: '" + pageAlias + "' threw an exception onStart", ex);

                }
            }
        }


        // Let anyone that cares that the page is loaded
        X.publish(X.constants.events.kPageLoaded, {"pageAlias" : pageAlias, "viewscope" : _currentViewScope});

    }

    // Do any necessary page processing
    // After all Mojo related manipulation of the page
    //------------------------------------------------------
    function _pageReady (pageAlias, options) {

        var setFocus = (_.isBoolean(options.setFocusOnFirstInput)) ? options.setFocusOnFirstInput : _options.setFocusOnFirstInput;
        // set focus on the first field - only if it is in view
        // otherwise its a crappy experience scrolling past stuff that may be important
        if (setFocus) {
            var inputTypes = _.isArray(_options.setFocusInputTypes) ? _options.setFocusInputTypes.join(",") : '';
            if (inputTypes) {
                var fields = _$viewPort.find(inputTypes)
                    .filter(function (index) {
                        return (
                            $(this).is(":visible") &&
                            $(this).is(":enabled") &&
                            X.utils.isElementCompletelyInView(this)
                        );
                    });

                if (fields[0]) {
                    fields[0].focus();
                }
            }

        }

        // if the newly loaded page has an onReady() function, call it in the view name space
        if (window[_currentViewScope]) {
            if (typeof window[_currentViewScope].onReady === "function") {
                try {
                    X.trace("Calling onReady for page: " + pageAlias);
                    window[_currentViewScope].onReady();
                }
                catch (ex) {
                    _publishError("Page: '" + pageAlias + "' threw an exception onReady", ex);
                }
            }
        }

        // Let everyone know were ready
        X.publish(X.constants.events.kPageFinalized, {"pageAlias" : pageAlias, "viewscope" : _currentViewScope, "pageProfile" : _pageProfiler});

    }


    // Do any necessary cleanup before leaving the current View
    //----------------------------------------------------------
    function _endCurrentPage (options, callback) {

        // Reset our page profiler
        _pageProfiler.reset();
        _pageProfiler.mark("nav");

        if (!_currentPage) {
            callback();
            return;
        }

        // in case any input still has focus trigger a blur event, which will cause a model update before transitioning
        $('input:focus').trigger('blur');
        // scroll to the top when removing a page - if not told to do otherwise

        var scroll = (_.isBoolean(options.scrollToTop)) ? options.scrollToTop : _options.scrollToTop || _options.scrollOptions.toViewport;
        if (scroll) {
            if (!X.utils.isElementTopInView(_$viewPort)) {
                // scroll to 100px above the current viewport or to the options
                var offset = _$viewPort.offset().top - 100;

                // if the option is set to scroll to the browser top, set our target to 0
                if (_options.scrollToTop) {
                    offset = 0;
                }

                // Note: Firefox honors scrolling to the top via the "html" tag while WebKit/standard scroll via "body".
                $('body').scrollTo(offset, 200);
                $('html').scrollTo(offset, 200);

            }
        }

        // Capture time spent on page
        _customerTimeProfiler.captureTimeFromMark("customerTime", "timeOnPage");
        X.trace("Customer time on page: " + _customerTimeProfiler.getCapture('customerTime') + "ms", ["PROFILE", _currentPage]);
        X.publish(X.constants.events.kProfile, _customerTimeProfiler);

        // Let everyone know that we're ending the current page
        X.publish(X.constants.events.kBeforePageUnload, {"pageAlias" : _currentPage, "customerProfile" : _customerTimeProfiler});

        // If there is an onEnd specified in the VIEW_SCOPE, call it
        if (window[_currentViewScope] && typeof window[_currentViewScope].onEnd === "function") {
            try {
                X.trace("Calling onEnd for page: " + _currentPage);
                window[_currentViewScope].onEnd();
            }
            catch (ex) {
                _publishError("Page: '" + _currentPage + "' threw an exception onEnd", ex);
            }
        }

        //Clear any straggling errors from a previous page
        X.removeErrorTips(_$viewPort);

        // Now unsubscribe all VIEW_SCOPE subscriptions
        X.unsubscribe(window[_currentViewScope]);

        // Now remove the VIEW_SCOPE model for the page
        X.removeModel(_currentViewScope, {silent : true});

        // Get the viewport that the view is bound to and unbind everything
        X.unbind(_$viewPort); // Clean up the current view port, not the target view port

        // nullify the onEnd function in the global scope
        // cannot use delete, because delete can only be used on var and functions that are assigned rather
        // than defined through declaration
        window[_currentViewScope] = null;

        // Transition off the page
        if (options._samePage || options.noTransition) {
            callback();
        }
        else {
            _doTransition(false, options, callback);
        }

    }


    //------------------------------------------------
    // Controller callbacks
    //------------------------------------------------
    function _onControllerEnd (flowResponse, callback) {
        // Clean up
        _endCurrentPage({noTransition : true}, function () {
            _currentPage = null;
            _flowController = null;

            // publish an event that we're done
            X.publish(X.constants.events.kEndViewController + "." + _name, {viewport : _name, response : flowResponse});

            if (_.isFunction(callback)) {
                callback();
            }
        });


    }

    //------------------------------------------------
    function _onControllerModal (flowResponse) {
        // show the underlying page
        _doTransition(true, {});

        _flowController.pause();
        _isBusy = true;
        var resumeVal = null;

        // See if we got an indicator that we should navigate when the modal flow is done.
        // Get the list of values that we'll navigate on
        var navValues = flowResponse.modal.navWhenDone;
        if (navValues && typeof navValues === "string") {
            navValues = [navValues];
        }

        // set up options to pass to the modal API's
        var _fs = X.getModel(_flowController.getCurrentFlowScopeName()).getAll();
        var opts = {
            inputVars : _.extend(_.extend({}, _fs), flowResponse.inputVars),
            modal : flowResponse.modal
        };
        _.each(flowResponse.options, function (key, val) {
            opts[key] = val;
        });
        opts.complete = function (responseFromModal) {
            var _navVal = responseFromModal ? (responseFromModal.value || responseFromModal.nav) : null;

            // Now see if our response from the modal is in the list of values
            if (responseFromModal &&
                ( _.contains(navValues, _navVal) ||
                  _.contains(navValues, X.flow.constants.kWildCard)  )) {
                resumeVal = _navVal;
            }

            _flowController.resume(resumeVal, function (flowResp) {
                _loadContent(flowResp.value, flowResponse.options, function () {
                    _isBusy = false;
                });
            });
        };

        switch (flowResponse.state_type) {
            case X.flow.constants.kFlowState :
                X.getSome(flowResponse.value, opts);
                break;

            case X.flow.constants.kViewState :
                opts._flowNode = flowResponse;
                opts._flowscopeName = _viewport.getCurrentFlowScopeName();  // pass in the current flowscope name so the modal page has access to flowscope information
                X.loadPage(flowResponse.value, opts);
                break;
        }
    }

    //------------------------------------------------
    function _onControllerError (flowResponse) {
        if (flowResponse.error instanceof X.Exception) {
            X.publishException(flowResponse.error);

        }
        else {
            X.publishException("View Controller", flowResponse.error);
        }
    }

    function _setOptions () {
        // Start with the default options
        // Deep clone the default options so that the X.options does not get stomped on.
        var _opts = $.extend(true, {}, X.options.viewportOptions["default"]);

        // if there is an override object, it takes precedence over default
        if (typeof X.options.viewportOptions[_name] == "object") {
            _opts = X.utils.mergeObjects(_opts, X.options.viewportOptions[_name]);
        }

        // now passed in options take ultimate precedence
        _options = X.utils.mergeObjects(_options, _opts);

        _options.viewport = _name;

    }

    // -------------------------------
    // Function: _publishError
    // publish error with message
    //
    // Parameters:
    //   msg - the message of the error
    // -------------------------------
    function _publishError (msg, ex) {
        X.publishException("ViewController", "Viewport error: " + _name + " - " + msg, X.log.ERROR, ex);
    }


    // Manage autoNavigation instructions
    // either auto advance the flow controller in a specified time
    // or listen to an event to advance the flow controller
    var _autoNavHandler = (function () {
        var __handler = {
            handleAutoNav : function (autoNavOptions, options) {
                // if we still have a registered event handler when the next page comes in,
                // remove it (ya, it can happen)
                if (__registeredAutoNav.navEvent) {
                    X.unsubscribe(__registeredAutoNav.navEvent, __doAutoNav, __handler);
                }
                if (__timer) {
                    clearTimeout(__timer);
                }

                __registeredAutoNav = _.clone(autoNavOptions || {});

                if (__registeredAutoNav.navEvent) {
                    X.subscribe(__registeredAutoNav.navEvent, __doAutoNav, __handler);
                }
                else if (__registeredAutoNav.time) {
                    __timer = setTimeout(function () {
                        __doAutoNav();
                    }, __registeredAutoNav.time);
                }
            }
        };
        var __registeredAutoNav = {}, __timer;

        function __doAutoNav () {
            _viewport.doNext(__registeredAutoNav.nav, options);
        }

        return __handler;
    })();


    return _viewport;
};

/*
 Utility class that listens for Flow transition events
 And keeps a stack of the VIEW transitions (and ACTIONs if specified).

 This class will also listen for named events to perform a "back" in the system.
 The "Back" pops the last view off the stack and "jumps" to it.
 The named event that this class will listen for is passed in the constructor.
 So it is up to the application to define those events and publish them so this class can do its thing.

 Implementation details :
 As each flow transition is executed in the flow, an event is fired that contains information about the node that it
 is transitioning to.  Most importantly part of this information is the id of the current flow and
 the stack of flows that were executed to get to the node. This transition is put on a stack of recent views.
 When a 'back' is requested the last view on the stack is popped.
 And a jump request is constructed that uses the path element of the item (which, remember, contains a stack of flows that are needed to reach the node).
 As each path element is reconstructed, it uses the id element of the flow to regenerate the flowState of that flow. (It just so happens that the flow's id
 is the same as the FLOW_SCOPED model for that flow, so it is easy to get a handle to it).

 Actions can also be put on this stack, but they have to explicitly have the history : always attribute as part of their definition.
 I think the best practice if you want to put an action in the history is to have history : never on all of the possible view that the action could lead to.

 Flows default to history="always" but can specify "never" in the flow definition, in which case their subflows will also be removed from history.
 Modal flows are always removed from history when they exit.

 Listens for flowTransition events
 {
 "name" : name of the flow,
 "id" : uuid of the flow,
 "def" : flow definition json
 "metaData" : {
 "nodeName" : node name of the flow
 "  path" : array of NavigationObject objects that tell the system how to statefully regen the flows
 }
 }

 flowEnd
 {
 "name" : name of the flow,
 "id" : uuid of the flow,
 "metaData": "metaData" : {
 "nodeName" : node name of the flow
 "path" : array of NavigationObject objects that tell the system how to statefully get to this flow
 }
 }

 */
/**
 *
 * @param viewportId - [string] name of the viewport his history is assoiated with
 * @param options - [object]
 *          - maxSize - [number or null] maximum number in entries in the history stack
 */
X.view.ViewportHistory = function (viewportId, options) {

    var _impl = {

        start : function () {
            X.subscribe(X.constants.events.kFlowTransition + "." + _viewport, _captureTransition, _impl);
            X.subscribe(X.constants.events.kFlowEnd + "." + _viewport, _captureFlowEnd, _impl);
        },

        stop : function (clear) {
            if (clear) {
                _impl.clear();
            }
            X.unsubscribe(_impl);
        },

        // Clear the history
        clear : function () {
            _currentTransition = null;
            _history = [];
            _flowScopeMap = {};
        },

        // Create a string representation of the guts of our module so that it can be saved off.
        serialize : function () {
            var s = {
                "flowscopes" : _flowScopeMap,
                "history" : _history,
                "current" : _currentTransition
            };

            return X.utils.jsonSerializer.toString(s);
        },

        // Rehydrate the state of the module. Most likely from what was saved off.
        deserialize : function (str) {
            var s = X.utils.jsonSerializer.toJSON(str);
            _flowScopeMap = s.flowscopes;
            _history = s.history;
            _currentTransition = s.current;
        },

        // pop the last thing off the stack, but don't go back to it
        pop : function () {
            if (_history.length > 0) {
                _history.pop();
            }
        },

        processBack : function (evtOptions) {
            if (_history.length) {

                // Since we're going back, blow away the current transition so it doesn't get put on the stack later
                _currentTransition = null;

                var lastTrans = _history.pop();

                // Sometime it happens when a flow has history=never, a whole flow is removed from the history when it is finished
                // and the last thing left on the stack happens to be the same as the current page that the user is seeing
                // This if the user hits back on the current page, the result is to go back to the same page.
                // We'll fix this here
                while (!_allowDuplicates && lastTrans.stateDef.ref == evtOptions.currentPage) {
                    lastTrans = _history.pop();
                }
                var navPath = [];
                var path = lastTrans.metaData.path;

                // inner function to add a flow jump Object to the path
                var _pushNavigationObjectObj = function (jumpObj) {
                    var inputData = null;
                    var m = X.getModel(jumpObj.id);
                    // flowscope model is still in scope
                    if (m) {
                        inputData = m.serialize();
                        inputData = X.utils.jsonSerializer.toJSON(inputData);
                    }
                    // flow has gone out of scope, reydrate its data from what we saved off
                    else if (_flowScopeMap[jumpObj.id]) {
                        inputData = X.utils.jsonSerializer.toJSON(_flowScopeMap[jumpObj.id]);
                    }

                    navPath.push(new X.flow.NavigationObject(jumpObj.nodeName, inputData, {"modal" : jumpObj.modal, "forceFlowId" : jumpObj.id}));
                };

                // Iterate over the NavigationObject objects and
                // regen the flowscope for each of the nodes in the path to the view
                X._.each(path, function (jumpObj, idx) {
                    _pushNavigationObjectObj(jumpObj);
                });
                // now push the view node on the path
                _pushNavigationObjectObj(lastTrans);


                var _navEvt = evtOptions || {};
                _navEvt.jump = navPath;

                return _navEvt;
            }

            return {};
        }

    };

    var _currentTransition = null,
        _flowScopeMap = {},
        _history = [],
        _forgetWhenDone = {},
        _maxSize = null,
        _allowDuplicates = options.allowDuplicates,
        _viewport = viewportId;


    if (X._.isNumber(options.historySize)) {
        _maxSize = parseInt(options.historySize);
        _maxSize = (_maxSize > 0) ? _maxSize : 0;
    }

    // Event handler that listens for flow transition events
    function _captureTransition (transObj) {
        transObj.modal = transObj.modal || X.application.Controller.inModal();

        if (_maxSize === 0) {
            return;
        }

        // Listen here for a transition off the _currentTransition
        if (_currentTransition) {

            // if we've reached the maximum size of our history list
            // shift off the first item in the history
            if (_maxSize && _history.length == _maxSize) {
                _history.shift();
                // adjust forgetWhenDone object indexes due to the shift
                X._.each(_forgetWhenDone, function (value, key) {
                    if (value <= 0) {
                        delete _forgetWhenDone[key];
                    }
                    else {
                        _forgetWhenDone[key] = value - 1;
                    }
                });
            }

            _history.push(_currentTransition);

            _currentTransition = null;
        }

        // Create a new transition object
        if (_rememberState(transObj)) {
            _currentTransition = transObj;
        }
        if (transObj.stateDef.state_type === X.flow.constants.kFlowState) {
            // if starting a modal flow or a history=never flow, record the flow ref and the starting position in the _history,
            // so flow states can be removed from the history when the flow is done
            if (transObj.stateDef.history === X.flow.constants.historyType.kNever || transObj.modal) {
                _forgetWhenDone[transObj.stateDef.ref] = (_history.length).toString();
            }
        }
    }

    // Capture flow end states so we can save off the flowscoped data.
    // we'll need to hydrate this later if someone wants to back into a flow that has gone out of scope
    function _captureFlowEnd (endObj) {

        // determine if the ended flow needs to be removed from the history
        if (_forgetWhenDone[endObj.name]) {
            var index = parseInt(_forgetWhenDone[endObj.name], 10);
            if (_history[index] && (_history[index].name === endObj.name)) {
                _history.splice(index, _history.length - index);
            }
            delete _forgetWhenDone[endObj.name];
        }
        else {
            var flowId = endObj.id;
            var flowscopeModel = X.getModel(flowId);
            if (flowscopeModel) {
                var data = flowscopeModel.serialize();
                _flowScopeMap[flowId] = data;
                X.trace("VIEW HISTORY - captured flow '" + endObj.name + "' ending with flowscope: " + data);
            }
            else {
                X.trace("viewHistory component could not find flowscoped model for flow: '" + endObj.name + "'", X.log.WARN);
            }
        }
    }

    /**
     * Determine whether a state being transitioned to should be remembered in the history stack.
     * The default is true for views, false for actions.  Other types are never pushed onto the stack.
     */
    var _rememberState = function (transObj) {
        switch (transObj.stateDef.state_type) {
            case X.flow.constants.kActionState:
                return (transObj.stateDef.history === X.flow.constants.historyType.kAlways);
            case X.flow.constants.kViewState:
                return (transObj.stateDef.history !== X.flow.constants.historyType.kNever);
            default:
                return false;
        }
    };


    return _impl;
};
X.view.binder = (function () {
    // Set scoped shortened variables
    var _ = X._,
        $ = X.$;

    var _exports = {

        /**
         * Ferret out any specified viewports in the content and register them
         *
         * @param containerId - the containing DOM element id, or X.$ object
         */
        bindViewports : function (containerId) {
            var $container = X.utils.get$(containerId);
            X.$("*[data-viewport]", $container).each(function (idx, el) {
                var $el = X.$(el);
                var vid = $el.attr("data-viewport");
                var options = $el.attr("data-viewport-options");
                options = X.utils.jsonSerializer.toJSON(options, true) || {};
                X.registerViewport(vid, options);
                X.options.defaultViewport = X.options.defaultViewport || vid;
            });
        },


        /**
         *
         * @param containerId
         * @param inOptions
         * @returns {*}
         */
        bindRepeater : function (containerId, inOptions) {
            var deferred = $.Deferred();

            var $container = X.utils.get$(containerId);
            var $repeaters = $($container).find("[data-repeat]");
            if ($repeaters.length === 0) {
                return deferred.resolve();
            }
            $repeaters.each(function () {
                var $el = $(this);
                var repeaterOpts = $el.attr("data-repeat-options");
                repeaterOpts = X.utils.jsonSerializer.toJSON(repeaterOpts, true) || {};
                var _repeaterInfo = X.utils.parseRepeatAttr($el);
                if (_repeaterInfo) {
                    X.utils.renderRepeater($el, _repeaterInfo, repeaterOpts.customArgs);

                    //                    // push on any nested repeaters
                    //                    _promises.push(X.view.binder.bindRepeater($el, inOptions));

                    // but push any nested templating on the promise stack
                    deferred = X.view.binder.bindTemplate($el, inOptions);

                    // get the default events to listen to based on the data-bindings in the attribute
                    var _databindingEvents = [];
                    _.each(_repeaterInfo.bindings, function (val, nameSpace) {
                        _databindingEvents.push(X.constants.events.kDataChange + '.' + nameSpace);
                    });


                    // if we have a list of other events to listen for
                    // add them to our list
                    var _listenEvts = $el.attr("data-listen");
                    if (_listenEvts) {
                        _listenEvts = _listenEvts.match(/([\.\w]+)/g);
                        _databindingEvents = _.union(_listenEvts, _databindingEvents);
                    }
                    _listenEvts = _databindingEvents.join(",");


                    // set up a listener to re-evaluate ALL attributes when one of these events happens
                    if (_.size(_listenEvts) > 0) {
                        X.subscribe(
                            _listenEvts,
                            function () {
                                var customArg = arguments[arguments.length - 1];
                                // re-evaluate the collection that we're binding to... since it most likely changed
                                var _newInfo = X.utils.parseRepeatAttr(customArg.$el);

                                var focusedId = document.activeElement ? document.activeElement.id : null;    // keep track of the element that has focus
                                X.unbind(customArg.$el, true); // exclude self since we don't want to unbind our listeners

                                // only re-render if the collection length has changed or one of the listeners was fired;
                               // if (arguments.length <= 1 || _.size(_repeaterInfo.collection) != _.size(_newInfo.collection)) {
                                    _repeaterInfo.collection = _newInfo.collection;
                                    X.utils.renderRepeater(customArg.$el, _repeaterInfo, repeaterOpts);
                                //}

                                X.applyBindings(customArg.$el, inOptions);
                                // restore focus in case it was lost due to re-rendering the template
                                // FF and some other browsers loose the caret position when setting focus
                                if (focusedId && focusedId != document.activeElement.id) {
                                    var _$el = $("#" + focusedId);
                                    _$el.focus();
                                    try {
                                        if (_$el.val) {
                                            _$el.caret(_$el.val().length);
                                        }
                                    }
                                    catch (e) {
                                    }
                                }
                            },
                            $el[0],
                            {
                                $el : $el,
                                info : _repeaterInfo
                            }
                        );
                    }

                }
                else {
                    deferred.resolve();
                }
            });

            return deferred.promise();

        },


        /**********************************************************************************
         * bind the events
         *
         * @param containerId - the DOM element id or the $ element
         * @param options - contains
         *              - viewport - the viewport that is currently being bound
         */
        bindEvents : function (containerId, options) {
            var $container = X.utils.get$(containerId);
            //bind any <a>, <input type="button">, and <input type="submit"> to events based
            //on properties in the tag (i.e. data-nav, data-event, data-jump)
            // submit, buttons will be bound to a function that prevents immediate propagation of the event.
            $(_jqEventList, $container).each(function () {
                $(this).bindEvents($container, options);

            });
        },

        // -------------------------------
        // Function: bindComponents
        // bind the UI Widgets
        //
        // Parameters:
        //    containerId - the dom element identifier
        //                  or the $ element
        // -------------------------------
        bindComponents : function (containerId, options) {
            var $container = X.utils.get$(containerId);

            // iterate through all of the elements that have are <component>
            // And replace the <component> tag with the resulting $ element
            $($container).find("uiwidget").each(function () {
                var $el = X.view.componentFactory.create($(this));
                $(this).replaceWith($el);
            });
        },

        /***
         * Function to bind HTML templates to a provided DOM element.
         * @param containerId - DOM element ID or the $ element.
         * @param inOptions - options passed to the binder
         * @param excludeContainer - indicates whether to check the parent/container for template binding.  by default only descendants are searched.
         */
        bindTemplate : function (containerId, inOptions, excludeContainer) {
            inOptions = inOptions || {};
            var _viewResolver = X.getComponent(X.constants.interfaces.kViewResolver);
            var promise = $.Deferred(),
                _promises = [];


            // Determine whether a $ element or just an ID.
            var $container = X.utils.get$(containerId);

            // iterate through all of the elements that have a "data-template" attribute
            var $templateElements;

            if (!_viewResolver) {
                X.publishException("X.bindings", "Missing View Resolver");
                return promise.reject("Missing View Resolver");
            }

            if (!excludeContainer && $container.attr("data-template")) {
                $templateElements = $container;
            }
            else {
                $templateElements = $container.find("[data-template]");
            }

            if ($templateElements.length === 0) {
                return promise.resolve();
            }
            $templateElements.each(function () {

                // Get the template reference and load the HTML into the container
                var $el = $(this),
                    templateReference = X.resolveDynamicData($el.attr("data-template")),
                    lastHashIndex = templateReference.lastIndexOf('#');

                // template is a node that's already in the DOM
                if (lastHashIndex === 0) {
                    var $template = $(templateReference);
                    if ($template.is('script')) {
                        processScriptTemplate($el, $template, inOptions);
                    }
                    else {
                        $el.empty().append($template.contents().clone());  // clone() in order to leave the original template intact
                    }
                    _promises.push($.Deferred().resolve());
                    X.publish(X.constants.events.kTemplateReady + "." + templateReference.substr(1));
                }

                // Load the page off the server into memory.
                else {
                    if (templateReference) {
                        var p = $.Deferred();
                        _viewResolver.resolve(templateReference).then(
                            function (rawHTML) {
                                var _subPromises = [];
                                // Set up any VIEW or FLOW scope info
                                if (inOptions.viewport) {
                                    var _vp = X.registry.getViewport(inOptions.viewport);
                                    if (_vp) {
                                        rawHTML = rawHTML.replace(/FLOW_SCOPE/g, _vp.getCurrentFlowScopeName());
                                        rawHTML = rawHTML.replace(/VIEW_SCOPE/g, _vp.getCurrentViewScopeName());
                                    }
                                }
                                if (isScriptTemplate(rawHTML)) {
                                    processScriptTemplate($el, $(rawHTML).filter('script'), inOptions);  // need to filter in case there is a comment above the script
                                }
                                else {
                                    // Process and Load the HTML into the element.
                                    X.loaders.HTMLLoader.injectHTML({container : $el, html : rawHTML, ref : templateReference});
                                    _subPromises.push(X.view.binder.bindRepeater($el, inOptions));
                                    _subPromises.push(X.view.binder.bindTemplate($el, inOptions, true));
                                }
                                $.when.apply($, _subPromises).always(function () {
                                    p.resolve();
                                });
                                X.publish(X.constants.events.kTemplateReady + "." + templateReference);
                            },
                            function (ex) {
                                p.reject();
                                X.publishException("Bindings", "Error Details: Unable to load data-template. Template Reference: " + templateReference);

                            }
                        );
                        _promises.push(p);
                    }
                    else {
                        X.trace("Template reference is NULL", X.log.INFO);
                    }
                }

            });

            $.when.apply($, _promises).always(function () {
                promise.resolve();
            });

            return promise.promise();
        },

        /**
         * @private
         * Execute an custom binders that have been registered
         * @param containerId
         * @param preBinder
         */
        executeCustomBinders : function (containerId, preBinder, options) {
            var $container = X.utils.get$(containerId);
            var binders = X.registry.getCustomBinders(preBinder);
            if (!binders) {
                return;
            }
            _.each(binders, function (bindFunc, idx) {
                if (_.isFunction(bindFunc)) {
                    bindFunc($container, options);
                }
            });
        }
    };

    //----------------------------------------------------------------------------------------
    // Private
    //----------------------------------------------------------------------------------------

    /**
     * @private
     * $ attribute list of event types
     */
    var _jqEventList = _.map(X.constants.eventDirectives, function (str) {
        return '*[' + str + ']';
    }).join(',');


    /**
     * @private
     * Process a template by extracting the data attribute and sending it to the template engine.
     * Also listen for events that trigger a re-render of the template.
     * @param $el - the element into which the template is rendered
     * @param $template - the template
     */
    var processScriptTemplate = function ($el, $template, inOptions) {
        var templateType = $template.attr('type');
        if (!templateType || /javascript|ecmascript/i.test(templateType)) {
            X.publishException("X.bindings", "Wrong type of template for binding: " + $template.attr('id'));
            return;
        }
        var templateEngine = X.getComponent(X.constants.interfaces.kTemplateEngine);

        var templateData,
            _modelRefs = {},
            dataAttr = $el.attr('data-template-options');
        if (dataAttr) {
            templateData = X.resolveDynamicData(dataAttr, _modelRefs); // resolve any dyamic text in options and save off models refs to listen to
            templateData = X.utils.jsonSerializer.toJSON(templateData, true);
        }

        // Render the template
        templateEngine.process($el, $template, templateData);

        // Rerender based on data model references and on the data-template-listen attribute
        var listenAttr = $el.attr("data-listen");
        var eventTypes = _.map(_.keys(_modelRefs), function (val) {
            return 'dataChange.' + val;
        });
        eventTypes = _.union(eventTypes, listenAttr ? listenAttr.match(X.constants.eventSeparatorMatch) : []);
        if (eventTypes) {
            if (!$el[0].templateListener) {
                $el[0].templateListener = function (ev) {
                    var self = $el[0];
                    X.unbind($el, true); // exclude self since we don't want to unbind our listeners
                    X.applyBindings($el, _.extend(inOptions, {silent : true, skipTemplates : true}));
                };
                //var eventTypes = listenAttr.match(X.constants.eventSeparatorMatch);
                _.each(eventTypes, function (eventType) {
                    X.subscribe(eventType, $el[0].templateListener, $el[0]);
                });
            }
        }

    };

    /**
     * @private
     * Determine whether a raw string contains a dynamic template, based on the script type
     * @param rawTxt
     * @returns {boolean}
     */
    var isScriptTemplate = function (rawTxt) {
        var rawNoComment = rawTxt.replace(/<!--[\s\S]*?-->/g, "");  //will also strip out the comment pattern within js strings, which is ok in this case but not in general.
        var tag = rawNoComment.match(/<.*?>/);
        if (!tag) {
            return false;
        }
        var firstTag = tag[0];
        var isJavaScript = !/type.*=/i.test(firstTag) || /javascript|ecmascript/i.test(firstTag); // no-type or javascript-type = javascript
        return !isJavaScript;
    };


    return _exports;
})();

X.view.componentFactory = (function () {

    var _impl = {
        create : function ($el) {
            var configStr = $el.attr("data"),
                configObj = null;

            try {
                if (configStr) {
                    configObj = X.resolveDynamicData(configObj);
                    configObj = X.utils.attributeUtil.toJSON(configStr, true);
                }
            }
            catch (ex) {
                X.publishException("componentFactory", "could not parse data specification: " + configStr,  X.log.ERROR, ex);
            }

            var componentName = $el.attr("name");
            var component = X.registry.createUIComponent(componentName);

            if (!component) {
                X.publishException("componentFactory", "The specified component " + component + " is not found in the list of registered components");
                return;
            }

            // create the component, it will return a X.$ element that defines the UI layout
            // Config object may be null depending on the widget.
            // it will be up to the widgets to throw if they need the config
            return component.create($el, configObj);

        }
    };

    return _impl;
})();

/**
 * @class X.components.TemplateEngineUnderscore
 * @implements X.view.I_TemplateEngine
 *
 * Receives a X.$ element and template. The element can have data specified in the data-template-options attribute.
 * X._ is used to compile the template, after which it's passed the data and the resulting html is inserted into the target element.
 *
 * TODO: The compiled templates can be cached for potential performance improvement on slow devices.
 * That might be helpful especially with complex templates (initial profiling on a desktop with simple templates did not show a significant speed benefit.)
 */

X.components.TemplateEngineUnderscore = function () {
    var _templateCache = [];

    this.process = function ($el, $template, data) {
        try {
            var template = $template.html();
            if (!_templateCache[template]) {
                _templateCache[template] = 1;
            }
            var templateFunction = X._.template(template);  // TODO: in some cases it might be worth caching the compiled template
            $el.html(templateFunction(data));
        }
        catch (ex) {
            X.publishException("TemplateEngineUnderscore", ex.message, X.log.ERROR, ex);
        }
    };
};

// Self register
X.registerComponent(X.constants.interfaces.kTemplateEngine, new X.components.TemplateEngineUnderscore(), true);


/**
 * class: X.components.viewResolver
 *
 * @implements {X.interfaces.viewResolver}
 *
 * about:
 * Functionality to turn a reference of a view into the actual implementation of the view
 *
 * Options :
 *
 *      pathToViews : path to the implementation of html files.
 *                    Can be a string that represents the default path to ALL views,
 *                    Or a hashmap that has a list of namespaces that map to different locations.
 *                    If you use an hashmap, you must define a "default" key
 *                    I.e.
 *                        pathToViews:{
 *                                "ns1":"html/namespace1files/",
 *                                "ns1.views":"html/namespace2files/other/",
 *                                "default":"html/"
 *                        }
 *
 *                    Then in your flow references (in the flow definitions) you reference your flows
 *                    using the namespace in using the following convention.
 *                        <namespace>.<fileReference>
 *
 *                     - everything up to the last '.' is considered a namespace and needs to be resolved in the pathToFlows
 *                     - if there is no namespace (no '.') then the default path will be used
 *
 *                        ns1.page1                     will be mapped to html/namespace1files/ (and page1 will get resolved in the aliasMap)
 *                        ns1.views.page1               will be mapped to html/namespace2files/other/
 *                        page1                         will be mapped to html/  (the default path)
 *
 *
 *
 *      aliasMap    :  map containing the resolution of view references to html file names
 *                     wildcard entry ('*') in the alias map will contain the default extension of the flow names
 *
 *        Note : The item in the aliasMap marked '*' indicates that any view not existing in the map will be mapped directly to their reference name.
 *               The value of the '*' entry specifies the default extension of wildcarded view mappings.
 *
 *               You only need to supply aliasMappings here if your fileAliases do not match exactly to the name of the view.
 *               For example if the name of the fileAlias is page1 and your html file is page1.html, we'll use the wildcard convention, and you don't
 *               need to supply a mapping
 *
 *                        aliasMap:{
 *                          "Pg1":"namespace1/Page1.htm",
 *                          "ns1.Pg2":"Page2.htm",
 *                          "ns2.SubflowPg":"SubflowPage.htm",
 *                          "*":".htm"
 *                        }
 *
 *      cacheParam : parameter to append as a query string to each resolved page reference. can be a string or a function that returns a string.
 *
 *
 */
X.components.ViewResolver = function () {

    /*
     * Function: resolve
     * resolve the path to the view
     *
     * Parameters:
     * pageRef - the period-delimited filepath(eg. "a.b.c") we need to break this filepath into 2 parts.
     *      1st part is the filepath prefix. (eg. "a/b")
     *      2nd part is the actual file alias (eg. "c")
     *
     * We then look for the alias in the ABTest util class to see if there's a match, if not we'll look
     * for a match in the viewResolverConfig object
     *
     * @return promise, resolved with raw HTML, rejected with Exception
     */
    this.resolve = function (pageRef) {
        var parts = _resolve(pageRef);
        // return a promise for when the page loads off server
        return X.loaders.HTMLLoader.load(parts.path, parts.hash);
    };

    /**
     * Look up the page reference and return it to the caller
     * @param pageRef
     */
    this.resolveHref = function (pageRef) {
        var parts = _resolve(pageRef);
        return parts.path + ( parts.href ? ("#" + parts.href) : "");
    };

    // -------------\\
    // -- PRIVATE -- \\
    //----------------\\

    /*
     * Function: construct
     * construct the map
     *
     * Parameters:
     * options - the options object that contains the pathToViews and aliasMap
     *
     */
    var _pathToViews,
        _map,
        _queryParam;


    function _resolve (pageRef) {
        var pathAlias = "default",
            alias = pageRef,
            hash,
            pathToFile = null,
            abTestResolver = X.getComponent(X.constants.interfaces.kABTestResolver),
            page = null;


        var hashIdx = alias.split('#');
        alias = hashIdx[0];
        hash = hashIdx[1];

        // parse the pageRef into pathAlias.fileAlias
        var ns = X.constants.nameSpaceRegex.exec(alias);
        if (ns) {
            pathAlias = ns[1];
            alias = ns[2];
        }

        pathToFile = _pathToViews[pathAlias];
        if (!pathToFile) {
            pathToFile = _pathToViews["default"];
        }
        if (!pathToFile.match(/\/$/)) {
            pathToFile += "/";
        }

        if (_map[pageRef]) {
            page = _map[pageRef];
            X.trace("ALIAS REF: '" + pageRef + "' --> " + page, ["VIEW RESOLVER"]);
        }
        else if (_map[X.constants.kWildCard]) {
            page = alias + _map[X.constants.kWildCard]; // wild card entry will have the default extension
            X.trace("WILDCARD REF: '" + alias + "' --> " + page, ["VIEW RESOLVER"]);
        }
        if (page) {
            pathToFile += page;
            X.trace("FULL PATH RESOLUTION: '" + pageRef + "' --> " + pathToFile, ["VIEW RESOLVER"]);
        }

        var pathToFileABTest = abTestResolver ? abTestResolver.getABTestPage(pageRef, pathToFile) : null;
        if (pathToFileABTest) {
            X.trace(pageRef + " --> " + pathToFileABTest, ["VIEW RESOLVER", "ABTEST"]);
            pathToFile = pathToFileABTest;
        }

        var queryParam = typeof _queryParam === "function" ? _queryParam() : _queryParam;
        if (typeof queryParam === "string") {
            var delimiter = pathToFile.indexOf("?") >= 0 ? "&" : "?";
            pathToFile += delimiter + queryParam;
        }

        return ({
            path : pathToFile,
            hash : hash || ""
        });
    }

    function _init() {
        var options = X.options.viewResolverOptions;

        if (!options) {
            throw new X.Exception("View Resolver", "missing options", X.log.ERROR);
        }

        if (options.cacheParam) {
            _queryParam = options.cacheParam;
        }

        if (typeof options.pathToViews === "object") {
            _pathToViews = options.pathToViews;

            /* Looks for a variable ${foo} in the json object value. If found, will resolve the variable by looking for a key with
             * with the variable name and substituting it's value
             *
             * NOTE: This logic does NOT support a circular reference.
             *       It also does NOT support resolving an unresolved variable during the action of substituting.
             */
            for (var key in _pathToViews) {
                var matchedObj;
                while (( matchedObj = /\$\{(.*?)\}/g.exec(_pathToViews[key])) !== null) {
                    if (_pathToViews.hasOwnProperty(matchedObj[1])) {//Test that the property exists
                        var replaceVal = _pathToViews[matchedObj[1]];
                        _pathToViews[key] = _pathToViews[key].replace(matchedObj[0], replaceVal);
                    }
                    else {
                        throw new X.Exception("View Resolver", matchedObj[0] + " variable cannot be found.", X.log.ERROR);
                    }
                }
            }

            if (typeof _pathToViews["default"] !== "string") {
                throw new X.Exception("View Resolver", "pathToViews must contain a 'default' entry.", X.log.ERROR);
            }
        }
        else if (typeof options.pathToViews === "string") {
            _pathToViews = {"default" : options.pathToViews};
        }
        else {
            throw new X.Exception("View Resolver", "pathToView is invalid.  Must be an object or string.", X.log.ERROR);
        }

        if (typeof options.aliasMap === "object") {
            _map = options.aliasMap;
        }
        else {
            throw new X.Exception("View Resolver", "aliasMap is invalid.  Must be an object", X.log.ERROR);
        }

    }

    // Self initialize and then listen for changes to the config.
    _init();
    X.subscribe(X.constants.events.kOptions + ".viewResolverOptions", _init, this);

};

// Self register after the document is loaded
X.$.ready(function () {
    X.registerComponent(X.constants.interfaces.kViewResolver, new X.components.ViewResolver(), true);
});

X.utils.extend_$({
    // Bind well know events to any elements with the following attributes
    // Supported events:
    //      : data-nav = <navigation value>
    //        data-nav-options = { validate: <true | false> }
    //
    //      : data-jump = <path value>
    //        data-jump-options = { validate: <true | false> }
    //
    //      : data-loadpage = <pageAlias>
    //        data-loadpage-options = { validate: <true | false> }
    //
    //      : data-loadflow = <flowAlias>
    //        data-loadflow-options = { validate: <true | false> }
    //
    //      : data-event = <custom event name>
    //        data-event-options = <{ custom event options }>
    //
    //      : data-set = <'model.propname':'value'>
    //
    // Attach the viewport to the event when it is fired


    bindEvents : function ($parentContainer, inOptions) {
        var options,
            $el = X.$(this),
            evtId = X.utils.uuid(),
            _context = (typeof inOptions == "object") ? inOptions.viewport : null;

        // Set up a click handler for this element that we can assign multiple events to
        $el.prop("eventList", []);
        $el[0].xEventClickHandler = $el[0].xEventClickHandler || function (evt) {
            var $el = X.$(this);
            if (!$el.attr('disabled')) {
                X._.each($el.prop("eventList"), function (func, idx) {
                    func.call($el, evt);
                });
            }
        };

        // return a "throttled" function that can only be called once every 500ms
        function _throttleNavEvent (func, context) {
            var isBlocked = false;

            return function () {
                if (!isBlocked) {
                    func.apply(context ? context : $el, Array.prototype.slice.call(arguments, 0));
                    isBlocked = true;
                }

                setTimeout(function () {
                    isBlocked = false;
                }, 500);
            };
        }

        function _addEventInfo (options) {
            options.$el = $el;
            options.context = _context || X.application.Controller.getContainingViewport($el) || X.options.defaultViewport;
            options.eventId = evtId;
        }


        $el.off("click", $el[0].xEventClickHandler).on("click", $el[0].xEventClickHandler);

        // Execute any custom events or data setting before we navigate
        if ($el.attr('data-event')) {

            options = $el.attr('data-event-options');
            options = X.utils.jsonSerializer.toJSON(options, true) || {};

            $el.prop("event-options", options);
            $el.prop("eventList").push(function () {
                var evt = X.resolveDynamicData($el.attr('data-event'));
                var _opts = $el.prop("event-options");
                _opts = X.resolveDynamicData(_opts);
                _addEventInfo(_opts);
                X.publish(evt, _opts);
            });

        }
        if ($el.attr('data-set')) {

            var setProperty = $el.attr("data-set");
            var setObject = X.utils.attributeUtil.toJSON(setProperty, true) || {};
            $el.prop("eventList").push(function () {
                X._.each(setObject, function (property, name) {
                    var key = X.resolveDynamicData(name);
                    var val = X.resolveDynamicData(property);

                    var parsedProperty = X.utils.splitDataRef(key);
                    X.setDataVal(parsedProperty.modelName, parsedProperty.key, val);
                });
            });

        }

        // Navigation Events
        // Only one of these can be specified
        // Load Flow
        if ($el.attr('data-loadflow')) {
            options = $el.attr('data-loadflow-options');
            options = X.utils.jsonSerializer.toJSON(options, true) || {};

            $el.prop("loadflow-options", options);

            $el.prop("eventList").push(_throttleNavEvent(function (event) {

                var _opts = $el.prop("loadflow-options");
                _opts = X.resolveDynamicData(_opts);
                _opts.flow = X.resolveDynamicData($el.attr('data-loadflow'));
                _addEventInfo(_opts);

                event.preventDefault();
                X.publish(X.constants.events.kNavigation + "." + (options.viewport || _opts.context), _opts);
            }));

        }

        // Navigation Events
        // Load Page
        else if ($el.attr('data-loadpage')) {
            options = $el.attr('data-loadpage-options');
            options = X.utils.jsonSerializer.toJSON(options, true) || {};

            $el.prop("loadpage-options", options);

            $el.prop("eventList").push(_throttleNavEvent(function (event) {
                var _opts = $el.prop("loadpage-options");
                _opts = X.resolveDynamicData(_opts);
                _opts.load = X.resolveDynamicData($el.attr('data-loadpage'));
                _addEventInfo(_opts);

                event.preventDefault();
                X.publish(X.constants.events.kNavigation + "." + (options.viewport || _opts.context), _opts);
            }));

        }

        // Navigation Events
        // Navigate
        //-------------------------------
        else if ($el.attr('data-nav')) {
            options = $el.attr('data-nav-options');
            options = X.utils.jsonSerializer.toJSON(options, true) || {};

            $el.prop("nav-options", options);

            $el.prop("eventList").push(_throttleNavEvent(function (event) {

                var _opts = $el.prop("nav-options");
                _opts = X.resolveDynamicData(_opts);
                _opts.nav = X.resolveDynamicData($el.attr('data-nav'));
                _addEventInfo(_opts);

                event.preventDefault();
                X.publish(X.constants.events.kNavigation + "." + (options.viewport || _opts.context), _opts);
            }));

        }


        // Navigation Events
        // Jump
        else if ($el.attr('data-jump')) {
            options = $el.attr('data-jump-options');
            options = X.utils.jsonSerializer.toJSON(options, true) || {};

            $el.prop("jump-options", options);

            $el.prop("eventList").push(_throttleNavEvent(function (event) {

                var _opts = $el.prop("jump-options");
                _opts = X.resolveDynamicData(_opts);
                _opts.jump = X.resolveDynamicData($el.attr('data-jump'));
                _addEventInfo(_opts);

                event.preventDefault();
                X.publish(X.constants.events.kNavigation + "." + (options.viewport || _opts.context), _opts);
            }));

        }

        else if ($el.attr('data-href')) {
            $el.prop("eventList").push(_throttleNavEvent(function (event) {
                var href = X.resolveDynamicData($el.attr('data-href'));
                var viewResolver = X.getComponent(X.constants.interfaces.kViewResolver);
                document.location.href = viewResolver.resolveHref(href);
            }));


        }

    }
});

X._.extend(X.registry, {

    registerUIComponentClass : function (name, ComponentClass, dontReplace) {

        // Component must implement a UI Component Interface
        // So lets do a quick check here
        var component = new ComponentClass();
        if (component.interfaceType !== "uiComponent") {
            throw new X.Exception("X.registry", "Register: component must implement a UI interface: ", X.log.ERROR);
        }
        component = null;

        this._register(X.constants.registry.kUIComponents, name, ComponentClass, dontReplace);
        X.trace("added UI component, name = " + name);
    },

    // Look up the registered UI component in our registry and then
    // new one up and return it.
    // May return null if the new fails, or the component doesn't exist
    createUIComponent : function (name) {
        var UI = this._get(X.constants.registry.kUIComponents, name);
        if (UI) {
            return new UI();
        }
        else {
            X.publishException ("X.registry", "createComponent: component: '" + name + "' does not exist");
            return null;
        }
    }

});

/**
 * Parse an element with the data-repeat attribute;
 *
 * @param $el
 * @returns {key, collection, stamp, bindings}
 */
X.utils.parseRepeatAttr = function ($el) {
    var attr = $el.attr("data-repeat");
    attr = attr.trim();
    var bindings = {};

    // get the bindings from the top level element
    X.resolveDynamicData(attr, bindings);


    // split the attribute into its parts (key operator collection)
    // and collection will be considered all text after the operator
    var parts = attr.split(/\s+/);
    if (!parts || parts.length < 3 || !X._.contains(["in", "inModelGroup"], parts[1])) {
        X.publishException("X.utils.parseRepeatAttr", "Invalid data-repeat: " + attr);
        return null;
    }

    // remove the (key and operator) from the attribute and piece the rest back to get the collection.
    var collection = X.utils.evaluateSimpleOperand(parts.splice(2).join(" "));
    if (parts[1] === "inModelGroup") {
        collection = X.getModelGroup(collection, true);
    }
    else if (collection && typeof collection == "string") {
        collection = X.utils.stringToFunction(collection);
    }

    return {
        "key" : parts[0],
        "collection" : collection,
        "stamp" : X.utils.htmlUnescape($el.html()),
        "bindings" : bindings
    };
};

/**
 * Given the
 * @param $el - the X.$ element that represents the parent of the repeated elements
 * @param repeaterInfo
 *  - key
 *  - collection
 *  - stamp
 *  - bindings
 *  @param args - extra arguments passed to the repeater (object of n/v pairs)
 * @returns {string}
 */
X.utils.renderRepeater = function ($el, repeaterInfo, args) {
    args = args || {};

    // Function to stamp out the HTML of the repeater element
    function _repeaterFunc () {
        if (!repeaterInfo.collection) {
            X.trace("Repeater collection is empty, no data rendered. Repeater Element: " + X.utils.htmlEscape($el[0].outerHTML), X.log.INFO);
            return;
        }
        if (!repeaterInfo.collection || !repeaterInfo.key || !repeaterInfo.stamp) {
            var _msg = !repeaterInfo.collection ? "collection" : !repeaterInfo.key ? "key" : "stamp";
            _msg = "Invalid " + _msg;
            X.publishException("X.utils.repeaterFunc", "Invalid arguments passed to repeater: " + _msg + " Repeater Element: " + $el[0].outerHTML);
            return "";
        }

        var _index = -1, _first = false, _last = false, _middle = false, _count = X._.size(repeaterInfo.collection), result = "";

        X._.each(repeaterInfo.collection, function (item, key) {
            _index++;
            _first = (_index === 0);
            _last = (_index === repeaterInfo.collection.length - 1);
            _middle = !_first && !_last;
            var _args = X._.extend({_count : _count, _index : _index, _key : key, _first : _first, _last : _last, _middle : _middle}, args);
            _args[repeaterInfo.key] = (item instanceof X.data.Model) ? item.getAll() : item;

            result += _resolveRepeaterArgs(repeaterInfo.stamp, _args);
        });
        return result;
    }

    // Function to replace any repeater arguments with their values in the HTML stamp
    function _resolveRepeaterArgs (inStr, args) {
        // change all model references so the dont interfere with the search for expressions
        inStr = inStr.replace(/\$\{([^\s]*)\}/g, function () {
            return "X_MODEL(" + arguments[1] + ")";
        });

        // evaluate only the expressions that contain any references to our arguments
        var keys = X._.keys(args).join("|");
        inStr = inStr.replace(X.constants.expressionRegexPattern, function () {
            var regex = new RegExp("(" + keys + ")");
            var found = arguments[1].match(regex);

            // the expression has one of our arguments in it
            // resolve the whole thing
            // (change the model references back, first)
            if (found) {
                var expStr = arguments[0].replace(/X_MODEL\((.*?)\)/g, function () {
                    return "${" + arguments[1] + "}";
                });
                return X.resolveDynamicData(expStr, {}, args);
            }
            else {
                return arguments[0];
            }

        });

        // Now that we're done replacing repeater arguments in the html string,
        // return the model references back
        inStr = inStr.replace(/X_MODEL\((.*?)\)/g, function () {
            return "${" + arguments[1] + "}";
        });

        return inStr;
    }


    // create the contents of the repeater in a temporary div that is not attached to the DOM
    // which essentially creates a document fragment
    // BIND PAGE's Mojo bindings to the document fragment,
    // its tons faster to work on a document fragment rather than the actual document
    var frag = X.$("<div></div>");
    frag.html(_repeaterFunc());

    // now append the document fragment back to the element
    // TODO - this can't be the best way to do this because during a re-render, if any
    // of the elements have state (i.e. checked or disabled) it'll be lost.
    $el.empty().append(frag.contents());

};




/*
 The main interface to the data binding module
 */

// set up the data namespace
X.data = {
    binder : {}
};

X._.extend(X, {

    /**
     *
     * @param $container
     * @param options
     */
    attach : function ($container, options) {
        $container = X.utils.get$($container);
        if (!$container.length) {
            $container = X.$('body');
        }
        options = options || {};
        X.data.binder.bindText($container, options);
        X.data.binder.bindAttributes($container, options);
        X.data.binder.bindData($container, options);
    },

    /**
     * Remove bindings from the DOM.
     *      Otherwise memory leaks may occur if the DOM is blown away and formatters are still attached to elements
     *
     * @param $container  - the dom element identifier
     *                      or the Xinch.$ element
     */
    detach : function ($container) {
        $container = X.utils.get$($container);
        $container.unbind();
    },


    /**
     * Add a model
     *
     * @param  modelName :   string name of model (or instance of a X.data.Model
     * @param args object containing one or more optional properties:
     *          className:   string that is the class of the model to create - defaults to "X.data.Model"
     *          daoName:     name of DAO
     *          groupId:     name of a group to associate this model with (can be an array)
     *          schema:    reference to the JSON model schema (or the JSON object itself)
     *
     * @returns model instance
     */
    addModel : function (modelName, args) {
        args = args || {};
        var model;
        var schema;

        if (!modelName) {
            X.publishException("DATA API", "addModel requires a valid name", X.log.WARN);
            return null;
        }
        else if (modelName instanceof X.data.Model) {
            return X.registry.registerModel(modelName, true /* dont overwrite */);
        }


        // backwards compatibility if someone passes in the model name as part of the args
        if (X._.isPlainObject(modelName) && modelName.modelName) {
            args = modelName;
            modelName = modelName.modelName;
        }

        // If the model name is invalid, bail
        if (!modelName.match(X.constants.modelNameRegex)) {
            X.publishException("DATA API", "invalid model name: '" + modelName + "'", X.log.WARN);
            return null;
        }


        // If the model already exists, get out cheap
        var existingModel = X.getModel(modelName);
        if (existingModel) {
            X.trace("addModel: Model '" + modelName + "' already exists. Not adding model.");
            return existingModel;
        }


        // turn schema into an an actual Schema instance if can be (model schemas should be pre-loaded)
        if (args.schema) {
            if (args.schema instanceof X.data.Schema) {
                schema = args.schema;
            }
            else if (X._.isPlainObject(args.schema)) {
                schema = new X.data.Schema(args.schema);
            }
            else if (X._.isString(args.schema)) {
                schema = X.registry.getSchema(args.schema);
            }
        }

        var className = args.className || X.options.defaultModelClass || "X.data.Model";
        var ModelConstructor = X.utils.stringToFunction(className);
        model = new ModelConstructor({
            modelName : modelName,
            daoName : args.daoName,
            schema : schema,
            groupId : args.groupId,
            allowInvalidDataInModel : args.allowInvalidDataInModel
        });


        X.registry.registerModel(model, true);


        return model;
    },


    /**
     * Add an array of models
     *
     * @param models  associative array of models, each item is an object with one or more of these properties:
     *    modelName :   {
     *       className:   string that is the class of the model to create - defaults to "X.data.Model"
     *       daoName:     name of DAO
     *       schema:    name of the JSON object representing the model schema or the JSON object itself
     *    },
     *    modelName : {
     *          ....
     *    }
     * @return  array of model instances
     */
    addModels : function (models) {
        var modelsInstances = [];

        X._.each(models, function (args, name) {
            if (X._.isString(args)) {
                name = args;
                args = {};
            }
            modelsInstances.push(X.addModel(name, args));
        });

        return modelsInstances;
    },


    /**
     * Remove a model from the registry
     * @param name - the model name
     * @param args
     *      includePersistedData: boolean clear remote data as well as in memory data
     *      silent : boolean - don't broadcast dataChange event
     *
     * return promise
     */
    removeModel : function (name, args) {
        args = args || {};
        args.modelNames = [name];
        return X.clearData(args).then(function () {
            var m = X.getModel(name);
            if (m) {
                m.destroy();
            }
            X.registry.removeModel(name);
        });
    },


    /**
     * Get a model based on its name
     * @param name - the model name
     * @param autoCreate - create the model if it does not exist
     * @returns the model instance
     */
    getModel : function (name, autoCreate) {
        if (!name || !name.match(X.constants.modelNameRegex)) {
            X.publishException("DATA API", "Model name: '" + name + "' is invalid, cannot contain spaces, single or double quotes");
            return;
        }
        var m = X.registry.getModel(name);
        if (!m && autoCreate) {
            m = X.addModel(name);
        }
        return m;
    },


    /**
     * Return an array of models names based upon the filters passed in against the passed in array of inModels
     * If no inModels are passed in, we'll return ALL models in the system.
     * @param filters
     *          - daoName : the name of the dao associated with the model
     *          - isDirty : has any of the data changed in the model
     *          - noError : the model is error free
     *          - groupId : the model is associated with a group
     *          - attr    : the model has the associated attribute
     *          - fn      : custom callback function that you write to return true | false
     * @param inModels - array of model names or instances to test against.  If empty we'll filter against ALL models in the system
     * @param returnModelInstances - return the array of model instances instead of the names
     * @returns {*}
     */
    getModels : function (filters, inModels, returnModelInstances) {
        return X.registry.getModels(filters, inModels, returnModelInstances);
    },


    /**
     * Get the models names associated with the given group
     *
     * @param groupName
     * @param returnModelInstances - return the array of model instances instead of the names
     *
     * @returns an associative array of modelNames: modelImpl
     */
    getModelGroup : function (groupName, returnModelInstances) {
        return X.registry.getModels({groupId : groupName}, null, returnModelInstances);
    },


    /**
     * Add a model to a specified group (or array of groups)
     * @param modelName
     * @param groupIds - string or array
     */
    addModelToGroups : function (modelName, groupIds) {
        var m = X.getModel(modelName);
        if (m) {
            m.addToGroups(groupIds);
        }
        else {
            X.trace("Data API", "addModelToGroups : model: " + modelName + " does not exist", X.log.WARN);
        }
    },


    /**
     * Load a model schema (out of memory or the file system) and register it for use with models
     *  - if fullPathToSchema is an object, we'll assume that it is the schema definition and not the path.
     *    the object will be registered as a Schema an not pulled off the server
     *
     * @param name - name of the schema that will be registered
     * @param fullPathToSchema - the path to retrieve the json schema off disc ( of Schema definition object )
     * @param dontOverwrite - boolean - if a schema with the name already is registered dont overwrite it.
     *
     * @returns {promise} resolved with a X.data.Schema instance.
     */
    loadSchema : function (name, fullPathToSchema, dontOverwrite) {
        var promise = X.$.Deferred();

        // see if we already have a schema registered
        // if so, return it
        var schema = X.registry.getSchema(name);
        if (schema && dontOverwrite) {
            promise.resolve(schema);
        }

        // if we were passed a schema definition, just register it.
        else if (X._.isPlainObject(fullPathToSchema)) {
            schema = new X.data.Schema(fullPathToSchema);
            X.registry.registerSchema(name, schema, dontOverwrite);
            promise.resolve(schema);
        }

        else {
            X.loaders.JSONLoader.load(fullPathToSchema).then(
                function (data) { // success
                    schema = new X.data.Schema(data);
                    X.registry.registerSchema(name, schema, dontOverwrite);
                    promise.resolve(schema);
                },
                function (ex) { // error
                    X.publishException("Data API", "Failed to load schema: " + fullPathToSchema, X.log.ERROR, ex);
                    promise.reject(ex);
                }
            );
        }


        return promise.promise();
    },

    /**
     * Load one or multiple schemas off the server
     * @param configFile
     *      expecting file to be a json object map of name : path
     *      {
     *          foo : /path/to/fooSchema.json, (or schema definition object)
     *          bar : /path/to/barSchema.json
     *      }
     * @param dontOverwrite
     *
     * @returns {promise} resolved with an array of X.data.Schema instances.
     */
    loadSchemas : function (configFile, dontOverwrite) {
        var promises = [];

        X._.each(configFile, function (path, name) {
            promises.push(X.loadSchema(name, path, dontOverwrite));
        });

        return X.$.when.apply(X.$, promises);

    },

    /**
     * Load a combined model schema file asynchronously, and cache the individual definitions
     * Schemas will be registered in the system for use with models
     *
     * @param pathToSchemasFile - path to combined model schema file
     * @param overwriteExisting - boolean - if a schema with the name already is registered overwrite it.
     *      expecting file to on server be a json object map of name : schema
     *      {
     *          foo : { ... },
     *          bar : { ... }
     *      }
     *
     * @return promise - resolved with raw data from the server
     */
    //loadCombinedSchemas : function (pathToSchemasFile, overwriteExisting) {
    //    var promise = X.$.Deferred();
    //    X.loaders.JSONLoader.load(pathToSchemasFile).then(
    //        function (data) {
    //            X.loadSchemas(data);
    //
    //            promise.resolve(data);
    //        },
    //        function (ex) {
    //            // this is not a fatal error, but will affect performance since the model schemas will get loaded individually
    //            X.publishException("Data API", "Failed to load combined model schemas: "+ pathToSchemasFile, X.log.ERROR, ex);
    //            promise.reject(ex);
    //        }
    //    );
    //    return promise.promise();
    //
    //},


    /**
     * register a DAO
     * @param name - string containing DAO name
     * @param DAOImpl - DAO implementation
     * @param dontOverwrite - if a DAO is already registered with the same name, don't overwrite it
     */
    registerDAO : function (name, DAOImpl, dontOverwrite) {
        X.registry.registerDAO(name, DAOImpl, dontOverwrite);
    },
    /**
     * Get the registered DAO with the requested name
     * @param name
     * @returns X.data.I_DAO instance or null
     */
    getDAO : function (name) {
        return X.registry.getDAO(name);
    },


    /**
     * Set a single data value
     * @param modelName - the name of the model
     * @param key - the name of the model's property to set
     * @param value - the value for the name/value pair
     * @param options - optional object with one or more of the following properties:
     *          silent - boolean to specify that event should not to be sent (default = false)
     *          force  - boolean to set the data even if it's readOnly (default = false)
     *          changed - marks data as having changed, even if the comparison shows otherwise.  Will force a dataChange event
     */

    setDataVal : function (modelName, key, value, options) {
        var model = X.getModel(modelName, X.options.autoCreateModels);
        if (model) {
            model.setDataVal(key, value, options);
        }
        else {
            X.publishException("DATA API", "setDataVal: Model does not exist: " + modelName, X.log.WARN);
        }
    },


    /**
     * Get a model property value
     * @param modelName - the name of the model
     * @param key - the name of the model's property
     * @return {*} - the value of the model's property
     */
    getDataVal : function (modelName, key) {
        var model;
        if (key !== undefined) {
            model = X.getModel(modelName, X.options.autoCreateModels);
            if (model) {
                return model.getDataVal(key);
            }
            else {
                X.publishException("DATA API", "getDataVal: Model does not exist: " + modelName, X.log.WARN);
            }
        }

    },

    /**
     * UnSet a single data value to undefined
     * @param modelName - the name of the model
     * @param key - the name of the model's property to set
     * @param options - optional object with one or more of the following properties:
     *          silent - boolean to specify that event should not to be sent (default = false)
     */
    unsetDataVal : function (modelName, key, options) {
        var model = X.getModel(modelName);
        if (model) {
            model.remove(key, options);
        }
    },

    /**
     * Get the internal data representation of our data model (JSON object)
     *
     * @param modelName
     *          name of the model to extract data from
     * @param options
     *          changedDataOnly : <true | false> - get only data that has changed since the dirty flag was cleared
     *          excludeErrors : <true | false> - dont get elements that are in error
     *
     * @returns {*} - JSON Object
     */
    getAllDataInModel : function (modelName, options) {
        var model = X.getModel(modelName);
        if (model) {
            return model.getAll(options);
        }
        else {
            X.publishException("DATA API", "getAllDataInModel: Model does not exist: " + modelName, X.log.WARN);
            return null;
        }
    },

    /**
     * Save the data to storage
     *
     * @param args
     *  - modelNames - the name of the model or Array of model names, or null/empty
     *  - daoName - optional if you want to only save data from a specific dao
     *  - modelFilters : {
     *          - isDirty : has any of the data changed in the model
     *          - noError : the model is error free
     *          - groupId : the model is associated with a group
     *          - attr    : the model has the associated attribute
     *          - fn      : custom callback function that you write to return true | false
     *    }
     *  - dataFilters : {
     *          - changedDataOnly : <true | false> - only serialize data that has changed since the dirty flag was cleared
     *          - excludeErrors : <true | false> - don't serialize elements that are in error
     *    }
     *  - any name/value pairs that you want to pass to your DAO.  Some ones you can take advantage of for
     *                  leveraging Model Serialize API's
     *
     * We will filter models to pass to YOUR DAO based on the daoName and the changedDataOnly, excludeErrors
     *
     * @return promise
     */
    saveData : function (args) {
        if (typeof args === "string") {
            args = {modelNames : [args]};
        }
        return X.data.DAOFacade.save(args);
    },


    /**
     * Load the data from storage
     *
     * @param args
     *  - modelNames - the name of the model or Array of model names, or null/empty
     *  - daoName - optional if you want to only load data from a specific dao
     *  - any other name/value pairs that you want to pass to your DAO.
     *
     * @return promise
     */
    loadData : function (args) {
        if (typeof args === "string") {
            args = {modelNames : [args]};
        }
        return X.data.DAOFacade.load(args);
    },


    /**
     * Remove the data from remote storage
     *
     * @param args
     *  - modelNames - the name of the model or Array of model names, or null/empty
     *  - includePersistedData : boolean clear remote data as well as in memory data
     *  - silent : boolean to not send dataChange events
     *  - any other name/value pairs that you want to pass to your DAO.
     *
     * @return promise
     */
    clearData : function (args) {
        if (typeof args === "string") {
            args = {modelNames : [args]};
        }
        // clear in memory first.  If not, success may be called from the remote destroy before in memory data can be cleared
        X.registry.clear(args.modelNames, args);
        if (args.includePersistedData) {
            return X.data.DAOFacade.destroy(args);
        }
        else {
            return X.$.Deferred().resolve().promise();
        }

    },


    /**
     * Add a listener to a particular model's changes
     * @param dataRef - the model name, optionally with .propertyName
     * @param callback - function
     * @param context - object, context to run the callback
     */
    addChangeListener : function (dataRef, callback, context) {
        var parsedDataRef = (dataRef.indexOf('.') > 0) ? X.utils.splitDataRef(dataRef) : {modelName : dataRef, key : null, isCollection : false};
        var model = X.getModel(parsedDataRef.modelName);
        var eventType = X.constants.events.kDataChange;
        if (model) {
            model.off(eventType + '.' + dataRef, callback, context); // prevent duplicate subscriptions
            model.on(eventType + '.' + dataRef, callback, context);
        }

    },


    /**
     * Remove listener to a particular model's changes
     * @param dataRef - the model name, optionally with .propertyName
     * @param callback - function, optional
     * @param context - context, optional
     */
    removeChangeListener : function (dataRef, callback, context) {
        var parsedDataRef = (dataRef.indexOf('.') > 0) ? X.utils.splitDataRef(dataRef) : {modelName : dataRef, key : null, isCollection : false};
        var model = X.getModel(parsedDataRef.modelName);
        if (model) {
            model.off(X.constants.events.kDataChange + '.' + dataRef, callback, context);
        }
    }
});




X.constants = X.utils.mergeObjects(X.constants, {
    specialDOMAttributes : ["data-visible", "data-disabled", "data-hidden"],
    booleanDOMAttributes : [/*"disabled",*/ "checked", "compact", "declare", "defer", "ismap",
        "multiple", "nohref", "noresize", "noshade", "nowrap", "readonly", "selected"],


    events : {
        kDataChange : "dataChange",
        kModelCreated : "modelCreated",
        kModelDeleted : "modelDeleted",
        kModelRegistered : "modelRegistered"
    },
    interfaces : {
        kDAO : "DAO"
    },
    registry : {
        kDAOs : "daos",
        kModels : "models",
        kSchemas : "schemas",
        kGroups : "groups"
    },

    modelNameRegex : /(^[^\s\r\n\'\"\.\,]+)$/
});

X.constants.allDirectives = X.constants.allDirectives || ['data-bind', 'data-listen', 'data-bind-options', 'data-listen-options'];
/*
* data module options --------------------------
*/
X._.extend(X.options, {

    // what DOM events to listen to on input elements
    dataBindEvent : ["blur"], // Add 'keyup' to get as you type data-binding

    defaultTextForNullModelValue : "", // Value to show in bound text when the model value is null. - set it to something like DEBUG if you want to see bugs on your side

    // don't perform text binding to text inside these elements
    dontBindTextInNodeList : ["script", "code"],

    autoCreateModels : true, // create models if they are referenced, if false, the application will enforce the creation of models explicitly before using
    defaultModelClass : "X.data.Model", // default model class to use to create models defined in flow definitions


    // When binding, Mojo will convert the attributes in this list to the non data- version of the attribute
    // For example, data-class will be converted to just class
    attributeConversionList : [
        'data-class', 'data-style', 'data-value', 'data-src', 'data-href'
    ],

    visibilityFunction : null,
    disabledFunction : null
});
/* 
 * class: DataModel
 * X.data.modelBaseClass
 *
 * about:
 * 	This is a baseclass javascript class that
 *   provides functionality for handling an In memory data model
 *
 *
 *   Constructor takes the following arguments:
 *       name : REQUIRED - the name of the mode (name CANNOT contain spaces, single, or double quotes)
 *       schema : OPTIONAL - a predefined defintion of the allowed names (keys) in the model.
 *                  If null or empty, the model can be created ad-hoc with any names
 *       mutable : OPTIONAL - allow names (keys) to be added to a predifined model schema.
 *
 *   Events : X.constants.events.kModelCreated -- published when a model is constructed
 *           { "name" : name of the model,
 *             "id" : uuid of the model,
 *             "def" : the model schema object that this model uses (may be null)
 *             "groups" : array of groups that this model is associated with
 *           };
 *
 *           X.constants.events.kDataChange - published whenever a data value is changed due to a setVal call
 *           {
 *             "name" : name of the model,
 *             "id" : uuid of the model,
 *             "groupdId" : the group that this model belongs to based on the defiition (may be null),
 *             "def" : the model schema for the key that is being changed
 *             modelName.key : value being set on the model
 *           }
 *
 *   Note : Derived classes should not override the construct (constructor) method.
 *          If there is any special construction functionality needed, override the 'init' function
 *
 *   Note : if no model schema is passed in, or the model schema is empty
 *          the model will be set as mutable.  If a model schema is passed in with values in it,
 *          mutable will be false unless otherwise specified.
 *
 *   Note : Persistence of models is defined outside of this class.  When a model is added to the system,
 *          it is done so with the X.addModel(model, <persistence strategy name>)  The persistence strategy is
 *          bound to the model and when a save/load is invoked on the strategy, it should query the this models
 *          'serialize' or 'deserialize' methods to get/set the internal data.
 *
 *
 *   Note : schema definition
 *          model schemas are objects created outside this class that describe the constraints of the attributes of model
 *
 *          {
 *               metaData : { // describe
 *                    version : <int>
 *                    mutable : <boolean>, // can elements be dynamically added to this model schema,
 *                                         // If no model schema is found, it will default to true,
 *                                         // If a model schema is found, it will default to false
 *                    groupId: <string>,   // Will group models that are based on this groupId for iterating.
 *                                         // Can be used for multiple copy functionality
 *                },
 *                <model element> : {
 *                     defaultValue: <value to be auto-assigned to this element>
 *                                   syntax is ${model.property} if you want to default to another models value
 *                                   or just a string value otherwise,
 *                     validate: <array> list of validators to be applied to this element,
 *                     format: <string> formatter to be applied to this element,
 *                     type: <STRING | BOOLEAN | NUMBER | DATE | ARRAY | OBJECT>,
 *                     accessibility : <string> reader text for the element
 *                     placeholderText : <string> default text showing in HTML5 compliant browsers
 *                     mapping : <desciptions of how this element is mapped to persistent storage>,
 *                },
 *
 *                ....
 *
 *          }
 *
 */
X.data.Model = X.Class.extend({

    /**
     * construct a new data model
     *
     * @param args
     *    modelName - the name of the data model (required).  Name CANNOT contain spaces, single, or double quotes
     *    schema  - X.data.Schema instance
     *    groupId   - a group to associate this model to (a groupId can be specified in the model Def as well) and a model can be associated with multiple groups
     *    allowInvalidDataInModel - boolean - dont set data if it does not pass validation.
     *
     * Note: Default values are set here during construction of the model if there is a definition file associated with the model.
     *       If default values are used in HTML markup, they are set when the UI element loads.
     */
    construct : function (args) {
        var self = this;

        if (!args.modelName) {
            throw new X.Exception("X.model", "Constructor : 'modelName' parameter is required to create a model", X.log.ERROR);
        }
        if (!args.modelName.match(X.constants.modelNameRegex)) {
            throw new X.Exception("X.model", "Constructor : 'modelName' is invalid, cannot contain spaces, single or double quotes", X.log.ERROR);
        }

        this._id = X.utils.uuid();
        this._name = args.modelName;
        this._dao = args.daoName;
        this._model = {};
        this._nestedModels = {};
        this._attributes = {};
        this._groups = [];
        this._schema = new X.data.Schema();
        this._mutable = true;
        this._allowInvalidData = (X._.isBoolean(args.allowInvalidDataInModel)) ? args.allowInvalidDataInModel : true;
        this._changedData = [];
        this._errorList = [];
        X._.extend(this, X.events.Events);

        if (args.groupId) {
            self.addToGroups(args.groupId);
        }

        if (args.schema) {
            if (args.schema instanceof X.data.Schema) {
                self.setSchema(args.schema);
            }
            else if (X._.isObject(args.schema)) {
                self.setSchema(new X.data.Schema(args.schema));
            }
        }

        self.init();
        X.publish(X.constants.events.kModelCreated, {"name" : self._name, "id" : self._id, "def" : self._schema, "groups" : self._groups});
    },


    /**
     * Derived classes can add any functionality here to finish construction
     */
    init : function () {

    },

    /**
     * Do any clean up when a model is deleted
     */
    destroy : function () {
        var self = this;
        X._.each(this._nestedModels, function (model) {
            if (model) {
                model.destroy();
                X.removeModel(model.getName());
            }
        });
        X.publish(X.constants.events.kModelDeleted, {"name" : self._name, "id" : self._id, "def" : self._schema, "groups" : self._groups});

    },


    /**
     * return the name of the data model
     * @returns {*}
     */
    getName : function () {
        return this._name;
    },

    /**
     * Add this model to the specified group(s)
     * @param groupId
     */
    addToGroups : function (groupId) {
        if (groupId) {
            if (X._.isString(groupId)) {
                groupId = [groupId];
            }
            this._groups = X._.union(this._groups, groupId);
        }
    },

    /**
     * return the groupIds if this model is associated with a common group of models
     * @returns {Array}
     */
    getGroupIds : function () {
        return this._groups;
    },


    /**
     * Set the model Defintion
     * @param schema
     */
    setSchema : function (schema) {
        var self = this;

        if (!(schema instanceof X.data.Schema)) {
            X.publishException("X.DataModel: " + this._name, "Trying to set a schema that is not a X.data.Schema", X.log.ERROR);

            return;
        }
        self._schema = schema;
        // Mutable - can the client add more properties to this model, or is it rigid based on the model schema
        self._mutable = self._schema.mutable();
        if (self._schema.groupId()) {
            self.addToGroups(self._schema.groupId());
        }

        //if (!self._schema.hasDefinition()) {
        //    X.trace("Definition for model '" + self._name +
        //            "' does not exist - creating a free form model", "X.data.Model", X.log.INFO);
        //}

        // Set the default values
        X._.each(this._schema.getAll(), function (value, key) {
            if (X._.has(value, "defaultValue")) {
                // *** BAD - do not assign by reference ***
                // self._model[key] = value.defaultValue;
                self.setDataVal(key, X.resolveDynamicData(value.defaultValue));
            }
            //else {
            //    self._model[key] = ""; // TODO should we really assign empty string?? probably not
            //}
        });


        //var keys = self._schema.keys();
        //X._.each(keys, function (key, idx) {
        //    var df = self._schema.defForKey(key);
        //    if (df && !X._.isUndefined(df.defaultValue) && df.type) {
        //        var type = df.type.toUpperCase();
        //        if (type == "COLLECTION" || type == "ARRAY" || type == "OBJECT") {
        //            X._.each(df.defaultValue, function (val, idx) {
        //                self.setDatVal(key[idx], X.resolveDynamicData(val));
        //                X.trace("Setting default value in model: '" + self._name + "', " + key + " -> " + val);
        //            });
        //        }
        //        else {
        //            self.setDataVal(key, X.resolveDynamicData(df.defaultValue));
        //            X.trace("Setting default value in model: '" + self._name + "', " + key + " -> " + df.defaultValue);
        //        }
        //    }
        //});
    },

    /**
     * returns the model schema as an instance of Schema
     *
     * @returns {*}
     */
    getSchema : function () {
        return this._schema;
    },


    /**
     * return the defintion for this element in this model
     *
     * @param key
     * @returns {*}
     */
    getSchemaforKey : function (key) {
        if (!key) {
            return;
        }
        // if the key is namespaced, dig down to find nested model schemas
        var _keys = key.split(".");
        var _k = _keys.shift();
        while (_keys.length > 0) {
            if (this._nestedModels[_k]) {
                return this._nestedModels[_k].getSchemaforKey(_keys.join("."));
            }
            else {
                _k = _keys.shift();
            }
        }
        return this._schema.defForKey(_k);
    },


    /**
     * attach a random attribute on a model (i.e. description)
     *
     * @param name
     * @param val
     */
    // -------------------------------
    setAttribute : function (name, val) {
        this._attributes[name] = val;
    },

    /**
     * retrieve a random attribute on a model may return null or undefined
     *
     * @param name
     * @returns {*}
     */
    getAttribute : function (name) {
        return this._attributes[name];
    },


    /**
     * has the data changed since the last time the dirty flag was cleared
     *
     * @returns true/false
     */
    isDirty : function () {
        return (!X._.isEmpty(this._changedData));
    },


    /**
     * reset the dirty flag and any changed data
     */
    clearDirty : function () {
        this._changedData = [];
    },


    /**
     *
     * @param name - the name or key for the name/value pair
     * @param val - the value for the name/value pair
     * @param options [optional]
     *          silent - boolean to allow event not to be sent (default = false)
     *          force  - boolean to set the data even if it's readOnly (default = false)
     *          changed - marks data as having changed, even if the comparison shows otherwise.  Will force a dataChange event
     */
    setDataVal : function (name, val, options) {
        options = options || {};
        var self = this,
            _inName = name,
            _namespace,
            _array,
            _obj,

            type = null;

        _array = this._isArray(name);

        // normalize the name
        // i.e. change the associated arrays in the format foo['bar'] -> foo.bar
        // also will normalize non-quoted indexes that are non-numeric foo[bar] -> foo.bar
        // but leaves along valid array indexes foo[0] -> foo[0]
        name = X.utils.normalizeModelRef(name);

        // if the n comes in as dot notation to a nested object, grab that information
        _namespace = name.match(/^(.*)\.(.*)$/);

        function __publishChange (_name, _val, oldVal) {
            if (options.silent) {
                return;
            }

            // broadcast a message that this data has changed
            var obj = {
                "$el" : options.$el, // passed in from jqDataBinder
                "def" : self.getSchemaforKey(name),
                "groupId" : self._groupId,
                "modelName" : self._name,
                "key" : _name,
                "val" : _val,
                "oldval" : oldVal,
                "id" : self._id
            };
            obj[self._name + '.' + _name] = _val;
            //self.trigger(X.constants.events.kDataChange + "." + obj.modelName + "." + obj.key, obj);
            X.publish(X.constants.events.kDataChange + "." + obj.modelName + "." + obj.key, obj);

            //X.trace("setDataVal: '" + n + " = " + v + "'", [X.constants.components.MODEL, this._name]);
        }

        // If we're not allowed to extend this model schema and the
        // passed in name is not in our model
        if (!this._mutable) {
            // normalize name to convert arrays to dot notation and then grab the first namespace
            // to validate against the mutable flag
            var _n = X.utils.normalizeModelRef(name, true).match(/^(.*?)\.(.*)$/);
            _n = _n ? _n[1] : name;
            if (!this._schema.hasKey(_n)) {
                X.publishException("Model: " + this._name + " is not mutable.  Cannot add '" + name +
                        "' to the definition", "X.data.Model", X.log.WARN);
                return;
            }
        }


        // unless options specify otherwise, do dispatch change event, and respect readOnly flag
        var defaults = {
            silent : false,
            force : false,
            trim : false
        };
        options = X._.extend(defaults, options);

        // Trim the value if we need to
        if ((X._.isString(val)) && options.trim) {
            val = val.trim();
        }

        var schema = this.getSchemaforKey(_namespace ? _namespace[1] : name);

        if (schema && schema.readOnly) {
            if (!options.force) {
                // return without setting the readOnly property
                X.trace("Not setting read-only property'" + name + "' of " +
                        this._name, "X.data.Model", X.log.WARN);
                return;
            }
        }

        // enforce schema validation if there is a schema defined
        // if we get a force flag passed to us, don't enforce schema validation.
        var enforceSchema = options.force ? false : (schema && schema.type);


        // make sure the value matches the model schema type(if it is defined), try converting it, if something goes wrong
        // log the error
        if (enforceSchema) {
            type = schema.type;

            if (type.name) {
                type = type.name;
            }
            if (X._.isArray(type)) {
                type = "Array";
            }
            if (X._.isObject(type)) {
                type = "Object";
            }

            var errMsg = "";
            switch (type.toLowerCase()) {
                case "int" :
                case "integer" :
                case "number" :
                    if (!X._.isNumber(val)) {
                        try {
                            if (X._.isString(val)) {
                                // See if the value contains a decimal
                                // get rid of the crap
                                val = val.replace(/[^0-9.]/g, '');
                                val = (val.indexOf('.') >= 0) ? parseFloat(val) : parseInt(val, 10);
                            }
                        }
                        catch (ex) {
                            val = null;
                        }

                        if (typeof value !== "number" || isNaN(val)) {
                            errMsg = "Cannot set '" + name + "' to value '" + val + "' - not a valid number";
                        }
                    }
                    break;
                case "bool" :
                case "boolean" :
                    if (!X._.isBoolean(val)) {
                        try {
                            if (null === val) {
                                val = false;
                            }
                            else if (X._.isString(val)) {
                                if ('true' == val || '1' == val) {
                                    val = true;
                                }
                                else if ('false' == val || '0' == val) {
                                    val = false;
                                }
                            }
                        }
                        catch (ex) {
                            val = null;
                        }

                        if (!X._.isBoolean(val)) {
                            errMsg = "Cannot set '" + name + "' to value '" + val + "' - not a boolean";
                        }
                    }

                    break;
                case "string":
                    if (!X._.isString(val)) {
                        errMsg = "Cannot set '" + name + "' to value '" + val + "' - not a valid string";
                    }
                    break;
                case "function" :
                    if (X._.isString(val)) {
                        val = X.utils.stringToFunction(val);
                    }
                    if (!X._.isFunction(val)) {
                        errMsg = "Cannot set '" + name + "' to value '" + val + "' - not a valid function";
                        return;
                    }
                    break;
                case "model" :
                    // if we got a namespace request
                    // send the second part to the newly created model to set.
                    var _parseName = name.match(/^(.*?)\.(.*)$/);  // non-greedy will grab the key off the
                    var __tempName = _parseName ? _parseName[1] : name;

                    //ex modelName.key = value - set a value in a nested model
                    //ex modelName = {}; - update the nexted model with the data from the object
                    if (!this._nestedModels[__tempName]) {
                        if (val instanceof X.data.Model) {
                            this._nestedModels[__tempName] = val;
                        }
                        else {
                            this._nestedModels[__tempName] = new X.data.Model({modelName : this._name + "~" + __tempName, schema : schema.metaData});
                        }
                    }


                    // if we got a namespace request
                    // send te second part to the newly created model to set.
                    if (_parseName) {
                        this._nestedModels[__tempName].setDataVal(_parseName[2], val, options);
                    }
                    else if (val instanceof X.data.Model) {
                        // nothing to do here
                    }
                    // if we got an object passed as the value, just update the model
                    else if (X._.isObject(val)) {
                        this._nestedModels[__tempName].update(val, options);
                    }
                    else {
                        X.publishException("X.DataModel: " + this._name, "Trying to set a model with a value that is not an n/v pair - ignoring", X.log.WARN);
                        return;
                    }
                    this._model[__tempName] = this._nestedModels[__tempName].getAll();
                    this._setChanged(__tempName);
                    __publishChange(__tempName, this._model[__tempName]);
                    return;


                // fall through to set an internal {} that represents the models data
                // since it is an object passed by reference, updating it will also updata this model
                // and visa versa

                case "array" :
                    if (!X._.isArray(val)) {
                        if (!X._isArray(name)) {
                            errMsg = "Model: " + this._name + ".  Cannot set '" + name + "' to value '" + val + "' - not an array";
                        }
                    }
                    break;
                case "object" :
                    if (!X._.isPlainObject(val)) {
                        errMsg = "Model: " + this._name + ".  Cannot set '" + name + "' to value '" + val + "' - not an object";
                    }
                    break;
                default:
                    break;
            }

            if (errMsg) {
                X.publishException("X.DataModel: " + this._name, "errMsg", X.log.WARN);
                return;
            }

        }


        // See if we block invalid data from getting into the model
        if (!this._allowInvalidData) {
            // if the element fails validation and it is not blank,
            // don't set it.
            if (val !== "" && !this.validateElement(name, val)) {
                // set an attribute on the model schema
                return;
            }
        }

        // foo[0] = val
        if (_array) {
            _obj = this._findOrCreateCollection(this._model, _array[1], true);
            _obj[_array[2]] = val;
            this._setChanged(name);
            __publishChange(_array[1] + "." + _array[2], val);
        }
        // foo.bar = val
        else if (_namespace) {
            _obj = this._findOrCreateCollection(this._model, _namespace[1]);
            _array = this._isArray(_namespace[2]);
            if (_array) {
                _obj[_array[1]] = _obj[_array[1]] || [];
                _obj[_array[1]][_array[2]] = val;
            }
            else {
                _obj[_namespace[2]] = val;
            }
            this._setChanged(name);
            __publishChange(name, val);

        }
        // foo = model
        else if (val instanceof X.data.Model) {
            _oldVal = this._model[name];
            this._nestedModels[name] = val;

            this._setChanged(name);
            this._model[name] = this._nestedModels[name].getAll();
            __publishChange(name, this._model[name], _oldVal);

        }
        // name = val
        else {
            var _oldVal = this._model[name];
            if (!X._.isEqual(this._model[name], val)) {
                this._setChanged(name);
                this._model[name] = val;
            }
            __publishChange(name, val, _oldVal);
        }
    },


    /**
     * Will return null if no name is in the model
     *
     * @param name - the name or key for the name/value pair
     * @returns {*} - null if non-existent
     */
    getDataVal : function (name) {
        // flatten the models arrays and objects to get to value
        return X.utils.stringToFunction(X.utils.normalizeModelRef(name, true), this._model);
    },


    /**
     * Remove an element completely out of the model (if it is mutable)
     *
     * @param name
     * @param options [optional]
     *          silent - boolean to allow event not to be sent (default = false)
     */
    remove : function (name, options) {
        if (options && !options.silent) {
            var undef;
            this.setDataVal(name, undef, {force : true});
        }

        var _owner = this._model;

        name = X.utils.normalizeModelRef(name);

        // grab the name up to the last . which will be the key
        // if the request is for data in an object
        var _nv = name.match(/^(.*)\.(.*)$/);
        if (_nv) {
            _owner = X.utils.stringToFunction(X.utils.normalizeModelRef(_nv[1], true), this._model);
            name = _nv[2];
        }

        // Now do the deletion of the value
        var _array = this._isArray(name);
        if (_array) {
            _owner[_array[1]] = X._.without(_owner[_array[1]], _owner[_array[1]][_array[2]]);
        }
        else {
            delete _owner[name];
            if (this._nestedModels[name]) {
                delete this._nestedModels[name];
            }
        }
    },


    /**
     * Will update the model with passed in javascript object (of name value pairs), if the new object contains properties
     * that the old one doesn't have, these properties will be added to the old object only if the old object is mutable.
     *
     * @param obj - where we want to get the new properties from
     * @param options [optional]
     *          silent - boolean to allow event not to be sent (default = false)
     *          force  - boolean to set the data even if it's readOnly (default = false)
     */
    update : function (obj, options) {
        var self = this;
        // if obj is null or undefined, throw exception
        // cannot use typeof, because typeof null or object are both equal to "object"
        if (obj === null || obj === undefined) {
            X.publishException("Trying to update model '" + this._name +
                    "' with a null/undefined object", "X.data.Model", X.log.ERROR);
            return;
        }
        if (X._.isObject(obj)) {
            X._.each(obj, function (value, key) {
                self.setDataVal(key, value, options);
            });
        }
        else {
            X.publishException("X.DataModel: " + this._name,
                "Update invalid object passed in - ignoring");

        }
    },


    /**
     * Get a reference to the internal data representation of our data model (JSON object)
     *
     * @param options
     *          changedDataOnly : <true | false> - get only data that has changed since the dirty flag was cleared
     *          excludeErrors : <true | false> - dont get elements that are in error
     *
     * @returns {*} - JSON Object
     */
    getAll : function (options) {
        options = options || {};
        var returnData = this._model;

        // Filter data on isDirty, not in error
        if (options.changedDataOnly) {
            returnData = X._.pick(returnData, this._changedData);
        }
        if (options.excludeErrors) {
            this.validate();
            returnData = X._.omit(returnData, this._errorList);
        }

        return returnData;
    },

    /**
     * Does a value exist in the model
     *
     * @param name
     * @returns {boolean}
     */
    has : function (name) {
        return (!X._.isUndefined(this._model[name]));
    },

    /**
     * Iterate over all elements of the data collected
     *
     * @param funcCall - function to call with the element
     *                   will be called with the element value and name as parameters,
     *                   uses the underscore .each functionality
     * @returns {*}
     */
    //---------------------------------------------
    each : function (funcCall) {
        return X._.each(this._model, funcCall);
    },


    /**
     * Removes all attributes from the model (by setting them to null).
     * Fires a "change" event unless silent is passed as an option.
     *
     * @param options
     *      silent : boolean - don't broadcast dataChange event
     */
    clear : function (options) {
        var self = this;
        X._.each(this._model, function (val, key) {
            self.remove(key, options);
        });
        this.clearDirty();
    },

    /**
     * Validates an element against the model schema's 'validate' list
     * sets or clears an internal list of elements that are in error;
     *
     * @param name
     * @param value
     * @returns boolean (is valid)
     */
    validateElement : function (name, value /*used for internal api*/) {
        var elDef = this._schema.getOptionForKey(name, "validate");
        if (!elDef) {
            return true;
        }
        else {
            if (X._.isArray(elDef)) {
                elDef = elDef.join();
            }
            value = value || ( (!X._.isUndefined(this._model[name])) ? this._model[name] : "");
            var $el = X.$("<input value='" + value + "' data-validate='" + elDef + "' />");
            var valid = X.validateElement($el, {suppressErrors : true});

            if (!valid) {
                this._errorList.push(name);
            }
            return valid;
        }
    },

    /**
     * Validate all elements in a model against the model schema
     *
     * @returns {*}
     */
    validate : function () {
        var self = this;
        self._errorList = [];
        X._.each(self._schema.keys(), function (n) {
            self.validateElement(n);
        });

        return self._errorList;
    },


    /**
     * Return a list of element names that are in error;
     *
     * @returns {*}
     */
    getErrorList : function () {
        this.validate();
        return this._errorList;
    },

    hasError : function () {
        this.validate();
        return X._.size(this._errorList) > 0;
    },


    /**
     * Save the data in this model to the DAO specified when creating the model
     * @param args
     *      - daoName : name of the dao to use even if there has been one specified in the constuction of the model
     *      - changedDataOnly : <true | false> - only serialize data that has changed since the dirty flag was cleared
     *      - excludeErrors : <true | false> - don't serialize elements that are in error
     *      - any name/value pairs that you want to pass to your DAO.  Some ones you can take advantage of for
     *                  leveraging Model Serialize API's
     *
     *     *  @return promise
     */
    save : function (args) {
        args = args || {};
        var dao = this._getDAO(args.daoName);
        if (dao) {
            return dao.save([this], X._.omit(args, ["daoName"]));
        }
        else {
            return X.$.Deferred().resolve().promise();
        }
    },

    /**
     * Load the model data from the DAO specified when creating the model
     * @param args
     *      - daoName : name of the dao to use even if there has been one specified in the construction of the model
     *
     *  @return promise
     */
    load : function (args) {
        args = args || {};
        var dao = this._getDAO(args.daoName);
        if (dao) {
            return dao.load([this], X._.omit(args, ["daoName"]));
        }
        else {
            return X.$.Deferred().resolve().promise();
        }
    },

    _getDAO : function (name) {
        var dao = name || this._dao;
        dao = X.registry.getDAO(dao);
        if (!dao) {
            X.trace("Model DAO: " + this._name + "called with no DAO");
            return null;
        }
        return dao;
    },

    // create the object hierarchy and return the last reference
    _findOrCreateCollection : function (parent, nameSpace, asArray) {
        var _array = this._isArray(nameSpace);
        var _p;

        var _names = nameSpace.match(/^(.*?)\.(.*)$/);  // non-greedy will get name.rest.
        if (_names) {
            if (_names[1]) {
                _array = this._isArray(_names[1]);
                if (_array) {
                    parent[_array[1]] = parent[_array[1]] || [];
                    parent[_array[1]][_array[2]] = parent[_array[1]][_array[2]] || {};
                    _p = parent[_array[1]][_array[2]];
                }
                else {
                    parent[_names[1]] = parent[_names[1]] || {};
                    _p = parent[_names[1]];
                }
            }
            return this._findOrCreateCollection(_p, _names[2], asArray);
        }
        else if (_array) {
            parent[_array[1]] = parent[_array[1]] || [];
            parent[_array[1]][_array[2]] = parent[_array[1]][_array[2]] || (asArray ? [] : {});
            return parent[_array[1]][_array[2]];
        }
        else {
            parent[nameSpace] = parent[nameSpace] || (asArray ? [] : {});
            return parent[nameSpace];

        }

    },

    _isArray : function (key) {

        return key.toString().match(/^(.*)\[(\d*?)\]$/);
    },

    _setChanged : function (key) {
        this._changedData = X._.union(this._changedData, [key]);
    }

});


X.utils.attributeUtil = (function () {

    var _jqDataAttributes;

    var attrUtil = {
        // -------------------------------
        // Function: toJSON
        // convert the HTML attribute to JSON
        //
        // Parameters:
        //    htmlAttr - the HTML attribute
        // -------------------------------
        toJSON : function (htmlAttr) {

            if (typeof htmlAttr !== "string" || !htmlAttr) {
                return {};
            }

            var obj = null;
            var str = htmlAttr.trim();

            // Add object notation if it doesn't exist
            if (str.charAt(0) !== "{") {
                str = '{' + str + '}';
            }

            // Do a non-strict conversion to allow for limited way to express
            // values in HTML without generating parsing errors
            //   - allows for single quotes around names and values
            obj = X.utils.jsonSerializer.toJSON(str, true);
            return obj || {};
        },

        //// -------------------------------
        //// Function: toArray
        //// Split attribute into an array of values/
        //// Data inside of parentheses will be treated as one element
        //// This allows to have comma separated values in parentheses that wont get divided up.
        ////
        //// Parameters:
        ////    htmlAttr - the HTML attribute
        //// -------------------------------
        //toArray : function (htmlAttr) {
        //    // we need to remove spaces around commas that are used to separate some parameters
        //    // but leave other spaces, which could occur within a custom message (as in regex validation)
        //    htmlAttr = htmlAttr.replace(/(^\s*)|(\s*$)/g, "");  // remove leading and trailing spaces
        //    htmlAttr = htmlAttr.replace(/(\s*,\s*)/g, ","); // remove spaces around commas
        //    // Encode stuff between parens (so we can split on commas)
        //    htmlAttr = X.utils.replaceCharWithinParenthesis(htmlAttr, ",", "_comma_");
        //
        //    // now get the comma deliniated list
        //    var items = htmlAttr.split(',');
        //    X._.each(items, function (value, idx) {
        //        // replace foo(something) with foo=something
        //        value = value.replace(/([a-zA-Z]+\(.+\))+/g, function (str) {
        //            return str.replace(/\(/, "=").replace(/\)$/, "");
        //        });
        //        // restore commas within individual arguments
        //        items[idx] = value.replace(/_comma_/g, ",");
        //    });
        //    return items;
        //},


        /**********************************************************************************
         * @private
         * handle dataChange event that affects the data bound to a given attribute
         *
         * @param evtPayload - the published payload of the event
         * @param customArg - object containing the element and other information:
         *          el : the DOM element who's attribute needs to be updated,
         *          attributesToResolve : array of objects that specify the attributes to resolve - null if we need to resolve ALL attributes
         *              attrName : name of the attribute
         *              attrValue : the original attribute value, before it was resolved
         */
        attrChangeHandler : function () {
            // we only need the last parameter (our custom argument here)
            var customArg = arguments[arguments.length - 1];
            if (!customArg || !customArg.el) {
                X.trace("attrChangeHandler error: bad param ", ["X.bindings", ""], X.log.ERROR);
                return;
            }
            var $el = X.utils.get$(customArg.el);
            // if we didn't get a list of attributes to resolve,
            // re-evaluate all the attributes in the element
            var attrs = customArg.attributesToResolve || $el.prop("attributesToResolve");
            if (!attrs) {
                //X.trace("attrChangeHandler error: no attributes to resolve ", ["X.bindings", ""], X.log.INFO);
                return;
            }

            X._.each(attrs, function (attrObj, idx) {
                var resolved = X.resolveDynamicData(attrObj.attrValue, {});
                _setResolvedAttribute($el, attrObj.attrName, resolved, false /*not initial layout*/);
            });
        },


        /**********************************************************************************
         * @private
         * Resolve attributes associate with a DOM element that contain model references and/or could be an expression,
         * and listen for future changes that should trigger re-evaluating the attribute value
         *
         * @param el - the DOM element
         */
        resolveAttributes : function (el) {
            var $el = X.utils.get$(el);
            var attrArray = $el.prop("attributesToResolve");
            if (!attrArray) {
                return;
            }

            // Iterate over the attributes that need resolving and collect the model references
            // so we can subscribe for their change events.
            // along the way, resolve the attribute
            var eventToAttrMap = {};
            X._.each(attrArray, function (attrObj) {
                var _modelRefs = {};
                var resolved = X.resolveDynamicData(attrObj.attrValue, _modelRefs);
                //                if (resolved !== attrObj.attrValue) {
                _setResolvedAttribute(el, attrObj.attrName, resolved, true /* initial layout */);

                if (X._.size(_modelRefs) > 0) {
                    X._.each(_modelRefs, function (num, nameSpace) {
                        if (!eventToAttrMap[X.constants.events.kDataChange + '.' + nameSpace]) {
                            eventToAttrMap[X.constants.events.kDataChange + '.' + nameSpace] = [];
                        }
                        eventToAttrMap[X.constants.events.kDataChange + '.' + nameSpace].push(attrObj);
                    });
                }
                //                }
            });

            // set up the listener callback for all data-change events
            // (event {type,listener,context} combo needs to be unique for the events to all be added)
            X._.each(eventToAttrMap, function (attributes, evt) {
                X.subscribe(
                    evt,
                    X.utils.attributeUtil.attrChangeHandler,
                    el,
                    {
                        el : el,
                        attributesToResolve : attributes
                    }
                );
            });

        }
    };


    /**********************************************************************************
     * @private
     * Set the element's attribute the the resolved value
     *
     * @param el - the element or X.$ object
     * @param attrName - the attribute. if starts with data- then gets converted appropriately before setting
     * @param resolvedValue - the value. in case of data-disabled and data-visible, this gets interpreted
     * @param bInitialLayout - Boolean indicating this is the first time the attribute is resolved.
     *                         we need to to keep some wonky animation happening during hide/show
     */
    function _setResolvedAttribute (el, attrName, resolvedValue, bInitialLayout) {

        var $el = X.utils.get$(el);

        // remove any 'data-' from the attributes if specified
        if (X._.contains(_jqDataAttributes, attrName)) {
            attrName = attrName.replace(/^data-/, "");
        }

        // if were dealing with a boolean attribute
        if (X._.contains(X.constants.booleanDOMAttributes, attrName)) {
            var _enabled = resolvedValue && resolvedValue !== "false" && resolvedValue !== "undefined" && resolvedValue !== "null";

            // DEFAULT FUNCTIONALITY
            if (_enabled) {
                $el.prop(attrName, true);
            }
            else {
                $el.prop(attrName, false);
            }
            return;
        }

        switch (attrName) {
            case 'disabled':
                var disabled = resolvedValue && resolvedValue !== "false" && resolvedValue !== "undefined" && resolvedValue !== "null";
                // if the client has specifed their own hide/show functionality
                var ddo = $el.attr("data-disabled-options");
                ddo = X.utils.jsonSerializer.toJSON(ddo, true) || {};
                var _disfunc = ddo.disabledFunction || X.options.disabledFunction;
                if (_disfunc) {
                    if (typeof _disfunc == "string") {
                        _disfunc = X.utils.stringToFunction(_disfunc);
                    }
                    if (typeof _disfunc == "function") {
                        _disfunc($el, disabled);
                        return;
                    }
                    else {
                        X.publishException("resolveAttributes: disabled", "disabled function does not exist - using default: ", X.log.WARN);
                        // continue to use default mechanism
                    }
                }

                // DEFAULT FUNCTIONALITY
                if (disabled) {
                    $el.prop("disabled", true);
                    $el.addClass("disabled");
                }
                else {
                    $el.prop("disabled", false);
                    $el.removeClass("disabled");
                }
                break;
            case 'visible':
            case 'hidden' :
                var show = !!(resolvedValue && resolvedValue !== "false" && resolvedValue !== "undefined" && resolvedValue !== "null");
                show = (attrName == 'visible') ? show : !show;  // if we're here because of the data-hidden, invert the request

                // if the client has specifed their own hide/show functionality
                var dvo = $el.attr("data-visible-options") || $el.attr("data-hidden-options");
                dvo = X.utils.jsonSerializer.toJSON(dvo, true) || {};
                var _visfunc = dvo.visibilityFunction || X.options.visibilityFunction;
                if (_visfunc) {
                    if (typeof _visfunc == "string") {
                        _visfunc = X.utils.stringToFunction(_visfunc);
                    }
                    if (typeof _visfunc == "function") {
                        _visfunc($el, show);
                        return;
                    }
                    else {
                        X.publishException("resolveAttributes: visible", "visiblilty function does not exist - using default: ", X.log.WARN);
                        // continue to use default mechanism
                    }

                }

                // DEFAULT FUNCTIONALITY
                var status = X.$($el).prop("x_isVisible");
                if (show) {
                    if (status == "true") {
                        return;
                    }
                    if (X.$($el).parent().is(":hidden") || bInitialLayout) {
                        $el.show();
                    }
                    else {
                        $el.fadeToggle(300);
                        //                       $el.animate({height : 'toggle', opacity : 'toggle'}, 300);
                    }
                    X.$($el).prop("x_isVisible", "true");
                }
                else {
                    if (status == "false") {
                        return;
                    }

                    if (X.$($el).parent().is(":hidden") || bInitialLayout) {
                        $el.hide();
                    }
                    else {
                        if (X.removeErrorTips) {
                            X.removeErrorTips($el);
                        }
                        $el.fadeToggle(300);
                        //                        $el.animate({height : 'toggle', opacity : 'toggle'}, 300);
                    }
                    X.$($el).prop("x_isVisible", "false");

                }
                break;
            default:
                $el.attr(attrName, resolvedValue);
                break;
        }
    }

    // Create our list of attributes to manage
    function _initialize () {
        _jqDataAttributes = X._.map(X.constants.booleanDOMAttributes, function (attr) {
            return "data-" + attr;
        });
        _jqDataAttributes = X._.union(_jqDataAttributes, X.constants.specialDOMAttributes);
        _jqDataAttributes = X._.union(_jqDataAttributes, X.options.attributeConversionList);
    }
    _initialize();
    // and set up for a listener to re-init if they change
    X.subscribe(X.constants.events.kOptions + ".attributeConversionList", _initialize, attrUtil);



    return attrUtil;

})();

X.data.binder = {

    /**********************************************************************************
     * Search all the text nodes and do our replacement algorithms on them
     *
     * @param containerId - the DOM element id or the X.$ element who's children to resolve
     */
    bindText : function (containerId) {
        var $container = X.utils.get$(containerId);

        // We won't just do an innerHTML replace because X.$ listeners and bound elements lose their references
        // when doing html()
        $container.find("*").bindText();
    },

    // Set up two way binding (MVVC binding)
    //-----------------------------------------
    // -------------------------------
    // Function: bindData
    // bind the data
    //
    // Parameters:
    //    containerId - the dom element identifier
    //                  or the X.$ element
    // -------------------------------
    bindData : function (containerId, options) {
        var $container = X.utils.get$(containerId);

        // Iterate over the sub-elements that have the data-bind attribute associated with them
        // and attach the element to the pubsub mechanism for two way data-binding
        X.$("[data-bind]", $container).each(function () {

            var $el = X.$(this),
                def = null;

            // Get the data-bind attribute and see if it has any dynamic information in it that need dereferenceing
            var db = $el.attr("data-bind");

            // resolve model references in the data-bind  attribute and set the attribute to the resolved
            var _modelRefs = {};
            var resolvedDataBind = X.resolveDynamicData(db, _modelRefs);

            // if there are model references in here, set up listeners to re-bind when one changes
            if (X._.size(_modelRefs) > 0) {
                // save off the original val
                $el.prop("unresolvedDataBind", db);

                //var listenerMap = [];
                //X._.each(_modelRefs, function (num, nameSpace) {
                //    X.subscribe(
                //        X.constants.events.kDataChange + '.' + nameSpace,
                //        function (_$el) {
                //
                //        },
                //        $el,
                //        {
                //            el : $el
                //        }
                //    );
                //
                //});

            }

            $el.attr("data-bind", resolvedDataBind);

            var m = X.utils.splitDataRef(resolvedDataBind);
            var _model = X.getModel(m.modelName, X.options.autoCreateModels);
            if (_model) {
                def = _model.getSchemaforKey(m.key);
            }


            // See if this property references a model schema
            // if it does grab the info from the definition and
            // set them on the control
            // Note - existing validate/format DOM attributes override the ones supplied in the Definition
            var isInput = $el.is("input") || $el.is("select") || $el.is("textarea");
            if (def) {
                if (isInput) {

                    // Set formatters and validators
                    var v = $el.attr("data-validate");
                    var f = $el.attr("data-format");
                    var p = $el.attr("placeholder");
                    if (def.validate && !v) {
                        $el.attr("data-validate", def.validate.toString());
                    }
                    if (def.format && !f) {
                        $el.attr("data-format", def.format);
                    }
                    if (def.placeholderText && !p) {
                        $el.attr("placeholder", def.placeholderText);
                    }

                    // set up accessibility
                    if (def.accessibility) {
                        $el.attr("aria-label", def.accessibility);
                    }
                }

                // Not needed since we set default value on Model construction now
                //                    defaultValue = def.defaultValue;
                //
                //                    // if there is a default value specified, add it to the bind-options.
                //                    // Explicitly check for undefined and null, don't just test for falsiness, because we also
                //                    // want to pick up the defaultValue if it's a boolean(for example boolean value of false)
                //                    if (defaultValue != undefined && defaultValue != null) {
                //                        var BO = X.utils.attributeUtil.toJSON($el.attr("data-bind-options"));
                //
                //                        // if the defaultValue is a boolean, preserve the value as a boolean and don't cast it to a string
                //                        BO.defaultValue=defaultValue
                //                        $el.attr("data-bind-options", X.utils.jsonSerializer.toString(BO));
                //                    }
            }

            $el.bindToModel(options);

        });
    },

    /**********************************************************************************
     * bind all attributes in elements of a given container to models (if applicable)
     *
     * @param containerId - the container of the elements to bind, can be a $ object or an id.
     */
    bindAttributes : function (containerId, options) {
        var $container = X.utils.get$(containerId);

        X.$("*", $container).each(function (idx, el) {
            if (X.$(el).prop("attributesToResolve")) {
                // don't replace the property with a new (potentially smaller) array of attributes to resolve.
                // the presence of the attributesToResolve property indicates that this element is already bound.
                return;
            }

            var elAttrToResolve = [];

            // add the attribute to the binding list if it contains an expression or model reference
            // AND it is NOT one of our special Mojo directives
            X._.each(el.attributes, function (attr) {

                if (!X._.contains(X.constants.allDirectives, attr.nodeName) &&
                    (attr.nodeValue.indexOf("${") >= 0 || attr.nodeValue.indexOf("@{") >= 0)) {
                    elAttrToResolve.push({el : el, attrName : attr.nodeName, attrValue : attr.nodeValue});
                }
            });

            // Resolve attributes in our list and set up pubsub listeners to re-evaluate
            // the attriubtes when dataChange events occur
            if (elAttrToResolve.length > 0) {
                X.$(el).prop("attributesToResolve", elAttrToResolve);
                X.utils.attributeUtil.resolveAttributes(el);
            }


            // if we have a list of other events to listen for
            // set up a listener to re-evaluate ALL attributes when one of these events happens
            var listenEvts = X.$(el).attr("data-listen");
            if (listenEvts) {
                listenEvts = listenEvts.match(/([\.\w]+)/g).join(",");
                X.subscribe(
                    listenEvts,
                    X.utils.attributeUtil.attrChangeHandler,
                    el,
                    {
                        el : el
                    }
                );
            }

        });
    }



};

X.components.DataResolver = function () {
    var _resolver = {

        /**********************************************************************************
         * Resolve an object or string that can contain model references and/or could be an expression,
         *
         * Objects and Arrays will be returned in their native representation instead of [object Object]
         *
         * @param inData - the attribute value, before it was resolved
         * @param outModelRefs - return any model references in the attribute
         * @param addlTokens - additional information passed to the expression templating logic
         */
        resolveDynamicData : function (inData, outModelRefs, addlTokens) {
            addlTokens = addlTokens || {};
            outModelRefs = outModelRefs || {};
            var resolved;
            //var expressionVars = _reduceStringWithRefs(addlTokens);
            var expressionVars = addlTokens;

            if (!X._.isObject(inData) && !X._.isString(inData)) {
                return inData;
            }

            if (X._.isObject(inData)) {
                inData = X.utils.jsonSerializer.toString(inData);
                inData = _resolver.resolveDynamicData(inData, outModelRefs, expressionVars);
                return X.utils.jsonSerializer.toJSON(inData);
            }

            resolved = _reduceStringWithRefs(inData, outModelRefs, expressionVars);

            // There are cases when model references are not resolved if they are not in an expression.
            resolved = resolved.replace(/_x_refs\[(\d)\]/g, function () {
                var _v = addlTokens._x_refs[arguments[1]];
                return X.utils.jsonSerializer.toString(_v);
            });

            try {
                resolved = decodeURIComponent(resolved); // unescape anything that may have been put in there
            }
            catch (ex) {
                // will fail if v has '%' but not a valid encoded string - leave it as is
                //                    X.$.each(attrs, function (idx, attrObj) {
                //                        var resolved = X.utils.attributeUtil.resolveAttribute(attrObj.text, {});
                //                        _setResolvedAttribute($el, attrObj.attrName, resolved, false /*not initial layout*/);
                //                    });

            }
            return resolved;
        }

    };

    var _expCache = [];

    /**------------------------------------------------------
     *
     * Utility function to resolve any model references within a string
     * Note : will convert all model values to strings (like booleans, arrays, objects, etc)
     * Note2: will resolve nested model references such as ${${FLOW_SCOPE.modelName}.propertyName}
     *
     * Differs from resolveModelRefs in that this method does not expect the inStr to be a model reference.  It will only resolve the values in the string
     * So you can do concatenations and such ${model.name}.${model.val} or W2${FLOW_SCOPE.curIndex}.firstName
     *
     * @param inStr - the input string, which may contain model references
     * @param outModelRefs - optional object. if provided, the model refs will be added as properties of the object, each having the format 'modelName.modelProp'
     * @param expressionVars - information that has tokenized model references and tokenized string
     * @returns - the string with the model names resolved
     */
    function _reduceStringWithRefs (inStr, outModelRefs, expressionVars) {

        expressionVars._x_refs = expressionVars._x_refs || [];

        var start, end, dataRef;
        if (!X._.isObject(inStr) && !X._.isString(inStr)) {
            return inStr;
        }

        if (X._.isObject(inStr)) {
            inStr = X.utils.jsonSerializer.toString(inStr);
            inStr = _resolver.resolveDynamicData(inStr, outModelRefs, expressionVars);
            return X.utils.jsonSerializer.toJSON(inStr);
        }

        // if not found, look for last ${} or @{}
        var firstExp = inStr.lastIndexOf('@{');
        var firstMR = inStr.lastIndexOf('${');

        start = firstExp > firstMR ? firstExp : firstMR;
        end = inStr.indexOf('}', start);


        // nothing to resolve - return
        if (start < 0 || end < 0) {
            return inStr;
        }

        dataRef = inStr.substring(start, end + 1);

        // If this is an expression
        if (start === firstExp) {
            // if _x_refs are inside quotes - replace the value because it doesn't need to be a variable
            // expl
            // look for single or double quote
            // followed by any number of spaces
            // followed by _x_refs[number]
            // followed by any number of spaces
            // followed by the same opening quote mark

            inStr = inStr.replace(/(["'])(\s*)?(_x_refs\[(\d)\])(\s*?)?\1/g, function () {
                var rpl = X.utils.jsonSerializer.toString(expressionVars._x_refs[arguments[4]]);
                var rtn = arguments[0].replace(arguments[3], rpl);
                return rtn;
            });
            inStr = inStr.replace(dataRef, _resolveExpression(dataRef, expressionVars));

            return _resolver.resolveDynamicData(inStr, outModelRefs, expressionVars);

        }
        // otherwise if a model reference
        else {
            var modelNameDotProp = inStr.substring(start + 2, end);
            var innerValue;

            // There are cases when model references are multi-nested that the properties have
            // been changed to references to the actual value in the tokenized info refs array.
            // Sort them out here.
            modelNameDotProp = modelNameDotProp.replace(/_x_refs\[(\d)\]/g, function () {
                return expressionVars._x_refs[arguments[1]];
            });

            var m = X.utils.splitDataRef(modelNameDotProp);
            //      innerValue = X.getDataVal(m.modelName, m.key);
            var _model = X.getModel(m.modelName, X.options.autoCreateModels);
            if (_model && m.key) {
                innerValue = _model.getDataVal(m.key);
            }
            // if no key, get the whole model
            else if (_model) {
                innerValue = _model.getAll();
            }

            // add the found model ref to the refs object, if it was passed in
            if (outModelRefs && m.modelName && !X._.isUndefined(m.key)) {
                outModelRefs[m.modelName + '.' + m.key] = innerValue;
            }

            if (typeof innerValue === "undefined" || null === innerValue) {
                innerValue = X.options.defaultTextForNullModelValue;
            }
            //else if (typeof innerValue == "object") {
            //    innerValue = X.utils.jsonSerializer.toString(innerValue);
            //}
            inStr = inStr.replace(dataRef, "_x_refs[" + expressionVars._x_refs.length + "]");
            expressionVars._x_refs.push(innerValue);

            return _resolver.resolveDynamicData(inStr, outModelRefs, expressionVars);
        }
    }

    function _resolveExpression (text, additionalTokens) {
        additionalTokens = additionalTokens || {};

        var fn;
        var resolved = text;

        resolved = resolved.replace(X.constants.expressionRegexPattern, function () {
            return "<%=" + arguments[1] + "%>";
        });

        // now turn the expression into an underscore template.
        //----------------------------------------------------
        try {
            if (_expCache[resolved]) {
                fn = _expCache[resolved];
            }
            else {
                fn = X._.template(resolved);
                _expCache[resolved] = fn;
            }

        }
        catch (ex) {
            X.publishException("resolveAttribute", "Invalid expression: " + text + " (" + ex.message + ")", X.log.ERROR, ex);
            resolved = "";
        }

        // Execute the underscore template.
        // Temporarily switch out the toString methods for Object and Array so that we use our version
        // i.e. we don't want to evaluate Object.toString to [object Object] but rather '{ ... }'
        //----------------------------------------------------
        try {
            var _extraInfo = _resolver.resolveDynamicData(additionalTokens);
            Object.prototype.toString = function _tempToString () {
                return X.utils.jsonSerializer.toString(this);
            };
            Array.prototype.toString = function _tempToString () {
                return X.utils.jsonSerializer.toString(this);
            };
            resolved = fn(_extraInfo);
            Object.prototype.toString = _originalObjectToString;
            Array.prototype.toString = _originalArrayToString;
        }
        catch (ex) {
            X.publishException("resolveExession", "Expression error for " + text + " : " + ex.message, X.log.ERROR, ex);
            resolved = "";  // don't subscribe or change the attr if there's an exception
        }


        return resolved;
    }

    var _originalObjectToString = Object.prototype.toString;
    var _originalArrayToString = Array.prototype.toString;

    return _resolver;
};

// Register data resolver
// pass false to override the default dataresolver that does nothing.
X.registerComponent(X.constants.interfaces.kDataResolver,
    new X.components.DataResolver(), false);



/*
 * class: DAOFacade
 * X.data.DAOFacade
 *
 * about:
 * This class is responsible for managing data persistence across the system
 *
 *
 * When a persistence call is made (save, load, destroy, etc...) The DAO is invoked passing all the models
 * that have subscribed to it as an array parameter.  The DAO is then responsible for knowing how
 * to save/load/etc..
 *  - The reason I chose to pass all the models to the DAO is that I wanted to have a way to aggregate remote load/save calls
 *    Now if the client has a remote DAO, it can collect the data from ALL models before sending it to the server.
 *
 *
 *	Copyright <c> 2013 Intuit, Inc. All rights reserved
 */
X.data.DAOFacade = (function () {

    var _impl = {
        /**
         * Save the data to storage
         *
         * @param args
         *  - modelNames - the name of the model or Array of model names, or null/empty
         *  - any name/value pairs that you want to pass to your DAO.  Some ones you can take advantage of for
         *                  leveraging Model Serialize API's
         *          changedDataOnly : <true | false> - only serialize data that has changed since the dirty flag was cleared
         *          excludeErrors : <true | false> - don't serialize elements that are in error
         *
         * @return promise
         */
        save : function (args) {
            return _doOperation(args, "save");
        },

        /**
         * Load the data from storage
         *
         * @param args
         *  - modelNames - the name of the model or Array of model names, or null/empty
         *  - any other name/value pairs that you want to pass to your DAO.
         *
         * @return promise
         */
        load : function (args) {
            return _doOperation(args, "load");
        },

        /**
         * Remove the data from remote storage
         *
         * @param args
         *  - modelNames - the name of the model or Array of model names, or null/empty
         *  - any other name/value pairs that you want to pass to your DAO.
         *
         * @return promise
         */
        destroy : function (args) {
            return _doOperation(args, "destroy");
        }

    };

    //=======================================================
    // Private

    //==================================================================
    // Perform the requested operation
    // All dao operations need the same sort of functionality so its easier to just have one function to do it
    // If no models are passed in, request all models in the system that are associated with the DAO
    //==================================================================
    function _doOperation (args, operationFn) {
        args = args || {};
        var promises = [];
        var cnt = 0;
        var modelNames = args.modelNames;
        var daoList = {};

        if (typeof modelNames === "string") {
            modelNames = [modelNames];
        }

        if (args.daoName) {
            daoList[args.daoName] = X.registry.getDAO(args.daoName);
        }
        else {
            daoList = X.registry.getDAOs();
        }

        // Now iterate over those DAOs and save them
        if (daoList && 0 < X._.keys(daoList).length) {
            X._.each(daoList, function (dao, daoName) {
                // get the list of models to save for the dao
                var models = X.utils.getModelsForDAO(daoName, modelNames, args.modelFilters);
                if (models && models.length > 0) {
                    promises[cnt++] = dao[operationFn](models, X._.omit(args, ["modelNames", "daoName", "modelFilters"]));
                }
            });
        }

        return X.$.when.apply(X.$, promises);
    }

    return _impl;
})();




/**
 * @author Greg Miller
 *
 * Data Bind
 * Purpose: easily enable two-way binding between a DOM elements and an Javascript object
 * USES:
 *   Bind an object to a DOM Element:   X.$('#DOM_ID').bindData(object);
 *
 * To specify what data gets bound to what input we are using an HTML 5 data attribute: data-bind example:
 *   <input name="Name" type="text" id="NameTextbox" data-bind="Name" value="" placeholder="Enter Name" />
 *
 * To specify a default value, use the following syntax:
 *     - refer to another model's property as the default value
 *          <input type="text" data-bind-options="defaultValue : '${model.property}'" />
 *     - specify plain text as the default value
 *          <input type="text" data-bind-options="defaultValue : 'plain text'" />
 *
 */

X.utils.extend_$({

    bindToModel : function (opts) {
        opts = opts || {};
        var $el = X.$(this);


        var boundProperty = $el.attr("data-bind");
        var options = X.utils.attributeUtil.toJSON($el.attr("data-bind-options"), true) || {};
        options.$el = $el;
        options.viewport = opts.viewport;
        if (!boundProperty) {
            return;
        }


        // Get the value out of the data reference
        var parsedDataRef = X.utils.splitDataRef(boundProperty);
        var boundData = X.getDataVal(parsedDataRef.modelName, parsedDataRef.key);
        var evtListeners = X.constants.events.kDataChange + "." + parsedDataRef.modelName + "." + parsedDataRef.key;


        // Set the value of the control
        _setElementVal($el, boundData, options);


        // Now handle any options
        _handleBindingOptions($el, boundData, options);


        // Set the data in the model (which will broadcast the change event)
        // Only on change for input elements, we don't want to set data on div or table change events

        // *** In Chrome (as of v.25) the change event doesn't fire if the last change before an input field loses focus occurred programmatically (e.g. due to auto-formatter.)
        //     Therefore, we'll bind these input fields to the blur event.
        //        if ($el.is('[data-format]') && $el.is('input')) {
        //            $el.bind('blur', function () {
        //                _setDataVal(boundProperty, $el.val(), options);
        //            });
        //        }

        // determine which events will trigger a dataChange
        var changeEvent = options.dataBindEvent ? options.dataBindEvent : X.options.dataBindEvent;
        changeEvent = X._.isArray(changeEvent) ? changeEvent.join(" ") : changeEvent;

        if (($el.isTextInput())) {
            //changeEvent = changeEvent + " " + X.constants.jqEvents.kAutoformatApplied;
        }
        else if ($el.is('select') || $el.is('input')) {
            changeEvent = changeEvent + " " +"change";
        }
        else if ($el.attr("contentEditable") == "true") {
            changeEvent = changeEvent + " " +"input";
        }

        $el[0].dataChangeHandler = $el[0].dataChangeHandler || function (evt) {
            var val = null;
            if ($el.attr("type") == "checkbox") {
                val = $el.prop("checked");
            }
            else if ($el.is("select")) {
                val = $el.find(":selected").val();
            }
            else if ($el.attr("contentEditable") == "true") {
                val = $el.text();
            }
            else {
                val = $el.val();
            }

            _setDataVal(boundProperty, val, options);

        };
        $el.off(changeEvent, $el[0].dataChangeHandler).on(changeEvent, $el[0].dataChangeHandler);


        // Attach a listener for two way binding
        // Listen for changed data events and respond when data matches our data-bind attribute
        $el[0].databindListener = $el[0].databindListener || function (dataObj) {
            // if this data change was triggered by the same element that this element is
            // there is no need to reset the value on the element -- could lead to endless cycle??
            if (dataObj.$el === $el) {
                return;
            }

            var _val = X._.isUndefined(dataObj.index) ? dataObj.val : dataObj.val[dataObj.index];
            _setElementVal($el, _val, options);
            _handleBindingOptions($el, _val, options);
        };
        //don't use the slightly faster X.addChangeListener because the model may not be present yet
        X.subscribe(evtListeners, $el[0].databindListener, $el[0]);


        // Private function for setting the value of a control
        //-------------------------------------------------
        function _setElementVal ($el, data) {
            // input values can be set to null, but not undefined
            // change booleans to text we can do exact matching for radio/checkboxes that are bound to booleans in the model
            if (X._.isUndefined(data)) {
                data = null;
            }
            else if (!X._.isNull(data)) {
                data = data.toString();
            }

            // Set the value of the control from data already in our model
            if ($el.attr("type") == "checkbox") {
                var checked = data && data !== "false";
                if (checked) {
                    $el.attr("checked", "checked");
                }
                else {
                    $el.removeAttr("checked");
                }
            }
            // if a radio - set the group selected item
            else if ($el.attr("type") == "radio") {
                var val = $el.val();
                if (data === val) {
                    $el.attr("checked", "checked");
                }
                else {
                    $el.removeAttr("checked");
                }

            }
            else if ($el.is('input') || $el.is('select') || $el.is('textarea')) {
                // save off the caret value so we can set it back

                $el.val(data);

            }
            else {
                //                X.publish(X.constants.events.kException,
                //                new X.Exception("Text binding", "Data binding to non input element: " + $el[0] + " - use ${ } inside of text node", X.log.DEPRECATED));
                $el.text(data);
            }

        }

        // Private function for setting data in a model
        // dataRef contains a full reference to a data value, which could be in a collection.  Ex: "XYZ.ModelName.CollectionName[5]"
        //-------------------------------------------------
        function _setDataVal (dataRef, value, options) {
            var parsedDataRef = X.utils.splitDataRef(dataRef);
            X.setDataVal(parsedDataRef.modelName, parsedDataRef.key, value, options);
        }

        // Private function for handling binding options
        //======================================================
        function _handleBindingOptions (domEl, data, options) {
            if (!options) {
                return;
            }

            // If there is a function to call due to binding
            //----------------------------------------------
            var bindFunc = options.bindFunction;
            if (bindFunc) {
                var f = X.utils.stringToFunction(bindFunc);
                if (f) {
                    f(data, domEl); // call the function
                }
                else {
                    X.publishException("DataBinder", "Bind function not defined: " + bindFunc, X.log.WARN);
                }
            }

            // See if we only need to populate the field once and not listen/broadcast changes
            // Only set the value if there is not data already present for this control
            if (!X._.isUndefined(options.defaultValue)) {
                var _v = null;
                var m = X.utils.splitDataRef(boundProperty);
                _v = X.getDataVal(m.modelName, m.key);
                // Make sure defaultValue is only set if the model data is equal to null, if it's empty string, we don't
                // want to set the defaultValue
                if (_v === undefined) {
                    var dv = X.resolveDynamicData(options.defaultValue);
                    _setElementVal($el, dv, options);
                    _setDataVal(boundProperty, dv, options);
                }
            }
        }

    }

});

/*!
 * X.$ replaceText - v1.1 - 11/21/2009
 * http://benalman.com/projects/jquery-replacetext-plugin/
 *
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: X.$ replaceText: String replace for your jQueries!
//
// *Version: 1.1, Last updated: 11/21/2009*
//
// Project Home - http://benalman.com/projects/jquery-replacetext-plugin/
// GitHub       - http://github.com/cowboy/jquery-replacetext/
// Source       - http://github.com/cowboy/jquery-replacetext/raw/master/jquery.ba-replacetext.js
// (Minified)   - http://github.com/cowboy/jquery-replacetext/raw/master/jquery.ba-replacetext.min.js (0.5kb)
//
// About: License
//
// Copyright (c) 2009 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// This working example, complete with fully commented code, illustrates one way
// in which this plugin can be used.
//
// replaceText - http://benalman.com/code/projects/jquery-replacetext/examples/replacetext/
//
// About: Support and Testing
//
// Information about what version or versions of X.$ this plugin has been
// tested with, and what browsers it has been tested in.
//
// X.$ Versions - 1.3.2, 1.4.1
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome, Opera 9.6-10.1.
//
// About: Release History
//
// 1.1 - (11/21/2009) Simplified the code and API substantially.
// 1.0 - (11/21/2009) Initial release

//(function ($) {
    //    '$:nomunge'; // Used by YUI compressor.

    // Method: X.$.fn.replaceText
    //
    // Replace text in specified elements. Note that only text content will be
    // modified, leaving all tags and attributes untouched. The new text can be
    // either text or HTML.
    //
    // Uses the String prototype replace method, full documentation on that method
    // can be found here:
    //
    // https://developer.mozilla.org/En/Core_JavaScript_1.5_Reference/Objects/String/Replace
    //
    // Usage:
    //
    // > X.$('selector').replaceText( search, replace [, text_only ] );
    //
    // Arguments:
    //
    //  search - (RegExp|String) A RegExp object or substring to be replaced.
    //    Because the String prototype replace method is used internally, this
    //    argument should be specified accordingly.
    //  replace - (String|Function) The String that replaces the substring received
    //    from the search argument, or a function to be invoked to create the new
    //    substring. Because the String prototype replace method is used internally,
    //    this argument should be specified accordingly.
    //  text_only - (Boolean) If true, any HTML will be rendered as text. Defaults
    //    to false.
    //
    // Returns:
    //
    //  (X.$) The initial X.$ collection of elements.

X.utils.extend_$({
    bindText : function () {
        return this.each(function () {
            var node = this.firstChild,
                val,
                new_val;

            // Elements to be removed at the end.
            //                remove = [];

            // Only continue if firstChild exists.
            if (node) {

                // Loop over all childNodes.
                do {

                    // Only process text nodes and not in a script tag.
                    var pn = node.parentNode.tagName.toLowerCase();
                    if (node.nodeType === 3 && !X._.contains(X.options.dontBindTextInNodeList, pn)) {

                        // The original node value.
                        val = node.nodeValue;

                        // The new value.
                        var outRefs = {};
                        new_val = X.resolveDynamicData(val, outRefs);

                        // Only replace text and set up bindings if the new value is actually different!
                        if (new_val !== val) {

                            // save off the original text and attach bind data-listeners
                            //node._originalVal = val;
                            _bindListener(node, outRefs, val);

                            //                            if (!text_only && /</.test(new_val)) {
                            //                                // The new value contains HTML, set it in a slower but far more
                            //                                // robust way.
                            //                                $(node).before(new_val);
                            //
                            //                                // Don't remove the node yet, or the loop will lose its place.
                            //                                remove.push(node);
                            //                            }
                            //                            else {
                            // The new value contains no HTML, so it can be set in this
                            // very fast, simple way.
                            node.nodeValue = new_val;
                            //                            }
                        }
                    }

                } while (node = node.nextSibling);  // jshint ignore:line
            }

        });


        // Bind a function to execute when model values change that are bound to the text element
        function _bindListener (node, bindings, origVal) {

            var listenEvts = [];
            X._.each(bindings, function (num, name) {
                listenEvts.push(X.constants.events.kDataChange + '.' + name);
            });

            if (listenEvts.length > 0) {
                var strEvts = listenEvts.join(",");
                X.subscribe(
                    strEvts,
                    function (el, param) {
                        if (param && param.el) {
                            param.el.nodeValue = X.resolveDynamicData(param.origVal);
                        }
                        else if (el && el.el) {
                            el.el.nodeValue = X.resolveDynamicData(el.origVal);
                        }
                    },
                    node,
                    {
                        el : node,
                        origVal : origVal
                    }
                );
            }
        }

    }
});

X.data.ABTestModel = X.data.Model.extend({
    construct : function (abTestMap) {
        this._name = "ABTest";
        this._id = X.utils.uuid();
        this._model = abTestMap;
        this._attributes = {};
        this._groups = [];
        this._mutable = true;
        this._schema = new X.data.Schema();
        this._allowInvalidData = true;
        this._changedData = {};
        this._errorList = {};
        X._.extend(this, X.events.Events);
    }
});

X._.extend(X.registry, {

    //==========  MODELS ============ \\
    //=================================\\

    registerModel : function (model, dontReplace) {
        var self = this;
        if (!(model instanceof X.data.Model)) {
            X.publishException("Data Registry", "Model  must extend from X.data.DataModel");
        }

        this._register(X.constants.registry.kModels, model.getName(), model, dontReplace);
        X.publish(X.constants.events.kModelRegistered, model.getName());
    },

    getModel : function (name) {
        if (X.flow && name === X.constants.scopes.kFlowScope) {
            name = X.application.Controller.getCurrentFlowScopeName();
        }

        return this._get(X.constants.registry.kModels, name);
    },

    // Get a list of models names in the system based on the filters passed in
    // If no filters, return all models
    // If inModels is passed in, the filtering is based on the inModels, not all in the system
    //    filter based on daoName, isDirty, noErrors, groupId, attr, fn
    getModels : function (filters, inModels, returnModelInstances) {
        var self = this;
        filters = filters || {};

        var all = inModels || this._getAll(X.constants.registry.kModels);

        var filteredList = [];
        X._.each(all, function (model, name) {
            if (typeof model === "string") {
                model = self.getModel(model);
            }

            // If no model in system 'continue' the loop by returning true out of the X._.each
            if (!model) {
                return true;
            }


            var passed = false;

            if (filters.isDirty && model.isDirty()) {
                passed = true;
            }
            if (filters.daoName && model._dao == filters.daoName) {
                passed = true;
            }
            if (filters.noErrors) {
                passed = !model.hasError();
            }
            if (filters.groupId) {
                passed = X._.contains(model.getGroupIds(), filters.groupId);
            }
            if (filters.attr) {
                passed = model.getAttribute(filters.attr);
            }
            if (filters.fn && X._.isFunction (filters.fn)) {
                passed = filters.fn(model);
            }

            // if no filters at all, we'll consider this a pass.
            if (X._.size(filters) === 0) {
                passed = true;
            }

            // if passed all our filters, put it in the list
            if (passed) {
                if (returnModelInstances) {
                    filteredList.push(model);
                }
                else {
                    filteredList.push(model.getName());
                }
            }
        });

        return filteredList;


    },

    removeModel : function (name) {
        var model = this._get(X.constants.registry.kModels, name);
        if (!model) {
            return;
        }

        this._remove(X.constants.registry.kModels, name);

    },


    // -------------------------------
    // Function: clear
    // clear the model
    //
    // Parameters:
    //    modelNames - the names of the models to clear
    // -------------------------------
    clear : function (modelNames, args) {
        var self = this;
        modelNames = modelNames || X._.keys(this._getAll(X.constants.registry.kModels));
        if (typeof modelNames === "string") {
            modelNames = [modelNames];
        }

        X._.each(modelNames, function (name, idx) {
            if (name && self._has(X.constants.registry.kModels, name)) {
                self.getModel(name).clear(args);
            }
        });

    },


    //==========  DAO ============ \\
    //==============================\\

    registerDAO : function (name, daoImpl, dontReplace) {
//        if (!(daoImpl instanceof X.data.I_DAO)) {
//            X.publish(X.constants.events.kException,
//                new X.Exception("Data Registry", "DAO: " + name +
//                                                    "  must extend from X.data.I_DAO", X.log.ERROR));
//        }
        daoImpl._name = name;
        return this._register(X.constants.registry.kDAOs, name, daoImpl, dontReplace);
    },

    getDAO : function (name) {
        return this._get(X.constants.registry.kDAOs, name);
    },
    getDAOs : function () {
        return this._getAll(X.constants.registry.kDAOs);
    },


    //==========  MODEL SCHEMAS ============ \\
    //=====================================\\
    registerSchema : function (name, def, dontReplace) {
        if (!(def instanceof X.data.Schema)) {
            X.publishException("Data Registry", "Model Def: " + name + " must be a X.data.Schema");
        }
        return this._register(X.constants.registry.kSchemas, name, def, dontReplace);
    },

    getSchema : function (name) {
        return this._get(X.constants.registry.kSchemas, name);
    },
    getSchemas : function () {
        return this._getAll(X.constants.registry.kSchemas);
    }


});
/**
 *
 * Class encapsulation of a model schema
 *
 * Valid elements in a model schema are:
 *      metaData : Object
 *      groupId  : String or Array
 *      key      : {
 *          "defaultValue" : JS Primitive
 *          "validate": Array
 *          "format": String,
 *          "type": String
 *          "accessibility": String,
 *      }
 *
 */
X.data.Schema = X.Class.extend({

    construct : function(def) {
        this._def = def || {};
        this._def = X._.omit(this._def, "metaData");
        this._metaData = def ? def.metaData : null;
        this._mutable = def ? (def.metaData ? def.metaData.mutable : false) : true;
        this._groupId = def ? (def.metaData ? def.metaData.groupId : null) : null;
    },

    hasDefinition : function () {
        return this.keys().length > 0;
    },

    mutable : function () {
        return this._mutable;
    },

    groupId : function () {
        return this._groupId;
    },

    hasMetaData : function () {
        return this._metaData !== null;
    },

    metaData : function () {
        return this._metaData || {};
    },

    hasKey : function (key) {
        return X._.has(this._def, key);
    },

    defForKey : function (key) {
        if (this.hasKey(key)) {
            return this._def[key];  // could return a copy for better encapsulation
        }
        else {
            return null;
        }
    },

    getAll : function () {
        return this._def;
    },

    getOptionForKey : function (key, opt) {
        var k = this.defForKey(key);
        if (k) {
            return (typeof k[opt] !== "undefined") ? k[opt] : null;
        }
        return null;
    },

    keys : function () {
        return X._.keys(this._def);
    }
});


X._.extend(X.utils, {
    /**
     * Split a model data reference into parts
     *
     * @param dataRef a fully specified data name, such as namespace.ModelName.propertyName[index]
     * @return {Object} contains properties including
     *      modelName
     *      key
     *      index (only applies to collections)
     *      isCollection - boolean
     *      property - property name of collection item (only applies to collections)
     */
    splitDataRef : function (dataRef) {
        var result = {
            modelName : "",
            key : ""
        };
        // normalize the name
        // i.e. change the associated arrays in the format foo['bar'] -> foo.bar
        // also will normalize non-quoted indexes that are non-numeric foo[bar] -> foo.bar
        // but leaves along valid array indexes foo[0] -> foo[0]
        dataRef = X.utils.normalizeModelRef(dataRef, true);

        var _nv = dataRef.match(/^(.*?)\.(.*)$/);  // non-greedy will get modelName . ref
        if (_nv) {
            result.modelName = _nv[1];
            result.key = _nv[2];
        }
        else {
            result.modelName = dataRef;
        }
        return result;
    },


    /**
     * normalize the name
     * i.e. change the associated arrays in the format foo['bar'] -> foo.bar
     * also will normalize non-quoted indexes that are non-numeric foo[bar] -> foo.bar
     * but leaves along valid array indexes foo[0] -> foo[0]
     *
     * @param ref
     * @param convertArraysToObject - convert arrays to dot notation always foo[0] -> foo.0
     */
    normalizeModelRef : function (ref, convertArraysToObject) {
        return ref.replace(/(\[(.*?)\])/g, function () {
            if (arguments[1].match(/[\'\"]/) || arguments[2].toNum() === null || convertArraysToObject) {
                return "." + arguments[2].removeQuotes();
            }
            else {
                return arguments[0];
            }
        });
    },

    // If modelNames is passed in, this function will act as a filter
    // otherwise, we'll use all the models in the system.
    getModelsForDAO : function (daoName, modelNames, infilters) {
        if (daoName._name) {
            daoName = daoName._name;
        }
        var filters = {daoName : daoName};
        X._.extend(filters, infilters);

        return X.getModels(filters, modelNames, true);
    },


    convertNamesToModels : function (names) {
        var modelArray = [];
        X._.each(names, function (val, idx) {
            var m;
            if (X._.isString(val)) {
                m = X.registry.getModel(val);
            }
            else if (val instanceof X.data.Model) {
                m = val;
            }
            if (m) {
                modelArray.push(m);
            }
        });
        return modelArray;
    }
});

/**
 * class: X.components.actionExecutor
 *
 * About:
 * This class will first resolve the action reference to a javascript function
 * If the function does not exist in the system, it will throw an error
 *
 * Usage :
 *
 *      IMPORTANT : The execute function returns a promise.  This is to allow for the possibility of creating asynchronous actions
 *                  That make remote calls and are resolved when the remote call returns
 *
 *      Note : If your action executes a remote call it must return a promise and resolve/reject it when your remote call returns
 *      Note : parameters passed as part of the action argument take precedence over those passed in the params argument
 */

X.components.ActionExecutor = function () {

    var _api = {
        /*
         * Function: execute
         * execute the action with input params
         *
         * Parameters:
         * inAction - string representation of the action to execute with parameters
         *       i.e. ActionClass.doSomething('foo', '${model.val}')
         * inParams - optional array of parameters if not specified in the act parameter
         *
         * returns promise - with the return value of the function
         * Note : If your action executes a remote call it must return a promise and resolve it when your remote call returns
         */
        execute : function (inAction, inParams) {

            var ex;
            var DO = X.$.Deferred(),
                actionName = null,
                params = null,
                actFunction = null;

            if (!inAction) {
                ex = new X.Exception("X.components.actionExecutor", "execute: no action passed in", X.log.ERROR);
                X.publishException(ex);
                DO.reject(ex);
                return DO.promise();
            }

            if (inParams && !X._.isArray(inParams)) {
                X.publishException("X.components.actionExecutor", "execute: parameters not passed as array - ignoring them", X.log.WARN);
                inParams = null;
            }


            // parse out the action name and any parameters that may be part of it inside parenthesis
            var parts = X.constants.functionRegex.exec(inAction);
            if (parts) {
                actionName = parts[1];
                params = X.utils.getArrayOfArgs(parts[3]);
                //            if (args.$el) {
                //                params.push(args.$el);
                //            }
            }

            // If parameters were not part of the inAction, see if they were passed as a separate argument
            // and resolve them
            if (params.length === 0 && inParams) {
                X._.each(inParams, function (p, idx) {
                    params.push(X.utils.evaluateSimpleOperand(p));
                });
            }


            try {
                // See if the action class already exists
                actFunction = X.utils.stringToFunction(actionName);

                if (actFunction) {
                    var context = actionName.match(/(.*)\./);
                    context = context ? X.utils.stringToFunction(context[1]) : window;
                    _evaluate(actFunction, context, params); // call the function
                }

                // Action does not exist,
                else {
                    ex = new X.Exception("X.components.actionExecutor", "Missing action " +
                                                                              actionName, X.log.ERROR);
                    X.publishException(ex);
                    DO.reject(ex);

                }

            }
            catch (e) {
                ex = new X.Exception("X.components.actionExecutor", "Invalid action " +
                                                                          actionName, X.log.ERROR, e);
                X.publishException(ex);
                DO.reject(ex);
            }

            return DO.promise();

            /*
             * Function: _evaluate
             * evaluate the function with input params
             * and resolve or reject the action
             *
             * Parameters:
             * func - the function to be evaluated
             * context - the 'this' to execute in
             * params - the array of params
             */
            function _evaluate (func, context, params) {
                params = params || [];  //IE won't allow null; Need to set to empty array

                if (typeof params != "object") {
                    params = params.split(',');
                }


                try {
                    if (X._.isFunction(func)) {
                        var response = func.apply(context, params);
                        if (response && X._.isFunction(response.then)) {
                            response.then(
                                function (result) {
                                    DO.resolve(result);
                                },
                                function (error) {
                                    DO.resolve(error);
                                }
                            );
                        }
                        else {
                            DO.resolve(response);
                        }
                    }
                    else {
                        ex = new X.Exception("ActionExecutor", "Javascript action '" + actionName +
                                                                  "' does not exist. Check your function (case sensitive, or misnamed).", X.log.ERROR);
                        X.publishException(ex);
                        DO.reject(ex);
                    }
                }
                catch (e) {
                    ex = new X.Exception("ActionExecutor", "Javascript action '" + actionName +
                                                              "' threw an exception", X.log.ERROR, e);
                    X.publishException(ex);
                    DO.reject(ex);
                }

            }

        }
    };

    return _api;

};


/**
 * Class:  X.application.flowResolver
 *
 * @implements {X.flow.I_FlowResolver}
 *
 * About:
 * This class will first resolve the flow reference to a javascript object that represents the flow
 * It will load the object out of a javascript file syncronously
 *
 * Options :
 *
 *      pathToFlows : path to the implementation of flow definitions.
 *                    Can be a string that represents the default path to ALL flows,
 *                    Or a hashmap that has a list of namespaces that map to different locations.
 *                    If you use an hashmap, you must define a "default" key
 *                    I.e.
 *                        pathToFlows:{
 *                                "ns1":"scripts/flows/namespace1flows/",
 *                                "ns1.flows.views":"scripts/flows/other/",
 *                                "default":"scripts/flows/"
 *                        }
 *
 *                    Then in your flow references (in the flow definitions) you reference your flows
 *                    using the namespace in using the following convention.
 *                        <namespace>.<fileReference>
 *
 *                     - everything up to the last '.' is considered a namespace and needs to be resolved in the pathToFlows
 *                     - if there is no namespace (no '.') then the default path will be used
 *
 *                        ns1.flowDef                     will be mapped to scripts/flows/namespace1flows/ (and flowDef will get resolved in the aliasMap)
 *                        ns1.flows.views.flowDef         will be mapped to scripts/flows/other
 *                        flowDef                         will be mapped to scripts/flows  (the default path)
 *
 *
 *
 *      aliasMap    :  map containing the resolution of view references to html file names
 *                     wildcard entry ('*') in the alias map will contain the default extension of the flow names
 *
 *      cacheParam : parameter to append as a query string to each resolved flow reference. can be a string or a function that returns a string.
 *
 *        Note : The item in the aliasMap marked '*' indicates that any view not existing in the map will be mapped directly to their reference name.
 *               The value of the '*' entry specifies the default extension of wildcarded view mappings.
 *
 *               You only need to supply aliasMappings here if your fileAliases do not match exactly to the name of the view.
 *               For example if the name of the fileAlias is page1 and your html file is page1.html, we'll use the wildcard convention, and you don't
 *               need to supply a mapping
 *
 *                        aliasMap:{
 *                          "Pg1":"namespace1/Page1.htm",
 *                          "ns1.Pg2":"Page2.htm",
 *                          "ns2.SubflowPg":"SubflowPage.htm",
 *                          "*":".htm"
 *                        }
 * *
 */

X.components.FlowResolver = function () {

    /*
     * Function: resolve
     * resolve the flow
     *
     * Parameters:
     * flowRef - the reference used to find the flow in the map
     *
     * returns promise.  Resolve with definition, reject with Exception
     */
    this.resolve = function (flowRef) {
        var promise = X.$.Deferred();
        var pathAlias = "default",
            abTestResolver = X.getComponent(X.constants.interfaces.kABTestResolver),
            alias = flowRef,
            pathToFile = null,
            flow = null,
            flowFile = null;


        // parse the pageRef into pathAlias.fileAlias
        var ns = X.constants.nameSpaceRegex.exec(flowRef);
        if (ns) {
            pathAlias = ns[1];
            alias = ns[2];
        }
        else if (flowRef !== null) {
            pathAlias = flowRef;
        }

        pathToFile = _pathToFlows[pathAlias];
        if (!pathToFile) {
            X.trace("Path alias '" + pathAlias + "' not found, using default path", "Flow Resolver");
            pathToFile = _pathToFlows["default"];
        }
        if (!pathToFile.match(/\/$/)) {
            pathToFile += "/";
        }

        if (_map[flowRef]) {
            flow = _map[flowRef];
            X.trace("ALIAS REF: '" + flowRef + "' --> " + flow, ["FLOW RESOLVER"]);
        }
        else if (_map[X.constants.kWildCard]) {
            flow = alias + _map[X.constants.kWildCard]; // wild card entry will have the default extension
            X.trace("WILDCARD REF: '" + alias + "' --> " + flow, ["FLOW RESOLVER"]);
        }
        flowFile = pathToFile + flow;

        var flowABTest = abTestResolver ? abTestResolver.getABTestFlow(flowRef, flowFile) : null;
        if (flowABTest) {
            X.trace(flowRef + " --> " + flowABTest, ["FLOW RESOLVER", "ABTEST"]);
            flowFile = flowABTest;
        }

        var queryParam = typeof _queryParam === "function" ? _queryParam() : _queryParam;
        if (typeof queryParam === "string") {
            var delimiter = flowFile.indexOf("?") >= 0 ? "&" : "?";
            flowFile += delimiter + queryParam;
        }

        // Now that we have a reference to the definition,
        // Load it out of memory, if its been loaded before.
        // Or off the server, if it hasn't
        if (flow) {
            var flowdef = X.registry.getFlow(flowRef);
            if (flowdef) {
                X.trace("Loading flow out of memory: '" + flow + "'", ["FLOW RESOLVER"]);
                promise.resolve(flowdef);
            }
            else {
                X.loaders.JSONLoader.load(flowFile).then(
                    function (impl) { // success
                        X.registry.registerFlow(flowRef, impl);
                        X.trace("Loading flow off server: '" + flowRef + "' --> " + flowFile, ["FLOW RESOLVER"]);
                        promise.resolve(impl);
                    },
                    function (ex) {  // fail
                        promise.reject(ex);
                    });
            }
        }
        else {
            promise.reject(new X.Exception("Flow Resolver", "Flow Reference: " + flowRef + " not found in config", X.log.ERROR));
        }

        return promise.promise();
    };


    // -- PRIVATE -- \
    //----------------\\
    var _pathToFlows,
        _queryParam,
        _map;

    function _init () {
        var options = X.options.flowResolverOptions;

        if (!options) {
            throw new X.Exception("Flow Resolver", "missing options", X.log.ERROR);
        }

        if (options.cacheParam) {
            _queryParam = options.cacheParam;
        }

        if (typeof options.pathToFlows === "object") {
            _pathToFlows = options.pathToFlows;

            /* Looks for a variable ${foo} in the json object value. If found, will resolve the variable by looking for a key with
             * with the variable name and substituting it's value
             *
             * NOTE: This logic does NOT support a circular reference.
             *       It also does NOT support resolving an unresolved variable during the action of substituting.
             */
            for (var key in _pathToFlows) {
                var matchedObj;
                while (( matchedObj = /\$\{(.*?)\}/g.exec(_pathToFlows[key])) !== null) {
                    if (_pathToFlows.hasOwnProperty(matchedObj[1])) {//Test that the property exists
                        var replaceVal = _pathToFlows[matchedObj[1]];
                        _pathToFlows[key] = _pathToFlows[key].replace(matchedObj[0], replaceVal);
                    }
                    else {
                        throw new X.Exception("Flow Resolver", matchedObj[0] + " variable cannot be found.", X.log.ERROR);
                    }

                }
            }

            if (typeof _pathToFlows["default"] !== "string") {
                throw new X.Exception("Flow Resolver", "pathToFlows must contain a 'default' entry.", X.log.ERROR);
            }
        }
        else if (typeof options.pathToFlows === "string") {
            _pathToFlows = {"default" : options.pathToFlows};
        }
        else {
            throw new X.Exception("Flow Resolver", "pathToFlows is invalid.  Must be an object or string.", X.log.ERROR);
        }

        if (typeof options.aliasMap === "object") {
            _map = options.aliasMap;
        }
        else {
            throw new X.Exception("Flow Resolver", "aliasMap is invalid.  Must be an object", X.log.ERROR);
        }
    }

    // Self initialize and then listen for changes to the config.
    _init();
    X.subscribe(X.constants.events.kOptions + ".flowResolverOptions", _init, this);


};

X.$.ready(function () {
    X.registerComponent(X.constants.interfaces.kFlowResolver, new X.components.FlowResolver(), true);
});


/***
 * ResourceLoader Class to load various resources such as HTML, JS, css.
 */
X.flow.ResourceLoader = (function () {

    var _impl = {

        /**
         * load js and css resources when sent a resources object and optional callback method
         * @param {Object} paramObject -  An object that should contain the following:
         *     - javascript: array with "javascript" resources
         *     - css : array with css resources
         *     - schemas : associative array of schemas to load
         *
         *  Ex: {
         *          "javascript" : ["fullPath2/javascriptFile.js", "fullPath2/secondJavascriptFile.js"],
         *          "css" : ["fullPath2/cssFile.css"],
         *          "schemas" : { foo : "path/to/fooSchema.json" }
         *      }
         * @returns promise
         */
        loadResources : function (paramObject) {
            if (!paramObject || !X._.isObject(paramObject)) {
                _publishError("loadJsAndCss requires a paramObject parameter. ");
            }

            paramObject = paramObject || {};


            var js = paramObject.javascript || paramObject.js || [];
            var css = paramObject.css || [];
            var schemas = paramObject.schemas || paramObject.schema || {};
            var promises = [];

            try {
                if (js) {
                    X._.each(js, function (file, idx) {
                        promises.push(X.loaders.JSLoader.load(file));
                    });
                }

                if (css) {
                    X._.each(css, function (file, idx) {
                        promises.push(X.loaders.CssLoader.load(file));
                    });
                }

                if (schemas.length) {
                    X._.each(schemas, function (path) {
                        promises.push(X.loadSchema(path));
                    });
                }

            }
            catch (ex) {
                _publishError("Exception during loadResources: " + X.utils.jsonSerializer.toString(paramObject), ex);
            }

            return X.$.when.apply(X.$, promises);

        }
    };


    function _publishError (msg, ex) {
        X.publishException("ResourceLoader", "Error Details: " + msg, X.log.ERROR, ex);
    }

    return _impl;
})();


X.constants = X.utils.mergeObjects(X.constants, {
    events : {
        kFlowStart : "startFlow",
        kFlowTransition : "flowTransition",
        kFlowEnd : "endFlow",
        kFlowEndController : "endFlowController"
    },
    interfaces : {
        kActionExecutor : "actionExecutor",
        kFlowResolver : "flowResolver"
    },

    registry : {
        kFlows : "flows"
    }
});

// -------------------------------
// class: X.flow.constants
// construct a constants object
//
// -------------------------------
X.flow.constants = {
    kViewState : "VIEW",
    kActionState : "ACTION",
    kFlowState : "FLOW",
    kEndState : "END",
    kErrorState : "ERROR",

    kWildCard : "*",
    kNavigationSeperator : "~"
};

X.flow.constants.historyType = {
    kNever : "never",
    kSession : "session",
    kAlways : "always"
};
X._.extend(X.options, {
    flowResolverOptions : {
        pathToFlows : {
            "default" : "flows"
        },
        aliasMap : {
            "*" : ".json"
        },
        cacheParam : null
    }
});
/*
 * class: JSFlow
 * X.flow.Flow
 *
 * about:
 * This class manages the state-machine within a flow definintion
 * 
 * Transmission map for JSFlows
 *
 * Events :
 *      X.constants.events.kFlowStart  -- when a flow starts
 *      {
 *          "name" : flow name,
 *          "id" : uuid of the flow
 *          "options" : options passed into the flow,
 *          "metaData" : metadata passed in as part of the flow definition, plus
 *          {
 *              path : array of NavigationObject objects that tells the system how to statefully get to this flow
 *              nodeName : the nodename of this flow
 *          }
 *      }
 *
 *      X.constants.events.kFlowEnd  -- when a flow ends
 *      {
 *          "name" : flow name,
 *          "id" : uuid of the flow
 *          "options" : options passed into the flow,
 *          "metaData" : metadata passed in as part of the flow definition, plus
 *          {
 *              path : array of NavigationObject objects that tells the system how to statefully get to this flow
 *              nodeName : the nodename of this flow
 *          }
 *       }
 *
 *      X.constants.events.kFlowTransition  -- on every transition of the flow
 *      {
 *         "name" : flow name,
 *         "id" : uuid of the flow,
 *         "nodeName" : name of the transition node,
 *         "stateDef" : object describing the nodename,
 *         "path" : path to the current flow
 *      }
 *
 * 
 * Note : As a bonus, this class will automatically generate a flow scoped model that will be valid for the lifetime of the flow
 *        All input variables into the flow will be added to the flow scoped model by default
 *        Data in the flow scoped model can be accessed outside of this class by referencing it in a view using on of the following notations:
 *           1) ${FLOW_VAR.<key>}  - this will immediately replace contents with the value out of flow scope
 *           2) FLOW_VAR.<key>  - these will be treated as dynamic data-binding so elements on a page can update the flow scope.
 * 
 *      : By default views states get a history attribute of 'always', flows get 'always', and actions get 'never'
 *
 * Note : By default, history attributes will be attached to each node unless otherwise specified
 *  ACTION : never
 *  VIEW : always (unless options.modal - then NEVER)
 *  FLOW : always (unless options.modal - then NEVER)
 *
 *
 * FlowDef:
 *  {
 *      require : { // any resources that will be needed before the flow starts [optional]
 *                   css : [ "path/to/css/file.css", "path/to/css/file2.css", ... ],
 *                   js : [ "path/to/css/file.js", "path/to/css/file2.js", ... ],
 *                   schema : [ "schema", "schema2", ... ],
 *                   module : [ "path/to/css/file.css", "path/to/css/file2.css", ... ]
 *                }
 *
 *      models : {  // Model that this flow will need [ optional ]
 *                  name : <string>,
 *                  className : <string>,  // if not specified, will use the one in the Options file
 *                  definition : <string>
 *                  DAO : <string - name of the DAO to use for this model> if not specified, will use the one in the Options file
 *              },
 *
 *      options : { [ optional ]
 *          modal : {  // show the flow in a modal window
 *              closeButton : <true | false > // have Mojo supply a close button on the modal,
 *              navWhenDone : <true | false > // allow the content of a modal window navigate the flow controller
 *              blockCloseWhenErrors : <true | false> // don't allow modal to close if errors are present
 *          }
 *      },
 *
 *
 *      onStart : {
 *          ref : <ref> // Action to perform on flow startup (maybe populating the model) [optional]
 *          params : parameters to pass to the javascript function
 *          exp : Mojo expression
 *      }
 *
 *
 *      onEnd : {
 *          ref : <ref> // Action to perform on flow startup (maybe populating the model) [optional]
 *          params : parameters to pass to the javascript function
 *          exp : Mojo expression
 *      }
 *
 *      startState : <name>, // name of the first node in the flow to execute
 *
 *      allowRandomAccess : <true | false>  - defaults to true // Can we navigate via jump inside this flow
 *
 *
 *
 *      <name>: {
 *          history : <never | always | session >
 *          state_type:<VIEW | ACTION | FLOW | END>,
 *          ref: <string>, // reference to a VIEW, ACTION, or FLOW
 *          data : {n:v, n:v, ...} // optional if we want to associate any data with this state
 *          transitions :{
 *              <on>: <to>,
 *              <on>: <to>,
 *              etc...
 *          }
 *      },
 *      <name> : .....
 *      }
 *
 *   Notes:
 *      In the transitions, ALL <on> values are required to be Strings.  No looking for transitions on booleans, nulls, undefineds, etc.
 *      Will turn all responses from Actions or values referenced in Models into Strings when looking up a transition.
 *
 *      for example, you need to do something like this:
 *
 *      ...
 *      transitions : {
 *          "false" : "goToFalse",
 *          "null"  " "goToNull",
 *          "undefined " : "goToUndefined",
 *          "0" : goToZero
 *       }
 *
 * 
 * Constructor:
 *      name : name of the flow
 *      flowDef : JSON definition of the flow
 *
 *
 *  Notes:
 *      Action states can take an 'exp' key.  And the value of that key would be a valid action expression
 *      End states can take an expression as a value of the 'outcome'.  And the value of that key would be a valid action expression
 */

X.flow.Flow = function (name, flowDef) {

    var _instance = {

        //---------------------------------------------------------
        // Function: init
        // Initialize a flow
        //  - initialize the flow with input parameters
        //---------------------------------------------------------
        init : function (inputVars, options, flowInfo, callback) {

            var self = this;

            // Handle any options passed in
            _options = options || {};
            _context = _options.context;

            // Set up the meta data and add any flowInfo to it.
            _metaData = _flowDef.metaData || {};
            X._.defaults(_metaData, flowInfo);

            //            // Force an ID if one is passed in
            //            // Used when using the back history and we need to hydrate a flow back
            //            // to its original state
            //            if (_options.forceFlowId)
            //                _id = _options.forceFlowId;

            // Create a flow scoped Model
            // And add the input options to the model
            _flowScopedModel = X.addModel(this.getflowScopedModelName());
            if (inputVars) {
                X._.each(inputVars, function (val, name) {
                    X.setDataVal(self.getflowScopedModelName(), name, val);
                });

            }

            // Load any requested resources
            // Then the call the _loadModels when done
            var require = _flowDef.require || {};
            X.flow.ResourceLoader.loadResources(require).always(function () {
                // if we need to gen up any models
                if (require.models) {
                    if (typeof require.models === "string") {
                        X.addModel(require.models);
                    }
                    else if (X._.isObject(require.models)) {
                        X.addModels(require.models);
                    }
                }

                callback();
            });
        },


        //---------------------------------------------------------
        // Function: start
        // Start a flow
        //  - start up the flow and run to the first view
        //  - return the first view response
        //---------------------------------------------------------
        start : function (callback) {
            if (_busy) {
                X.trace("Cannot start flow: " + _name + " We are busy");
                return;
            }

            var self = this;
            _errorStatus = null;

            X.publish(X.constants.events.kFlowStart + "." + _context, _getFlowInfoObj());

            self.onStart(function () {         // first, execute onStart instructions, if present
                self.doNext(null, function (resp) {
                    callback(resp);
                });
            });

        },

        //---------------------------------------------------------
        // Function: onStart
        // Run the action defined in the onStart node, if any
        // @param callback - function to call when done
        //---------------------------------------------------------
        onStart : function (callback) {
            // execute any onStart instructions
            if (_flowDef.onStart) {
                _runAction(_flowDef.onStart, callback);
            }
            else {
                callback();
            }
        },


        //---------------------------------------------------------
        // Function: end
        // This is called when an kEndState is encountered
        // checks to see if this modal was displayed in a modal, if true, end it.
        // In the flow definition, if there's an onEnd action specified, execute it
        // Publishes a flowEnd event with the flows name
        //---------------------------------------------------------
        end : function (callback) {
            var self = this;
            self.onEnd(function () {
                // publish event before blowing away the model.  Listeners may want to capture info out of the model
                X.publish(X.constants.events.kFlowEnd + "." + _context, _getFlowInfoObj());
                X.removeModel(self.getflowScopedModelName(), {silent : true});
                callback();
            });
        },

        //---------------------------------------------------------
        // Function: onEnd
        // Run the action defined in the onEnd node, if any
        // @param callback - function to call when done
        //---------------------------------------------------------
        onEnd : function (callback) {
            // execute any onEnd instructions
            if (_flowDef.onEnd) {
                _runAction(_flowDef.onEnd, callback);
            }
            else {
                callback();
            }
        },

        //---------------------------------------------------------
        // Function: doNext
        // Get the appropriate response out of the next logic state in the flow
        //  - will execute through action states without returning a response out
        //
        // Parameters:
        //   response - the response used to determine the current state
        //---------------------------------------------------------

        doNext : function (response, ctrlCallback) {
            if (_busy) {
                X.trace("Cannot doNext in flow: " + _name + " We are busy");
                ctrlCallback();
            }

            _errorStatus = null;
            _busy = true;
            // Set the current state based on the response from the previous state
            _setCurrent(response);

            // Now run the State-machine to the first logical page
            _run(function () {
                var resp = _createResponse();
                _busy = false;
                if (ctrlCallback) {
                    ctrlCallback(resp);
                }
            });

        },

        //---------------------------------------------------------
        // Function: jumpToState
        // Jump into the middle of the flow
        //  - return the response of the appropriate state
        //  - will run through actions to get the the next state-type
        //
        // Parameters:
        // stateName - the state name to jump to
        //---------------------------------------------------------
        jumpToState : function (stateName, ctrlCallback) {

            if (_busy) {
                X.trace("Cannot jump in flow: " + _name + " We are busy");
                ctrlCallback();
            }

            _errorStatus = null;
            _busy = true;
            if (this.allowRandomAccess()) {
                _setCurrent(stateName, true);

                if (!_currentState) {
                    _setErrorState("jumpToState: State Name '" + stateName + "' does not exist!");
                    return null;
                }
                _currentState.name = stateName;
            }


            _run(function () {
                var resp = _createResponse();
                _busy = false;
                if (ctrlCallback) {
                    ctrlCallback(resp);
                }
            });
        },


        //---------------------------------------------------------
        // Function: restoreToLastView
        // Restore this flow to the last visted view state
        //
        // Parameters:
        // callback - callback with the response of the function
        //---------------------------------------------------------
        restoreToLastView : function (callback) {
            _currentState = _lastViewState;

            // if no last view, start at the beginning
            if (_currentState) {
                var resp = _createResponse();
                callback(resp);
            }
            else {
                this.start(callback);
            }

        },


        //---------------------------------------------------------
        // Function: has
        // Does this flow contain a state-type with the passed name
        //
        // Parameters:
        // name - the name of the flow definition
        //---------------------------------------------------------
        has : function (name) {
            return (typeof _flowDef[name] != 'undefined');
        },

        //---------------------------------------------------------
        // Function: allowRandomAccess
        // Does this flow allow random access into middle of it	for the case of a jumpTo
        //---------------------------------------------------------
        allowRandomAccess : function () {
            if (this.has('allowRandomAccess')) {
                return _flowDef.allowRandomAccess;
            }
            else {
                return true;
            }
        },

        //---------------------------------------------------------
        // Function: getName
        // Get the name of the flow
        //---------------------------------------------------------
        getName : function () {
            return _name;
        },

        //---------------------------------------------------------
        // Function: getId
        // Get the id of the flow
        //---------------------------------------------------------
        getId : function () {
            return _id;
        },

        getNodeName : function () {
            return _metaData.nodeName;
        },

        //---------------------------------------------------------
        // Function: getFlowVariable
        // Get the value of a flow scoped variable
        //---------------------------------------------------------
        getFlowVariable : function (name) {
            return X.getDataVal(this.getflowScopedModelName(), name);
        },

        //---------------------------------------------------------
        // Function: setFlowVariable
        // Set the value of a flow scoped variable
        //---------------------------------------------------------
        setFlowVariable : function (name, value) {
            return X.setDataVal(this.getflowScopedModelName(), name, value);
        },

        //---------------------------------------------------------
        // Function: getflowScopedModelName
        // Get the name of the model that represents this flow scope
        //---------------------------------------------------------
        getflowScopedModelName : function () {
            return _id;
        },


        //---------------------------------------------------------
        // Function: isBusy
        // Indicate whether flow is waiting for an asynchronous action to complete
        //---------------------------------------------------------
        isBusy : function () {
            return _busy;
        }

    };

    //============================================================================
    //============================================================================
    // Group: Private
    // PRIVATE STUFF  - dont look below this line for your API!
    //============================================================================
    //============================================================================
    var _name = name,
        _id = X.constants.scopes.kFlowScope + "_" + X.utils.uuid(true),
        _flowDef = flowDef,
        _options = {},
        _metaData = {},
        _flowScopedModel = null,
        _currentState = null,
        _context = null,  // the viewport context that this flow is currently running in.
        _lastViewState = null,
        _actionExecutor = X.getComponent(X.constants.interfaces.kActionExecutor),
        _busy = false,
        _errorStatus = null;

    if (!_actionExecutor) {
        _actionExecutor = X.registerComponent(X.constants.interfaces.kActionExecutor,
            new X.components.ActionExecutor());
    }

    if (!name) {
        _publishException("Construtor: Flow name not specified", true);
    }
    if (!flowDef) {
        _publishException("Construtor: Flow Definition Object not specified", true);
    }


    //--------------------------------------------------------------------------
    // Function: _setCurrent
    // Set the new current State based on the outcome of the old current State
    // Sets _errorStatus if there is a failure
    //
    // Parameters:
    //   response - the response used to determine the current state
    // Return value:
    //   boolean indicating success
    //--------------------------------------------------------------------------
    function _setCurrent (response, bJumpTo) {
        var next = null,
            curNodeName = _currentState ? _currentState.nodeName : "",
            trans = null;

        // if directly setting the node
        if (bJumpTo) {
            next = response;
        }
        // If no currentState, or no response lets start at the beginning
        else if (null === _currentState || null === response) {
            if (!_instance.has("startState")) {
                _setErrorState("No 'startState' defined");
                return false;
            }
            curNodeName = "startState";
            next = _flowDef.startState;
        }


        // find the next state
        else {
            if (!_currentState.transitions) {
                _setErrorState("Flow Object: " + _name + " - No transitions defined for '" + _currentState.nodeName + "'");
                return false;
            }
            trans = _currentState.transitions;
            next = trans[response];
            if (!next && trans[X.flow.constants.kWildCard]) {
                next = trans[X.flow.constants.kWildCard];
            }
        }

        // Ok we have somewhere to go, lets find it in the flow definition
        if (next) {
            next = _resolveFlowValue(next);
            _currentState = _flowDef[next];

            if (!_currentState) {
                if (bJumpTo) {
                    _setErrorState("Cannot jump, node does not exist: " + next);
                }
                else {
                    _setErrorState("No Transition for: " + curNodeName + " -answer: " + next);
                }
                return false;
            }
            _currentState.nodeName = next;

        }
        else {
            response = response || "<EMPTY or NULL>";
            _setErrorState("No Transition for: " + curNodeName + ": " + response);
            return false;
        }

        //  DEBUG Stuff
        if (curNodeName) {
            X.trace("Transition from state '" + curNodeName + "' response: '" + response + "' to state '" +
                    _currentState.nodeName + "'", ["FLOW", _name]);
        }
        else {
            X.trace("Starting flow with state '" + _currentState.nodeName +
                    "'", ["FLOW", _name]);
        }

        var isModal = (_currentState.modal || (_currentState.options && _currentState.options.modal)) ? true : false;
        X.publish(X.constants.events.kFlowTransition + "." +
                       _context, {"name" : _name, "id" : _id, "nodeName" : next, "stateDef" : _currentState, "metaData" : _metaData, "modal" : isModal});

        return true;
    }

    //--------------------------------------------------------------------------
    // Function: _run
    //  Expects the current node of the flow (_currentState) to be set before entering this function.
    //  Run the state-machine to the next logical VIEW
    //  Does not return anything, just advances the currentState to the next
    //   logical view, flow or end state, executing actions along the way.
    //  If we're currently on one of those states, cool, just return.
    //--------------------------------------------------------------------------
    function _run (respToController) {

        if (!_currentState) {
            _setErrorState("JSFLow._run - No current state: ");
            respToController();
            return;
        }
        if (!_currentState.state_type) {
            _setErrorState("No 'state_type' defined for '" + _currentState.nodeName + "'");
            respToController();
            return;
        }

        var type = _currentState.state_type;

        if (type == X.flow.constants.kViewState) {
            var modal = _currentState.modal || (_currentState.options ? _currentState.options.modal : false);
            if (!modal) {
                _lastViewState = _currentState;
            }
        }
        if (type == X.flow.constants.kViewState || type == X.flow.constants.kFlowState ||
            type == X.flow.constants.kEndState) {
            // Nothing to run to.
            respToController();
        }

        // Run actions through to completion
        else if (type == X.flow.constants.kActionState) {
            var _actionResponse = '_x_null';
            var _actionState = _currentState;
            var _waitingOnTimer = false;

            // if there is an indicator to show a messge while the action runs
            var showMessage = _currentState.showMessage;
            if (showMessage) {
                // inject a special node into the flow to that will show the message
                // and navigate to it
                // then wait for either the timer to expire of the action to return
                // when it does, perform the navigation of the action.
                _injectMessageNode(_currentState);
                _currentState.transitions.__action_show_message__ = "__ACTION_SHOW_MESSAGE__";
                _setCurrent("__action_show_message__");
                _run(respToController);

                // If there is a timeer, set it and wait to navigate
                // the action response will be updated from _x_null to the actual value
                // when the action returns, we'll use this to indicate if we should navigate
                // when the timer expires, or wait until the action completes
                if (showMessage.minTime) {
                    _waitingOnTimer = true;
                    setTimeout(function () {
                        _waitingOnTimer = false;
                        if (_actionResponse != '_x_null') {
                            _setCurrent(_actionResponse);
                            if (!_errorStatus) {
                                _run(respToController);
                            }
                            else  // error, just return
                            {
                                _publishException(_errorStatus.msg);
                                respToController();
                            }
                        }

                    }, showMessage.minTime);
                }

            }


            _runAction(_actionState, function (response) {
                if (!_errorStatus) {
                    // turn all responses to Strings
                    _actionResponse = "" + response;


                    // Based on the result of the action, advance the State-machine to the next state
                    // and run again
                    if (!_waitingOnTimer) {
                        _setCurrent(_actionResponse);
                        if (!_errorStatus) {
                            _run(respToController);
                        }
                        else  // error, just return
                        {
                            _publishException(_errorStatus.msg);
                            respToController();
                        }
                    }

                }
                else {
                    respToController();
                }

            });
        }
        else {
            _setErrorState("Invalid State Type: " + type + " in " + _currentState.name);
            respToController();
        }

    }


    //--------------------------------------------
    // Run a javascript action
    //
    //--------------------------------------------
    function _runAction (node, callback) {
        var act = node.ref,
            exp = node.exp,
            response;

        if (act) {
            // convert references to FLOW_SCOPE to the actual flowscope instance
            act = _resolveFlowValue(act);
            var profiler = new X.utils.Profiler("ACTION_PROFILE: " + act);
            profiler.mark("execute");
            _actionExecutor.execute(act).then(
                function (response) {
                    profiler.captureTimeFromMark("executeTime", "execute");
                    X.publish(X.constants.events.kProfile, profiler);
                    X.trace(profiler.serialize());
                    callback(response);
                },
                function (error) {
                    _setErrorState(error);
                    callback();
                }
            );
        }
        else if (exp) {
            // convert references to FLOW_SCOPE to the actual flowscope instance
            var resp = _resolveFlowValue(exp);
            X.trace("Executing expression '" + exp + "' response: '" + resp +
                    "'", ["FLOW", _name]);
            callback(resp);
        }
        else {
            return _setErrorState("Invalid ACTION node - missing ref or exp");

        }
    }

    //---------------------------------------------------------
    // Function: getFlowInfoObj
    // Get an object that represents the information about the current flow
    //---------------------------------------------------------
    function _getFlowInfoObj () {
        return {"name" : _name, "metaData" : _metaData, "options" : _options, "id" : _id};
    }


    // -------------------------------
    // Function: _setErrorState
    // publish error with message
    //
    // Parameters:
    //   msg - the message of the error
    // -------------------------------
    function _setErrorState (msg) {
        //X.trace("Flow error: " + _name + " - " + msg, ["X.flow.Flow", ""], X.log.ERROR);

        _errorStatus = new X.Exception("Flow", "Flow Object: " + _name + " - " + msg, X.log.ERROR);

        //        X.publish(X.constants.events.kException, _errorStatus);
    }

    // -------------------------------
    // Function: _publishException
    // _publishException error with message
    //
    // Parameters:
    //   msg - the message of the error
    // -------------------------------
    function _publishException (msg, throwEx) {
        var ex = new X.Exception("Flow", "Flow Object: " + _name + " - " + msg, X.log.ERROR);
        X.publishException(ex);
        if (throwEx) {
            throw(ex);
        }
    }

    /* -------------------------------
     // Function: _createResponse
     // construct the response
     {
     state_type, // type of current node
     value, // navigation value from the current node
     data, // any data specified in the current node
     options,
     inputVars,
     modal,
     autoNav
     error = null; // will be populated with X.Exception if there is an error;
     }
     // -------------------------------
     */
    function _createResponse () {
        var response = {};

        // Check to see if we're in an error state;
        if (_errorStatus) {
            response.state_type = X.flow.constants.kErrorState;
            response.error = _errorStatus;
            return response;
        }
        response.state_type = _currentState.state_type;
        switch (_currentState.state_type) {
            case X.flow.constants.kFlowState:
            case X.flow.constants.kViewState :
                response.value = _currentState.ref;
                response.options = _currentState.options;
                response.modal = _currentState.modal;
                response.autoNav = _currentState.autoNav;
                response.inputVars = _resolveInputVars(_currentState.inputVars);
                response.metaData = _currentState.metaData;
                break;
            case X.flow.constants.kActionState:
                response.value = _currentState.ref;
                break;
            case X.flow.constants.kEndState :

                if (_currentState.outcome) {
                    response.value = _resolveFlowValue(_currentState.outcome);
                }
                else {
                    _setErrorState("Node " + _currentState.nodeName + " does not have an outcome");
                    response.error = _errorStatus;
                }
                break;
        }

        // Turn ALL responses into Strings
        if (typeof(response.value) !== "string") {
            response.value = "" + response.value;
        }

        // Set output here
        response.outputVars = null;
        response.data = _resolveInputVars(_currentState.data);
        response.nodeName = _currentState.nodeName;

        return response;
    }

    function _resolveInputVars (iv) {
        // Resolve any inputvars
        var out = {};
        if (iv) {
            X._.each(iv, function (val, name) {
                out[name] = (typeof val === "string") ? (_resolveFlowValue(val)) : val;
            });
        }
        return out;
    }

    // Resolve dynamic data as well as substituting in the current flowscope name if it exists in the value
    function _resolveFlowValue (inval) {
        inval = inval.replace(X.constants.scopes.kFlowScope, _instance.getflowScopedModelName());
        return X.resolveDynamicData(inval);
    }

    function _injectMessageNode (currentNode) {
        var bind = currentNode.showMessage.message;
        if (bind) {
            X.setDataVal(bind.model, bind.key, _resolveFlowValue(bind.value));
        }
        _flowDef.__ACTION_SHOW_MESSAGE__ = {
            state_type : "VIEW",
            history : "never",
            transitions : currentNode.transitions,
            ref : currentNode.showMessage.ref,
            data : {
                messageNode : true
            }
        };
    }

    return _instance;
};


//-------------------------------------------------------------------------------------
// class: JSFlowController
// X.flow.controller
//  
// About:
//  This class manages the state machine of X.
//  It manages the lifecycle of flows and is in charge of progressing the state machine from view to view.
//      running actions and subflows along the way.
//
//  As a response to the calls to 'getNextView' and 'navigateTo', this class will return a reference to a view that higher level calling code must
//  Resolve to an actual implementation of that view.

// This class uses a flow resolver that has been injected into the system.
// If clients have special requirements around resolving flow references, they must supply a flow resolver options file to let the system know
// where and how to resolve flow references to actual flow definitions

//  Options : onEndCB, onModalCB, onErrorCB
//
//-------------------------------------------------------------------------------------

/**
 *
 * @param options
 *          - onEndCB : callback when the flow sequence ends
 *          - onErrorCB : callback when the flow errors out
 *          - onModalCB : callback when the flow encounters modal functionality
 *
 * @returns {{start: start, navigateTo: navigateTo, getNextView: getNextView, pause: pause, resume: resume, getStateToCurrentFlow: getStateToCurrentFlow, getCurrentFlowVariable: getCurrentFlowVariable, setCurrentFlowVariable: setCurrentFlowVariable, getCurrentFlowScopeName: getCurrentFlowScopeName, isBusy: isBusy, getId: getId}}
 * @constructor
 */
X.flow.Controller = function (options) {

    var _instance = {

        /**
         *  start the specifed flow
         * @param flowName
         * @param inputVars
         * @param options
         * @param callback  function callback to execute when we're done navigating to first view,
         *                  will return a flowResponse object
         */
        start : function (flowName, inputVars, options, callback) {
            var nav = new X.flow.NavigationObject(flowName, inputVars, options);
            this.navigateTo(nav, callback);
        },

        //-------------------------------------------
        // Function: navigateTo
        // jump to the specifed node in the heirarchy of flows specified by the target (path)
        //
        // Parameters:
        //   pathElements - array of NavigationObjectObjs that specify how to get to the requested node,
        //   callback - function callback to execute when we're done navigating, will return a flowResponse object
        //-------------------------------------------
        navigateTo : function (pathElements, callback) {
            if (!callback) {
                _publishException("navigateTo() called without callback");
                return;
            }
            else if (!pathElements) {
                callback(_createErrorResponse("No pathElements passed to navigateTo"));
                return;
            }


            // Throw the old stack away
            _currentFlow = null;
            _flowStack = [];


            // Save off the first and the last
            //  - The first must be the main flow reference
            //  - The last can be any state-type
            var start = pathElements[0];
            var end = pathElements[pathElements.length - 1];

            if (!(start instanceof X.flow.NavigationObject)) {
                callback(_createErrorResponse("navigateTo : Start node is not a NavigationObject Object"));
                return;
            }
            if (!(end instanceof X.flow.NavigationObject)) {
                callback(_createErrorResponse("navigateTo : end node is not a NavigationObject Object"));
                return;
            }


            // Only one thing in the jump path, basically if the user only passed in the flow name
            if (start === end) {
                _loadFlow(start.nodeName, start.inputVars, start.options, start.nodeName, function (err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        _runToView(null, false, function (flowResp) {
                            callback(flowResp);
                        });
                    }
                });
            }
            else {
                _loadFlow(start.nodeName, start.inputVars, start.options, start.nodeName, function (err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        _currentFlow.onStart(function () {
                            _loadPathElements(1, pathElements, function (err) {
                                if (err) {
                                    callback(err);
                                }
                                else {
                                    _runToView(end.nodeName, true, function (flowResp) {
                                        callback(flowResp);
                                    });
                                }
                            });
                        });
                    }
                });
            }
        },

        //-------------------------------------------
        // Function: getNextView
        // Return the next page based on the response passed in from the current page
        // If no response is passed in, we'll assume this is a request for the first view of the flow
        //
        // Parameters:
        //   response - the response from which to determine the next view
        //-------------------------------------------
        getNextView : function (response, callback) {
            if (!callback) {
                _publishException("getNextView() called without callback");
                return;
            }
            if (!response) {
                callback(_createErrorResponse("No response passed to getNextView"));
                return;
            }

            _runToView(response, false, function (flowResp) {
                callback(flowResp);
            });

        },

        //---------------------------------------
        //  Pause/Resume functionality
        //---------------------------------------
        pause : function () {
            _paused = true;
        },

        resume : function (response, callback) {
            _paused = false;
            if (response) {
                _runToView(response, false, function (flowResp) {
                    callback(flowResp);
                });
            }
            else {
                _currentFlow.restoreToLastView(callback);
            }
        },


        //-------------------------------------------
        // Function: get the path to the current flow
        //  - returns an array of flowinfoobjects
        //------------------------------------------
        getStateToCurrentFlow : function (currentNodeName) {
            var path = [];
            for (var i = 0; i < _flowStack.length; i++) {
                path.push({"nodeName" : _flowStack[i].getNodeName(), "id" : _flowStack[i].getId()});
            }
            path.push({"nodeName" : currentNodeName, "id" : _currentFlow.getId()});
            return path;
        },

        //-------------------------------------------
        // Function: getCurrentFlowVariable
        // get a flow scoped variable out of the current flow
        //  - may return null or undefined
        //
        // Parameters:
        //   name - the name of the variable to get
        //------------------------------------------
        getCurrentFlowVariable : function (name) {
            if (_currentFlow) {
                return _currentFlow.getFlowVariable(name);
            }
        },

        //-------------------------------------------
        // Function: setCurrentFlowVariable
        // set a flow scoped variable out of the current flow
        //  - may return null or undefined
        //
        // Parameters:
        //   name - the name of the variable to set
        //   value - the value of the variable to be set
        //-------------------------------------------
        setCurrentFlowVariable : function (name, value) {
            if (_currentFlow) {
                _currentFlow.setFlowVariable(name, value);
            }
        },

        //-------------------------------------------
        // Function: getCurrentFlowScopeName
        // get the name of the current flow scope
        //  - may return null or undefined
        //
        //-------------------------------------------
        getCurrentFlowScopeName : function () {
            if (_currentFlow) {
                return _currentFlow.getflowScopedModelName();
            }
        },

        //-------------------------------------------
        // Function: isBusy
        // indicates whether flow resolver is still waiting for a flow definition to load
        //
        //-------------------------------------------
        isBusy : function () {
            if (_currentFlow && _currentFlow.isBusy()) {
                X.trace("current flow is busy waiting for asynchronous functionality to complete", X.log.WARN);
                return  _currentFlow.isBusy();
            }
            return false;
        },

        getId : function () {
            return _id;
        }
    };

    //-------------------------------------------------------------------------------------
    // Group: Private
    // PRIVATE STUFF  - dont look below this line for your API!
    //      - not included in the public API returned in the _instance Object
    //-------------------------------------------------------------------------------------
    var _id = X.utils.uuid(),
        _currentFlow = null,
        _flowStack = [],
        _flowResolver = X.getComponent(X.constants.interfaces.kFlowResolver),
        _paused = false,
        _context = options.context || "",  // the viewport context that this flow is currently running in.
        _onEndCallback = options.onEndCB || function () {},
        _onModalCallback = options.onModalCB || function () {},
        _onErrorCallback = options.onErrorCB || function () {};


    //--------------------------------------------
    // Function: _loadPathElements
    // used to recursively load each step of a path during a navigational jump
    //
    // Parameters:
    //   step - index of current element in the pathElements array
    //   pathElements - array of path elements
    //   callback - function to execute when reaching the last path element
    //--------------------------------------------
    function _loadPathElements (step, jumpNodes, callback) {
        if (step < jumpNodes.length - 1) {
            var jumpNode = jumpNodes[step];
            if (!_currentFlow.allowRandomAccess()) {
                callback(_createErrorResponse("Cannot jump- flow does not allow jump access: " + _currentFlow.getName()));
            }
            if (!_currentFlow.has(jumpNode.nodeName)) {
                callback(_createErrorResponse("Cannot jump- flow: " + _currentFlow.getName() + " - does not have element: " + jumpNode.nodeName));
            }
            _currentFlow.jumpToState(jumpNode.nodeName, function (rsp) {
                _loadFlow(rsp.value, jumpNode.inputVars, jumpNode.options, rsp.nodeName, function (err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        _currentFlow.onStart(function () {
                            _loadPathElements(step + 1, jumpNodes, callback);
                        });
                    }
                });
            });

        }
        else {
            callback();
        }
    }

    //--------------------------------------------
    // Function: _runToView
    // Step through the flow to the next view
    // Running actions, executing subflows, etc.
    // Returns a string representing the resolved view
    //  - if the flow sequencing is done, it will return an indicator that the
    //    flow is finished plus any output of the flow
    //
    // Parameters:
    //   response - the response to determine the next view
    //   isJump - boolean to identify a jump is required
    //--------------------------------------------
    function _runToView (response, isJump, callback) {

        if (isJump) {
            _currentFlow.jumpToState(response, function (flowResp) {
                _handleFlowResponse(flowResp, callback);
            });
        }
        else if (!response) {
            _currentFlow.start(function (flowResp) {
                _handleFlowResponse(flowResp, callback);
            });
        }
        else {
            _currentFlow.doNext(response, function (flowResp) {  // Do next with no 'response' starts the flow from the beginning
                _handleFlowResponse(flowResp, callback);
            });
        }
    }

    function _handleFlowResponse (flowResp, callback) {
        //------------------------------
        // Handle a Modal response
        //------------------------------
        var modal = flowResp.modal || (flowResp.options ? flowResp.options.modal : false);
        if (modal && _onModalCallback) {
            // pause the current flow
            _instance.pause();

            // Now handle the modal and return;
            _onModalCallback(flowResp);
            return;
        }


        //---------------------------------
        // Handle a normal response
        //---------------------------------
        switch (flowResp.state_type) {

            case X.flow.constants.kViewState :
                // Return a reference to a view
                callback(flowResp);
                break;

            case X.flow.constants.kFlowState :
                // load the new Flow (making it current), then run
                _loadFlow(flowResp.value, flowResp.inputVars, flowResp.options, flowResp.nodeName, function (err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        // Pass empty response to get the start state of the flow
                        _runToView(null, false, function (rsp) {
                            callback(rsp);
                        });
                    }
                });
                break;


            case X.flow.constants.kEndState :
                // pop back up to the parent flow and run
                _currentFlow.end(function () {
                    _currentFlow = _flowStack.pop();
                    if (_currentFlow) {
                        _runToView(flowResp.value, false, function (rsp) {
                            callback(rsp);
                        });
                    }
                    else {
                        if (X._.isFunction(_onEndCallback)) {
                            _onEndCallback(flowResp);
                        }
                        else {
                            callback(flowResp);
                        }
                    }

                });
                break;


            case X.flow.constants.kErrorState :
            /* falls through */
            default :
                if (X._.isFunction(_onErrorCallback)) {
                    _onErrorCallback(flowResp);
                }
                break;
        }
    }


    //--------------------------------------------
    // Function: _loadFlow
    // Load a new flow definition and initialize it
    // Push the current one on the stack
    //
    // Parameters:
    //   flowRef - the reference to the flow
    //   inputVars - the variables to be passed into a flow
    //   options     - external options about the flow to be passed into it
    //--------------------------------------------
    function _loadFlow (flowRef, inputVars, options, nodeName, callback) {
        options = options || {};

        // pass the current flowscope down into the subflow
        if (_currentFlow) {
            var _fs = X.getAllDataInModel(_instance.getCurrentFlowScopeName());
            inputVars = X._.extend(X._.extend({}, _fs), inputVars);
        }

        // lookup/load the new flow
        _flowResolver.resolve(flowRef)
            .then(function (flowDefObj) {
                // push the current flow
                if (_currentFlow) {
                    _flowStack.push(_currentFlow);
                }

                // Create a new flow and initialize it.
                try {
                    _currentFlow = new X.flow.Flow(flowRef, flowDefObj);
                    _currentFlow.__ref = nodeName;
                }
                catch (ex) {
                    callback(_createErrorResponse("No Flow found for flow reference" + ": " + flowRef));
                    return;
                }

                // get the current path and nodeName and pass it to the flow,
                // so the flow has some notion of its context
                var _flowInfo = {
                    "path" : _instance.getStateToCurrentFlow(nodeName),
                    "nodeName" : nodeName
                };
                options.context = _context;
                _currentFlow.init(inputVars, options, _flowInfo, callback);
            })
            .fail(function (ex) {
                X.publishException(ex);
                callback(_createErrorResponse(ex.msg));
            });
    }


    //--------------------------------------------
    // Function: _publishException
    // Publishes an error
    //
    // Parameters:
    //   msg - the message for the error
    //--------------------------------------------
    function _publishException (msg) {
        X.publishException("X.flow.controller", msg, X.log.ERROR);
    }

    /* -------------------------------
     // Function: _createResponse
     // construct the response
     {
     state_type, // type of current node
     value = null, // navigation value from the current node
     data = null, // any data specified in the current node
     options = null,
     inputVars = null,
     modal = null,
     autoNav = null
     error = Exception; // will be populated with X.Exception if there is an error;
     }
     // -------------------------------
     */
    function _createErrorResponse (msg) {
        return {
            state_type : X.flow.constants.kErrorState,
            error : new X.Exception("X.flow.controller", msg, X.log.ERROR)
        };
    }

    return _instance;

};


X.flow.NavigationObject = function (flowNodeName, inputVars, options) {
    this.nodeName = flowNodeName;
    this.inputVars = inputVars || null;
    this.options = options || null;
};
X._.extend(X.registry, {

    registerFlow : function (name, flowObj, dontReplace) {

        return this._register(X.constants.registry.kFlows, name, flowObj, dontReplace);
    },

    getFlow : function (name) {
        return this._get(X.constants.registry.kFlows, name);
    },

    getFlows : function () {
        return this._getAll(X.constants.registry.kFlows);
    }
});

/*
 *    The main API to the validation module
 */

// set up validation namespaces
X.validation = {};

// Extend the core
X._.extend(X, {


    // -------------------------------
    // bind the formatters and validators to the DOM
    //
    // Parameters:
    //    $container - the dom element identifier
    //                  or the X.$ element
    // -------------------------------
    attach : function ($container, options) {
        $container = X.utils.get$($container);
        if (!$container.length) {
            $container = X.$('body');
        }
        X.validation.binder.bindFormatters($container, options || {});
        X.validation.binder.bindValidators($container, options || {});
    },

    /**
     * Remove bindings from the DOM.
     *      Otherwise memory leaks may occur if the DOM is blown away and formatters are still attached to elements
     *
     * @param $container  - the dom element identifier
     *                      or the X.$ element
     */
    detach : function ($container) {
        $container = X.utils.get$($container);
        $container.unbind();
    },

    /**
     * Set/Override Xinch validation options
     *
     *  {
     *      useValidator : true, // enable/disable the use the validation functionality
     *      tooltipPosition : 'top', // position of tooltip relative to input.  supported values: 'top', 'bottom', 'right'
     *      hideOnFocus : false, // hide the tooltip when input field gets focus
     *      showOnlyOne : false, // show only one error tooltip
     *      showMultipleErrorsPerInput : false, // if there is more than one error, show them all
     *      validateOnBlur : false, // Perform validation on blur of an element
     *      suppressErrors : false // Just validate and return the result, but don't show any errors messaging
     *   }
     *
     * @param opts -  object representing validation options
     */
    setValidationOptions : function (opts) {
        opts = opts || {};
        var clientOpts = {
            validationOptions : opts
        };
        X.setOptions(clientOpts);
    },
    /**
     * Set/Override Xinch format options
     *
     *   {
     *      useFormatter : true, // enable/disable autoformatting of input elements
     *      formatEvent : ["keyup", "blur", "paste"], // Android 2.x bug results in erroneous input when formatting after each key, we'll fix in the formatter code
     *      ignoreKeyCodes : [9, 16], // tab, shift
     *      formatOnLoad : false  // Future use to autoformat a the value if it is changed via data-binding
     *   }
     *
     * @param opts     -  object representing formatting options
     */
    setFormatOptions : function (opts) {
        opts = opts || {};
        var clientOpts = {
            formatOptions : opts
        };
        X.setOptions(clientOpts);
    },


    /**
     * Override an existing or default validation/formatting strategy
     *
     * @param strategyName - strategy name
     * @param strategyObj - instance of X.validation.baseStrategy
     */
    registerInputStrategy : function (strategyName, strategyObj /*instance of X.validation.baseStrategy*/) {
        X.registry.registerStrategy(strategyName, strategyObj);
    },


    /**
     * Override an existing or default validation/formatting strategy
     *
     * @param strategyName - name of an existing strategy
     * @param overrideObj - contains the key(s) and the value(s) of the properties to override
     *  *  I.e.:
     *  { defaultMessage : "Hello there" }
     *  { validate : function () { .... } }
     *
     *  or a combo: {
     *    defaultMessage : "Foo Bar",
     *        format : function ($el, evt ) { .... },
     *        validate : function ($el) { .... },
     *  }
     */
    overrideInputStrategy : function (strategyName, overrideObj) {
        X.registry.overrideStrategy(strategyName, overrideObj);
    },


    /**
     * Register you custom validation renderer
     *
     * @param renderer - instance of your renderer that overrides the show and hide methods
     */
    registerValidationRenderer : function (renderer) {
        if (X._.isObject(renderer) && X._.isFunction(renderer.show) && X._.isFunction(renderer.hide)) {
            X.registerComponent(X.constants.interfaces.kValidationRenderer, renderer);
        }
        else {
            X.publishException("X.registerValidationRenderer: invalid Renderer - no show or hide function");
        }
    },

    /**
     * Validate a container and its descendant elements
     *
     * @param $container - element id or X.$ object
     * @param options - validation options {showOnlyOne , suppressErrors, showMultipleErrorsPerInput}
     * @returns {boolean} - true iff validation passes
     */
    validateSection : function ($container, options) {
        return X.validation.engine.validateAll($container, options);
    },


    /**
     * Validate an element
     *
     * @param $el - element id or X.$ object
     * @param options - validation options {showOnlyOne , suppressErrors, showMultipleErrorsPerInput}
     * @returns {boolean} - true iff validation passes
     */
    validateElement : function ($el, options) {
        return X.validation.engine.validateField($el, options);
    },

    /**
     * Returns an array of error object - empty array if no errors
     *      {
     *          $el : X.$ element in error
     *          errorList : [] array of error messages
     *      }
     * @param $container
     * @returns {Array|*}
     */
    getErrorList : function ($container) {
        return X.validation.engine.getErrorList($container);
    },

    /**
     * Remove the error tooltips from a container and its descendant elements
     *
     * @param $container - element id or X.$ or jQuery object
     */
    removeErrorTips : function ($container) {
        X.validation.engine.hideErrorTooltips($container);
    },


    /**
     * Does the container have any error tips showing
     * @param $container - element id or X.$ or jQuery object
     * @returns boolean
     */
    hasErrorToolTips : function ($container) {
        return X.validation.engine.hasErrorToolTips($container);
    },

    /**
     * Force show an error message on an element
     *
     * @param $el - element id or X.$ or jQuery object
     * @param msg - error message
     * @param options - validation options
     * @returns {*}
     */
    showErrorMsg : function ($el, msg, options) {
        return X.validation.engine.showErrorMsg($el, msg, options);
    },


    /**
     * Format the element based on the data-format attribute
     *
     * @param $el
     */
    formatElement : function ($el) {
        // check to see if we've already bound the formatter,
        // if not, do so.
        var formatter = $el.data("formatter");
        if (!formatter) {
            formatter = $el.attr("data-format");
            $el.data("formatter", formatter);
        }

        //since the formatter expects an event, send a fake keydown. code 38 is 'up arrow' key
        $el.format(X.$.Event("keydown", {keyCode : 38}));
    }


});

//==========================================================
//  API for setting/getting the current time
//
//  Make a HEAD request to your server to pull the
//  current time stamp if you don't explicitly set the date.
//===========================================================
X.$.ready(function () {
    var _officialTime;     // milliseconds since 1970
    var _localTimeWhenSet; // milliseconds since 1970

    /**
     * Inform the application of the official time/date
     * @param d - Date object, or number of ms since 1/1/1970
     */
    X.setDate = function (d) {
        if (d instanceof Date) {
            _officialTime = d.getTime();
        }
        else if (typeof d === "number") {
            _officialTime = d;
        }
        _localTimeWhenSet = (new Date()).getTime();
    };


    /**
     * Get the date that was previously set via a head request to the server or setDate
     * @returns {Date}
     */
    X.getDate = function () {
        var adjustment = (new Date()).getTime() - _localTimeWhenSet;

        return (new Date(_officialTime + adjustment));
    };

    // Get the official date off your server
    // Make a head request and grab the date header
    X.$.ajax({
        type : "HEAD",
        url : "",
        success : function (data, status, xhr) {
            _officialTime = new Date(xhr.getResponseHeader("Date")).getTime();
        },
        error : function (xhr, type, error) {
            _officialTime = new Date(xhr.getResponseHeader("Date")).getTime();
        }
    });
    _localTimeWhenSet = (new Date()).getTime();

});



X.constants = X.utils.mergeObjects(X.constants, {
    events : {
        kValidationFailed : "validationFailed"
    },
    jqEvents : {
        kAutoformat : "xinch.autoformat"
    },
    interfaces : {
        kValidationRenderer : "validationRenderer"
    },
    registry : {
        kInputStrategies : "inputStrategies"
    }
});
X._.extend(X.options, {
    // validation module options --------------------------
    validationOptions : {
        tooltipPosition : 'top', // position of tooltip relative to input.  supported values: 'top', 'bottom', 'right'
        hideOnFocus : false, // hide the tooltip when input field gets focus
        showOnlyOne : false, // show only one error tooltip
        showMultipleErrorsPerInput : false, // if there is more than one error, show them all
        validateOnBlur : false, // Perform validation on blur of an element
        suppressErrors : false, // Just validate and return the result, but don't show any errors messaging
        validateOnBack : false, // No validation if the customer hits back, keys off of "back" or your viewportHistory autoBackNavigationEvent
        validateOnJump : false, // No validation if the customer jumps in navigation
        useValidator : true // use the validation functionality
    },
    formatOptions : {
        useFormatter : true, // use the autoformatting functionality
        formatEvent : ["keyup", "blur", "paste"], // Android 2.x bug results in erroneous input when formatting after each key, we'll fix in the formatter code
        ignoreKeyCodes : [9, 16], // tab, shift
        autoFormat : false
    }
});

X._.extend(X.registry, {

    registerStrategy : function (name, strategyObj, dontReplace) {
        if (!X._.isObject(strategyObj)) {
            X.publishException("X.validation.strategies",
                "Invalid strategy definition - must be an object or instance of X.validation.BaseStrategy : '" +
                strategyObj + "'");
        }
        if (!(strategyObj instanceof X.validation.BaseStrategy)) {
            var S = X.validation.BaseStrategy.extend(strategyObj);
            strategyObj = new S();
            S = null;
        }
        strategyObj._strategyName = name;
        return this._register(X.constants.registry.kInputStrategies, name, strategyObj, dontReplace);
    },

    overrideStrategy : function (name, overrideObj) {
        var s = this.getStrategy(name);
        if (s) {
            // if the strategy already exists, add/replace with the new properties
            X.$.extend(s, overrideObj);
            X.trace("X.validation.strategies: overriding " + name);

        }
        else {
            X.publishException("X.validation.strategies", "overrideStrategy: " + name + " does not exist - not overriding", X.log.WARN);
        }

    },

    getStrategy : function (name) {
        return this._get(X.constants.registry.kInputStrategies, name);
    },

    getStrategies : function () {
        return this._getAll(X.constants.registry.kInputStrategies);
    }

});

/*
 * class: BaseStrategy
 * Validation Strategy Interface
 */
X.validation.BaseStrategy = X.Class.extend({
    ignoreKeyCodesOnMask : [8, 46, 127],
    exceptions : null, // (optional) - A list of valid exceptions for this strategy - if no exceptions are applicable, do not override.
    allowException : false,
    regex : null,
    defaultMessage : null, // defaultMessage needs to be null in the base class
    validateIfEmpty : false, // perform validation if the field is empty;
    getError : function ($el, otherMsg) {
        var dv = $el.prop("validate");
        // strategy name is injected during registration of the input strategy (validationRegistry)
        var msg = (dv && dv[this._strategyName] && dv[this._strategyName].options.message) ? dv[this._strategyName].options.message : this.defaultMessage || otherMsg;

        return X.utils.evaluateSimpleOperand(msg);
    },

    // -------------------------------
    // Function: construct
    // construct a new BaseStrategy
    //
    // variables:
    //   allowException - the boolean value to allow alternative formats
    //   maskChar - the default masking character
    // -------------------------------
    construct : function () {
        // Define our member variables;
        this.allowException = false;
        this.maskChar = "#";
        this._strategyName = "";
    },

    // -------------------------------
    // Function: validate
    // Base functionality tests against exceptions, then regex
    //
    // Parameters:
    //   value - the value to be validated
    // -------------------------------
    validate : function ($el) {
        var value = $el.val();

        // Test against exceptions
        // If exception passes, return no error
        if (this.allowException && this.exceptions && typeof this.exceptions === "object") {
            if (this.containedInExceptions(value)) {
                return;
            }
        }

        // Test against regex
        if (this.regex) {
            var regexp = new RegExp(this.regex);
            if (!regexp.test(value)) {
                // doesn't match the regex
                return this.getError($el, "Invalid Entry");
            }
        }
    },

    // -------------------------------
    // Function: formatAgainstMask
    // format the element value using the elements mask
    //
    // Parameters:
    //   $el - the element's value will be formatted
    //   inVal - the mask format
    //   event - X.$ event that triggered the formatting
    // -------------------------------
    formatAgainstMask : function ($el, inVal, event) {
        var startLength = inVal.length,
            endLength = 0,
            mask = this.mask,
            self = this,
            caretPos = $el.caret();

        if (X._.contains(this.ignoreKeyCodesOnMask, event.keyCode)) {
            return;
        }

        // Test against exceptions
        // if the user input is partially contained in the exception array, exit right away
        if (this.allowException && this.exceptions && typeof this.exceptions === "object") {
            if (this.containedInExceptions(inVal, true)) {
                return;
            }

        }

        //get the current position of the caret
        caretPos = caretPos ? caretPos.end : 0;

        inVal.replace(/\d/g, function () {
            var digit = arguments[0];
            mask = mask.replace(self.maskChar, digit);
            return arguments[0];
        });
        mask = mask.split(this.maskChar)[0];
        endLength = mask.length;

        this.setFormattedValue($el, mask, event, (startLength == endLength) ? caretPos : caretPos + (endLength - startLength));

    },

    setFormattedValue : function ($el, formattedVal, event, caretPos) {
        if ($el.isTextInput()) {
            $el.val(formattedVal);
        }
        else if (!$el.isUserInputElement()) {
            $el.text(formattedVal);
        }

        //Set the caret back to it's position after we lost it by using .val()
        //but only if caretPos has a value.
        // skip this for "blur" events, in order to leave the focus on the new field that received it.
        if (X._.isNumber(caretPos) && event && event.type !== "blur") {
            // Give control back to the browser momentarily and set the caret on the next tick
            // IE 11 and Android 2.x bug results in erroneous input when formatting after each key or blur
            setTimeout(X.$.proxy(X.$.fn.caret, $el, caretPos), 0);

        }
    },

    // -------------------------------
    // Function: containedInExceptions
    // if the input string is partially contained in the exception array
    //
    // Parameters:
    //   s - the input string
    //   allowPartial - allow a substring of the exception
    // -------------------------------
    containedInExceptions : function (s, allowPartial) {
        var valid = false;
        if (this.exceptions) {
            if (s) {
                s = s.toLowerCase();
                s = s.replace(/ /g, "");
            }
            for (var i = 0; i < this.exceptions.length; i++) {
                var itm = this.exceptions[i].toLowerCase();
                itm = itm.replace(/ /g, "");

                if (s === itm) {
                    valid = true;
                    break;
                }
                else if (allowPartial && itm.indexOf(s) === 0) {
                    valid = true;
                    break;
                }


            }
        }
        return valid;

    }

});


/*
 * class: DefaultStrategies
 * Default validation strategies
 * 
 * about:
 * Clients can add new strategies or override existing ones by 
 * creating an object that has a 'validate' method and adding it to the mix
 * via the X.addValidationStrategy(<name>, <strategyObject>) call;
 * 
 */

X.validation.defaultStrategies = {
    // -------------------------------
    // Function: required
    // field is required
    //
    // Parameters:
    //   $el - the dom input element
    // -------------------------------
    required : {
        validateIfEmpty : true,
        validate : function ($el) {
            var err = this.validateAgainstType($el);
            if (err) {
                return this.getError($el, err);
            }
        },

        validateAgainstType : function ($el) {
            switch ($el.prop("type")) {
                case "text":
                case "password":
                case "textarea":
                case "file":
                /* falls through */
                default:
                    if (!$el.val()) {
                        return "This field is required";
                    }
                    break;
                case "checkbox" :
                    if (!$el.prop("checked")) {
                        return "This checkbox is required";
                    }
                    break;
                case "radio":
                    var container = X.$('body');
                    var name = $el.attr("name");
                    //if (container.find("input:radio[name='" + name + "']:checked").size() === 0)
                    if (container.find("input[name='" + name + "'][type=radio]:checked").size() === 0) {
                        return "Please select an option";
                    }
                    break;
                // required for <select>
                case "select-one":
                    // added by paul@kinetek.net for select boxes, Thank you
                    if (!$el.val()) {
                        return "This field is required";
                    }
                    break;
                case "select-multiple":
                    // added by paul@kinetek.net for select boxes, Thank you
                    if (!$el.find("option:selected").val()) {
                        return "This field is required";
                    }
                    break;

            }
        }
    },

    // -------------------------------
    // Function: requiredIf
    // field is required if the model reference has a value
    //
    // Parameters:
    //   $el - the dom input element
    //
    // Note : use some of the functionality of 'required' validator to get type specific messaging
    // -------------------------------
    requiredIf : {
        validateIfEmpty : true,
        validate : function ($el, modelVal) {
            var rq = X.registry.getStrategy("required");
            var err = rq.validateAgainstType($el);

            if ((null !== modelVal && typeof modelVal !== "undefined" && modelVal !== "") && err) {
                return this.getError($el, err);
            }

        }

    },

    // -------------------------------
    // Function: requiredIf
    // field is required if the expression evaluates to true
    //
    // Parameters:
    //   $el - the dom input element
    //
    // Note : use some of the functionality of 'required' validator to get type specific messaging
    // -------------------------------
    requiredIfExpression : {
        validateIfEmpty : true,
        validate : function ($el, exp) {
            var rq = X.registry.getStrategy("required");
            var err = rq.validateAgainstType($el);

            if (exp === true && err) {
                return this.getError($el, err);
            }

        }
    },

    // -------------------------------
    // Function: groupRequired
    // Validate input text fields are mutually exclusive
    // Display error if value exists in more than one of the grouped input fields
    // Display error if all grouped input fields are empty
    //
    // Parameters:
    //   value - the dom element value
    //   groupId - the id attribute of the grouped input elements
    // -------------------------------
    groupRequired : {
        validateIfEmpty : true,
        validate : function ($el, groupId) {
            var value = $el.val();
            // grab all the elements that have both grouprequired AND the group id in the data-validate tag
            // I do it this way instead of X.$("input[data-validate*='groupRequired(" + groupId + ")']");
            // because if the user put quotes around the groupId in the HTML, then we done get a match
            var $groupElems = X.$("input[data-validate*='groupRequired'][data-validate*='" + groupId + "']").filter(":visible");

            // filter out groupRequiredMultiple
            $groupElems = $groupElems.filter(function () {
                return !(this.id.match(/groupRequiredMultiple/));
            });

            var entered = 0;
            X.$.each($groupElems, function () {
                if (this.value.length !== 0) {
                    entered++;
                }
            });
            // check if groupRequired input fields are not empty
            if (entered > 1) {
                return this.getError($el, "Only one field can be entered");
            }
            // check if groupRequired input fields are empty
            else if (entered === 0) {
                return this.getError($el, "One of these fields is required");
            }
        }
    },

    // -------------------------------
    // groupRequiredOneOrMore:
    // Validate input text fields are mutually exclusive
    // DON"T Display error if value exists in more than one of the grouped input fields (unlike the standard groupRequired)
    // Display error if all grouped input fields are empty
    // -------------------------------
    groupRequiredMultiple : {
        validateIfEmpty : true,
        validate : function ($el, groupId) {
            var value = $el.val();
            var $groupElems = X.$("input[data-validate*='groupRequiredMultiple'][data-validate*='" + groupId + "']").filter(":visible");

            var entered = 0;
            X.$.each($groupElems, function () {
                if (this.value.length !== 0) {
                    entered++;
                }
            });
            // check if number of elements is greater than number of empty elements
            if (entered === 0) {
                return this.getError($el, "One or more of these fields is required");
            }
        }
    },

    // -------------------------------
    // Function: maxLength
    // Maximum characters allowed
    //
    // Parameters:
    //   value - the dom element value
    //   length - the Maximum characters allowed
    // -------------------------------
    maxLength : {
        validate : function ($el, length) {
            var value = $el.val();
            length = parseInt(length, 10);
            if (isNaN(length)) {
                X.publishException("X.defaultStrategies.maxLength", "maxLength validation set with non numeric arguement of: " + length);
            }
            this._max = length;
            if (value.length > length) {
                return this.getError($el, ("Maximum " + length + " characters allowed"));
            }
        },
        format : function ($el, event, length) {
            length = parseInt(length, 10);
            if (isNaN(length)) {
                X.publishException("X.defaultStrategies.maxLength", "maxLength validation set with non numeric arguement of: " + length);
            }
            if (!isNaN(length) && X._.isNumber(length)) {
                if (($el.is("input") || $el.is("textarea")) && $el.val().length >= length) {
                    $el.val($el.val().slice(0, length));
                }
                else if ($el.text().length >= length) {
                    $el.text($el.text().slice(0, length));
                }
            }
        }
    },

    // -------------------------------
    // Function: minLength
    // Minimum characters required
    //
    // Parameters:
    //   value - the dom element value
    //   length - the Minimum characters allowed
    // -------------------------------
    minLength : {
        validate : function ($el, length) {
            var value = $el.val();
            length = parseInt(length, 10);
            if (isNaN(length)) {
                //invalid arguement. throw exception
                X.publishException("X.defaultStrategies.minLength", "minLength validation set with non numeric arguement of: " + length);
            }
            if (X._.isNumber(length) && !isNaN(length) && value.length < length) {
                return this.getError($el, ("Minimum " + length + " characters required"));
            }
        }
    },

    // -------------------------------
    // Function: exactlength
    // Value must be X number of characters
    //
    // Parameters:
    //   value - the dom element value
    //   length - the Exact number of characters allowed
    // -------------------------------
    exactLength : {
        validate : function ($el, length) {
            var value = $el.val();
            length = parseInt(length, 10);
            if (isNaN(length)) {
                X.publishException("X.defaultStrategies.exactLength", "exactLength validation set with non numeric arguement of: " + length);
            }
            if (X._.isNumber(length) && !isNaN(length) && value.length != length) {
                return this.getError($el, ("Value must be " + length + " characters"));
            }

        },
        format : function ($el, event, length) {
            length = parseInt(length, 10);
            if (isNaN(length)) {
                X.publishException("X.defaultStrategies.exactLength", "exactLength validation set with non numeric arguement of: " + length);
            }
            if ($el.is("input") && X._.isNumber(length) && !isNaN(length)) {
                if ($el.val().length >= length) {
                    $el.val($el.val().slice(0, length));
                }
            }
            else if ($el.text().length >= length && X._.isNumber(length) && !isNaN(length)) {
                $el.text($el.text().slice(0, length));
            }
        }
    },

    // -------------------------------
    // Function: max
    // Maximum value is
    //
    // Parameters:
    //   value - the dom element value
    //   max - the Maximum value allowed
    // -------------------------------
    max : {
        validate : function ($el, max) {
            var value = $el.val().replace(/\,/g, "");
            max = parseFloat(max);
            value = parseFloat(value);
            if (isNaN(max) || (!X._.isNumber(max))) {
                X.publishException("X.defaultStrategies.max", "max validation set with non numeric arguement of: " + max);
            }
            if (isNaN(value) || !X._.isNumber(value) || (parseFloat(value) > parseFloat(max))) {
                return this.getError($el, ("Maximum value is " + max));
            }
        }
    },

    // -------------------------------
    // Function: min
    // Minimum value is
    //
    // Parameters:
    //   value - the dom element value
    //   min - the Minimum value allowed
    // -------------------------------
    min : {
        validate : function ($el, min) {
            var value = $el.val().replace(/\,/g, "");
            min = parseFloat(min);
            value = parseFloat(value);
            if (isNaN(min)) {
                X.publishException("X.defaultStrategies.min", "min validation set with non numeric arguement of: " + min);
            }
            if (isNaN(value) || !X._.isNumber(value) || (parseFloat(value) < parseFloat(min))) {
                return this.getError($el, ("Minimum value is " + min));
            }
        }
    },

    // -------------------------------
    // Function: multipleOf(x)
    // value is a multiple of x
    //
    // Parameters:
    //   value - the dom element value
    //   multiple - Integer which value must be a multiple of
    // -------------------------------
    multipleOf : {
        validate : function ($el, multiple) {
            var value = parseFloat($el.val().replace(/\,/g, ""));
            multiple = parseFloat(multiple);
            if (!X._.isNumber(multiple) || isNaN(multiple)) {
                X.publishException("X.defaultStrategies.min", "min validation set with non numeric arguement of: " + multiple);
            }
            if (isNaN(value) || !X._.isNumber(value) || (parseFloat(value) % parseFloat(multiple) !== 0)) {
                return this.getError($el, ("Must be a multiple of " + multiple));
            }
        }
    },

    // -------------------------------
    // Function: same
    // Field must be same as fieldName
    //
    // Parameters:
    //   value - the dom element value
    //   fieldId - the id of the field to match the value to
    //   fieldName - the name of the field to match the value to
    //   caseInsensitive - bool field. true = not case sensitive match
    //           default is falsy
    // -------------------------------
    same : {
        validate : function ($el, fieldId, fieldName, caseInsensitive) {
            var value = $el.val();
            var otherEl = X.$("#" + fieldId);
            var equalVal = otherEl.val() ? otherEl.val() : otherEl.text();
            if (caseInsensitive && (value.toLowerCase() !== equalVal.toLowerCase())) {
                return this.getError($el, ("Field must be same as " + fieldName));
            }
            else if (!caseInsensitive && (value !== equalVal)) {
                return this.getError($el, ("Field must be same as " + fieldName + " (Case Sensitive)"));
            }
        }
    },
    // -------------------------------
    // Function: sameTrimmed
    // Field must be same as fieldName after leading
    // and trailing white space is removed.
    //
    // Parameters:
    //   value - the dom element value
    //   fieldId - the id of the field to match the value to
    //   fieldName - the name of the field to match the value to
    //   caseInsensitive - bool field. true = not case sensitive match
    //           default is falsy
    // -------------------------------
    sameTrimmed : {
        validate : function ($el, fieldId, fieldName, caseInsensitive) {
            var value = X.$.trim($el.val());
            var otherEl = X.$("#" + fieldId);
            var equalVal = otherEl.val() ? otherEl.val() : otherEl.text();

            //trim whitespace
            equalVal = X.$.trim(equalVal);
            if (caseInsensitive && (value.toLowerCase() !== equalVal.toLowerCase())) {
                return this.getError($el, ("Field must be same as " + fieldName));
            }
            else if (!caseInsensitive && (value !== equalVal)) {
                return this.getError($el, ("Field must be same as " + fieldName + " (Case Sensitive)"));
            }
        }
    },

    // -------------------------------
    // Function: notSame
    // Field cannot be same as fieldName
    //
    // Parameters:
    //   value - the dom element value
    //   fieldId - the id of the field to validate that the value does NOT match
    //   fieldName - the name of the field to validate that the value does NOT match
    //   caseInsensitive - bool field. true = not case sensitive match
    //           default is falsy
    // -------------------------------
    notSame : {
        validate : function ($el, fieldId, fieldName, caseInsensitive) {
            //trim whitespace
            var value = $el.val();
            var otherEl = X.$("#" + fieldId);
            var equalVal = otherEl.val() ? otherEl.val() : otherEl.text();
            //            var equalVal = X.$("#" + fieldId).val();
            if (caseInsensitive && (value.toLowerCase() === equalVal.toLowerCase())) {
                return this.getError($el, ("Field cannot be same as " + fieldName));
            }
            else if (!caseInsensitive && (value === equalVal)) {
                return this.getError($el, ("Field cannot be same as " + fieldName + " (Case Sensitive)"));
            }
        }
    },
    // -------------------------------
    // Function: notSame
    // Field cannot be same as fieldName after leading and trailing white splace
    // is removed.
    //
    // Parameters:
    //   value - the dom element value
    //   fieldId - the id of the field to validate that the value does NOT match
    //   fieldName - the name of the field to validate that the value does NOT match
    //   caseInsensitive - bool field. true = not case sensitive match
    //           default is falsy
    // -------------------------------
    notSameTrimmed : {
        validate : function ($el, fieldId, fieldName, caseInsensitive) {
            //trim whitespace
            var value = X.$.trim($el.val());
            var otherEl = X.$("#" + fieldId);
            var equalVal = otherEl.val() ? otherEl.val() : otherEl.text();
            //            var equalVal = X.$("#" + fieldId).val();
            //trim whitespace
            equalVal = X.$.trim(equalVal);
            if (caseInsensitive && (value.toLowerCase() === equalVal.toLowerCase())) {
                return this.getError($el, ("Field cannot be same as " + fieldName));
            }
            else if (!caseInsensitive && (value === equalVal)) {
                return this.getError($el, ("Field cannot be same as " + fieldName + " (Case Sensitive)"));
            }
        }
    },

    // -------------------------------
    // Function: equalsVal
    // Value must be equal/
    //
    // Parameters:
    //   value - the dom element value
    //   equalVal - the value to validate against
    // -------------------------------
    equalsVal : {
        validate : function ($el, equalVal) {
            var value = $el.val();
            if (value !== (equalVal + "")) {
                return this.getError($el, ("Value must be " + equalVal));
            }
        }
    },

    // -------------------------------
    // Function: notEqualsVal
    // Value cannot be equal
    //
    // Parameters:
    //   value - the dom element value
    //   notEqualVal - the value to validate against
    // -------------------------------
    notEqualsVal : {
        validate : function ($el, notEqualVal) {
            var value = $el.val();
            if (value === (notEqualVal + "")) {
                return this.getError($el, ("Value cannot be " + notEqualVal));
            }
        }
    },

    // -------------------------------
    // Function: email
    // valid email format is enforced
    // -------------------------------
    email : {
        // Shamelessly lifted from Scott Gonzalez via the Bassistance Validation plugin http://projects.scottsplayground.com/email_address_validation/
        regex : /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
        getError : function ($el) {
            return this._super($el, "Invalid email address");
        }
    },

    // -------------------------------
    // Function: ssn
    // valid ssn format is enforced
    //
    // Parameters:
    //   value - the dom element value
    //   allowException - the boolean value to allow alternative formats
    // -------------------------------
    ssn : {
        exceptions : ["applied for", "died", "tax exempt", "LAFCP", "unknown"],
        defaultRegex : /^\d\d\d\-\d\d\-\d\d\d\d$/,
        altRegex : /^\d\d\-\d\d\d\d\d\d\d$/,
        defaultMask : "###-##-####",
        altMask : "##-#######",
        getError : function ($el, altMsg) {
            return this._super($el, (this.allowException ? "Invalid SSN" : "Invalid SSN, must be " + this.mask));
        },
        // -------------------------------
        // Function: validate
        // validate a ssn
        //
        // Parameters:
        //   value - the string to validate
        //   p1 - allowException flag
        //   p2 - validate range
        // -------------------------------
        validate : function ($el, allowException, validateRange) {
            var value = $el.val();
            this.allowException = allowException;
            this.regex = this.defaultRegex;
            this.mask = this.defaultMask;

            // EINs is also a valid exception (eins start with nn-
            if (allowException && value.match(/^\d\d\-/)) {
                this.regex = this.altRegex;
                this.mask = this.altMask;
            }
            var msg = this._super($el);

            // Validate range if we passed the pattern check
            if (!msg && validateRange && !allowException) {
                //              Regular SSN range 001-01-0001 to 699-99-9999
                //                       700-01-0001 to 733-99-9999	 2003 increased 729 to 733 1/14/2004 jre
                //                       750-01-0001 to 765-99-9999	 2000
                //                       750-01-0001 to 763-99-9999  2001 change
                //                       764-01-0001 to 899-99-9999  2001 change
                //
                //              ATIN range        900-93-0000 to 999-93-9999
                //              ATIN range        is not included, given that this may not be entered in SSN field
                //              ITIN range        900-70-0000 to 999-80-9999

                var valid = false;
                var ssn = value.replace(/[^0-9]/g, "");
                var first = ssn.substr(0, 3);
                var second = ssn.substr(3, 2);
                var third = ssn.substr(5, 4);

                if ((first < 900) && (first !== 0) && (second !== 0) && (third !== 0)) {
                    valid = true;
                }
                // ITIN validation / ATIN
                else if ((first > 899) && (second > 69 && second < 81)) {
                    valid = true;
                }

                if (!valid) {
                    msg = "Invalid Social security number";
                }

            }

            return msg;
        },
        format : function ($el, event, allowException) {
            var inVal = $el.val() || $el.text();

            if (inVal === "") {
                return;
            }

            this.allowException = allowException;
            this.mask = this.defaultMask;

            // EINs is also a valid exception (eins start with nn-
            if (allowException && inVal.match(/^\d\d\-/)) {
                this.mask = this.altMask;
            }
            this.formatAgainstMask($el, inVal, event);
        }
    },
    // -------------------------------
    // Function: regex
    // validate based on a regular expression
    //
    // Parameters:
    //   value - the dom element value
    //   re - the regular expression to validate against
    //   message - the error message to display if validation doesn't pass
    regex : {
        validate : function ($el, expression, message) {
            this.errorMsg = message;
            this.regex = new RegExp(expression);
            return this._super($el);
        },
        getError : function ($el) {
            return this._super($el, this.errorMsg);
        }
    },
    // -------------------------------
    // Function: date
    // valid date format is enforced
    //
    // Parameters:
    //   value - the dom element value
    //   mask - the format to validate against
    //   allowException - the boolean value to allow alternative formats
    // -------------------------------
    date : {
        exceptions : ["various", "inherit", "inherited", "continue", "continues", "none"],
        defaultMask : "MM/DD/YYYY",
        getError : function ($el) {
            return this._super($el, "Invalid '" + this.mask + "' date");
        },
        // -------------------------------
        // Function: validate
        // validate a date
        //
        // Parameters:
        //   value - the string to validate
        //   p1 - date mask or allowException flag
        //   p2 - date mask or allowException flag
        // -------------------------------
        validate : function ($el, p1, p2) {  // parameters [mask,allowException] can be passed in either order
            var value = $el.val();
            // figure out which order the parameters were passed in
            if (typeof p1 === "boolean") {
                this.allowException = p1;
                this.mask = p2 || this.defaultMask;
            }
            else if (typeof p2 === "boolean") {
                this.allowException = p2;
                this.mask = p1 || this.defaultMask;
            }
            else {
                this.mask = p1 || this.defaultMask;
                this.allowException = false;
            }

            var m, d, y;
            switch (this.mask) {
                case "MM/YYYY" :
                    this.regex = /^(?:0?[1-9]|1[0-2])\/(?:19\d\d|20\d\d)$/;
                    var parts = value.split('/');
                    m = parts[0];
                    y = parts[1];
                    break;
                case "MM/YY" :
                    this.regex = /^(?:0?[1-9]|1[0-2])\/(\d\d)$/;
                    parts = value.split('/');
                    m = parts[0];
                    y = parts[1];
                    break;
                case "YYYY" :
                    this.regex = /^(?:19\d\d|20\d\d)$/;
                    y = value;
                    break;
                case "YYYY-MM-DD" :
                    this.regex = /^(?:19\d\d|20\d\d)\-(0?[1-9]|1[0-2])\-(0?[1-9]|[12][0-9]|3[01])$/;
                    parts = value.split('-');
                    m = parts[1];
                    d = parts[2];
                    y = parts[0];
                    break;
                case "MM/DD" :
                    this.regex = /^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|[12][0-9]|3[01]))$/;
                    parts = value.split('/');
                    m = parts[0];
                    d = parts[1];
                    break;
                case "" :
                case "MM/DD/YYYY" :
                /* falls through */
                default :
                    this.regex = /^(?:(?:0?[1-9]|1[0-2])(\/|-)(?:0?[1-9]|[12][0-9]|3[01]))(\/|-)(?:19\d\d|20\d\d)$/;
                    parts = value.split('/');
                    m = parts[0];
                    d = parts[1];
                    y = parts[2];
                    break;  // use the default mask/regex
            }

            function _isValidDateRange (m, d, y) {
                m = parseInt(m, 10);
                d = parseInt(d, 10);
                y = parseInt(y, 10);

                // only year is in the range 1900 - 2099
                if (y && !m && !d) {
                    return (y >= 1900 && y < 2100);
                }
                if (m && (m < 1) || (m > 12)) {
                    return false;
                }
                if (d && (d < 1) || (d > 31)) {
                    return false;
                }
                if (((m == 4) || (m == 6) || (m == 9) || (m == 11)) && (d > 30)) {
                    return false;
                }
                if (m == 2 && d > 29) {
                    return false;
                }

                // figure out leap years
                if (d && m == 2) {
                    // is leap year
                    if ((y % 4 === 0) && (y % 100 !== 0) || (y % 400 === 0)) {
                        return d <= 29;
                    }
                    else {
                        return d < 29;
                    }
                }
                return true;
            }


            // See if we have date within ranges
            var err = _isValidDateRange(m, d, y) ? null : "Invalid date range";

            // if it passed the range check, see if it passes the valid date check
            if (!err) {
                err = this._super($el);
            }

            if (err) {
                return this.getError($el, err);
            }

        },
        format : function ($el, event, mask, allowException) {
            var inVal = $el.val() || $el.text(),
                outVal;

            if (inVal === "") {
                return;
            }

            // set up mask
            this.allowException = allowException;
            mask = mask || this.defaultMask;
            this.mask = mask;
            this.mask = this.mask.replace(/[A-Za-z]/gi, "#");

            outVal = inVal;

            var caretCnt = 0;
            var caret = $el.caret();
            if (mask.indexOf("YYYY") > -1) { // 4 digit year, try to upgrade  anything not 19 or 20
                if (outVal.charAt(6) && outVal.charAt(7) && outVal.charAt(5) === '/' && !outVal.charAt(8)) {
                    var leastSigYrDigits = outVal.substr(6, 2);
                    if (leastSigYrDigits !== "19" && leastSigYrDigits !== "20") {
                        // try to guess the full year, based on the two year digits entered
                        var fullYear = parseInt('20' + leastSigYrDigits, 10);  // this line becomes obsolete before the year 2100
                        var yearDifference = fullYear - X.getDate().getFullYear();
                        // assume dates are more likely to be from last century than more than two years in the future
                        if (yearDifference > 2) {
                            fullYear -= 100;
                        }
                        outVal = outVal.slice(0, 5) + fullYear.toString();

                        // unlike at other times, when we don't want to format on '0' key press,
                        // in this instance we do. We want to format on any keypress
                        // because it's part of a two digit year that should be expanded to four digits.
                        // so, after this expansion, call formatAgainstDateMask regardless of the users keypress.
                        this.formatAgainstMask($el, outVal, event);

                    }
                }
            }

            var monthIdx = mask.indexOf("MM");
            if (monthIdx > -1) { // 2 Digit month. Expand one-digit entries followed by a slash
                // Check whether the user has entered a one-digit month number followed by a slash
                if (outVal.charAt(monthIdx) && outVal.charAt(monthIdx + 1) === '/') {

                    // Expand month to two digits
                    var fullMonth = "0" + outVal.charAt(monthIdx);
                    if (!X._.contains(this.ignoreKeyCodesOnMask, event.keyCode)) {
                        caretCnt++;
                    }

                    // Update return value
                    outVal = outVal.substring(0, monthIdx) + fullMonth + outVal.substring(monthIdx + 1);

                }
            }

            var dayIdx = mask.indexOf("DD");
            if (dayIdx > -1) { // 2 Digit day. Expand one-digit entries followed by a slash
                // Check whether the user has entered a one-digit day number followed by a slash
                if (outVal.charAt(dayIdx) && outVal.charAt(dayIdx + 1) === '/') {

                    // Expand day to two digits
                    var fullDay = "0" + outVal.charAt(dayIdx);
                    if (!X._.contains(this.ignoreKeyCodesOnMask, event.keyCode)) {
                        caretCnt++;
                    }

                    // Update return value
                    outVal = outVal.substring(0, dayIdx) + fullDay + outVal.substring(dayIdx + 1);
                }
            }

            this.formatAgainstMask($el, outVal, event);
            if (caretCnt > 0) {
                $el.caret(caret.end + caretCnt);
            }
        }

    },

    // -------------------------------
    // Function: before
    // Date entered must be before date
    //
    // Parameters:
    //   value - the dom element value
    //   date - the date to validate against
    //   inclusive - the boolean value to include the date as a valid date
    // -------------------------------
    before : {
        validate : function ($el, date, inclusive) {
            var value = $el.val();
            try {
                var inputDate = value.toDate();
                var targetDate;
                switch (date) {
                    case "today" :
                    case "now" :
                        targetDate = X.getDate(true);
                        break;
                    default :
                        targetDate = date.toDate();
                        break;
                }
                var valid = true;
                if (inclusive) {
                    valid = (inputDate.yyyymmdd() <= targetDate.yyyymmdd());
                }
                else {
                    valid = (inputDate.yyyymmdd() < targetDate.yyyymmdd());
                }
                return valid ? null : this.getError($el, "Date entered must be" + ((inclusive) ? " on or" : "") + " before " + date);

            }
            catch (err) {
                return;
            }

        }
    },

    // -------------------------------
    // Function: after
    // Date entered must be after date
    //
    // Parameters:
    //   value - the dom element value
    //   date - the date to validate against
    //   inclusive - the boolean value to include the date as a valid date
    // -------------------------------
    after : {
        validate : function ($el, date, inclusive) {
            var value = $el.val();

            try {
                var inputDate = value.toDate();
                var targetDate;
                switch (date) {
                    case "today" :
                    case "now" :
                        targetDate = X.getDate(true);
                        break;
                    default :
                        targetDate = date.toDate();
                        break;
                }
                var valid = true;
                if (inclusive) {
                    valid = (inputDate.yyyymmdd() >= targetDate.yyyymmdd());
                }
                else {
                    valid = (inputDate.yyyymmdd() > targetDate.yyyymmdd());
                }
                return valid ? null : this.getError($el, "Date entered must be" + ((inclusive) ? " on or" : "") + " after " + date);

            }
            catch (err) {
                return;
            }

        }
    },

    // -------------------------------
    // Function: phone
    // valid phone format is enforced
    //
    // Parameters:
    //   value - the dom element value
    //   mask - the format to validate against
    // -------------------------------
    phone : {
        regex : /^\(\d\d\d\) \d\d\d[\-]\d\d\d\d$/,
        defaultMask : "(###) ###-####",
        getError : function ($el) {
            return this._super($el, "Invalid phone number, must be " + this.mask);
        },
        validate : function ($el, mask) {
            var value = $el.val();
            this.mask = mask || this.defaultMask;

            var pattern = this.mask.replace(/#/g, "\\d").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/\./g, "\\.");

            pattern = "^" + pattern + "$";
            this.regex = new RegExp("" + pattern);

            var msg = this._super($el);

            // apparently new phone numbers can have a 0 or 1 in any position
            //if (!msg) {
            //    var ph = value.replace(/[^0-9]/g, "");
            //    if (ph.charAt(0) == '0' || ph.charAt(0) == '1') msg = "First digit cannot be 0 or 1";
            //    if (ph.charAt(3) == '0' || ph.charAt(3) == '1') msg = "Fourth digit cannot be 0 or 1";
            //}

            //if msg is not undefined, that means error has been set, no need to validate for all zeros
            if (!msg && /[1-9]/.test(value) === false) {
                return "Phone number can't be all zeros.";
            }

            return msg;
        },

        format : function ($el, event, mask) {
            var inVal = $el.val() || $el.text();

            if (inVal === "") {
                return;
            }

            this.mask = mask || this.defaultMask;

            //get all the non-number chars in the mask, so they're not replaced (i.e. entered by the user)
            //            var reg = new RegExp(this.mask.replace(/^#/gi, ""), 'gi');

            this.formatAgainstMask($el, inVal, event);
        }
    },

    // -------------------------------
    // Function: number
    // Number, including positive, negative, and floating decimal.
    // see numberOnly validator for validating integers
    // -------------------------------
    number : {
        regex : /^[\-\+]?(\d+(\,\d{3})*\.?\d{0,9}|\.\d{1,9})$/,
        getError : function ($el) {
            return this._super($el, "Invalid number");
        },
        validate : function ($el, precision) {

            precision = precision || "100";

            var pattern = "[\\-\\+]?(\\d+(,\\d{3})*\\.?\\d{0,PRE}|\\.\\d{1,PRE})";
            pattern = pattern.replace(/PRE/g, precision);

            pattern = "^" + pattern + "$";
            this.regex = new RegExp("" + pattern);

            return this._super($el);
        },
        format : function ($el, event, precision, addPrecisionOnBlur) {

            var inVal = $el.val() || $el.text();
            var startLength = inVal.length;
            var endLength = 0;
            if (inVal === "") {
                return;
            }


            // save off the cursor position
            var caretPos = $el.caret();
            caretPos = caretPos ? caretPos.end : 0;

            // get rid of all the crap
            var isNeg = inVal.charAt(0) === "-";
            inVal = inVal.replace(/[^0-9.]/gi, "");

            if (isNeg) {
                inVal = "-" + inVal;
            }

            // Add the commas in the appropriate spots
            var parts = inVal.split(".");
            parts[0] = parts[0].replace(/0*(\d+)/, "$1"); // remove leading zero's except first one
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            // Get rid of anything after and including a second period
            // and truncate up to the precision
            if (!X._.isUndefined(parts[1])) {
                parts[1] = parts[1].substr(0, precision);
                parts = [parts[0], parts[1]];
            }

            if (event.type == X.constants.jqEvents.kAutoformat || (addPrecisionOnBlur && event.type === "blur")) {
                if (!parts[1]) {
                    parts[1] = "";
                }
                for (var i = parts[1].length; i < precision; i++) {
                    parts[1] += "0";
                }

            }

            inVal = parts.join(".");
            endLength = inVal.length;

            // Set the value and the caret position
            this.setFormattedValue($el, inVal, event, (startLength == endLength) ? caretPos : caretPos + (endLength - startLength));
        }

    },

    // -------------------------------
    // Function: numberOnly
    // Numbers 0-9 only
    // -------------------------------
    numberOnly : {
        regex : /^[0-9]+$/,
        getError : function ($el) {
            return this._super($el, "Value is not a number");
        },
        format : function ($el, event) {
            var inVal = $el.val() || $el.text();

            if (inVal === "") {
                return;
            }
            if (inVal.replace(/[0-9]/gi, "").length === 0) {
                return inVal;
            }
            this.setFormattedValue($el, inVal.replace(/[^0-9]/g, ''));

        }
    },

    // -------------------------------
    // Function: alpha
    // Letters only
    // -------------------------------
    alpha : {
        regex : /^[a-zA-Z]*$/,
        getError : function ($el) {
            return this._super($el, "Value must be all letters");
        },
        validate : function ($el, allowSpace) {
            this.regex = allowSpace ? /^[a-zA-Z\s]*$/ : this.regex;
            return this._super($el);
        },
        format : function ($el, event, allowSpace) {
            var inVal = $el.val() || $el.text();

            var reg = allowSpace ? /[^a-zA-Z\s]/g : /[^a-zA-Z\s]/g;

            this.setFormattedValue($el, inVal.replace(reg, ""));
        }
    },

    alphaNumeric : {
        regex : /^[a-zA-Z0-9]*$/,
        getError : function ($el) {
            return this._super($el, "Should be alphanumeric");
        },
        validate : function ($el, allowSpace) {
            this.regex = allowSpace ? /^[a-zA-Z0-9\s]*$/ : this.regex;
            return this._super($el);
        },
        format : function ($el, event, allowSpace) {
            var inVal = $el.val() || $el.text();

            var reg = allowSpace ? /[^a-zA-Z0-9\s]/g : /[^a-zA-Z0-9]/g;

            this.setFormattedValue($el, inVal.replace(reg, ""));

        }
    },

    upperCase : {
        getError : function ($el) {
            return this._super($el, "Should be all upper case");
        },
        validate : function ($el) {
            var val = $el.val();
            var test = val === val.toUpperCase();
            if (!test) {
                return this.getError($el);
            }
            else {
                return null;
            }

        },
        format : function ($el, evt) {
            var val = $el.val() || $el.text();
            this.setFormattedValue($el, val.toUpperCase());
        }
    },

    lowerCase : {
        getError : function ($el) {
            return this._super($el, "Should be all lower case");
        },
        validate : function ($el) {
            var val = $el.val();
            var test = (val === val.toLowerCase());
            if (!test) {
                return this.getError($el);
            }
            else {
                return null;
            }

        },
        format : function ($el, evt) {
            var val = $el.val() || $el.text();
            this.setFormattedValue($el, val.toLowerCase());
        }
    },

    maskedNumber : {
        regex : /^$/,
        defaultMask : "",
        getError : function ($el) {
            return this._super($el, "Invalid input, format must be " + this.mask);
        },
        validate : function ($el, mask) {
            var value = $el.val();

            this.mask = mask || this.defaultMask;

            // escape all non alpha so we can turn it into a regex
            var pattern = this.mask.replace(/([^a-zA-Z0-9#])/g, "\\$1");
            // now replace the "#" as a digit
            pattern = pattern.replace(/#/g, "\\d");

            pattern = "^" + pattern + "$";
            this.regex = new RegExp("" + pattern);

            return this._super($el);
        },
        format : function ($el, event, mask) {
            var inVal = $el.val() || $el.text();

            if (inVal === "") {
                return;
            }

            // set up mask
            this.mask = mask ? mask : this.defaultMask;
            //this.mask = this.mask.replace(/[A-Za-z]/gi, "#").replace(/&#41;/g, ")");

            this.formatAgainstMask($el, inVal /*.replace(/[^0-9]/gi, ""*/, event);
        }
    },

    zip : {
        regex : /^\d{5}(\-\d{4})?$/,
        fivedigitMask : "#####",
        defaultMask : "#####-####",
        validate : function ($el, mustBePlusFour) {
            var value = $el.val();
            this.mask = this.defaultMask; //always use default mask

            if (mustBePlusFour && value.length != 10) {
                return this.getError($el, "Invalid zip code, must be #####-####");
            }
            if (!(value.length === 5 ||
                  value.length === 10)) //hard coded lengths for zip if mask arg is ommited and default mask is used( can be 5 or 10)
            {
                return this.getError($el, "Invalid zip code, must be #####  or  #####-####");
            }
        },

        format : function ($el, event) {
            var inVal = $el.val();

            if (inVal === "") {
                return;
            }


            // set up mask
            this.mask = (inVal.length > 5) ? this.defaultMask : this.fivedigitMask; //always use default mask
            //this.mask = this.mask.replace(/[A-Za-z]/gi, "#");

            this.formatAgainstMask($el, inVal /*.replace(/[^0-9]|-/gi, "")*/, event);

        }
    },

    creditCard : {
        defaultMask : "################",
        validate : function ($el) {
            var value = $el.val().replace("-", "").replace(/\s/g, "");
            var ccFirstTwo = value.slice(0, 2);
            if (ccFirstTwo === "34" || ccFirstTwo === "37") { //Amex Cards are only 15 digits
                if (value.length !== 15) {
                    //return error if if it's not 15 digits
                    return this.getError($el, "Invalid Credit Card Number");
                }
                else {
                    // if it is an amex of valid length
                    //need to prepend a "0" so that the luhn check will pass. Adding
                    //a zero to the beginning of a valid number wont affect the validation
                    value = "0" + value;
                }
            }
            else {
                if (value.length !== 16) {  //It's not an Amex, Should be 16 digits
                    return this.getError($el, "Invalid Credit Card Number");
                }
            }

            //passed the length requirement, now check the luhn validation.

            //###### Luhn Number validation ######
            var digit = 0 , checksum = 0;
            for (var len = (value.length - 1); len >= 0; len--) {
                digit = parseInt(value.charAt(len), 10);
                if (len % 2) {
                    checksum += digit;
                }
                else {
                    digit = digit * 2;
                    if (digit >= 10) {
                        checksum += Math.floor(digit / 10);
                        checksum += digit % 10;
                    }
                    else {
                        checksum += digit;
                    }
                }
            }
            if (checksum % 10 === 0) {
                // return undefined (aka valid) is implied
            }
            else {
                return this.getError($el, "Invalid Credit Card Number");
            }

        },
        format : function ($el, event) {
            //todo: accept user specified mask?
            //in addition to the normal formatting options,
            var inVal = $el.val();

            var ccFirstTwo = inVal.slice(0, 2);
            //Check if it's Amex, if so, we need a 15 char mask, not 16
            if (ccFirstTwo === "34" || ccFirstTwo === "37") {
                this.mask = "###############";
            }
            else {
                this.mask = this.defaultMask;
            }

            if (inVal === "") {
                return;
            } //skip masking if empty.

            this.formatAgainstMask($el, inVal /*.replace(/[^0-9]/gi, "")*/ /* <-- replace non-numerics */, event);
        }
    },

    /*
     RTN - Bank Routing Number
     */
    rtn : {
        validate : function ($el) {
            var passedRTN = $el.val();
            var valid = false;

            if (passedRTN.match("[-\\d]+")) {
                var strippedRTN = passedRTN.replace(/-/, "");
                if (strippedRTN.length == 9) {
                    var firstTwo = strippedRTN.substring(0, 2).toNum();
                    if (!((firstTwo >= 1 && firstTwo <= 12) || (firstTwo >= 21 && firstTwo <= 32))) {
                        valid = false;
                        return this.getError($el, "Invalid Routing Transit Number");
                    }
                    var sumOfMultipliers = 0;
                    var multipliers = [ 3, 7, 1, 3, 7, 1, 3, 7 ];
                    for (var i = 0; i < multipliers.length; i++) {
                        sumOfMultipliers += multipliers[i] * strippedRTN.charAt(i).toNum();
                    }
                    var checkDigit = strippedRTN.charAt(8).toNum();
                    var checkNumber = (10 - (sumOfMultipliers % 10)) % 10;
                    if (checkDigit == checkNumber) {
                        valid = true;
                    }
                }
            }

            if (!valid) {
                return this.getError($el, "Invalid Routing Transit Number");
            }
        }
    }

};

X.validation.binder = {
    /**
     * Bind Input elements to format on keyup if specified
     * @param container
     * @param options - viewport options
     */
    bindFormatters : function (container, options) {
        options = options || X.options.formatOptions;
        if (!options.useFormatter) {
            return;
        }

        var $container = X.utils.get$(container);

        // Find all of the input fields that have a "data-format" attribute
        var fields = X.$($container).find("[data-format]");

        // Iterate through all of the fields, and setup listeners and strategies
        X.$.each(fields, function () {
            var $control = X.$(this);
            var opts = X.utils.jsonSerializer.toJSON($control.attr("data-format-options"), true) || {};
                opts = X.utils.mergeObjects(options, opts);
            var fme = opts.formatEvent;
            var ignoreKeyCodes = opts.ignoreKeyCodes;
            var formatEvts = X._.isArray(fme) ? fme.join(" ") : fme;



            if ($control.isTextInput() && formatEvts) {
                $control.on(formatEvts, function (event) {
                    if (X._.contains(ignoreKeyCodes, event.keyCode)) {
                        return;
                    }
                    var valBefore = $control.val();
                    $control.format(event);
                    if ($control.val() != valBefore) {
                        $control.trigger(X.constants.jqEvents.kAutoformat);  // add event namespace corresponding to the event that triggered the formatOnLoad
                    }
                });
            }

            // Look for format on load options and attach it as a property for the data-binder to look at
            // if the control is not an input control and there is a data-format attached to it, set it up for autoformat.
            var af = opts.autoFormat;
            if (af || !$control.isUserInputElement()) {
                $control.format(X.$.Event(X.constants.jqEvents.kAutoformat));
            }
        });
    },

    /**
     * Bind Input elements to validate on blur if specified
     * @param container
     * @param options - viewport options
     */
    bindValidators : function (container, options) {
        options = options || X.options.validationOptions;
        if (!options.useValidator) {
            return;
        }

        var $container = X.utils.get$(container);
        // iterate through all of the elements that have a "data-validate" attribute
        X.$($container).find("[data-validate]").each(function () {
            var $el = X.$(this);
            var opts = X.utils.jsonSerializer.toJSON($el.attr("data-validate-options"), true) || {};
            opts = X.utils.mergeObjects(options, opts);
            if (opts.validateOnBlur === true) {
                X.validation.engine.setValidateOnBlur($el, opts, true);
            }

        });
    }
};




X.validation.renderer = function () {
    var $ = X.$;
    var _utils = X.utils;
    
    var _exports = {
        // -------------------------------
        // Function: _showErrorTooltip
        // show the error tooltip(s)
        //
        // Parameters:
        //    $element - the input element
        //    error = the string error message
        // -------------------------------
        show : function ($element, errors, options) {
            var errorMsg = "";

            if (options.showMultipleErrorsPerInput) {
                X._.each(errors, function (error) {
                    errorMsg += error + "<br/>";
                });
            }
            else {
                errorMsg = errors[0];
            }

            var targetLeft = $element.offset().left;
            var targetTop = $element.offset().top;
            var targetRight = targetLeft + $element.width();
            var tooltip;
            var tooltipArrowClass;

            $element.addClass('xValidationError');
            $element.attr('aria-invalid', 'true');

            var tooltipPosition = options.tooltipPosition || "top";
            var hideOnFocus = options.hideOnFocus;

            switch (tooltipPosition) {
                case 'right':
                    tooltipArrowClass = "errorTooltipArrowLeft";
                    break;
                case 'bottom':
                    tooltipArrowClass = "errorTooltipArrowUp";
                    break;
                default:
                    tooltipArrowClass = "errorTooltipArrowDown";
                    break;
            }

            $element.attr("hasErrorTip", true);
            if ($element.data('errorTooltip') && $element.data('errorTooltip').is(':visible')) {
                tooltip = $element.data('errorTooltip');
                tooltip.html(errorMsg + "<div class='" + tooltipArrowClass + "' />");
            }
            else {
                var errorId = _utils.uuid(true);

                tooltip = $("<div class='errorTooltip' role='alert' id='" + errorId + "'>" + errorMsg + "<div class='" + tooltipArrowClass +
                                 "'></div></div>");
                //    tooltip.appendTo($element.parent()).hide().fadeIn(120);
                tooltip.appendTo("body").hide().fadeIn(120);
                $element.data('errorTooltip', tooltip);
                $element.attr('aria-describedby', errorId);

            }
            var m = X.getComponent(X.constants.interfaces.kModalWindow);
            if (m && X.getContainingViewport($element) === m.getViewPortId()) {
                tooltip.addClass("modalTip");
            }

            // always update the tooltip position, cuz sometimes the content of the tooltip gets bigger or smaller
            // so the tooltip container's size adjusts
            switch (tooltipPosition) {
                case 'right':
                    tooltip.css("left", targetRight + 14);
                    tooltip.css("top", targetTop + ($element.height() - tooltip.height()) / 2);
                    break;
                case 'bottom':
                    tooltip.css("left", targetLeft);
                    tooltip.css("top", targetTop + $element.height() + 9);
                    break;
                default:
                    tooltip.css("left", targetLeft);
                    tooltip.css("top", targetTop - tooltip.height() - 7);
                    break;
            }


            // attach event listeners to the error tooltips, when the user clicks on them, the error tooltips should disappear
            tooltip.off("click").on("click", function () {
                _exports.hide($($element));
            });
            if (hideOnFocus && !$element.prop('clickHandlerSet')) {
                $element.prop('clickHandlerSet', true); // set so we don't double add the click handler
                $element.on("click", function () {
                    _exports.hide($(this));
                });
            }
        },

        // -------------------------------
        // Function: _removeErrorTooltip
        // hide the error tooltip(s)
        //
        // Parameters:
        //    $element - the input element
        // -------------------------------
        hide : function ($element) {
            $element.removeClass('xValidationError');

            var tooltip = $element.data('errorTooltip');
            if (tooltip) {
                tooltip.fadeOut(100, function () {
                    tooltip.remove();
                });
            }

            $element.removeData('errorTooltip');
            $element.removeAttr('hasErrorTip');
            $element.removeAttr('aria-invalid');
            $element.removeAttr('aria-describedby');
        }
    };


    return _exports;

};

// Self register
// Can be overridden by client by calling X.registerComponent
X.registerComponent(X.constants.interfaces.kValidationRenderer, new X.validation.renderer());
// class: ValidationEngine
X.validation.engine = (function () {

    var $ = X.$;
    var _ = X._;
    var _utils = X.utils;

    /* Public APIs */
    var _instance = {

        /****************************************************************************
         * Function: validateAll
         * Validate every field(that has a validate attribute in the parent container)
         * Parameters:
         *   container - the input element (jquery element OR element Id)
         *   options - validation options
         *        tooltipPosition : 'top', // position of tooltip relative to input.  supported values: 'top', 'bottom', 'right'
         *        hideOnFocus : false, // hide the tooltip when input field gets focus
         *        showOnlyOne : false, // show only one error tooltip
         *        showMultipleErrorsPerInput : false, // if there is more than one error, show them all
         *        validateOnBlur : false, // Perform validation on blur of an element
         *        suppressErrors : false, // Just validate and return the results, but don't show any errors messaging
         *        validateOnBack : false, // No validation if the customer hits back, keys off of "back" or your viewportHistory autoBackNavigationEvent
         *        validateOnJump : false, // No validation if the customer jumps in navigation
         *        useValidator : true // turn on/off the use of the validation functionality
         *
         * Returns:  true if passes all validation, false otherwise
         *
         * ****************************************************************************/
        validateAll : function (container, options) {
            var $container = _utils.get$(container);
            var opts = _utils.mergeObjects(X.options.validationOptions, options || {});

            var isValid = true;

            var showOnlyOne = opts.showOnlyOne;

            this.hideErrorTooltips($container);
            $($container).find("[data-validate]").not(":hidden").not(":disabled").each(function (idx, $el) {
                $el = $($el);
                // Set the focus if we still are good on validation
                var setFocus = isValid;
                // only update set isValid flag to false if validateField returns false, otherwise
                // don't update isValid's value
                isValid = _instance.validateField($el, opts, setFocus) ? isValid : false;

                if (showOnlyOne && !isValid) {
                    return false;
                }

            });

            return isValid;
        },

        /****************************************************************************
         * Function: validateField
         * Validate an individual input field
         *
         * Parameters:
         *   el - the input element (jquery element OR element Id
         *   options - validation options
         *        tooltipPosition : 'top', // position of tooltip relative to input.  supported values: 'top', 'bottom', 'right'
         *        hideOnFocus : false, // hide the tooltip when input field gets focus
         *        showOnlyOne : false, // show only one error tooltip
         *        showMultipleErrorsPerInput : false, // if there is more than one error, show them all
         *        validateOnBlur : false, // Perform validation on blur of an element
         *        suppressErrors : false, // Just validate and return the result, but don't show any errors messaging
         *        validateOnBack : false, // No validation if the customer hits back, keys off of "back" or your viewportHistory autoBackNavigationEvent
         *        validateOnJump : false, // No validation if the customer jumps in navigation
         *        useValidator : true // use the validation functionality
         *
         ****************************************************************************/
        validateField : function (el, options, setFocus) {
            var $el = _utils.get$(el);
            var opts = _utils.mergeObjects(X.options.validationOptions, options || {});

            var elOpts = $el.attr('data-validate-options');
            elOpts = _utils.jsonSerializer.toJSON(elOpts, true) || {};
            opts = _utils.mergeObjects(opts, elOpts);

            this.setValidateOnBlur($el, opts, true);

            var suppressErrors = (opts.suppressErrors === true);

            // We added the 'validate' method to $ elements in the validationBinder
            var errors = $el.validate();

            if (errors.length > 0) {
                // hack for radio buttons, only show the error on the first one....
                if ($el.prop("type") == "radio") {
                    var name = $el.prop("name");
                    var first = $("body").find("input[name='" + name + "'][type=radio]:first");
                    if ($el[0] != first[0]) {
                        return opts.__returnErrorObj ? {$el : $el, errorList : errors} : false;
                    }
                }
                // there's an error, see if we need to display it
                if (!suppressErrors) {
                    _getRenderer().show($el, errors, opts);
                    if (setFocus) {
                        _setFocus($el);
                    }
                }
                return opts.__returnErrorObj ? {$el : $el, errorList : errors} : false;
            }
            else {
                // if there's an error tooltip, hide it
                _getRenderer().hide($el);

                return true;
            }
        },

        /**
         * Run validation on all elements in the container
         *
         * @parameter $container - the input element ($ element OR element Id
         *                 If not container Id is supplied we'll search the whole body
         *
         * @return Array of errors
         *      {
         *          $el : $ element in error
         *          errorList : [] array of error messages
         *      }
         */
        getErrorList : function ($container) {
            if ($container) {
                $container = _utils.get$($container);
            }
            else {
                $container = $("body");
            }

            var errorList = [];
            $($container).find("[data-validate]").not(":hidden").not(":disabled").each(function (idx, $el) {
                $el = $($el);
                var error = _instance.validateField($el, {suppressErrors : true, __returnErrorObj : true});
                if (_.isObject(error)) {
                    errorList.push(error);
                }
            });

            return errorList;
        },


        hasErrorToolTips : function ($container) {
            if ($container) {
                $container = _utils.get$($container);
            }
            else {
                $container = $("body");
            }

            return $container.find("[hasErrorTip]").length > 0;
        },

        /****************************************************************************
         * Function: hideErrorTooltips
         * hide all error tooltips
         * Parameters:
         *     $container - the input element (jquery element OR element Id
         *                 If not container Id is supplied we'll remove all
         ****************************************************************************/
        hideErrorTooltips : function ($container) {
            if ($container) {
                $container = _utils.get$($container);
            }
            else {
                $container = $("body");
            }


            $container.find("[hasErrorTip]").each(function (idx, $el) {
                _getRenderer().hide($($el));
            });
            if ($container.attr("hasErrorTip")) {
                _getRenderer().hide($container);
            }

        },

        setValidateOnBlur : function ($el, options, bValidateOnBlur) {
            // TODO - if bValidateOnBlur is false, remove the event handler

            var handlerSet = $el.prop("validationBlurSet") === true;

            // Attach blur event so we'll re-validate when the user tabs off
            // but only do it once!!
            if (!handlerSet) {
                $el.prop("validationBlurSet", true);
                //if (bValidateOnBlur) {
                $el.on("blur", function () {
                    //var revalidationOpts = options || {};
                    //// Only show one popup at a time, but allow corrected fields to dismiss the validation bubble
                    //if (revalidationOpts.showOnlyOne) {
                    //    //                       revalidationOpts.suppressErrors = true;
                    //}
                    _instance.validateField($(this), options);
                });
                //}
            }

        },

        showErrorMsg : function ($el, msg, options) {
            $el = _utils.get$($el);
            options = options || {};

            _getRenderer().show($el, [msg], options);
        }
    };

    /****************************************************************************
     * Group: Private
     * Private APIs
     ****************************************************************************/

    function _getRenderer () {
        return X.getComponent(X.constants.interfaces.kValidationRenderer);
    }

    //-------------------------------
    // set focus on an element, this will be a convenience to the user
    // and scroll the input field into view if it is not already
    //-------------------------------
    function _setFocus ($el) {
        if (!_utils.isElementInView($el)) {
            ////check if the offset - 70 is negative and use 0 if it is.
            //var elOffset = ($el.offset().top - 70 > 0) ? $el.offset().top - 70 : 0;
            ////scroll
            //$('html,body').animate({scrollTop : elOffset }, 'fast');

            // Get the offset top of the element.
            //var elOffset = $el.offset().top;

            // Scroll to the element.  Scroll location tries to be place element in middle of screen.
            $el.scrollTo($(window).height() / 2, 200);

        }

        // and focus it
        $el.focus().select();
    }


    // Load up all the default strategies
    _.each(X.validation.defaultStrategies, function (obj, name) {
        // otherwise, extend the base strategy
        X.registry.registerStrategy(name, obj);
    });

    return _instance;
})();



/*
 * class: InputStrategies
 * Maintains a list of validation strategies
 */
X.validation.executor = (function () {

    var _impl = {


        validate : function ($el, name, params) {
            return _execute(_VALIDATE, $el, null, name, params);
        },

        format : function ($el, event, name, params) {
            return _execute(_FORMAT, $el, event, name, params);
        }


    };

    var _VALIDATE = "validate",
        _FORMAT = "format";

    // -------------------------------
    // Function: executeStrategy
    // evaluate the validation or formatting strategy
    //
    // Parameters:
    //   action - the validation or format action to execute
    //   $el - the input element
    //   name - the strategy name
    //   params - the parameters
    // -------------------------------
    function _execute (/* either validate or format */action, $el, event, /* strategy name */name, params) {
        var result = null,
            strategy = X.registry.getStrategy(name);

        if (!strategy) {
            // Check to see if the specified strategy exists
            X.publishException("X.validation.strategies", "Missing strategy: '" + name + "'", X.log.WARN);
            return;
        }

        if (!strategy[action]) {
            // Check to see if the specified action (either validate or format) exists for this strategy
            X.publishException("X.validation.strategies", "Missing action:" + action + " for strategy:" + name, X.log.WARN);
            return;
        }

        // Now turn the parameters into an array
        // and resolve any model references
        var args = X.utils.getArrayOfArgs(params);

        try {
            // if there is no value and the name of the strategy is not
            // in the array of validator name that that should validate
            // when empty (i.e. required is one of them) then just return and don't validate. Otherwise
            // if the strategy is in the list, validate as if it were not empty
            if (action === _VALIDATE && !$el.val() && !strategy.validateIfEmpty) {
                return "";
            }

            // add the $element as the first parameter
            args.splice(0, 0, $el);
            //add the event if it's a formatter
            if (action === _FORMAT) {
                args.splice(1, 0, event);
            }
            result = strategy[action].apply(strategy, args);
        }
        catch (ex) {
            X.publishException("X.validation.strategies", "Invalid " + action +" definition " + name + ": " + params, X.log.WARN, ex);
        }

        return result;
    }

    return _impl;

})();

/*
 * Formatter
 * Written by Greg Miller
 * Purpose: attach formatters to input fields so that data is formatted as the user types

 * This plugin is written for X.$ 1.6+
 *
 * valid formatter values
 * 	mask : <masked char set using the '#' symbol for replaceable characters
 * 	date : <masked date value using Y=year, M=month, D=day,  ex. DD/MM/YYYY
 * 	number : <precision> or null if no formatting is requested
 */

X.utils.extend_$({
    format : function (event) {
        var $control = X.$(this),
            formatter = $control.attr("data-format");

        if (!formatter) {
            return;
        }
        // parse out the formatter name and any arguments
        var formatterParts = X.constants.functionRegex.exec(formatter);

        X.validation.executor.format($control, event, formatterParts[1], formatterParts[3]);
    }
});



X.utils.extend_$({

    validate : function (showMultipleErrors) {
        var $el = this;

        // accepts a single validator string with commas already replaced with _comma_
        // returns an object with properties {type, args, message}
        function _parseSingleValidator(validatorStr) {
            var validator = {};
            validatorStr = X.utils.replaceCharWithinParenthesis(validatorStr, ":", "_colon_");
            var parts = validatorStr.split(':');

            // now put back the colons
            X._.each(parts, function (itm, idx) {
                parts[idx] = itm.replace(/_colon_/g, ":");
            });

            // parse out the validator name and any arguments
            var validationParts = X.constants.functionRegex.exec(parts[0]);
            if (validationParts) {
                validator.type = validationParts[1];
                validator.args = validationParts[3] ? validationParts[3].replace(/_comma_/g, ",") : null;
            }
            validator.options = {};

            // get the options, which are after the colon (currently only :message(string) is used)
            for (var optionIndex = 1; optionIndex < parts.length; optionIndex += 1) {
                var optionParts = X.constants.functionRegex.exec(parts[optionIndex]);
                var optionName = optionParts[1];
                validator.options[optionName] = optionParts[3] ? optionParts[3].replace(/_comma_/g, ",").replace(/_colon_/g, ":").removeQuotes() : null;
            }

            // Set the information up as a property
            var dv = $el.prop("validate") || {};
            dv[validator.type] = validator;
            $el.prop("validate", dv);

            return validator;
        }

        function _parseValidators(htmlAttr) {
            // we need to remove spaces around commas that are used to separate some parameters
            // but leave other spaces, which could occur within a custom message (as in regex validation)
            htmlAttr = htmlAttr.replace(/(^\s*)|(\s*$)/g, "");  // remove leading and trailing spaces
            htmlAttr = htmlAttr.replace(/(\s*,\s*)/g, ","); // remove spaces around commas
            // Encode stuff between parens (so we can split on commas)
            htmlAttr = X.utils.replaceCharWithinParenthesis(htmlAttr, ",", "_comma_");

            var validatorStrings = htmlAttr.split(',');
            var validators = [];
            X._.each(validatorStrings, function (validatorStr, validatorIndex) {
                validators.push(_parseSingleValidator(validatorStr));
            });
            return validators;
        }

        // if this element doesn't have a validator attribute, or if the value of the validator attribute is empty, null or false,
        // or if the element is not an input, return right away
        if (!$el.attr("data-validate")) {
            return "";
        }

        var validatorStr = $el.attr("data-validate"),
            validationResult = null,
            errors = [],
            validators = _parseValidators(validatorStr);

        X._.each(validators, function (validator) {
            validationResult = X.validation.executor.validate($el, validator.type, validator.args);
            if (validationResult) {
                X.publish(X.constants.events.kValidationFailed, $el.get(0));
                errors.push(validationResult);
            }
        });

        return errors;

    }
});
