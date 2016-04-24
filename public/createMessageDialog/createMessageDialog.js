function CreateMessageDialogController ($scope, $uibModalInstance, innergerbil, toaster, baseUrl, from) {
  'use strict';
  $scope.from = from;
  $scope.baseUrl = baseUrl;
  $scope.title = '';
  $scope.description = '';

  $scope.ok = function () {
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

function openCreateMessageDialog ($uibModal, baseUrl, from) {
  var modalInstance = $uibModal.open({
    animation: true,
    templateUrl: 'createMessageDialog/createMessageDialog.html',
    controller: 'CreateMessageDialogController',
    size: 200,
    resolve: {
      baseUrl: function () {
        return baseUrl;
      },
      from: function () {
        return from;
      }
    }
  });
}
