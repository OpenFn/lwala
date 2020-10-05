get(
  '/a/lwala-community-alliance/api/v0.5/form/',
  {
    query: {
      limit: 5,
      offset:
        state.meta && state.meta.next
          ? state.meta.limit + state.meta.offset
          : 0,
      // TODO :consider limiting by a list of form IDs here?
      // xmlns: ''
    },
  },
  state => {
    const { meta, objects } = state.data;
    const { openfnInboxUrl } = state.configuration;
    state.configuration = { baseUrl: 'http://localhost:4000' };
    state.meta = meta;
    console.log('Metadata in CommCare response:');
    console.log(meta);
    return each(
      dataPath('objects[*]'),
      post(
        `/inbox/${openfnInboxUrl}`,
        { body: state => state.data },
        state => ({ ...state, data: {}, references: [] })
      )
    )(state);
  }
);
