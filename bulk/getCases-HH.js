fn(state => {
  const { baseUrl } = state.configuration;

  const caseTypes = ['Household'];

  const limit = 5000;
  const indexedOnStart = '2023-01-01T00:00:00';
  const lastRunOn =
    typeof state.lastRunOn !== 'undefined' ? state.lastRunOn : indexedOnStart;

  const queries = caseTypes.map(
    t => `?type=${t}&indexed_on_start=${lastRunOn}&limit=${limit}`
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
        finalState.lastRunOn = now.toISOString().slice(0, 19);
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
