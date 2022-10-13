// set up a base Url, formIds, and the initial queries to use
fn(state => {
  const baseUrl =
    'https://www.commcarehq.org/a/lwala-community-alliance/api/v0.5/form/';

  const formIds = [
    '457C806C-B47D-44F0-BE4B-7E88F7162D1D',
    '320142AD-BC92-4470-951E-B3CA140BDC4A',
    '318B2FE0-F17F-4FC2-8EBE-1FF170F25B3F',
  ];

  const limit = 1000;
  const indexedOnStart = '2022-08-01';
  const receivedOnEnd = '2022-08-31';

  const queries = formIds.map(
    id =>
      `?xmlns=http://openrosa.org/formdesigner/${id}` +
      `&indexed_on_start=${indexedOnStart}` +
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

// send all of those payloads to OpenFn in batches


fn(async state => {
  const { configuration, payloads } = state;

  const loop = Math.ceil(payloads.length / 250);

  let countInbox = 0;

  const postToInbox = async data => {
    countInbox++;

    console.log(`Sending batch ${countInbox} to inbox`);
    await http.post({
      url: configuration.openfnInboxUrl,
      data: data,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })(state);
  };

  console.log(`Sending ${loop} batches of submissions to inbox`);
  for (let i = 0; i < loop; i++) {
    const batch = state.payloads.slice(i * 250, (i + 1) * 250);

    const data = {
      tag: 'update_person_historical',
      commCareSubmissions: batch,
    };
    await postToInbox(data);
  }

  return { ...state, payloads: [], references: [], data: {} };
});