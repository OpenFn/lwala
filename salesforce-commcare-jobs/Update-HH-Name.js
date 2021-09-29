// Update CommCare case
fn(state => {
  const { Notification } = state.data.Envelope.Body.notifications;

  const Notifications = Array.isArray(Notification)
    ? Notification
    : [Notification];

  const notifications = Notifications.map(notification => {
    console.log(
      `Mapping HH code to CommCare: `,
      notification.sObject.Household_Code_Autonumber__c
    );
    return {
      case_id: notification.sObject.Commcare_Code__c,
      name: notification.sObject.Household_Code_Autonumber__c,
    };
  });

  return { ...state, notifications };
});

submitXls(state => state.notifications, {
  case_type: 'Household',
  search_field: 'case_id',
  search_column: 'case_id',
  name_column: 'name',
  create_new_cases: 'off',
});
