const regionSelect = document.getElementById('select-region');
const numCountriesInput = document.getElementById('num-countries');
const loadButton = document.getElementById('load-button');
const progress = document.getElementById('progress');
const countriesList = document.getElementById('list-countries');
const errorMessage = document.querySelector('#error-message');

const regions = {
  AF: 'Africa',
  AN: 'Antarctica',
  AS: 'Asia',
  EU: 'Europe',
  NA: 'North America',
  OC: 'Oceania',
  SA: 'South America',
};

for (const code in regions) {
  const option = document.createElement('option');
  option.value = code;
  option.textContent = regions[code];
  regionSelect.appendChild(option);
}

loadButton.addEventListener('click', handleLoadButtonClick);

async function handleLoadButtonClick() {
  errorMessage.style.display = 'none';
  const regionCode = regionSelect.value;
  const numOfCountries = parseInt(numCountriesInput.value);

  if (!regionCode || !numOfCountries) return;

  progress.style.display = 'block';
  countriesList.innerHTML = '';

  let detailedCountries;
  do {
    const countries = await getCountries(regionCode);
    if (countries.length < numOfCountries) {
      errorMessage.style.display = 'block';
      progress.style.display = 'none';
      break;
    }
    const selectedCountries = getRandomCountries(countries, numOfCountries);
    detailedCountries = await getCountryDetails(selectedCountries);

    console.log('detailedCountries:', detailedCountries);
  } while (detailedCountries.includes(undefined));

  progress.style.display = 'none';
  displayCountryInfo(detailedCountries);
}

async function getCountries(regionCode) {
  const query = `
        {
            countries(filter: { continent: { eq: "${regionCode}" } }) {
                code
                name
            }
        }
    `;
  const response = await fetch('https://countries.trevorblades.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const data = await response.json();
  return data.data.countries;
}

function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandomCountries(countries, count) {
  const shuffledCountries = shuffle([...countries]);
  return shuffledCountries.slice(0, count);
}

async function getCountryDetails(countries) {
  console.log('getCountryDetails');
  console.log('countries:', countries);
  const detailsPromises = countries.map(async (country) => {
    const response = await fetch(
      `https://restcountries.com/v3.1/name/${country.name}`
    );
    if (!response.ok) {
      return undefined;
    }
    const data = await response.json();
    return data[0];
  });
  return Promise.all(detailsPromises);
}

function displayCountryInfo(detailedCountries) {
  detailedCountries.forEach((country) => {
    const li = document.createElement('li');
    li.innerHTML = `
            <h2>${country.name.common}</h2>
            <p>Capital: ${country.capital}</p>
            <p>Population: ${country.population}</p>
            <p>Currency: ${Object.values(country.currencies)[0].name}</p>
            <p>Subregion: ${country.subregion}</p>
            <p>Languages: ${Object.values(country.languages).join(', ')}</p>
        `;
    countriesList.appendChild(li);
  });
}
