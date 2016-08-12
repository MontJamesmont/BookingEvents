var app=angular.module('app',['ngStorage']);

app.controller('loginController',['$scope', '$window', '$http', '$location', '$localStorage', function($scope, $window, $http, $location,$localStorage){
$scope.$storage = $localStorage;
$scope.counts=[];
$scope.usel={};
$scope.tab=0;
$scope.incorrectLogin=false;
$scope.setTab = function (nr) {
    $scope.tab=nr;
}
$scope.isSelectedTab = function (nr) {
    return $scope.tab===nr;
}
$scope.loginUser = function () {
	$http.post('http://localhost:3000/user/login', { login: $scope.login, pass: $scope.pass })
        .success(function (response) {			
		if(response.status === "logged"){
			$scope.$storage.login = $scope.login;
			$window.location.href = 'http://localhost:3000/booking';
		}
		else $scope.incorrectLogin=true;
        })
        .error(function (data, status, headers, config) {
		console.log("error");
        });
};
$scope.signUpUser = function () {
	$scope.usel={
		"login": $scope.login2,
		"pass": $scope.pass2
	}
	if($scope.usel.login.length>0 && $scope.usel.pass.length>0){
		$http.post('http://localhost:3000/user/create',$scope.usel)
		.success(function (response) {
			console.log("succed");			
			$window.location.href = 'http://localhost:3000/';
		})
		.error(function (data, status, headers, config) {
			console.log("error");
		});
	}
};
}]);

app.controller('bookingController',['$scope', '$window','$rootScope', '$http', '$location', '$localStorage', function($scope, $window, $rootScope, $http, $location, $localStorage){
$scope.$storage = $localStorage;
$scope.counts = [];
$scope.products = [];
$scope.booki={};
$http.get('http://localhost:3000/event/list')
        .success(function (response) {
		console.log("response: "+response);
		$scope.products = response;
		console.log($scope.products[0].name);
        })
        .error(function (data, status, headers, config) {
		console.log("error");
        });
$scope.czyZamow=false;
$scope.book = function () {
    $scope.products.forEach(function(event, index){
	if(index<$scope.counts.length && $scope.counts[index]>0){
		$scope.czyZamow=true;
		var Id=event._id;
		$scope.booki={
		"userName" : $scope.$storage.login,
		"eventId":event._id,
		"count":$scope.counts[index],
		"sum":$scope.counts[index]*event.cena
		}
			$http.post('http://localhost:3000/booking/create', JSON.stringify($scope.booki))
			.success(function (response) {
				console.log($scope.booki.userName);
				console.log("succes");			        })
			.error(function (data, status, headers, config) {
				console.log("error");
			});
	}else console.log("else");
    });
    $window.location.href = 'http://localhost:3000/booked';
};
}]);

app.controller('bookedController',['$scope', '$rootScope', '$http', '$location', '$localStorage', function($scope, $rootScope, $http, $location, $localStorage){
$scope.$storage = $localStorage;
$scope.products = [];
$scope.getEvents = function (){
   $scope.products.forEach(function(product, index){
	$http.get('http://localhost:3000/event/read/'+product.eventId)
	.success(function (response) {
		$scope.products[index].name=response.name;
		$scope.products[index].date=response.date;	
		$scope.products[index].miejsce=response.miejsce;
		$scope.products[index].cena=response.cena;
	})
	.error(function (data, status, headers, config) {
		console.log("error");
	});
  });
}
$http.get('http://localhost:3000/booking/list/' + $scope.$storage.login)
        .success(function (response) {
		$scope.products = response;
		$scope.getEvents();
        })
        .error(function (data, status, headers, config) {
		console.log("error");
        });
}]);

