fn(state => {
  const baseUrl =
    'https://www.commcarehq.org/a/lwala-community-alliance/api/v0.5/form/';

  const formIds = [
    '457C806C-B47D-44F0-BE4B-7E88F7162D1D',
    '320142AD-BC92-4470-951E-B3CA140BDC4A',
    '318B2FE0-F17F-4FC2-8EBE-1FF170F25B3F',
  ];

  const queries = formIds.map(
    id =>
      `?xmlns=http://openrosa.org/formdesigner/${id}` +
      `&received_on_end=2019-12-31` +
      `&limit=50`
  );

  return { ...state, queries, baseUrl, payloads: [] };
});

each(
  '$.queries[*]',
  get(
    state => `${state.baseUrl}${state.data}`,
    {},
    nextState => {
      const { baseUrl, queries, data, payloads } = nextState;
      const { meta, objects } = data;
      console.log('Metadata in CommCare response:', meta);

      if (meta.next) queries.push(`${baseUrl}${meta.next}`);

      return { ...nextState, payloads: [...payloads, ...objects] };
    }
  )
);

fn(state => {
  console.log('Count of payloads', state.payloads.length);
  console.log('Count of queries', state.queries.length);
  return state;
});

// each(
//   '$.messagePayloads[*]',
//   post(
//     'https://www.openfn.org/inbox/someuuid',
//     { body: state => state.data },
//     state => ({ ...state, data: {}, references: [] })
//   )
// );
