'use strict';

describe('expert-box-language', function() {

	describe('ebLanguage', function() {		

		beforeEach(module('ngResource'));

		//load expert box language module
		beforeEach(module('expert-box-language', function ($provide) {
			//$provide.value('$log', console);
		}));

		var $httpBackend, $log, $rootScope, $q, ebLanguage;
		beforeEach(inject(function ($injector, _$log_,_$rootScope_, _$q_, _ebLanguage_) {
			$httpBackend = $injector.get('$httpBackend');
			$log = _$log_;
			$rootScope = _$rootScope_;
			$q = _$q_;
			ebLanguage = _ebLanguage_;
		}));

		//content for 2 different translation files
		var translationsEN = {
			ONE: 'one',
			TWO: 'two',
			BEER: 'beer',
			BEERS: 'beers',
			AND: 'and'
		};
		var translationsNL = {
			ONE: 'een',
			TWO: 'twee',
			BEER: 'biertje',
			BEERS: 'biertjes',
			AND: 'en'
		};

		it('should resolve translation promise', function (){

			//ebLanguage should get file during loading
			$httpBackend.expectGET('translation/en.json').respond(translationsEN);
			
			//load the language
			ebLanguage.load('EN');
			$httpBackend.flush();
			
			expect(ebLanguage.translations.ONE).toEqual(translationsEN.ONE);
		});

		it('should form singular noun', function (done){

			//ebLanguage should get file during loading
			$httpBackend.expectGET('translation/nl.json').respond(translationsNL);
			
			//load the language
			ebLanguage.load('NL');
			$httpBackend.flush();

			var tests = {
				success : function (noun) {
					$log.debug('then success');
					expect(noun).toEqual('biertje');
				},
				failure : function (error) {
					$log.debug('catch failure');
					expect(error).toBeUndefined();
				}
			};

			spyOn(tests, 'success').and.callThrough();
			spyOn(tests, 'failure').and.callThrough();

			var formNoun = ebLanguage.formNoun(1,'BEER','BEERS');
			$q.when(formNoun).then(tests.success).catch(tests.failure).finally(done);
			$rootScope.$apply();
			$rootScope.$apply();

			expect(tests.success).toHaveBeenCalled();
		});

		it('should form plural noun', function (done){

			//ebLanguage should get file during loading
			$httpBackend.expectGET('translation/en.json').respond(translationsEN);
			
			//load the language
			ebLanguage.load('EN');
			$httpBackend.flush();

			var tests = {
				success : function (noun) {
					$log.debug('then success');
					expect(noun).toEqual('beers');
				},
				failure : function (error) {
					$log.debug('catch failure');
					expect(error).toBeUndefined();
				}
			};

			spyOn(tests, 'success').and.callThrough();
			spyOn(tests, 'failure').and.callThrough();

			var formNoun = ebLanguage.formNoun(2,'BEER','BEERS');
			$q.when(formNoun).then(tests.success).catch(tests.failure).finally(done);
			$rootScope.$apply();
			$rootScope.$apply();

			expect(tests.success).toHaveBeenCalled();
		});

		it('should create measurement with unit as a singular formed noun', function (done){

			//ebLanguage should get file during loading
			$httpBackend.expectGET('translation/nl.json').respond(translationsNL);
			
			//load the language
			ebLanguage.load('NL');
			$httpBackend.flush();

			var tests = {
				success : function (measurement) {
					$log.debug('then success '+measurement);
					expect(measurement).toEqual('1 biertje');
				},
				failure : function (error) {
					$log.debug('catch failure');
					expect(error).toBeUndefined();
				}
			};

			spyOn(tests, 'success').and.callThrough();
			spyOn(tests, 'failure').and.callThrough();

			var measurement = ebLanguage.measurement(1,'BEER','BEERS');
			$q.when(measurement).then(tests.success).catch(tests.failure).finally(done);
			$rootScope.$apply();
			$rootScope.$apply();

			expect(tests.success).toHaveBeenCalled();
		});

		it('should create measurement with unit as a plural formed noun', function (done){

			//ebLanguage should get file during loading
			$httpBackend.expectGET('translation/en.json').respond(translationsEN);
			
			//load the language
			ebLanguage.load('EN');
			$httpBackend.flush();

			var tests = {
				success : function (measurement) {
					$log.debug('then success '+measurement);
					expect(measurement).toEqual('2 beers');
				},
				failure : function (error) {
					$log.debug('catch failure');
					expect(error).toBeUndefined();
				}
			};

			spyOn(tests, 'success').and.callThrough();
			spyOn(tests, 'failure').and.callThrough();

			var measurement = ebLanguage.measurement(2,'BEER','BEERS');
			$q.when(measurement).then(tests.success).catch(tests.failure).finally(done);
			$rootScope.$apply();
			$rootScope.$apply();

			expect(tests.success).toHaveBeenCalled();
		});
	});
});


