
'use strict';

var express = require('express'),
	accepts = require('accepts'),
	request = require('supertest');

function ok(req, res, next) {
	res.status(200).send({ ok: true });
	next();
}

function error(error, req, res, next) {
	res.status(error.statusCode || 500).send(error);
	next(error);
}

describe('#accepts', function() {

	describe('with multiple acceptable types', function() {

		beforeEach(function() {
			this.app = express();
			this.app.get('/', accepts('application/json', 'text/html'), ok);
			this.app.use(error);
		});

		afterEach(function() {
			this.app = null;
		});

		describe('when an invalid Content-Type header is given', function() {

			beforeEach(function() {
				this.request = request(this.app)
					.get('/')
					.set('Accept', 'application/foo+bar');
			});

			afterEach(function() {
				this.request = null;
			});

			it('should respond with HTTP 406', function(done) {
				this.request.expect(function(res) {
					expect(res).to.have.status(406);
				}).end(done);
			});

			it('should abort the middleware chain', function(done) {
				var spy = sinon.spy();
				this.app.get('/', spy);
				this.request.expect(function() {
					expect(spy).to.not.be.called;
				}).end(done);
			});
		});

		describe('when a valid Content-Type header is given', function() {

			beforeEach(function() {
				this.request = request(this.app)
					.get('/')
					.set('Accept', 'application/json');
			});

			afterEach(function() {
				this.request = null;
			});

			it('should continue the middleware chain', function(done) {
				var spy = sinon.spy();
				this.app.get('/', spy);
				this.request.expect(function() {
					expect(spy).to.be.calledOnce;
				}).end(done);
			});

			it('should call the correct type delegates', function(done) {
				var spy = sinon.spy();
				this.app.get('/', accepts.on('application/json'), spy, ok);
				this.request.expect(function() {
					expect(spy).to.be.calledOnce;
				}).end(done);
			});

			it('should not call the incorrect type delegates', function(done) {
				var spy = sinon.spy();
				this.app.get('/', accepts.on('text/html'), spy, ok);
				this.request.expect(function() {
					expect(spy).to.not.be.called;
				}).end(done);
			});
		});
	});

	describe('#on', function() {
		it('should fail when given anything other than booleans', function() {
			expect(function() {
				accepts.on(false);
			}).to.throw(TypeError);

			expect(function() {
				accepts.on(55);
			}).to.throw(TypeError);

			expect(function() {
				accepts.on({ });
			}).to.throw(TypeError);
		});
		it('should fail when no accept information is present', function(done) {
			var spy = sinon.spy();
			var app = express();
			app.get('/', accepts.on('application/json'), ok);
			app.use(function(err, req, res, next) {
				spy(); next(err);
			});
			request(app)
				.get('/')
				.set('Content-Type', 'application/json')
				.expect(function(res) {
					expect(res).to.have.status(500);
					expect(spy).to.be.calledOnce;
				})
				.end(done);
		});
	});
});
