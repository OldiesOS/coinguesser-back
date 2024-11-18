// fetchData.test.js
const { fetchData } = require('./services/dataService');

describe('fetchData function', () => {
  it('should fetch data successfully', async () => {
    const data = await fetchData();
    expect(data).toBeDefined(); // 데이터를 성공적으로 가져왔는지 확인
    console.log('Data fetched successfully:', data);
  });

  it('should handle errors during data fetching', async () => {
    // fetchData 함수를 모의하여 에러를 강제로 발생시킴
    jest.spyOn(require('./services/dataService'), 'fetchData').mockImplementation(() => {
      throw new Error('Fetch error');
    });

    try {
      await fetchData();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Fetch error');
      console.error('Error fetching data:', error);
    }
  });
});
