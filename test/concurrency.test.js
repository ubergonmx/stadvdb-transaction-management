const { node1 } = require('../model/db');

function performQuery(query, node) {
  return node.query(query, (err, result) => {
    if (err) {
      console.log(err);
      return undefined;
    }
    const cleanedResults = result.map(() => ({
      id: result.id,
      name: result.name,
      year: result.year,
      rank: result.rank,
    }));
    return cleanedResults;
  });
}

describe('performQuery', () => {
  test('should return a list of movies', () => {
    expect(performQuery('Select * from movies WHERE id = 1;', node1)).toEqual(['id', 'name', 'year', 'rank']);
    console.log(performQuery('Select * from movies WHERE id = 1;', node1));
  });
});
