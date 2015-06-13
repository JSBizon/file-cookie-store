var expect = require('expect.js'),
    FS = require('fs'),
    util = require('util'),
    TOUGH = require('tough-cookie'),
    MemoryCookieStore = require('tough-cookie/lib/memstore').MemoryCookieStore,
    Q =     require('q');

describe('Test file cookie store', function() {

    var FileCookieStore,
        COOKIES_TEST_FILE = __dirname + '/cookies.txt',
        COOKIES_EMPTY_FILE = __dirname + '/cookies-not-found.txt',
        COOKIES_BAD_FILE = __dirname + '/cookies-bad.txt',
        COOKIES_TEST_FILE2 = __dirname + '/cookies2.txt',
        COOKIES_TEST_FILE_NEW = __dirname + '/cookies2-new.txt',
        PARALLEL_WRITES = 20,
        cookie_store;
  
    before(function(done) {
        FileCookieStore = require('../index');
        try {
            FS.unlinkSync(COOKIES_TEST_FILE2);
        } catch (err) {};
        
        try {
            FS.unlinkSync(COOKIES_TEST_FILE2 + '.lock');
        } catch (err) {};
        
        done();
    });
    
    beforeEach(function(done){
        FS.writeFileSync(COOKIES_TEST_FILE2, FS.readFileSync(COOKIES_TEST_FILE) );
        cookie_store = new FileCookieStore(COOKIES_TEST_FILE2);
        done();
    });
    
    afterEach(function(done){
        try {
            FS.unlinkSync(COOKIES_TEST_FILE2);
        } catch (err) {};
        done();
    });
    
    
    after(function (done) {
        try {
            FS.unlinkSync(COOKIES_TEST_FILE2 + '.lock');
        } catch (err) {};
        done();
    });
    
    
    describe("load", function() {
        it('should have a FileCookieStore class', function () {
            expect(FileCookieStore).to.be.ok();
        });
    });
  
    describe("#constructor", function () {
        it('should not allow create object without file name', function () {
            expect(function () { new FileCookieStore()} ).to.throwError();
        });
        
        it('should create object of FileCookieStoreClass', function () {
            expect(new FileCookieStore(COOKIES_TEST_FILE)).to.be.ok();
        });
        
        it('should not open bad formatted file', function (done) {
            new FileCookieStore(COOKIES_BAD_FILE).findCookies('.ebay.com', null, function (err) {
                
                expect(err).to.be.ok();
                
                done();
            });
        });

        it('should throw exception if file not found', function (done) {
            new FileCookieStore(COOKIES_TEST_FILE_NEW,{no_file_error: true}).findCookies('.ebay.com', null, function (err,cookies) {
                expect(err).to.be.ok();
                done();
            });
        });
        
        it('should parse bad formatted file', function (done) {
           new FileCookieStore(COOKIES_BAD_FILE,{force_parse : true }).findCookies('.ebay.com', null, function (err, cookies) {
                
                expect(err).not.to.be.ok();
                expect(cookies).to.have.length(5);
                
                done();
            });
        });
    });
    
  
    describe("#findCookie", function () {
        
        it ('should find amazon cookie', function (done) {
            cookie_store.findCookie('.amazon.com', '/', 'skin', function (err, cookie) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookie).to.be.a(TOUGH.Cookie);
                    expect(cookie.key).to.be('skin');
                    expect(cookie.value).to.be('noskin');
                    expect(cookie.expires).to.be('Infinity');
                    expect(cookie.secure).not.to.be.ok();
                    expect(cookie.path).to.be('/');
                    expect(cookie.httpOnly).not.to.be.ok();
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });
        
        it ('should find httpOnly cookie', function (done) {

            cookie_store.findCookie('.alibaba.com', '/path/test', 'xman_f', function (err, cookie) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookie).to.be.a(TOUGH.Cookie);
                    expect(cookie.key).to.be('xman_f');
                    expect(cookie.value).to.be('fUW2oGT39LOjTSJEvoSq+tfDjwQ1hO+QEEvx+D0eUDjWGotyXIFKVtj1DJi+k50tivsK3bmd8VlLjNm1XbmORTf/Xylom0EWEyPMtJuOqjqKUnkBr3cyww==');
                    expect(cookie.expires.getFullYear()).to.be(2082);
                    expect(cookie.path).to.be('/path/test');
                    expect(cookie.httpOnly).to.be.ok();
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });
        
        it ('should not find cookie', function (done) {
            cookie_store.findCookie('.alibaba.com', '/', 'xman_f', function (err, cookie) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookie).not.to.be.ok();
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });
        
        it('should not find cookie(file not found)', function (done) {
            var cookie_empty_store = new FileCookieStore(COOKIES_EMPTY_FILE);
            cookie_empty_store.findCookie('.amazon.com', '/', 'skin', function (err, cookie) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookie).not.to.be.ok();
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });
        
        it ('wrong arguments', function (done) {
            cookie_store.findCookie(null, null, null, function (err, cookie) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookie).not.to.be.ok();
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });
        
        it ('wrong arguments2', function (done) {
            cookie_store.findCookie(null, '/', null, function (err, cookie) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookie).not.to.be.ok();
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });
        
        it ('wrong arguments3', function (done) {
            cookie_store.findCookie('.amazon.com', null, 'skin', function (err, cookie) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookie).not.to.be.ok();
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });
        
        it ('wrong arguments4', function (done) {
            cookie_store.findCookie('.amazon.com', '/', null, function (err, cookie) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookie).not.to.be.ok();
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });
    });
    
  
    describe("#findCookies", function () {
        
        it ('should find cookies for ebay.com', function (done) {
            
            cookie_store.findCookies('.ebay.com', null, function (err, cookies) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(5);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    expect(cookies[0].domain).to.be('ebay.com');
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });
        
        it ('should find cookies for top level domain', function (done) {
            cookie_store.findCookies('www.facebook.com', null, function (err, cookies) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(4);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    expect(cookies[0].domain).to.be('facebook.com');
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });



        it ('should not find host only cookies', function (done) {
            done();
        });
        
        it ('wrong arguments', function (done) {
            cookie_store.findCookies(undefined, null, function (err, cookies) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(0);
                } catch (e) {
                    return done(e);
                }
                done();
            });
        });
        
    });
    
  
    describe("#putCookie", function () {
        
        afterEach(function(done){
            try {
                FS.unlinkSync(COOKIES_TEST_FILE_NEW);
            } catch (err) {};
            done();
        });
        
        
        it ('should save cookie', function (done) {
            cookie_store.findCookies('.ebay.com', null, function (err, cookies) {
                try {
                    expect(err).not.to.be.ok();
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(5);

                    var fns = [],
                        cookie_store2 = new FileCookieStore(COOKIES_TEST_FILE_NEW);

                    cookies.forEach(function(cookie) {
                        var func = Q.nbind(cookie_store2.putCookie, cookie_store2);
                        fns.push(func(cookie));
                    });

                    var new_cookie_store = new FileCookieStore(COOKIES_TEST_FILE_NEW),
                        findCookies = Q.nbind(new_cookie_store.findCookies, new_cookie_store, '.ebay.com', null);

                    Q.all(fns).
                    then(function() {
                        return findCookies()
                    }).
                    then(function(cookies) {
                        
                        expect(cookies).to.be.a(Array);
                        expect(cookies).to.have.length(5);

                        done();
                    }).
                    catch(function(err) {
                        done(err);
                    }).
                    done();
                } catch (e) {
                    return done(e);
                }
            });
        });
        
        
        it ('should update cookie', function (done) {
            
            var findCookie = Q.nbind(cookie_store.findCookie, cookie_store,'.twitter.com', '/', 'guest_id');
            
            findCookie().
                then(function (cookie) {
                    expect(cookie.key).to.be('guest_id');
                    expect(cookie.value).to.be('v1:141105733211768497');
                    
                    cookie.value = 'test value';
                        
                    return Q.nbind(cookie_store.putCookie, cookie_store)(cookie);
                }).
                then(function () {
                    var cookie_store2 = new FileCookieStore(COOKIES_TEST_FILE2);
                    
                    return Q.nbind(cookie_store2.findCookie, cookie_store2,'.twitter.com', '/', 'guest_id')();
                }).
                then(function (cookie) {
                    
                    expect(cookie.key).to.be('guest_id');
                    expect(cookie.value).to.be('test value');
                    
                    done();
                }).
                catch(function (err){
                    done(err);
                }).
                done();
            
        });
        
        it('should insert new cookie', function (done) {
            
            var domain = 'putcookie.test.com',
                path = '/',
                key = 'key 1 , . !@#$%^&*()',
                expire = new Date();
            
            expire.setDate(expire.getDate() + 2);
            
            var cookie = new TOUGH.Cookie({
                    domain : domain,
                    path : path,
                    secure : true,
                    expires : expire,
                    key : key,
                    value : '[]{}!@#$%%^&*()_+?',
                    httpOnly: true
                });
            
            Q.nbind(cookie_store.putCookie, cookie_store)(cookie).
                then(function () {
                    var cookie_store2 = new FileCookieStore(COOKIES_TEST_FILE2);
                    var findCookies = Q.nbind(cookie_store2.findCookies, cookie_store2);
                    return findCookies(domain, null);
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(1);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                }).
                then(function () {
                    var cookie_store2 = new FileCookieStore(COOKIES_TEST_FILE2);
                    var findCookie = Q.nbind(cookie_store2.findCookie, cookie_store2);
                    return findCookie(domain,path,key);
                }).
                then(function (cookie) {
                    
                    expect(cookie).to.be.a(TOUGH.Cookie);
                    expect(cookie.domain).to.be(domain);
                    expect(Math.round(cookie.expires.getTime() / 1000)).to.be(Math.round(expire.getTime() / 1000));

                    done();
                }).
                catch(function(err) {
                    done(err);
                }).
                done();
        });
        
        it('should mass cookies store update', function (done) {
            
            var i=0, 
                stores_num = PARALLEL_WRITES, 
                keys = [], 
                cookies = [], 
                fns = [],
                expire = new Date(),
                test_domain = 'masstest.com';
            
            expire.setDate(expire.getDate() + 2);
            
            for (i = 0; i < stores_num; i++) {
                var key = 'key ' + i;
                var cookie_store = new FileCookieStore(COOKIES_TEST_FILE2);
                var cookie = new TOUGH.Cookie({
                    domain : test_domain,
                    path : '/',
                    secure : true,
                    expires : expire,
                    key : key,
                    value : 'value ' + i,
                    httpOnly : false
                });
                
                var func = Q.nbind(cookie_store.putCookie, cookie_store);
                fns.push(func(cookie));
                keys.push(key);
            }
            
            Q.all(fns)
                .then(function () {
                    var cookie_store = new FileCookieStore(COOKIES_TEST_FILE2);
                    return Q.nbind(cookie_store.findCookies, cookie_store)(test_domain,null);
                })
                .then(function(cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(PARALLEL_WRITES);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                
                    var map_key_cookie = {};
                
                    cookies.forEach(function (cookie) {
                        map_key_cookie[cookie.key] = cookie;
                    });
                
                    keys.forEach(function (key) {
                        expect(map_key_cookie[key]).to.be.a(TOUGH.Cookie);
                    });
                
                    done();
                })
                .catch(function (err){
                    done(err);
                }).
                done();
        });
        
        it('should mass cookies store update without auto_sync', function (done) {
            var i=0, 
              stores_num = PARALLEL_WRITES, 
              keys = [], 
              cookies = [], 
              fns = [],
              expire = new Date(),
              test_domain = 'noautosync.masstest.com',
              cookie_store = new FileCookieStore(COOKIES_TEST_FILE2, {auto_sync : false});
            
            expire.setDate(expire.getDate() + 2);
            
            for (i = 0; i < stores_num; i++) {
                var key = 'key ' + i;
                var cookie = new TOUGH.Cookie({
                    domain : test_domain,
                    path : '/',
                    secure : true,
                    expires : expire,
                    key : key,
                    value : 'value ' + i,
                    httpOnly : false
                });
                
                var func = Q.nbind(cookie_store.putCookie, cookie_store);
                fns.push(func(cookie));
                keys.push(key);
            }
            
            Q.all(fns)
            .then(function () {
                return Q.nbind(cookie_store.save, cookie_store)();
            })
            .then(function () {
                var cookie_store = new FileCookieStore(COOKIES_TEST_FILE2);
                return Q.nbind(cookie_store.findCookies, cookie_store)(test_domain,null);
            })
            .then(function(cookies) {
                expect(cookies).to.be.a(Array);
                expect(cookies).to.have.length(PARALLEL_WRITES);
                expect(cookies[0]).to.be.a(TOUGH.Cookie);
            
                var map_key_cookie = {};
            
                cookies.forEach(function (cookie) {
                    map_key_cookie[cookie.key] = cookie;
                });
            
                keys.forEach(function (key) {
                    expect(map_key_cookie[key]).to.be.a(TOUGH.Cookie);
                });
            
                done();
            })
            .catch(function (err){
                done(err);
            }).
            done();
            
        });
    });
    
    
    describe("#removeCookie", function () {
        it ('should remove cookie', function (done) { 
            
            var removeCookie = Q.nbind(cookie_store.removeCookie, cookie_store,'.twitter.com', '/', 'guest_id');
            
            removeCookie().
                then(function (cookie) {
                    var cookie_store2 = new FileCookieStore(COOKIES_TEST_FILE2);
                    
                    return Q.nbind(cookie_store2.findCookie, cookie_store2)('.twitter.com', '/', 'guest_id');
                }).
                then(function (cookie) {
                    expect(cookie).not.to.be.ok();
                    done();
                }).
                catch(function (err){
                    done(err);
                }).
                done();
        });
    });
    
    
    describe("#removeCookies", function () {
        it ('should remove all domain cookies', function (done) { 
            
            var test_domain = '.twitter.com';
            
            Q.nbind(cookie_store.findCookies, cookie_store)(test_domain, null).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(2);
                    return  Q.nbind(cookie_store.removeCookies, cookie_store)(test_domain, null);
                }).
                then(function () {
                    var cookie_store2 = new FileCookieStore(COOKIES_TEST_FILE2);
                    return Q.nbind(cookie_store2.findCookies, cookie_store2)(test_domain, null);
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(0);
                    done();
                }).
                catch(function (err){
                    done(err);
                }).
                done();
        });
    });
    
    
    describe("#CookieJar", function () {
        var cookie_jar;
            
        beforeEach(function(done){
            cookie_jar = new TOUGH.CookieJar(cookie_store);
            done();
        });

        afterEach(function(done){
            try {
                FS.unlinkSync(COOKIES_TEST_FILE_NEW);
            } catch (err) {};
            done();
        });

        it ('should create CookieJar object', function (done) {
            expect(cookie_jar).to.be.a(TOUGH.CookieJar);
            done();
        });
        
        it('should find cookie in CookieJar', function (done) {
            this.timeout(10000);
            Q.nbind(cookie_jar.getCookies, cookie_jar)('http://facebook.com')
                .then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(3);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('http://www.facebook.com');
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(3);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('http://aaa.bbb.facebook.com');
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(3);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('https://aaa.bbb.facebook.com');
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(3);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('http://alibaba.com');
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(7);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('http://www.alibaba.com');
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(8);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('http://www.alibaba.com/path/test');
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(9);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('https://www.alibaba.com/');
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(8);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('https://www.ya.ru/super/path');
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(1);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                }).
                then(function () {
                    done();
                }).
                catch(function (err){
                    done(err);
                }).
                done();
        });
        
        it('should not find cookie in CookieJar', function (done) {
            
            Q.nbind(cookie_jar.getCookies, cookie_jar)('http://www.thefacebook.com/').
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(0);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('https://ya.ru/');
                }).
                then(function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(0);
                }).
                then(function () {
                    done();
                }).
                catch(function (err){
                    done(err);
                }).
                done();
        });

        it ('should find "host only" cookies', function (done) {
            Q.nbind(cookie_jar.getCookies, cookie_jar)('http://www.aff.store.com/').
                then(function (cookies){
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(2);
                    done();
                }).
                catch(function (){
                    done(err);
                }).
                done();
        });

        it ('should find "host only" cookies and domain cookies', function (done) {
            Q.nbind(cookie_jar.getCookies, cookie_jar)('http://aff.store.com/').
                then(function (cookies){
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(6);
                    done();
                }).
                catch(function (){
                    done(err);
                }).
                done();
        });
        
        it('should put cookie in CookieJar', function (done) {
            
            var expire = new Date();
            
            expire.setDate(expire.getDate() + 2);
            
            var cookie = new TOUGH.Cookie({
                expires : expire,
                key : 'key111',
                value : 'value222',
                httpOnly : false
            });
            
            Q.nbind(cookie_jar.setCookie, cookie_jar)(cookie, 'http://setcookietest.com/').
                then( function (cookie) {
                    expect(cookie).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('http://setcookietest.com/test/path');
                }).
                then( function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(1);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                }).
                then(function () {
                    done();
                }).
                catch(function (err){
                    done(err);
                }).
                done();
        });

        
        it('should save cookie into file from CookieJar', function (done) {
            var expire = new Date();
            
            expire.setDate(expire.getDate() + 2);
            
            var cookie = new TOUGH.Cookie({
                path : '/test/path',
                expires : expire,
                key : 'key312',
                value : 'value333',
                httpOnly : false
            });
            Q.nbind(cookie_jar.setCookie, cookie_jar)(cookie, 'http://setcookietest.com/').
                then( function (cookie) {
                    expect(cookie).to.be.a(TOUGH.Cookie);
                    var cookie_jar2 = new TOUGH.CookieJar(new FileCookieStore(COOKIES_TEST_FILE2));
                    return Q.nbind(cookie_jar2.getCookies, cookie_jar2)('http://setcookietest.com/test/path');
                }).
                then( function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(1);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    
                    var cookie_jar2 = new TOUGH.CookieJar(new FileCookieStore(COOKIES_TEST_FILE2));

                    return Q.nbind(cookie_jar2.getCookies, cookie_jar2)('http://setcookietest.com/');
                }).
                then( function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(0);
                }).
                then(function () {
                    done();
                }).
                catch(function (err){
                    done(err);
                }).
                done();
        });
        
        it('should use secure cookie for https only', function (done) {
            var expire = new Date();
            
            expire.setDate(expire.getDate() + 2);
            
            var cookie = new TOUGH.Cookie({
                expires : expire,
                secure: true,
                key : 'key232',
                value : 'value212',
                httpOnly : false
            });
            
            Q.nbind(cookie_jar.setCookie, cookie_jar)(cookie, 'http://setcookietest.com/').
                then( function (cookie) {
                    expect(cookie).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('https://setcookietest.com/test/path');
                }).
                then( function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(1);
                    expect(cookies[0]).to.be.a(TOUGH.Cookie);
                    
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('http://setcookietest.com/test/path');
                }).
                then( function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(0);
                }).
                then(function () {
                    done();
                }).
                catch(function (err){
                    done(err);
                }).
                done();
        });
        
        it('should remove expired Cookie from CookieJar', function (done) {
            var expire = new Date();
            
            expire.setDate(expire.getDate() - 2);
            
            var cookie = new TOUGH.Cookie({
                expires : expire,
                key : 'key',
                value : 'value',
                httpOnly : false
            });
            
            Q.nbind(cookie_jar.setCookie, cookie_jar)(cookie, 'http://setcookietest.com/').
                then( function (cookie) {
                    expect(cookie).to.be.a(TOUGH.Cookie);
                    return Q.nbind(cookie_jar.getCookies, cookie_jar)('http://setcookietest.com/');
                }).
                then( function (cookies) {
                    expect(cookies).to.be.a(Array);
                    expect(cookies).to.have.length(0);
                }).
                then(function () {
                    done();
                }).
                catch(function (err){
                    done(err);
                }).
                done();
        });


        it('should save "host only" cookies correctly', function (done) {
            var cookies_urls = ['http://aff.store.com/', 'http://www.aff.store.com/', 
                'http://store.com', 'http://www.store.com'],
                fns = [];
            for (i = 0; i < cookies_urls.length; i++) {
                var func = Q.nbind(cookie_jar.getCookies, cookie_jar);
                fns.push(func(cookies_urls[i]));
            }

            var cookie_store2 = new FileCookieStore(COOKIES_TEST_FILE_NEW),
                cookie_jar2 = new TOUGH.CookieJar(new FileCookieStore(COOKIES_TEST_FILE_NEW));

            Q.all(fns).spread(function(cookies1,cookies2,cookies3,cookies4){
                expect(cookies1).to.be.a(Array);
                expect(cookies1).to.have.length(6);
                expect(cookies2).to.be.a(Array);
                expect(cookies2).to.have.length(2);
                expect(cookies3).to.be.a(Array);
                expect(cookies3).to.have.length(2);
                expect(cookies4).to.be.a(Array);
                expect(cookies4).to.have.length(1);

                var all_cookies = cookies1.concat(cookies1, cookies2, cookies3,cookies4),
                    put_fns = [];

                for (i = 0; i < all_cookies.length; i++) {
                    var func = Q.nbind(cookie_store2.putCookie, cookie_store2);
                    put_fns.push(func(all_cookies[i]));                    
                }
                
                return Q.all(put_fns);               
            }).then(function () {
                return Q.nbind(cookie_jar2.getCookies, cookie_jar2)('http://aff.store.com/');
            }).then(function (cookies) {
                expect(cookies).to.be.a(Array);
                expect(cookies).to.have.length(6);
                return Q.nbind(cookie_jar2.getCookies, cookie_jar2)('http://store.com/');
            }).then(function (cookies) {
                expect(cookies).to.be.a(Array);
                expect(cookies).to.have.length(2);
                done();
            }).
            catch(function (err){
                done(err);
            }).
            done();
        });

        it('#serialize', function (done) {
            Q.nbind(cookie_jar.serialize, cookie_jar)()
                .then(function (serialized_object) {
                    expect(serialized_object.cookies).to.be.a(Array);
                    expect(serialized_object.cookies).to.have.length(43);
                    done();
                })
                .catch(function(err){
                    done(err);
                })
                .done();
        });
    });

    describe("#export", function () {
        it('should export cookies to the array', function (done) {

            cookie_store.export(function (err, cookies) {
                if (err) {
                    done(err);
                } else {
                    try {
                        expect(cookies).to.be.a(Array);
                        expect(cookies).to.have.length(43);
                    } catch (e) {
                        return done(e);
                    }
                    done();
                }
            });
        });

        it('should export cookies to the other store', function (done) {
            var memory_cookie_store = new MemoryCookieStore();
            cookie_store.export(memory_cookie_store, function (err, cookies) {
                try {
                    if (err) {
                        return done(err);
                    } else {
                        var idx = memory_cookie_store.idx,
                            cookies_num = 0;
                        for (var domain in idx) {
                            if (!idx.hasOwnProperty(domain)) continue;
                            for (var path in idx[domain]) {
                                if (!idx[domain].hasOwnProperty(path)) continue;
                                for (var key in idx[domain][path]) {
                                    if (!idx[domain][path].hasOwnProperty(key)) continue;
                                    var cookie = idx[domain][path][key];
                                    if (cookie) {
                                        ++cookies_num;
                                    }
                                }
                            }
                        }
                        expect(cookies_num).to.be(43);
                        done();
                    }
                } catch (e) {
                    return done(e);
                }
            });
        });
    });

    describe("#getAllCookies", function () {
        it('should fetch all cookies', function (done) {
            cookie_store.getAllCookies(function (err, cookies) {
                if (err) {
                    done(err);
                } else {
                    try{
                        expect(cookies).to.be.a(Array);
                        expect(cookies).to.have.length(43);
                        done();
                    } catch (e) {
                        return done(e);
                    }
                }
            });
        });
    });

});