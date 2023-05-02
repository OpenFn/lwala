fn(state => {
  const { baseUrl } = state.configuration;

  const caseTypes = ['Household'];

  //NOTE: You can use 'limit' to modify this batch size as desired
  const limit = 1000; //E.g., change to 10 to process records in smaller batch sizes
  
  //NOTE: indexedOnStart is the default sync start data the FIRST time the job runs
  const indexedOnStart = '2023-03-01T00:00:00'; 
  
  //NOTE: After first job run, OpenFn will check the job sync data ("lastRunAt") to set as the indexedOnStart
  const lastRunAt =
    typeof state.lastRunAt !== 'undefined' ? state.lastRunAt : indexedOnStart;

  const queries = caseTypes.map(
    //t => `?type=${t}&indexed_on_start=${lastRunAt}&limit=${limit}`
    //NOTE: If for testing, you want to fetch data for a specific historical range (e.g., between April 23 and 24)...
    //...then use the query string below instead of the one above on L16, and custom adjust the index_on start/end dates
     t => `?type=${t}&indexed_on_start=2023-03-01T00:00:00&limit=${limit}&indexed_on_end=2023-03-03T00:00:00`
  );

  return { ...state, queries, baseUrl, payloads: [] };
});

// create a "recursiveGet" which will call itself if CommCare tells us there's
// more data to fetch for the same form
fn(state => {
  const recursiveGet = url =>
    get(
      url,
      {
        headers: { 'content-type': 'application/json' },
      },
      nextState => {
        const now = new Date();
        const { baseUrl, data, payloads } = nextState;

        const { meta, objects } = data;
        console.log('Metadata in CommCare response:', meta);

        const finalState = {
          ...nextState,
          payloads: [...payloads, ...objects],
        };

        if (meta.next) {
          console.log('Next query detected, recursing...');
          return recursiveGet(`${baseUrl}${meta.next}`)(finalState);
        }
        finalState.lastRunAt = now.toISOString().slice(0, 19);
        return finalState;
      }
    );

  return { ...state, recursiveGet };
});

// for each initial query, fetch data recursively
each(
  '$.queries[*]',
  fn(state => {
    return state.recursiveGet(`${state.baseUrl}${state.data}`)(state);
  })
);
// log the total number of payloads returned
fn(state => {
  console.log('Count of payloads', state.payloads.length);
  return { ...state, references: [], data: {} };
});
