//Job to integrate CommCare 'Outreach' form with SF
upsert(
  'Family_Planning_community_Distribution__c',
  'Commcare_Case_ID__c',
  fields(
    field('Commcare_Case_ID__c', dataValue('id')),
    relationship('Outreach_Catchment__r', 'Name', state => {
      var area = dataValue('form.where_was_the_outreach_conducted')(state);
      var newArea = area
        .split(/_/g)
        .map(
          word => `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`
        )
        .join(' ');
      return newArea;
    }),
    relationship('Outreach_Area__r', 'Name', state => {
      var catchment = dataValue('form.where_was_the_outreach_conducted')(state);
      var area1 = dataValue('form.outreach_area_NK')(state)
        ? dataValue('form.outreach_area_NK')(state)
        : dataValue('form.outreach_area_SK')(state);
      var area = area1 ? area1 : dataValue('form.outreach_area_EK')(state);

      var newArea = area
        ? area
            .split(/_/g)
            .map(
              word =>
                `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`
            )
            .join(' ') //+ ' Area'
        : catchment
            .split(/_/g)
            .map(
              word =>
                `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`
            )
            .join(' ');
      return `${newArea} Area`;
    }),
    relationship('RecordType', 'Name', 'FP Community Outreach Distribution'),
    field('Outreach_Date__c', dataValue('form.outreach_date')),
    field('Male_Condoms__c', dataValue('form.male_condoms_total')),
    field('Female_Condoms__c', dataValue('form.female_condoms_total')),
    field('Pregnancy_tests__c', dataValue('form.pregnancy_test_total')),
    field(
      'Pregnancy_test_positive__c',
      dataValue('form.positive_pregnancy_tests')
    ),
    field('Pregnancy_referrals__c', dataValue('form.pregnancy_referrals')),
    field(
      'Contraception_referrals__c',
      dataValue('form.family_planning_referrals')
    )
  )
);
