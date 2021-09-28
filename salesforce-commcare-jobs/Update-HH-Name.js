//Update CommCare case
alterState(state => {
  console.log(`Mapping HH code to CommCare: `, dataValue('Envelope.Body.notifications.Notification.sObject.Household_Code_Autonumber__c')(state));
  
  const notifications = Array.isArray(state.data.Envelope.Body.notifications) ? state.data.Envelope.Body.notifications : [state.data.Envelope.Body.notifications]
  return { ...state, notifications, values: []}; 
  
}); 

each("$.notifications[*]", state => {
  const value = {
    case_id: dataValue('Notification.sObject.Commcare_Code__c')(state), 
    name: dataValue('Notification.sObject.Household_Code_Autonumber__c')(state)
  }
  state.values.push(value)
  return state
})

fn(state => {
  console.log(state)
  return state
})

submitXls(state => state.values, {
  case_type: 'Household',
  search_field: 'case_id',
  search_column: 'case_id',
  name_column: 'name',
  create_new_cases: 'off',
})