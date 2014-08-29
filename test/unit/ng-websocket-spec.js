'use strict';

var $websocket;

describe('Testing ng-websocket', function () {
    beforeEach(module('ngWebsocket'));
    beforeEach(inject(function (_$websocket_) {
        $websocket = _$websocket_;
    }));

    describe('Testing an offline $websocket', function () {
        var ws;

        beforeEach(function () {
            ws = $websocket.$new('ws://localhost:12345');
        });

        afterEach(function () {
            ws.$close();
        });

        it('should remain in a CONNECTING state', function () {
            expect(ws).toBeDefined();
            expect(ws.$status()).toEqual(ws.$CONNECTING);
        });

        it('should not raise an Error when calling $emit', function () {
            var error;

            try {
                ws.$emit('test', 'data');
            }
            catch (err) {
                error = err;
            }

            expect(error).toBeUndefined();
            expect(ws.$status()).not.toEqual(ws.$OPEN);
        });
    });

    describe('Testing an online $websocket', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new('ws://localhost:12345');

            ws.$on('$open', function () {
                done();
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should be in an OPEN state', function (done) {
            expect(ws.$status()).toEqual(ws.$OPEN);
            done();
        });

        it('should not to throw an Error when calling $emit', function () {
            var error;

            try {
                ws.$emit('test', 'data');
            }
            catch (err) {
                error = err;
            }

            expect(ws.$status()).toEqual(ws.$OPEN);
            expect(error).toBeUndefined();
        });
    });

    describe('Testing a parrot websocket server', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new('ws://localhost:12345');

            ws.$on('$open', function () {
                done();
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should have received the same message', function (done) {
            ws.$emit('custom event', 'hello world');

            ws.$on('$message', function (message) {
                expect(message.event).toEqual('custom event');
                expect(message.data).toEqual('hello world');

                done();
            });
        });

        it('should have received the same message on the same event', function (done) {
            ws.$emit('custom event', 'hello world');

            ws.$on('custom event', function (message) {
                expect(message).toEqual('hello world');

                done();
            });
        });
    });

    describe('Testing a lazy websocket', function () {
        var ws;

        beforeEach(function () {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                lazy: true
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should be in a CLOSE state', function () {
            expect(ws.$status()).toEqual(ws.$CLOSED);
        });

        it('should not throw an error on $emit', function () {
            var error;

            try {
                ws.$emit('test', 'data');
            }
            catch (err) {
                error = err;
            }

            expect(error).not.toBeDefined();
            expect(ws.$status()).toEqual(ws.$CLOSED);
        });

        it('should open the connection when invoking $open', function () {
            ws.$open();

            ws.$on('$open', function () {
                expect(ws.$status()).toEqual(ws.$OPEN);
            });
        });
    });

    describe('Testing an open lazy websocket', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                lazy: true
            });

            ws.$open();

            ws.$on('$open', function () {
                done();
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should be open', function (done) {
            expect(ws.$status()).toEqual(ws.$OPEN);
            done();
        });

        it('should send data via $emit', function (done) {
            var error;

            try {
                ws.$emit('event', 'data');
            }
            catch (err) {
                error = err;
            }

            expect(error).toBeUndefined();
            done();
        });

        it('should have received the same message on the same event', function (done) {
            ws.$emit('custom event', 'hello lazy world');

            ws.$on('$message', function (message) {
                expect(message.event).toEqual('custom event');
                expect(message.data).toEqual('hello lazy world');
                done();
            });
        });
    });
});