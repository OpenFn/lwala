get(
  'https://www.commcarehq.org/a/lwala-community-alliance/api/v0.5/form/798f5a9f-a116-4f63-8d2e-e59f3dab3feb',
  {
    query: {
      limit: 1000, //max limit
      offset:
        state.meta && state.meta.next
          ? state.meta.limit + state.meta.offset
          : 0,
      // Filter by Update Person form
      //xmlns: 'http://openrosa.org/formdesigner/25cb9620c678f403ccb59839cc22f91bd1c5d134',
      xmlns: 'http://openrosa.org/formdesigner/ecca8b571aa3cdb7ed2df493301d0e885211d09a',
      received_on_start: '2018-01-01',
      received_on_end: '2018-10-30'
    },
  },
  state => {
    const { meta, objects } = state.data;
    const { openfnInboxUrl } = state.configuration;
    state.configuration = { baseUrl: 'https://www.openfn.org' };
    state.meta = meta;
    console.log('Metadata in CommCare response:');
    console.log(meta);
    return each(
      dataPath('objects[*]'),
      post(
        '/inbox/e77693cc-71d5-49a9-8192-5b15679450df',
        //`/inbox/${openfnInboxUrl}`,
        { body: state => state.data },
        state => ({ ...state, data: {}, references: [] })
      )
    )(state);
  }
);
