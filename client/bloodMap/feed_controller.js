app.controller('FeedController', function($scope, Feed) {
  let FeedCtrl = this;
  FeedCtrl.posts = [];

  setTimeout(() => {
    Feed.get($scope.bounds.H.H, $scope.bounds.j.j, $scope.bounds.H.j, $scope.bounds.j.H).then(posts => FeedCtrl.posts = posts);
  }, 1000);

  let updatePosts = () => {
    let lastUpdated = FeedCtrl.posts.length ? FeedCtrl.posts[0].createdAt : 0;
    Feed.get($scope.minLat, $scope.minLong, $scope.maxLat, $scope.maxLong, lastUpdated)
    .then(posts => FeedCtrl.posts = posts.concat(FeedCtrl.posts));
  };
  setInterval(updatePosts, 5000);

  FeedCtrl.submit = () => {
    Feed.submit(FeedCtrl.content, {latitude: $scope.latitude, longitude: $scope.longitude});
    updatePosts();
  };
});