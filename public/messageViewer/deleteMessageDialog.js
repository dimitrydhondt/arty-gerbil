function DeleteMessageDialogController ($scope, $uibModalInstance, message, messages, baseUrl, innergerbil, toaster) {
  $scope.message = message;
  $scope.messages = messages;
  $scope.baseUrl = baseUrl;

  $scope.ok = function () {
    return innergerbil.deleteResource($scope.baseUrl, $scope.message).then(function (response) {
      if(response.statusCode === 200) {
        $scope.messages.splice($scope.messages.indexOf(message), 1);
        $uibModalInstance.close();
        toaster.pop('success', 'Bericht verwijderd', 'Je bericht is correct verwijderd.');
      } else {
        console.error('Delete failed : status code ' + response.statusCode);
      }
    }).catch(function (response) {
      console.error('Unable to delete item ' + message.$$meta.permalink + '. statusCode: ' + response.statusCode);
    });

  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}

function openDeleteMessageDialog($uibModal, baseUrl, message, messages) {
  var modalInstance = $uibModal.open({
    animation: true,
    templateUrl: 'messageViewer/deleteMessageDialog.html',
    controller: 'DeleteMessageDialogController',
    size: 200,
    resolve: {
      message: function () {
        return message;
      },
      baseUrl: function () {
        return baseUrl;
      },
      messages: function () {
        return messages;
      }
    }
  });
}