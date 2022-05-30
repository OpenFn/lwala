fn(state => {
  const formIds = [
    '457C806C-B47D-44F0-BE4B-7E88F7162D1D',
    '320142AD-BC92-4470-951E-B3CA140BDC4A',
    '318B2FE0-F17F-4FC2-8EBE-1FF170F25B3F',
  ];
  return { ...state, formIds, payloads: [] };
});

each(
  '$.formIds[*]',
  get(
    'https://www.commcarehq.org/a/lwala-community-alliance/api/v0.5/form/',
    {
      query: state => ({
        limit: 2, // max limit
        offset:
          state.meta && state.meta.next
            ? state.meta.limit + state.meta.offset
            : 0,
        xmlns: `http://openrosa.org/formdesigner/${state.data}`,
        received_on_end: '2019-12-31',
      }),
    },
    state => {
      console.log('Metadata in CommCare response:');
      console.log(state.data.meta);

      return { ...state, payloads: [...state.payloads, ...state.data.objects] };
    }
  )
);

fn(state => {
  console.log(state.payloads.length);
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
