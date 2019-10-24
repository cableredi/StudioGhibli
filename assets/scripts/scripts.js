"use strict"

/*****************
 * Format API parameters for call
 *****************/
function formatQueryParams(params) {
  console.log('Entering formatQueryParams');

  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

/*****************
 * Build STORE films with Studio Ghibli API film responses
 *****************/
function buildStoreGhibliFilm(responseJson) {
  console.log('Entering buildStoreGhibliFilm');

  for (let i = 0; i < responseJson.length; i++) {
    let film = {
      id: responseJson[i].id,
      title: responseJson[i].title,
      description: responseJson[i].description,
      rt_score: responseJson[i].rt_score,
      release_date: responseJson[i].release_date,
      locations: responseJson[i].locations,
      people: responseJson[i].people,
      species: responseJson[i].species,
      vehicles: responseJson[i].vehicles
    }

    STORE.films.push(film);
  };

  getMovieDbFilms();
}

/*****************
 * Build STORE films with Movie DB API film responses
 *****************/
function buildStoreMovieDb(responseJson) {
  console.log('Entering buildStoreMovieDb');

  for (let i = 0; i < responseJson.results.length; i++) {
    let result = STORE.films.findIndex(p => 
        ( p.title === responseJson.results[i].title ) && ( responseJson.results[i].genre_ids.indexOf(16) >= 0 )
    );

    if (result != -1) {
      STORE.films[result].poster_path = responseJson.results[i].poster_path;
      STORE.films[result].movieDbId = responseJson.results[i].id;
      STORE.films[result].backdrop_path = responseJson.results[i].backdrop_path;
      STORE.films[result].original_title = responseJson.results[i].original_title;
      STORE.films[result].release_date = responseJson.results[i].release_date;
      STORE.films[result].homepage = responseJson.results[i].homepage;
      STORE.films[result].backdrops = [];
      STORE.films[result].posters = [];

    } 
  }

  displayResultsHome();
}

/*****************
 * Build STORE films with Movie DB API individual film responses
 *****************/
function buildStoreMovieDbDetails(responseJson) {
  console.log('Entering buildStoreMovieDbDetails');

  let backdrop = '';
  let poster = '';

  for (let i = 0; i < responseJson.images.backdrops.length; i++) {
    backdrop = {
      file_path: responseJson.images.backdrops[i].file_path,
      height: responseJson.images.backdrops[i].height,
      width: responseJson.images.backdrops[i].width
    };

    STORE.films[STORE.filmIndexClicked].backdrops.push(backdrop);
  };

  for (let i = 0; i < responseJson.images.posters.length; i++) {
    poster = {
      file_path: responseJson.images.posters[i].file_path,
      height: responseJson.images.posters[i].height,
      width: responseJson.images.posters[i].width
    };

    STORE.films[STORE.filmIndexClicked].posters.push(poster);
  };

  STORE.films[STORE.filmIndexClicked].tagline = responseJson.tagline;

  displayResultsDetails();
}

/*****************
 * Display Home Page
 *****************/
function displayResultsHome() {
  console.log('Entering displayResultsHome');

  $('#js-films').empty();

  for (let i = 0; i < STORE.films.length; i++) {
    let imageURL = '<div><i class="far fa-image"></i></div>';
    let moreButton = '';
    
    if (STORE.films[i].poster_path > '') {
      let url = STORE.theMovieDBImageBase_url + STORE.theMovieDBImagePoster_size + STORE.films[i].poster_path;
      imageURL = `<img class='filmPoster' src=${url} alt=${STORE.films[i].title} />`;
      moreButton = `<button class="moreInfo-button js-moreInfo-button" type="button" id='${STORE.films[i].id}'>More Info</button>`;
    }

    $('#js-films').append(
      `
      <div class="film">
        ${imageURL}
        <div class='filmText'>
          <h2>${STORE.films[i].title}</h2>
          <p>${STORE.films[i].description}</p>
        </div>
        ${moreButton}
      </div>
      `
    )
  }
}

/*****************
 * Display Details Page
 *****************/
function displayResultsDetails() {
  console.log('Entering displayResultsDetails');

  $('#js-film-details').empty();
  $('#js-films').toggle();
  $('#js-film-details').toggle();

  let imageURL = '<div><i class="far fa-image"></i></div>';

  if (STORE.films[STORE.filmIndexClicked].poster_path > '') {
    let url = STORE.theMovieDBImageBase_url + STORE.theMovieDBImagePoster_size + STORE.films[STORE.filmIndexClicked].poster_path;
    imageURL = `<img class="details-filmPoster" src=${url} alt='${STORE.films[STORE.filmIndexClicked].title}' />`;
  }

  let backdropsList = '';
  let backdropsUrl = ''; 
  for (let i = 0; i < STORE.films[STORE.filmIndexClicked].backdrops.length; i++) {
    backdropsUrl = STORE.theMovieDBImageBase_url + STORE.theMovieDBImageBackdrop_size + STORE.films[STORE.filmIndexClicked].backdrops[i].file_path;
    backdropsList += `<li><img class="details-backdrop-img" src=${backdropsUrl} alt='${STORE.films[STORE.filmIndexClicked].title} - Backdrop image' /></li>`;
  }

  let postersList = '';
  let postersUrl = ''
  for (let i = 0; i < STORE.films[STORE.filmIndexClicked].posters.length; i++) {
    postersUrl = STORE.theMovieDBImageBase_url + STORE.theMovieDBImageBackdrop_size + STORE.films[STORE.filmIndexClicked].posters[i].file_path
    postersList += `<li><img class="details-posters-img" src=${postersUrl} alt='${STORE.films[STORE.filmIndexClicked].title} - Poster Image' /></li>`;
  }

  $('#js-film-details').append(`
      <ul class="details-top">
        <li>${imageURL}</li>
        <li>
          <div class="details-information">
            <h2>${STORE.films[STORE.filmIndexClicked].title}</h2>
            <p><span class="bold">Tagline: </span>${STORE.films[STORE.filmIndexClicked].tagline}</p>
            <p><span class="bold">Description: </span>${STORE.films[STORE.filmIndexClicked].description}</p>
            <p><span class="bold">Release Date: </span>${STORE.films[STORE.filmIndexClicked].release_date}</p>
            <p><span class="bold">Original Title: </span>${STORE.films[STORE.filmIndexClicked].original_title}</p>
            <p><span class="bold">Rotten Tomatoes Score: </span>${STORE.films[STORE.filmIndexClicked].rt_score}</p>
            <div class="back-to-home-btn">
              <button class="back-button" type="button" onClick="window.location.reload();">Back to Film List</button>
            </div>
          </div>
        </li>
      </ul>
      <div>
        <h2>Backdrops</h2>
        <ul class="details-backdrops">${backdropsList}</ul>
      </div>
      <div>
        <h2>Posters</h2>
        <ul class="details-posters">${postersList}</ul>
      </div>
  `); 
}

/*****************
 * Handle user clicking More info button on Home Page
 *****************/
function handleMoreInfoClicked() {
  console.log('Entering handleMoreInfoClicked');

  $('#js-films').on('click', '.js-moreInfo-button', event => {
    console.log('Clicked More Info');

    STORE.filmIndexClicked = STORE.films.findIndex(p => p.id === event.target.id)

    getMovieDbFilmDetails();
  });
}

/*****************
 * Studio Ghibili Films API
 *****************/
function getStudioGhibliFilms() {
  console.log('Entering getStudioGhibiliFilms');

  const url = STORE.studioGhibliApi + '/films';

  fetch(url)
  .then (response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  }) 
  .then (responseJson => buildStoreGhibliFilm(responseJson))
  .catch(err => {
    $('#js-error-message').text(`Error getting Studio Ghibi films: ${err.message}`);
  });
}

/*****************
 * The Movie DB get all Films with Title API
 *****************/
function getMovieDbFilms() {
  console.log('Entering getMovieDbFilms');

  for (let i = 0; i < STORE.films.length; i++) {
    let title = STORE.films[i].title.split(' ').join('+');

    let params =  {
      api_key: STORE.theMovieDBApiKey,
      query: title
    };

    let queryString = formatQueryParams(params);
    let url = STORE.theMovieDBApi + 'search/movie?' + queryString;

    fetch(url)
    .then (response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    }) 
    .then (responseJson => buildStoreMovieDb(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Error getting The Movie Database films: ${err.message}`);
    });
  }
}

/*****************
 * The Movie DB get Film Title Detail information
 *****************/
function getMovieDbFilmDetails() {
  console.log('Entering getMovieDbFilmDetails');
    const movieDbId = STORE.films[STORE.filmIndexClicked].movieDbId;

    let params =  {
      api_key: STORE.theMovieDBApiKey,
      language: 'en-US',
      append_to_response: 'images',
      include_image_language: 'en,null'
    };

    let queryString = formatQueryParams(params);
    let url = STORE.theMovieDBApi + 'movie/' + movieDbId + '?' + queryString;

    fetch(url)
    .then (response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    }) 
    .then (responseJson => buildStoreMovieDbDetails(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Error getting The Movie Database films: ${err.message}`);
    });
}

/*****************
 * Initial Loading of Page
 *****************/
function loadPage() {
  console.log('Entering loadPage');

  /* get current year for footer */
  document.getElementById("year").innerHTML = new Date().getFullYear();

  getStudioGhibliFilms();
  handleMoreInfoClicked()
}

loadPage();