const countriesContainer = document.getElementById('countriesContainer')
//State variables
let currentPage = 0;
let resultsPerPage = 10;
let paginationEnabled = false;
let countries = [];
let sortByTotalDeathDirection = false;
let sortByNameDirection = true;
let sortByWhat = 'totalDeath';
let relevantInfo;
const changePagination = () => {
    paginationEnabled = !paginationEnabled;
    changeCountriesInDom();
}
async function getCountriesData() {
    try {
        loading = document.createElement('div');
        loading.innerHTML = `Loading...`;
        countriesContainer.appendChild(loading);
        const data = await sendRequest(`https://api.covid19api.com/summary`); 
        relevantInfo = data.Countries.map(item => ({ name: item.Country, totalDeaths: item.TotalDeaths, totalConfirmed: item.TotalConfirmed, NewDeaths: item.NewDeaths }));
        countries = relevantInfo;
        //remove Loading
        loading.remove();
        sortCountries(); // Also Manipulate the Dom
    }
    catch (error) {
        addErrorToDom(error);
    }
}
function sortHelper(n, sortDirection) {
    if (!sortDirection) {
        return n * -1;
    }
    return n;
}
function sortCountries(changeDirection = true) {
    if (sortByWhat === 'name') {
        sortByName(changeDirection);
    }
    else {
        sortByTotalDeath(changeDirection);
    }
}
function sortByTotalDeath(changeDirection = true) {
    sortByWhat = 'totalDeath';
    if (changeDirection) {
        sortByTotalDeathDirection = !sortByTotalDeathDirection;
    }
    countries = countries.sort((a, b) => sortHelper(a.totalDeaths < b.totalDeaths ? 1 : -1, sortByTotalDeathDirection));
    changeCountriesInDom();
}
function sortByName(changeDirection = true) {
    sortByWhat = 'name';
    if (changeDirection) {
        sortByNameDirection = !sortByNameDirection;
    }
    countries = countries.sort((a, b) => sortHelper(a.name.localeCompare(b.name), sortByNameDirection));
    changeCountriesInDom();
}
function changeCountriesInDom() {
    //Handle pagination if enbaled
    const pageCountries = paginationEnabled
        ? countries.slice(currentPage * resultsPerPage, currentPage * resultsPerPage + resultsPerPage)
        : countries;
    countriesContainer.innerHTML = '';
    let flag = false;
    for (country of pageCountries) {
        const newCountry = document.createElement('div');
        newCountry.innerHTML = `
                <div class="line data-line ${flag ? 'greyedColor' : ''}">
                    <div class="cell">${country.name}</div>
                    <div class="cell">${country.totalDeaths} </div>
                </div>`;
        countriesContainer.appendChild(newCountry);;
        flag = !flag;
    }
    //Handle pagination if enbaled
    const paginationConatiner = document.getElementById('pagination')
    if (paginationEnabled) {
        const pagesNumber = parseInt(countries.length / resultsPerPage);
        paginationConatiner.innerHTML = `
                    <div class="">
                        Page ${currentPage} of (${pagesNumber}) 
                        ${currentPage !== pagesNumber ? `<div class="link" onclick="nextPage()" >Next </div>` : ``}
                        ${currentPage !== 0 ? `<div class="link" onclick="previousPage()" >Previos </div>` : ``}
                    </div>`;
    }
    else {
        paginationConatiner.innerHTML = ''
    }
    //Total Death:
    const totalDeath = pageCountries.reduce((prevValue, currentValue) => prevValue + currentValue.totalDeaths, 0);
    const totalConfirmed = pageCountries.reduce((prevValue, currentValue) => prevValue + currentValue.totalConfirmed, 0);
    document.getElementById('totalDeath').innerHTML = `
                <div class="line data-line">
                    <div class="cell">Total</div>
                    <div class="cell">${totalDeath}</div>
                </div>`;
}

function addErrorToDom(error) {
    const errorMessage = document.createElement('div');
    errorMessage.style.color = 'red';
    errorMessage.innerHTML = error;
    countriesContainer.appendChild(errorMessage);

}
function performSearch (event)  {
    const searchKey = event.target.value.toLowerCase();
    let tempArr = [];
    if (searchKey === '') {
        tempArr = relevantInfo;
    }
    else {
        tempArr = relevantInfo
            .map(country => ({ ...country, searchTextLocation: country.name.toLowerCase().indexOf(searchKey) }))
            .filter(country => country.searchTextLocation !== -1);

        //highlight the keyword
        tempArr = tempArr.map(country => ({ ...country, name: highlightText(country.name, searchKey) }));

    }
    countries = tempArr
    sortCountries(false)
}
function highlightText(text, keyword) {
    const startLocation = text.toLowerCase().indexOf(keyword)
    const beforeText = text.slice(0, startLocation)
    const afterText = text.slice(startLocation + keyword.length, text.length)
    if (startLocation === 0) {
        keyword = keyword.slice(0, 1).toUpperCase() + keyword.slice(1, keyword.legnth)
    }
    return `${beforeText}<span class="highlighted">${keyword}</span>${afterText}`;
}
const nextPage = () => {
    if (currentPage === parseInt(countries.length / resultsPerPage)) {
        return
    }
    currentPage++;
    changeCountriesInDom();
}
const previousPage = () => {
    if (currentPage === 0) return;
    currentPage--;
    changeCountriesInDom();
}
(() => {
    document.getElementById('filterInput').addEventListener('keyup',performSearch )
    document.getElementById("resultsPerPage").innerText = `(${resultsPerPage} results per page)`
    getCountriesData()
})()


