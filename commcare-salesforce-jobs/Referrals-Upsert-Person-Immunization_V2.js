upsertIf(
  state.data.user_id !== 'a3c31c9be392427a97f8704262065661' && //test.2021
    state.data.user_id !== 'd1e19bd5a4754e4d94d9e31f735302e6', //openfn.test
  'Household__c',
  'CommCare_Code__c',
  fields(
    field('CommCare_Code__c', state => {
      return (
        dataValue('indices.parent.case_id')(state) ||
        dataValue('properties.parent_id')(state)
      );
    })
  )
),
  upsertIf(
    state.data.user_id !== 'a3c31c9be392427a97f8704262065661' &&
      state.data.user_id !== 'd1e19bd5a4754e4d94d9e31f735302e6' &&
        state.data.properties.test_user  !== 'Yes'
          ),
    'Person__c',
    'CommCare_ID__c',
    fields(
      field('CommCare_ID__c', dataValue('case_id')),
      relationship('Household__r', 'CommCare_Code__c', state => {
        return (
          dataValue('indices.parent.case_id')(state) ||
          dataValue('properties.parent_id')(state)
        );
      }),
      field('BCG__c', state => {
        var date = dataValue('properties.BCG')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('OPV_0__c', state => {
        var date = dataValue('properties.OPV_0')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('OPV_1__c', state => {
        var date = dataValue('properties.OPV_PCV_Penta_1')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('OPV_2__c', state => {
        var date = dataValue('properties.OPV_PCV_Penta_2')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('OPV_3__c', state => {
        var date = dataValue('properties.OPV_PCV_Penta_3')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('Measles_6__c', state => {
        var date = dataValue('properties.Measles_6')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('Measles_9__c', state => {
        var date = dataValue('properties.Measles_9')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('Measles_18__c', state => {
        var date = dataValue('properties.Measles_18')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('ANC_1__c', state => {
        var date = dataValue('properties.ANC_1')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('ANC_2__c', state => {
        var date = dataValue('properties.ANC_2')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('ANC_3__c', state => {
        var date = dataValue('properties.ANC_3')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('ANC_4__c', state => {
        var date = dataValue('properties.ANC_4')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('ANC_5__c', state => {
        var date = dataValue('properties.ANC_5')(state);
        return date && date !== '' ? date : undefined;
      }),
      field('Date_of_Birth__c', state => {
        var date = dataValue('properties.DOB')(state);
        return date && date !== '' ? date : undefined;
      }),
      field(
        'Exclusive_Breastfeeding__c',
        dataValue('properties.Exclusive_Breastfeeding')
      ),
      field(
        'Immediate_Breastfeeding__c',
        dataValue('properties.Breastfeeding_Delivery')
      ),
      field('Place_of_Delivery__c', dataValue('properties.Skilled_Unskilled')),
      field('Child_Status__c', dataValue('properties.Child_Status')),
      field('Gender__c', dataValue('properties.Gender')),
      field('HIV_Status__c', dataValue('properties.hiv_status')), //MOTG
      field(
        'Last_Modified_Date_CommCare__c',
        dataValue('server_date_modified')
      ),
      field('Case_Closed_Date__c', state => {
        var closed = dataValue('closed')(state);
        var date = dataValue('server_date_modified')(state);
        return closed && closed == true ? date : undefined;
      })
    )
  );
