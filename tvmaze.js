"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm( term ) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.

  const returnArr = [];

  // results are a list of objects, almost all information in result.show 
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`)
  const results = res.data;

  /**
   * Relevant properties: show.id, show.name, show.summary, show.image.medium, show.image.original
   */
  
  for (let result of results) {
    const {show: {id, name, summary, image}} = result;

    returnArr.push({
      id, 
      name, 
      summary,
      image: image?.original || "https://tinyurl.com/tv-missing"
    })
  }

  return returnArr;

}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="card Show col-md-12 col-lg-6 mb-4">
        <div class="card-body media">
          <img 
            src="${show.image}" 
            alt="Bletchly Circle San Francisco" 
            class="w-25 mr-3">
          <div class="media-body">
            <h5 class="text-primary">${show.name}</h5>
            <div class="card-body">
              <small>${show.summary}</small>
            </div>
            <button class="btn btn-outline-info btn-sm Show-getEpisodes" onclick="searchForEpisodesAndDisplay(${show.id})">
              Episodes
            </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $("#episodes-list").empty();
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  console.log(response);

  return response.data.map(episode => {
    const {id, name, season, number} = episode
    return {
      id, 
      name, 
      season, 
      number
    }
  })
}

/** 
 * Once the async and logic have been taken care of in getEpisodesOfShow, populateEpisodes will take the returned array and map them to li elements. The display: none style of episodes-area will be modified to block to restore visibility, and the episode-list will be filled with all of the new li elements
 */

function populateEpisodes(episodes) {
  const $episodes = episodes.map(episode => {
    return $(`
      <li>${episode.name} (Season ${episode.season}, Episode ${episode.number})</li>
    `)
  })

  $("#episodes-area").css("display", "block");
  $("#episodes-list").append($episodes);
}

// click handler to tie together logic and UI functions
async function searchForEpisodesAndDisplay(id) {
  const episodeArr = await getEpisodesOfShow(id);
  populateEpisodes(episodeArr);
}