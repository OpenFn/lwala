alterState(state => {
  if (dataValue('$.form.CHW.Follow-Up.Follow-Up')(state) == 'Yes') {
    if (dataValue('$.form.CHW.Follow-Up.Client_Improved')(state) == 'No') {
      return upsert(
        'Service__c',
        'Service_UID__c',
        fields(
          field('Service_UID__c', dataValue('$.form.case.@case_id')),
          field(
            'Follow_Up_Date__c',
            dataValue('$.form.CHW.Follow-Up.Follow-Up_Date')
          ),
          field(
            'Follow_Up_By_Date__c',
            dataValue('$.form.CHW.Follow-Up.Follow-Up_By_Date')
          )
        )
      )(state);
    } else {
      return upsert(
        'Service__c',
        'Service_UID__c',
        fields(
          field('Service_UID__c', dataValue('$.form.case.@case_id')),
          field(
            'Follow_Up_Date__c',
            dataValue('$.form.CHW.Follow-Up.Follow-Up_Date')
          ),

          field('Open_Case__c', false)
        )
      )(state);
    }
  } else if (
    dataValue('$.form.CHW.Facility_Services.Facility_Visit')(state) == 'Yes'
  ) {
    return upsert(
      'Service__c',
      'Service_UID__c',
      fields(
        field('Service_UID__c', dataValue('$.form.case.@case_id')),
        field(
          'Clinical_Visit_Date__c',
          dataValue('$.form.CHW.Facility_Services.Facility_Date')
        )
      )
    )(state);
  }

  return state;
});
