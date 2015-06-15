$('document').ready(function() {
  //Initialization of Oauth.io


  var Oauth = (function(){
    //oauth.io authentication
    OAuth.initialize('j3Fkckg36uZb1WJypdFhT9e6BPU', {cache: true});
    //if the user is already signed in, run the main scripts
    if (OAuth.create('github')) {
      doEverything();
    } else {
        //display sign in form
        $('#createRepo, #addUser, #listRepos, #languages').hide();
        $('.signIn').on('click', doEverything);
    }  
  })();

  //after login
  function doEverything() {
    OAuth.popup('github', {cache: true}, function (error, result) {

      //console.log(error);

      $('.signIn').hide();
      $('#createRepo, #addUser, #listRepos, #languages').show();     

      //urls used in API calls. 
      var apiUrl = "https://api.github.com";
      var access_token = result.access_token;
      var tokenUrl ='?access_token='+access_token;
      var userUrl = apiUrl+'/user'+tokenUrl;
      var authRepoUrl = apiUrl+'/user/repos'+tokenUrl;
      var authAddUserUrl = apiUrl+'/user/match/collaborators'+tokenUrl;

      //get array of repo objects from github
      var getRepos = function (authRepoUrl){
        return $.ajax({
          url: authRepoUrl,
          type: 'GET',
          data: {'sort': 'updated', 'per_page': 100},
        });
      };

      // get the bytes of code of the languages in each repo
      var getReposLanguages = function(repos) {
        return Promise.all(repos.map(function(repo) {
          return $.ajax({
            url: repo.languages_url+tokenUrl,
            type: 'GET'
          })
        })).then(function(languages) {
          for(var i = 0; i<repos.length; i++) {
            repos[i].languages = languages[i];
          };
          return repos;
        })
      };

      getRepos(authRepoUrl).then(getReposLanguages).then(function(output) {
        console.log(output);
      });

    });
  };
});
  

    //   //process and display information about repos
    //   var processRepos = function(repos) {

    //     //turn object into array then sort array
    //     var sortObject = function(object) {
    //       var array = [];
    //       for(var j in object) {
    //         array.push([ j,object[j] ])
    //       }
    //       array.sort(function(a,b) {return b[1]-a[1] });
    //       return array;
    //     };

    //     //calculate the total bytes of code for the languages in all repos
    //     var ReposTotalSizes = function(repos){
    //       var sizes = function(repos) {
    //         var totals = {};
    //         repos.forEach(function(repo){
    //           var languages = repo.languages;
    //           Object.keys(languages).forEach(function(lang){
    //             totals[lang] = totals[lang]? totals[lang] + languages[lang] : languages[lang];
    //           });
    //         });
    //         return totals;
    //       };
          
    //       //display bytes of code for the languages in all repos
    //       var displaySizes = function(totals) {
    //         var reposLanguages = sortObject(totals);
    //         var output = '<ul class="list-group totalLanguages"> ';
    //         for(var i in reposLanguages) {
    //           output += '<li class="list-group-item">'+reposLanguages[i][0]+':'+'<span class="badge">'+Math.round(reposLanguages[i][1]/1000)+'</span>'+'</li>';
    //         };
    //         output+='</ul>';
    //         $('.reposLanguages').append(output);
    //       };
    //       var totals = sizes(repos);
    //       displaySizes(totals);
    //     }(repos); 

    //     //format the repos into panels and display them
    //     var parseRepo = function(repo){
          
    //       //display formatted repo html on the page
    //       var render = function(htmlString) {
    //         $('.repos').append(htmlString);
    //       };

    //       //count total bytes of code for languages in each repo. Argument is github object of languages
    //       var repoBytes = function(repoLangs) {
    //         var totalBytes=0;
    //         for(key in repoLangs) {
    //           //console.log(repoLangs[key]);
    //           totalBytes += repoLangs[key];
    //         };
    //         return totalBytes;
    //       };
          
    //       //format html.
    //       var output = '<div class="col-md-2">';
    //       output += '<div class="panel panel-default">';
    //       output += '<div class="panel-heading">';
    //       output += '<label class="btn btn-primary"> <input type="checkbox" id=' + repo.name + '></label> ';//checkbox
    //       output += '<a href=' + repo.html_url + ' target="_blank" class="'+repo.name+'">' + repo.name + '</a>';
    //       output += '</div>'

    //       output += '<div class="panel-body">';
    //       output += '<ul class="list-group languages">';        
          
    //       //calculate the languages' percentage of it's repo's total byte size
    //       var langArray = sortObject(repo.languages);
    //       for (var i =0;i< langArray.length ;i++) {
    //         var languagePercentage = Math.round(langArray[i][1]/repoBytes(repo.languages)*100)
    //         output += '<li class="list-group-item language">' + langArray[i][0] + ':  ' + '<span class="badge">'+languagePercentage+'%'+'</span>' + '</li>'; 
    //       };
    //       output += '</ul>';
    //       output += '</div>';
    //       output += '</div>';
    //       output += '</div>';

    //       //display formatted html
    //       render(output);
    //     };

    //     repos.forEach(parseRepo);
    //   }

    //   getRepos(authRepoUrl).then(getReposLanguages).then(processRepos);
      
    //   //create and diaplay new repo
    //   var createRepo = function(authRepoUrl) {
    //     //POST new repo to github
    //     var postRepo = function(repoName) {
    //       return $$.ajax({
    //         url: authRepoUrl,
    //         type: 'POST',
    //         data:{'name': repoName}
    //       })
    //     };

    //     //display new repo
    //     var renderRepo = function(repo) {
    //        //format html.
    //       var output = '<div class="col-md-2">';
    //       output += '<div class="panel panel-default">';
    //       output += '<div class="panel-heading">';
    //       output += '<label class="btn btn-primary"> <input type="checkbox" id=' + repo.name + '></label> ';//checkbox
    //       output += '<a href=' + repo.html_url + ' target="_blank" class="'+repo.name+'">' + repo.name + '</a>';
    //       output += '</div>'

    //       output += '<div class="panel-body">';

    //       output += '</div>';
    //       output += '</div>';
    //       output += '</div>';

    //       $$('.repos').prepend(output);
    //     };
        
    //     $$('.create').on('click', function() {
    //       event.preventDefault();
    //       var repoName = $$('.repoName').val();
    //       postRepo(repoName).then(renderRepo)
    //     }); 
    //   }(authRepoUrl);
    //   //when create button is clicked, create a new repo and display it
          
    //   //add new collaborator to repo(s) and display user's gravatar    
    //   var collaborator = function() {  
    //     //add collaborator to repo(s)
    //     var addCollaborator = function(userAdded, repo) { 
    //       var postUser = function(userAdded, repo) {
    //         $$.ajax({
    //           url: userUrl,
    //           type: 'GET',
    //           success: function(user) {
    //             var addUserUrl = apiUrl + '/repos/' + user.login + '/' + repo + '/collaborators/' + userAdded + tokenUrl;
    //             $$.ajax({
    //               url: addUserUrl,
    //               type: 'PUT',
    //               success: function(response) {
    //                 getGravatar(userAdded);
    //               }
    //             });
    //           }
    //         });
    //       }(userAdded, repo);

    //       //get new collaborator's gravatar from github
    //       var getGravatar = function(userAdded) {
    //         var displayGravatar = function(userAdded) {
    //           var content = '<img src=' + userAdded.avatar_url + ' class="img-responsive img-circle" alt="user added">';
    //           var oldImg = $$('#' + repo).parent().parent().children('img');
    //           if(oldImg[0]){ oldImg.hide() };
    //           $$('.' + repo).after('<img src=' + userAdded.avatar_url + ' class="img-responsive img-circle" alt="user added">');  
    //         };
    //         $$.ajax({
    //           url: apiUrl + '/users/' + userAdded,
    //           type: 'GET',
    //           success: displayGravatar
    //         });  
    //       };
    //     };

    //     //when add button is clicked, add new user to repos
    //     $$('.add').on('click', function () {
    //       event.preventDefault();
    //       var repos = $$("input[type=checkbox]:checked");
    //       console.log(repos);
    //       if (repos.length == 0) {
    //         $$('.error').hide();
    //         $$('#userName').append('<div class="error">check the repos to which you want to add a collaborator</div>');
    //       } else {
    //         for (var i = 0; i < repos.length; i++) {
    //           $$('.error').hide();
    //           addCollaborator($$('.userName').val(), repos[i].id);
    //         }
    //       };
    //     });
    //   }();


