"use strict"

function formatQueryParams(params) {
  console.log('Entering formatQueryParams');

  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

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
    } 
  }

  displayResultsHome();
}

function displayResultsHome(responseJson) {
  console.log('Entering displayResultsHome');

  $('#js-films').empty();

  for (let i = 0; i < STORE.films.length; i++) {
    let imageURL = '<div><i class="far fa-image"></i></div>';
    
    if (STORE.films[i].poster_path > '') {
      let url = STORE.theMovieDBImageBase_url + STORE.theMovieDBImagePoster_size + STORE.films[i].poster_path;
      imageURL = `<img class='filmPoster' src=${url} alt=${STORE.films[i].title} />`;
    }

    $('#js-films').append(
      `
      <div class="film">
        ${imageURL}
        <div class='filmText'>
          <h2>${STORE.films[i].title}</h2>
          <p>${STORE.films[i].description}</p>
        </div>
        <button class="moreInfo-button js-moreInfo-button" type="button" value=${STORE.films[i].id}>More Info</button>
      </div>
      `
    )
  }
}

function displayResultsDetails(responseJson) {
  console.log('Entering displayResultsDetails');

  $('#js-film-details').empty();
  $('#js-films').toggle();
  $('#js-film-details').toggle();

  let imageURL = '<div><i class="far fa-image"></i></div>';

  if (STORE.films[STORE.filmIndexClicked].poster_path > '') {
    let url = STORE.theMovieDBImageBase_url + STORE.theMovieDBImagePoster_size + STORE.films[STORE.filmIndexClicked].poster_path;
    imageURL = `<img class="details-filmPoster" src=${url} alt=${STORE.films[STORE.filmIndexClicked].title} />`;
  }

  $('#js-film-details').append(`
      ${imageURL}
      <div class="details-information">
        <h2>${STORE.films[STORE.filmIndexClicked].title}</h2>
        <p>${STORE.films[STORE.filmIndexClicked].description}</p>
        <p>Release Date: ${STORE.films[STORE.filmIndexClicked].release_date}</p>
        <p>Rotten Tomatoes Score: ${STORE.films[STORE.filmIndexClicked].rt_score}</p>
      </div>
  `);

  
}

/* here is where Im trying to get the actual button that was clicked */
function handleMoreInfoClicked() {
  console.log('Entering handleMoreInfoClicked');

  $('#js-films').on('click', '.js-moreInfo-button', event => {
    console.log('Clicked More Info');

    let allClickedButtons = document.getElementsByClassName('js-moreInfo-button');
    allClickedButtons = Array.from(allClickedButtons);

    /*
    let result = allClickedButtons.map(clickedButton => {
      return STORE.films.findIndex(p => p.id === clickedButton.value)
    });

    */

  console.log('kim: ' + result);

    getStudioGhibiliPeople();
  });
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
  .then (responseJson => buildStoreGhibliFilm(responseJson))
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
    .then (responseJson => buildStoreMovieDb(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Error getting The Movie Database films: ${err.message}`);
    });
  }
}

function getStudioGhibiliPeople() {
  console.log('Entering getStudioGhibiliPeople');

  const url = STORE.studioGhibliApi + '/people';

  fetch(url)
  .then (response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error(response.statusText);
  }) 
  .then (responseJson => displayResultsDetails(responseJson))
  .catch(err => {
    $('#js-error-message').text(`Error getting Studio Ghibi people: ${err.message}`);
  });
}


function loadPage() {
  console.log('Entering loadPage');

  /* get current year for footer */
  document.getElementById("year").innerHTML = new Date().getFullYear();

  getStudioGhibliFilms();
  handleMoreInfoClicked()
}

loadPage();