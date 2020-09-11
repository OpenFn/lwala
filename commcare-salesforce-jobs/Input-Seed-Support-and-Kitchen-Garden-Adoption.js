combine(function (state) {
  var input_seed_support = dataValue('form.input_seed_support')(state).split(
    ' '
  );
  for (i = 0; i < input_seed_support.length; i++) {
    upsert(
      'Household__c',
      'CommCare_Code__c',
      fields(
        field('CommCare_Code__c', input_seed_support[i]),
        field('Seed_Input_Support__c', 'Yes')
      )
    )(state);
  }
}),
  combine(function (state) {
    var kitchen_garden = dataValue('form.kitchen_garden')(state).split(' ');
    for (i = 0; i < kitchen_garden.length; i++) {
      upsert(
        'Household__c',
        'CommCare_Code__c',
        fields(
          field('CommCare_Code__c', kitchen_garden[i]),
          field('Kitchen_Garden__c', 'Yes')
        )
      )(state);
    }
  });
// Your job goes here.
