const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

function fetchUsers() {

    return fetchData(`${ BASE_URL }/users`)
  }



function renderUser(user) {
                
    const cardUser= $(`
    
    <div class="user-card">
    <header>
        <h2>${user.name}</h2>
    </header>
    <section class="company-info">
        <p><b>Contact:</b> ${user.email}</p>
        <p><b>Works for:</b> ${user.company.name}</p>
        <p><b>Company creed:</b> "${user.company.catchPhrase}, which will ${user.company.bs}!"</p>
    </section>
    <footer>
        <button class="load-posts">POSTS BY ${user.username}</button>
        <button class="load-albums">ALBUMS BY ${user.username}</button>
    </footer>
  </div>`);
 
  cardUser.data('user', user);

  return cardUser
}

function renderUserList(userList) {
    $('#user-list').empty();
    userList.forEach(function(user){
      
      let div = renderUser(user);

            
      $('#user-list').append(div);
  
      
    })
}

$('#user-list').on('click', '.user-card .load-posts', function () {     

    const forPost = $(this).closest('.user-card').data('user');

    fetchUserPosts(forPost.id).then(renderPostList)
  });
  
  $('#user-list').on('click', '.user-card .load-albums', function () {      

    // load albums for this user
    // render albums for this user

    const forAlbum = $(this).closest('.user-card').data('user')
    
    fetchUserAlbumList(forAlbum.id).then(renderAlbumList);

  });


// ------------------------------------------------------------//
  function fetchUserAlbumList(userId) {
    // convert from JSON to an object, and return
    return fetchData(`${ BASE_URL }/users/${userId}/albums?_expand=user&_embed=photos`)
  }
  
  /* render a single album */
  function renderAlbum(album) {

      const cardAlbum = $(`
      <div class="album-card">
        <header>
          <h3>${album.title}, by ${album.user.username} </h3>
        </header>
        <section class="photo-list">

        </section>
      </div>
          `)
        
        const photoAlbum = cardAlbum.find('.photo-list');

      album.photos.forEach(function(photo){
        let div = renderPhoto(photo);

        photoAlbum.append(renderPhoto(photo));
      })

      return cardAlbum
  }
  

  /* render a single photo */
  function renderPhoto(photo) {
    const snapPic = $(`
    <div class="photo-card">
    <a href="${photo.url}" target="_blank">
      <img src="${photo.thumbnailUrl}">
      <figure>${photo.title}</figure>
    </a>
  </div> `);
  
    return snapPic

}
  
  /* render an array of albums */
  function renderAlbumList(albumList) {

    $('#app section.active').removeClass('active')
    
    $('#album-list').empty()
    $('#album-list').addClass('active')
    

    albumList.forEach(function(album){
      let dab = renderAlbum(album)

      $('#album-list').append(dab)
    })
  }


function fetchData(url){
  return fetch(url).then(function(response){
    return response.json()
  }).catch(function(error){
    console.error(error)
  })
}

// ------------------------------------------------------------//

function fetchUserPosts(userId) {
  return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
}

function fetchPostComments(postId) {
  return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);
}


function setCommentsOnPost(post) {

  // if we already have comments, don't fetch them again
  if (post.comments) {
    // #1: Something goes here
    
    return Promise.reject(null)
  }

  // fetch, upgrade the post object, then return it
  return fetchPostComments(post.id)
    .then(function (comments) {

    // #2: Something goes here
    post.comments = comments;
    return post
  }) 
}


function renderPost(post) {

const forPost = $(`
  <div class="post-card">
  <header>
    <h3>${post.title}</h3>
    <h3>--- ${post.user.username}</h3>
  </header>
  <p>${post.body}</p>
  <footer>
    <div class="comment-list"></div>
    <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
  </footer>
</div>
`)
  forPost.data('post', post)
  return forPost

}

function renderPostList(postList) {

  $('#app section.active').removeClass('active');
  $('#post-list').empty()
  $('#post-list').addClass('active')

  postList.forEach(function(post){
    let glide = renderPost(post);

    $('#post-list').append(glide)



});

}


function toggleComments(postCardElement) {
  const footerElement = postCardElement.find('footer');

  if (footerElement.hasClass('comments-open')) {
    footerElement.removeClass('comments-open');
    footerElement.find('.verb').text('show');
  } else {
    footerElement.addClass('comments-open');
    footerElement.find('.verb').text('hide');
  }
}



$('#post-list').on('click', '.post-card .toggle-comments', function () {
  const postCardElement = $(this).closest('.post-card');
  const post = postCardElement.data('post');
  

  
  setCommentsOnPost(post)
    .then(function (post) {

      const bar = postCardElement.find('.comment-list')
      $(bar).empty()

      post.comments.forEach(function(comment){
        $(bar).append(`<h3> ${comment.body} --- ${comment.email}</h3>`)
      })

     console.log('building comments for the first time...', post);
      
     toggleComments(postCardElement)
    })

    .catch(function () {

      toggleComments(postCardElement)

      console.log('comments previously existed, only toggling...', post);
    });

});

// ------------------------------------------------------------//
function bootstrap(){
    fetchUsers().then(renderUserList);
}

bootstrap();
