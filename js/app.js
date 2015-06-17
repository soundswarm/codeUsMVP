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
        $('#languages, #filterForm, #organizations').hide();
        $('.signIn').on('click',doEverything);
    }  
  })();

  //after login
  function doEverything() {
   
    OAuth.popup('github', {cache: true})
    .done(function (result) {
      console.log(result);
      $('#organizations').show()
      $('.signIn, #filterForm, #languages').hide();

      //urls used in API calls. 
      var apiUrl = "https://api.github.com";
      var access_token = result.access_token;
      var tokenUrl ='?access_token='+access_token;
      var userUrl = apiUrl+'/user'+tokenUrl;
      var authRepoUrl = apiUrl+'/user/repos'+tokenUrl;
      var authOrgUrl = apiUrl+'/user/orgs'+tokenUrl;
      // var authAddUserUrl = apiUrl+'/user/match/collaborators'+tokenUrl;
      // var authCommitsUrl = apiUrl+'/user/match/collaborators'+tokenUrl;

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

      var displayOrgs= function(orgs) {
        // takes an array of organization objects
        // var html = '<ul>';
        var html='';
        var output = orgs.map(function(org) {
          return html += '<li class="list-group-item organization">' + org.login + '</li>';
        });

        $('#organizations').append(output);
        $('.organization').on('click', function(e) {
          e.preventDefault();
          $('#languages, #filterForm').show();   
          
          //get org members then display them

          getMembers($(this).text()).then(getMembersRepos);
          $('button').click(function(event){
            event.preventDefault();
            var input = $('input').val().toUpperCase();
            console.log(input)
            $('.member:not(:contains("'+input+'"))').hide()
          });
          $('input').keyup(function(event){
            $('.member').show();
            event.preventDefault();
            var input = $(this).val().toUpperCase();
            $('.member:not(:contains("'+input+'"))').hide()
          });          
        })
      }
      getOrgs(authOrgUrl).then(displayOrgs);


// cCHANGE NUM OF USERS RETRIEVED
      getOrgs(authOrgUrl).then(function(output) {
      });
      getMembers = function(orgName) {
        // returns array of user objects
        return new Promise(function(resolve, reject) {
          $.ajax({
            url: apiUrl+'/orgs/'+orgName+'/members'+tokenUrl,
            type: 'GET',
            data: {'per_page': 5},
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
            data: {'sort': 'updated', 'per_page': 5}, ///CHANGE RESULTS NUMBER
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
          var memberName = repos[0].owner.login;
          var gravatarUrl = repos[0].owner.avatar_url+tokenUrl;
          var memberUrl = repos[0].owner.html_url;
          var reposLanguages = sortObject(totals);
          var output = '<div class="list-group-item member">';
          output+= '<ul class="list-group totalLanguages"> ';
          output += '<img src='+gravatarUrl+' class="img-responsive img-circle" alt="user added">';
          output += '<div class=username>'+'<a target="_blank" href="'+memberUrl+'">'+memberName+'</a></div>';
          for(var i in reposLanguages) {
            output += '<li class="list-group-item">'+'<span class="language">'+reposLanguages[i][0].toUpperCase()+'</span>'+':'+'<span class="badge">'+Math.round(reposLanguages[i][1]/1000)+'</span>'+'</li>';
          };
          output+='</ul>';
          output+='</div>';
          $('.reposLanguages').append(output);
        };
        var totals = sizes(repos);
        displaySizes(totals);
      }(repos); 
    };

      var getMembersRepos = function(members) {
        for(var i=0; i<members.length; i++) {
          var member = members[i];
          var reposUrl = member.repos_url+tokenUrl;
          getRepos(reposUrl)
          .then(getReposLanguages)
          .then(processRepos)
        }
      };       
    });
  };
});
  

    



 


