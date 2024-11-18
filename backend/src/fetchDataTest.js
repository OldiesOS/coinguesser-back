const { fetchData } = require('./services/dataService');

async function testFetchData() {
  try {
    const data = await fetchData();
    console.log('Data fetched successfully:', data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

testFetchData();
