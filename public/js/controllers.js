function MainController($scope, innergerbil, $q) {
  var partyContactDetails;
  var promises = [];
  var baseUrl = 'https://inner-gerbil-test.herokuapp.com';
  // TODO: client of innergerbil service should not know root URL

  //innergerbil.getListResourcePaged("http://localhost:5000/parties", {
  promises.push(innergerbil.getResource(baseUrl + '/me', {}));
  //promises.push(innergerbil.getListResourcePaged(baseUrl + '/contactdetails', {
  //  forDescendantsOfParties: groupParty,
  //  public: true
  //}));

  $scope.baseUrl = baseUrl;
  return $q.all(promises).then(function (results) {
    $scope.me = results[0];
    //partyContactDetails = results[1].results;
    //addContactDetailsToParties($scope.members, partyContactDetails);
    //splitContactDetails($scope.members);
    console.log($scope.me); // eslint-disable-line
  });
};

angular
    .module('inspinia')
    .controller('MainController', MainController)
    .controller('MembersController', MembersController)
    .controller('ProfileController', ProfileController)
    .controller('TransactionsController', TransactionsController)
    .controller('EventsController', EventsController);

function addContactDetailsToParties(parties, contactdetails) {
  'use strict';
  var permalinkToParty = {};

  parties.forEach(function (party) {
    permalinkToParty[party.$$meta.permalink] = party;
  });

  contactdetails.forEach(function (contactdetail) {
    contactdetail.$$parties.forEach(function (party) {
      if (!permalinkToParty[party.href].$$contactdetails) {
        permalinkToParty[party.href].$$contactdetails = [];
      }
      permalinkToParty[party.href].$$contactdetails.push(contactdetail);
    });
  });
}

function addPartiesToTransactions(transactions, parties) {
  'use strict';
  var permalinkToParty = {};

  parties.forEach(function (party) {
    permalinkToParty[party.$$meta.permalink] = party;
  });

  transactions.forEach(function (transaction) {
    transaction.from = permalinkToParty[transaction.from.href];
    transaction.to = permalinkToParty[transaction.to.href];
  });
}

function splitContactDetails(parties) {
  'use strict';
  parties.forEach(function (party) {
    if (party.$$contactdetails) {
      party.$$contactdetails.forEach(function (detail) {
        if (detail.type === 'address') {
          if (!party.$$addresses) {
            party.$$addresses = [];
          }
          party.$$addresses.push(detail);
        } else if (detail.type === 'email') {
          if (!party.$$emails) {
            party.$$emails = [];
          }
          party.$$emails.push(detail);
        } else if (detail.type === 'phone') {
          if (!party.$$phones) {
            party.$$phones = [];
          }
          party.$$phones.push(detail);
        }
      });
    }
  });
}

//TODO : move to seperate file/project
angular.module('inspinia').factory('innergerbilDummy', [function () {
  var that = {};

  that.getDummyData = function () {
    var members = [
      {
        name: 'Steve Buytinck',
        imageurl: 'img/a2.jpg'
    },
      {
        name: 'Alex De Smedt',
        imageurl: 'img/a1.jpg'
    },
      {
        name: 'Nathalie Gols',
        imageurl: 'img/a5.jpg'
      }
    ];

    return members;
  };

  return that;
}])

angular.module('inspinia').factory('innergerbil', ['$http', '$q', function ($http, $q) {
  var that = {};

  var generateGUID = function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
  };

  /* Retrieve a single resource */
  that.getResource = function (url, params, cancelPromise) {
    params = params || {};
    var d = $q.defer();
    $http({
      method: "GET",
      url: url,
      params: params,
      withCredentials: true,
      cache: true,
      timeout: cancelPromise
  }).success(function (resp) {
    //hrefToResource[resp.$$meta.permalink];
    hrefToResource[resp.permalink];
    d.resolve(resp);
    }).error(function (error) {
      //if (error.status === 403) {
      //  $notification.error('Geen Rechten', 'U hebt onvoldoende rechten tot ' + url);
      //} else if (error.status === 404) {
      //  $notification.error('Niet gevonden', url + ' kon niet worden gevonden');
      //} else if (error.status === 500) {
      //  $notification.error('Connectie Probleem', 'Er is een interne fout opgetreden op de server van ' + url);
      //} else if (error.status === 502 || error.status === 504) {
      //  $notification.error('Connectie Probleem', 'De server van ' + url + ' is niet beschikbaar.');
      //} else {
      //  $notification.error('Connectie Probleem', 'Er is een probleem met de VSKO-services voor ' + url);
      //}
      d.reject(error);
    });
    return d.promise;
  };

  var getAllFromResults = function (data) {
    var defer = $q.defer();
    var results = [];
    for (var i = 0; i < data.results.length; i++) {
      results.push(data.results[i].$$expanded);
    }

    if (data.$$meta.next) {
      that.getResource(data.$$meta.next).then(function (next) {
        getAllFromResults(next).then(function (next_results) {
          results = results.concat(next_results);
          defer.resolve(results);
        });
      }, function (error) {
        // TODO : Error notification to the user ?
        // or send to /log...
        defer.reject(error);
      });
    } else {
      defer.resolve(results);
    }

    return defer.promise;
  };

  /* Retrieve a list resource (single page)
  that.getListResource = function (url, params, cancelPromise) {
      var d = $q.defer();
      $http({
          method: "GET",
          url: url,
          params: params,
          cache: true,
          timeout: cancelPromise
      }).success(function(resp) {
              var results = [];
              for(var i = 0; i < resp.results.length; i++) {
                  results.push(resp.results[i].$$expanded);
              }
              d.resolve({results: results, meta: resp.$$meta});
          }).error(function(error) {
              // TODO : Error to the user ? Or /log
              if(error.status === 403) {
                  $notification.error('Geen Rechten', 'U hebt onvoldoende rechten tot '+url);
              } else if(error.status === 404) {
                  $notification.error('Niet gevonden', href+' kon niet worden gevonden');
              } else if(error.status === 500) {
                  $notification.error('Connectie Probleem', 'Er is een interne fout opgetreden op de server van '+url);
              } else if(error.status === 502 || error.status === 504){
                  $notification.error('Connectie Probleem', 'De server van '+url+' is niet beschikbaar.');
              } else {
                  $notification.error('Connectie Probleem', 'Er is een probleem met de VSKO-services voor '+url);
              }
              d.reject(error);
          });
      return d.promise;
  };*/

  /* Retrieve a list resource, perform paging to get all pages */
  that.getListResourcePaged = function (url, params, cancelPromise) {
    var d = $q.defer();
    $http({
      method: "GET",
      url: url,
      params: params,
      withCredentials: true,
      cache: true,
      timeout: cancelPromise
    }).success(function (resp) {
      getAllFromResults(resp).then(function (allResults) {
        // Add individual resources to resource cache.
        angular.forEach(allResults, function (element) {
          if (element.$$meta && element.$$meta.permalink) {
            hrefToResource[element.$$meta.permalink] = element;
          }
        });
        d.resolve({ results: allResults, meta: resp.$$meta });
      });
    }).error(function (error) {
      // TODO : Error to the user ? or /log ? Or generic message + /log
      //if (error.status === 403) {
      //  $notification.error('Geen Rechten', 'U hebt onvoldoende rechten tot ' + url);
      //} else if (error.status === 404) {
      //  $notification.error('Niet gevonden', url + ' kon niet worden gevonden');
      //} else if (error.status === 500) {
      //  $notification.error('Connectie Probleem', 'Er is een interne fout opgetreden op de server van ' + url);
      //} else if (error.status === 502 || error.status === 504) {
      //  $notification.error('Connectie Probleem', 'De server van ' + url + ' is niet beschikbaar.');
      //} else {
      //  $notification.error('Connectie Probleem', 'Er is een probleem met de VSKO-services voor ' + url);
      //}
      d.reject(error);
    });

    return d.promise;
  };

  that.createOrUpdateResource = function (type, resource) {
    var defer = $q.defer();
    var url;
    if (resource.$$meta && resource.$$meta.permalink) {
      url = resource.$$meta.permalink;
    } else {
      url = '/' + type + '/' + generateGUID();
    }

    $http({
      method: 'PUT',
      url: url,
      data: resource,
      contentType: 'application/json',
      dataType: 'json'
    }).success(function (data, status) {
      var resp = {
        status: status
      };

      // Remove from expand cache.
      delete hrefToResource[url];

      defer.resolve(resp);
    }).error(function (error) {
      cl("createOrUpdateResource failed, rejecting promise.");
      // TODO : Root error, send to /log + message to the user...
      defer.reject(error);
    });

    return defer.promise;
  };

  that.updateResource = function (resource) {
    var defer = $q.defer();

    $http({
      method: 'PUT',
      url: resource.$$meta.permalink,
      data: resource,
      contentType: 'application/json',
      dataType: 'json'
    }).success(function (data, status) {
      var resp = {
        status: status
      };

      // Remove from expand cache.
      delete hrefToResource[resource.$$meta.permalink];

      defer.resolve(resp);
    }).error(function (resp) {
      defer.reject(resp);
    });

    return defer.promise;
  };

  that.deleteResource = function (resource) {
    var defer = $q.defer();

    $http({
      method: 'DELETE',
      url: resource.$$meta.permalink
    }).success(function (data, status) {
      var resp = {
        status: status
      };

      // Remove from expand cache.
      delete hrefToResource[resource.$$meta.permalink];

      defer.resolve(resp);
    }).error(function (resp) {
      var resp = {
        status: status
      };
      defer.reject(resp);
    });

    return defer.promise;
  };

  that.batch = function (batch) {
    var defer = $q.defer();

    $http({
      method: 'PUT',
      url: '/batch',
      data: batch,
      contentType: 'application/json',
      dataType: 'json'
    }).success(function (data, status) {
      var resp = {
        status: status
      };

      // Remove from expand cache.
      for (var i = 0; i < batch.length; i++) {
        delete hrefToResource[batch[i].href];
      }

      defer.resolve(resp);
    }).error(function (resp) {
      var resp = {
        status: status
      };
      defer.reject(resp);
    });

    return defer.promise;
  };

  var toArray = function (list) {
    var ret = {};

    angular.forEach(list.results, function (value, key) {
      ret[value.$$meta.href] = value;
    });

    return ret;
  };

  var hrefToResource = {};

  expandOne = function (resource, key) {
    var defer = $q.defer();

    var cached = hrefToResource[resource[key].href];
    if (!cached) {
      that.getResource(resource[key].href)
          .then(function (data) {
            resource[key].$$expanded = data;
            hrefToResource[resource[key].href] = data;
            defer.resolve(resource);
          }, function (error) {
            // TODO
          });
    } else {
      resource[key].$$expanded = cached;
      defer.resolve(resource);
    }

    return defer.promise;
  };

  // Do client-side expansion (with local caching) on a list of resources, for one or more keys.
  that.expand = function (resources, keys) {
    var promises = [];

    if (!(resources instanceof Array)) {
      resources = [resources];
    }

    if (!(keys instanceof Array)) {
      keys = [keys];
    }

    angular.forEach(resources, function (resource) {
      angular.forEach(keys, function (key) {
        promises.push(expandOne(resource, key));
      });
    });

    return $q.all(promises);
  };

  return that;
}]);