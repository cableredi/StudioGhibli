"use strict"

function formatQueryParams(params) {
  console.log('Entering formatQueryParams');

  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function buildGhibliFilm(responseJson) {
  console.log('Entering buildGhibliFilm');

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

function buildMovieDb(responseJson) {
  console.log('Entering buildMovieDb');

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
    } 
  }

  displayResultsHome();
}

function displayResultsHome(responseJson) {
  console.log('Entering displayResultsHome');

  $('#js-films').empty();

  for (let i = 0; i < STORE.films.length; i++) {
    let imageURL = 'Poster Image not available';
    if (STORE.films[i].poster_path > '') {
      let url = STORE.theMovieDBImageBase_url + STORE.theMovieDBImagePoster_size + STORE.films[i].poster_path;
      imageURL = `<img src=${url} alt=${STORE.films[i].title} />`;
      
    }

    $('#js-films').append(
      `
      <div class="film">
        <h2>${STORE.films[i].title}</h2>
        <p>${STORE.films[i].description}</p>
        ${imageURL}
      </div>
      `
    )
  }
}

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
  .then (responseJson => buildGhibliFilm(responseJson))
  .catch(err => {
    $('#js-error-message').text(`Error getting Studio Ghibi films: ${err.message}`);
  });
}

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
    .then (responseJson => buildMovieDb(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Error getting The Movie Database films: ${err.message}`);
    });
  }
}


function loadPage() {
  console.log('Entering loadPage');

  /* get current year for footer */
  document.getElementById("year").innerHTML = new Date().getFullYear();

  getStudioGhibliFilms();

}

loadPage();