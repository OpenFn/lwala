fn(state => {
  const baseUrl =
    'https://www.commcarehq.org/a/lwala-community-alliance/api/v0.5/case/';

  const caseTypes = [
    'Household',
    'Person',
    'visite',
    'Case',
  ];

  const limit = 1000;
  const indexedOnStart = '2023-03-23';
  const receivedOnEnd = '2023-03-23';
  // const indexedOnStart = '2022-05-31';
  // const receivedOnEnd = '2022-05-01';

  const queries = caseTypes.map(
    t =>
      `?type=${t}` +
      `?indexed_on_start=${indexedOnStart}` +
      `&received_on_end=${receivedOnEnd}` +
      `&limit=${limit}`
  );

  return { ...state, queries, baseUrl, payloads: [] };
});

// create a "recursiveGet" which will call itself if CommCare tells us there's
// more data to fetch for the same form
fn(state => {
  const recursiveGet = url =>
    get(url, {}, nextState => {
      const { baseUrl, data, payloads } = nextState;
      const { meta, objects } = data;
      console.log('Metadata in CommCare response:', meta);

      const finalState = { ...nextState, payloads: [...payloads, ...objects] };

      if (meta.next) {
        console.log('Next query detected, recursing...');
        return recursiveGet(`${baseUrl}${meta.next}`)(finalState);
      }
      return finalState;
    });

  return { ...state, recursiveGet };
});

// for each initial query, fetch data recursively
each(
  '$.queries[*]',
  fn(state => state.recursiveGet(`${state.baseUrl}${state.data}`)(state))
);
// log the total number of payloads returned
fn(state => {
  console.log('Count of payloads', state.payloads.length);
  return { ...state, references: [], data: {} };
});