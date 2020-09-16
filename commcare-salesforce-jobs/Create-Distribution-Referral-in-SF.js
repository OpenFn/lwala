//Job to integrate CommCare 'Distribution & Referrals' form
upsert(
  'Family_Planning_community_Distribution__c',
  'Commcare_Case_ID__c',
  fields(
    field('Commcare_Case_ID__c', dataValue('id')),
    relationship('RecordType', 'Name', 'FP Community Distribution & Referrals'),
    field('Distribute_Date__c', dataValue('form.date')),
    field('Client_Name__c', dataValue('form.name')),
    field('Client_Gender__c', dataValue('form.gender')),
    field('Client_Age__c', dataValue('form.age')),
    field('Client_currently_on_FP__c', dataValue('form.current_use')),
    field('Referral_Date__c', dataValue('form.Referral_Date')),
    field('Referral_Method__c', state => {
      var method = dataValue('form.referral_method')(state);
      var newMethod = method
        ? method
            .split(/_/g)
            .map(
              word =>
                `${word.substring(0, 1).toUpperCase()}${word.substring(1)}`
            )
            .join(' ')
        : '';
      return newMethod;
    }),
    field('Implant_Type__c', state => {
      var type = dataValue('form.implant_type')(state);
      var newType = '';
      if (type) {
        if (type === 'implanon') {
          newType = '3-year Implanon';
        } else {
          newType = type === 'jadelle' ? '5-year Jadelle' : null;
        }
      }
      return newType;
    }),
    field('Male_Condoms__c', dataValue('form.male_condoms_count')),
    field('Female_Condoms__c', dataValue('form.female_condoms_count')),
    field('POP__c', dataValue('form.POP_count')),
    field('COC__c', dataValue('form.COC_count')),
    field('Emergency_Pills__c', dataValue('form.emergency_pills_count')),
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
