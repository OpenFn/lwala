create(
  'Survey__c',
  fields(
    /*relationship("Household_CHW__r","Name",state =>{
    if(dataValue("$.form.Household_Information.CHW_Name")(state)!==null){
      return(dataValue("$.form.Household_Information.Final_CHW_Name")(state).toString().replace(/_/g," "));
    }
  }),
  relationship("Area__r","Name",state =>{
    return(dataValue("$.metadata.username")(state).toString().charAt(0).toUpperCase()+dataValue("$.metadata.username")(state).toString().slice(1,-3)+" Area");
  }),*/
    //field("Source__c",1),
    relationship(
      'Household__r',
      'CommCare_Code__c',
      dataValue('$.form.case.@case_id')
    ),
    field(
      'Treats_Drinking_Water__c',
      dataValue('$.form.Household_Information.Treats_Drinking_Water')
    ),
    field(
      'WASH_Trained__c',
      dataValue('$.form.Household_Information.WASH_Trained')
    ),
    field(
      'Rubbish_Pit__c',
      dataValue('$.form.Household_Information.Rubbish_Pit')
    ),
    field(
      'Kitchen_Garden__c',
      dataValue('$.form.Household_Information.Kitchen_Garden')
    ),
    field(
      'Improved_Cooking_Method__c',
      dataValue('$.form.Household_Information.Improved_Cooking_Method')
    ),
    field('Uses_ITNs__c', dataValue('$.form.Household_Information.ITNs')),
    field(
      'Pit_Latrine__c',
      dataValue('$.form.Household_Information.Functional_Latrine')
    ),
    field(
      'Clothesline__c',
      dataValue('$.form.Household_Information.Clothesline')
    ),
    field(
      'Drying_Rack__c',
      dataValue('$.form.Household_Information.Drying_Rack')
    ),
    field(
      'Tippy_Tap__c',
      dataValue('$.form.Household_Information.Active_Handwashing_Station')
    ),
    field(
      'Number_of_Over_5_Females__c',
      dataValue('$.form.Household_Information.Number_of_over_5_Females')
    ),
    field(
      'Number_of_Under_5_Males__c',
      dataValue('$.form.Household_Information.Number_of_Under_5_Males')
    ),
    field(
      'Number_of_Under_5_Females__c',
      dataValue('$.form.Household_Information.Number_of_Under_5_Female')
    ),
    field(
      'Number_of_Over_5_Males__c',
      dataValue('$.form.Household_Information.Number_of_Over_5_Males')
    ),
    field('Source__c', 1)
  )
),
  create(
    'Visit__c',
    fields(
      relationship(
        'Household__r',
        'CommCare_Code__c',
        dataValue('$.form.case.@case_id')
      ),
      field('Date__c', dataValue('$.metadata.timeEnd')),
      field('Location__latitude__s', dataValue('$.metadata.location[0]')),
      field('Location__longitude__s', dataValue('$.metadata.location[1]'))
    )
  );

// Your job goes here.
