
'use strict';

/**
 * Create middleware that returns HTTP 406 Unacceptable unless the Accept
 * header is one of the allowed headers.
 * @returns {Function} Middleware.
 * @example app.use('/', accepts('application/json', 'text/html'), foo);
 */
module.exports = function acceptor() {
	var types = Array.prototype.slice.apply(arguments);
	return function accepts(req, res, next) {
		req.accept = req.accepts(types);
		if (!req.accept) {
			return next({ statusCode: 406 });
		}
		next();
	};
};

/**
 * Create middleware that stops the current route unless a specific accept
 * header is matched. You can pass as many types as you want.
 * @returns {Function} Middleware.
 * @example app.use('/', accepts.on('application/json'), foo);
 */
module.exports.on = function delegator() {
	var types = Array.prototype.slice.apply(arguments);
	for (var i = 0; i < types.length; ++i) {
		if (typeof types[i] !== 'string') {
			throw new TypeError();
		}
	}
	return function delegate(req, res, next) {
		if (!req.accept) {
			return next('no accept given.');
		}

		for (var i = 0; i < types.length; ++i) {
			if (types[i] === req.accept) {
				return next();
			}
		}
		next('route');
	};
};
