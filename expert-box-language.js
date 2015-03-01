'use strict';

var expertBoxLanguage = angular.module('expert-box-language', ['ngResource']);

//language service
expertBoxLanguage.service('ebLanguage', ['$log', '$q', '$resource',
                                         function($log, $q, $resource) {
  var self = this;

  //function to load a set of translations for language code
  self.load = function(code) {
    //$log.debug('language.load ' + code);

    //create language file resource
    var languageFilePath = 'translation/' + code.toLowerCase() + '.json';
    //$log.debug('languageFilePath is '+languageFilePath);
    var resource = $resource(languageFilePath,null, {
      'query': {
          method:'GET',
          isArray:false,
          cache:true
      }
    });

    //translations is a promise
    var defer = $q.defer();
    self.translations = resource.query(function(data) {
      self.translations = data;
      //$log.debug('ebLanguage.load.query.callback : self.translations = ...');
      //$log.debug(self.translations);
    }).$promise;

    //return promise to resolve after translations is recieved and stored
    //$log.debug('ebLanguage.load : self.translations = ...');
    //$log.debug(self.translations);
    return self.translations;
  };

  //form a noun as singular or plural according to a number
  //return promise until translations are resolved
  self.formNoun = function (number, singular, plural) {
      //$log.debug('formNoun requested for '+number+' '+singular+' '+plural);

      var defer = $q.defer();      
      $q.when(self.translations).then(function (translations) {        
        if (angular.isUndefined(number) || angular.isUndefined(singular) || angular.isUndefined(plural)) {
            var msg = 'formNoun input validation failed'
            $log.error(msg);
            defer.reject(msg);
        }
        else if (number<2) {
          var res = translations[singular];
          //$log.debug('formNoun '+number+' resolves as '+res);
          defer.resolve(res);
        }
        else {
          var res = translations[plural];
          //$log.debug('formNoun '+number+' resolves as '+res);
          defer.resolve(res);
        }
      });
      return defer.promise;
  };

  //translates a measurement with formed noun (singular/plural) units
  //use: measurements that contain a number and a formed noun 
  //  example: 1 gram, 500 grams
  //  example: 1 person, 2 people
  //  example: 1 hour, 2 hours
  //  example: 1 beer, 2 beers
  //arguments:
  //  singular: translation key for singulat form of the noun/unit
  //  plural: translation key for plural form of the noun/unit
  //return promise until translations are resolved    
  self.measurement = function (number, singular, plural) {
    //$log.debug('requesting measurement '+number+' '+singular+' '+plural);  
    var defer = $q.defer();
    $q.when(self.translations).then(function () {
      //$log.debug('translation resolved');  
      if (angular.isUndefined(number) || angular.isUndefined(singular) || angular.isUndefined(plural)) {
          defer.reject('measurement input validation failed');
      }
      $q.when(self.formNoun(number, singular, plural)).then(function(noun) {
          //$log.debug('measurement formNoun '+number+' '+singular+' '+plural+' resolved to '+noun);
          defer.resolve(number+' '+noun);
      });
    });
    return defer.promise;
  };

  //creates a comma seperated list of translated items, with last item joined by conjective add translation
  //argument items should be an array of strings
  self.list = function (items) {
      var defer = $q.defer();
      $q.when(translations).then(function () {
          var strings = _.map(items, function (item) {
              var translation = translations[item];
              return angular.isDefined(translation) ? translation : item;
          });

          var firstString = _.first(strings);

          var midString = '';
          var lastString = '';
          if (items.length > 1) {
              var midStrings = strings.slice(1, -1);
              midString = _.reduce(midStrings, function (memo, str) {
                  return memo + ', ' + str;
              }, '');
              lastString = ' ' + translations.AND + ' ' + _.last(strings);
          }

          defer.resolve(firstString + midString + lastString);
      });
      return defer.promise;
  };

  self.getTranslation = function(key) {
      var deferred = $q.defer();
      $q.when(translations).then(function () {
          deferred.resolve(translations[key]);
      });
      return deferred.promise;
  };

  //init language service
  //$log.debug('init language service');
  var deferred = $q.defer();
  self.translations = deferred.promise;
}]);

//translates collections and keys in the loaded language
expertBoxLanguage.filter('translated', ['$log', '_', 'ebLanguage', '$q', 
                                        function ($log, _, ebLanguage, $q) {
    var filterFn = function (items) {
        //$log.debug('translated filter not available yet');
        return undefined;
    };

    $q.when(ebLanguage.translations).then(function (translations) {
        //$log.debug('translated filter is available');
        filterFn = function (items) {
            //$log.debug('using translated filter');
            if (_.isArray(items) || _.isObject(items)) {
                //$log.debug('translated filter: array or object');
                return _.map(items, function (item) {
                    return translations[item];
                });
            }
            else if (_.isString(items)) {
                //$log.debug('translated filter: string');
                var item = items;
                return translations[item];
            }
            else
                return items;
        };
    });

    return function (items) {
        return filterFn(items);
    };
}]);