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
      var authOrgUrl = apiUrl+'/user/orgs'+tokenUrl;
      console.log(tokenUrl)
      // var authAddUserUrl = apiUrl+'/user/match/collaborators'+tokenUrl;
      // var authCommitsUrl = apiUrl+'/user/match/collaborators'+tokenUrl;

      //get orgs then display on page
      //on org click,  
      // get org members -> array

      // get members' repos. promise all
      // get repos langs. promise all
      var getOrgs = function(authOrgUrl) {
        //returns array of org objects
        return new Promise(function(resolve, reject) {
          $.ajax({
          url: authOrgUrl,
          type: 'GET',
          // data: {'sort': 'updated', 'per_page': 10},
          success: function(result) {
            return resolve(result);
          }
        })});
      };
      // getOrgs(authOrgUrl).then(function(output) {
      //   console.log(output);
      // });
      getMembers = function(orgName) {
        // returns array of user objects
        return new Promise(function(resolve, reject) {
          $.ajax({
            url: apiUrl+'/orgs/'+orgName+'/members',
            type: 'GET',
            // data: {'sort': 'updated', 'per_page': 10},
            success: function(result) {
              return resolve(result);
            }
          });
        });
      };

      var getRepos = function (authRepoUrl){
        //get array of repo objects from github
        return new Promise(function(resolve, reject) {
          $.ajax({
            url: authRepoUrl,
            type: 'GET',
            data: {'sort': 'updated', 'per_page': 3}, ///CHANGE RESULTS NUMBER
            success: function(result) {
              return resolve(result);
            }
          });
        });
      };

      var getReposLanguages = function(repos) {
        // this is for authenticated users
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

      //process and display information about repos
    var processRepos = function(repos) {
      console.log(repos)
      //turn object into array then sort array
      var sortObject = function(object) {
        var array = [];
        for(var j in object) {
          array.push([ j,object[j] ])
        }
        array.sort(function(a,b) {return b[1]-a[1] });
        return array;
      };

      //calculate the total bytes of code for the languages in all repos
      var ReposTotalSizes = function(repos){
        var sizes = function(repos) {
          var totals = {};
          repos.forEach(function(repo){
            var languages = repo.languages;
            Object.keys(languages).forEach(function(lang){
              totals[lang] = totals[lang]? totals[lang] + languages[lang] : languages[lang];
            });
          });
          return totals;
        };
        
        //display bytes of code for the languages in all repos
        var displaySizes = function(totals) {
          var reposLanguages = sortObject(totals);
          var output = '<ul class="list-group totalLanguages"> ';
          // output += '<div class=username>'+
          for(var i in reposLanguages) {
            output += '<li class="list-group-item">'+reposLanguages[i][0]+':'+'<span class="badge">'+Math.round(reposLanguages[i][1]/1000)+'</span>'+'</li>';
          };
          output+='</ul>';
          $('.reposLanguages').append(output);
        };
        var totals = sizes(repos);
        displaySizes(totals);
      }(repos); 


      // repos.forEach(parseRepo);
    };

      var getMembersRepos = function(members) {
        for(var i=0; i<members.length; i++) {
          var member = members[i];
          var gravatarUrl = member.avatar_url;
          var memberName = member.login;
          var reposUrl = member.repos_url;
          console.log(gravatarUrl, memberName)
          getRepos(reposUrl)
          .then(getReposLanguages)
          .then(processRepos)
          // .then(function(output){
          //   console.log(output);
          // });
        }
      }; 

      getMembers('hackreactor').then(getMembersRepos);
      // var getMembersRepos = function(members) {
      //   return Promise.all(members.map(function(member) {
      //     var reposUrl = members.repos_url;
      //     $.ajax({
      //       url: reposUrl,
      //       type: 'GET',
      //       data: {'sort': 'updated', 'per_page': 10},
      //       success: function(result) {
      //         return resolve(result);
      //       }
      //     });
      //   }));
      // };

      
      //  var getMembersRepos = function(members) {
      //   return Promise.all(members.map(function(member) {
      //     var reposUrl = members.repos_url;
      //     $.ajax({
      //       url: reposUrl,
      //       type: 'GET',
      //       data: {'sort': 'updated', 'per_page': 3},
      //       success: function(result) {
      //         return resolve(result);
      //       }
      //     });
      //   }));
      // };
      

      // var getReposLanguages = function(repos) {
      //   // this is for authenticated users
      //   return Promise.all(repos.map(function(repo) {
      //     return $.ajax({
      //       url: repo.languages_url+tokenUrl,
      //       type: 'GET'
      //     })
      //   })).then(function(languages) {
      //     for(var i = 0; i<repos.length; i++) {
      //       repos[i].languages = languages[i];
      //     };
      //     return repos;
      //   })
      // };

          // var getReposCommits = function(repos) {
      //   // /repos/:owner/:repo/stats/contributors
      //   var owner = repo.owner.login;
      //   var repoName = repo.name;
      //   $.ajax({
      //     url: authRepoUrl
      //     // url: apiUrl+'/'+'repos/'+owner+'/'+repoName+'/'+'stats/contributors',
      //     type: 'GET',
      //     data: {'sort': 'updated', 'per_page': 10},
      //     success: function(result) {
      //       return console.log(result);
      //     }
      //   })
      // };


      // get the bytes of code of the languages in each repo
      // var getReposLanguages = function(repos) {
      //   return Promise.all(repos.map(function(repo) {
      //     return $.ajax({
      //       url: repo.languages_url+tokenUrl,
      //       type: 'GET'
      //     })
      //   })).then(function(languages) {
      //     for(var i = 0; i<repos.length; i++) {
      //       repos[i].languages = languages[i];
      //     };
      //     return repos;
      //   })
      // };

      // getRepos(authRepoUrl).then(getReposLanguages).then(function(output) {
      //   console.log(output);
      // });

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
    



 


