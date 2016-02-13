﻿function MembersController($scope, innergerbil, $q) {
  var partyContactDetails;
  var promises = [];
  var groupParty = '/parties/8bf649b4-c50a-4ee9-9b02-877aa0a71849';
  var baseUrl = 'https://inner-gerbil-test.herokuapp.com';
  // TODO: client of innergerbil service should not know root URL
  // TODO: use "me" as party in call to forDescendantsOfParties

  //innergerbil.getListResourcePaged("http://localhost:5000/parties", {
  promises.push(innergerbil.getListResourcePaged('https://inner-gerbil-test.herokuapp.com/parties', {
    descendantsOfParties: groupParty,
    type: 'person'
  }));
  promises.push(innergerbil.getListResourcePaged('https://inner-gerbil-test.herokuapp.com/contactdetails', {
    forDescendantsOfParties: groupParty,
    public: true
  }));

  $q.all(promises).then(function (results) {
    $scope.members = results[0].results;
    partyContactDetails = results[1].results;
    addContactDetailsToParties($scope.members, partyContactDetails);
    splitContactDetails($scope.members);
    console.log($scope.members); // eslint-disable-line
  });
}
