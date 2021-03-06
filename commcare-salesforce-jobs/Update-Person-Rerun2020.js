// To update service data missing from Salesforce; this job only includes person and service updates,
// No visit data to re-insert
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Clinical_Services')(state) !==
    undefined
  ) {
    const clinical = state.data.form.TT5.Child_Information.Clinical_Services;
    if (!Array.isArray(clinical)) {
      state.data.form.TT5.Child_Information.Clinical_Services = [clinical];
    }
  }

  if (
    dataValue('$.form.HAWI.Clinical_Services_Rendered')(state) !== undefined
  ) {
    const clinical1 = state.data.form.HAWI.Clinical_Services_Rendered;
    if (!Array.isArray(clinical1)) {
      state.data.form.HAWI.Clinical_Services_Rendered = [clinical1];
    }
  }

  return state;
});

//Deliveries

// combine(state => {
//   if (dataValue("$.form.Status.Client_Status")(state) == "Active") {
//     //Deliveries
//     if (
//       dataValue("$.form.TT5.Child_Information.Delivery_Information.Delivery")(
//         state
//       ) == "Yes"
//     ) {
//       //Unskilled delivery: upsert person with delivery information, but no service provided
//       if (
//         dataValue(
//           "$.form.TT5.Child_Information.Delivery_Information.Delivery_Type"
//         )(state) == "Unskilled"
//       ) {
//         upsert(
//           "Person__c",
//           "CommCare_ID__c",
//           fields(
//             field("Source__c", 1),
//             field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
//             //field("Name",dataValue("$.form.final_name")),
//             field("Name", state => {
//               var name1 = dataValue("$.form.final_name")(state);
//               var name2 = name1.replace(/\w\S*/g, function (txt) {
//                 return (
//                   txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
//                 );
//               });
//               return name2;
//             }),
//             field("Place_of_Delivery__c", "Home"),
//             field(
//               "Date_of_Birth__c",
//               dataValue(
//                 "$.form.TT5.Child_Information.Delivery_Information.DOB"
//               )
//             ),
//             field("Child_Status__c", "Born"),
//             field("Immediate_Breastfeeding__c", state => {
//               var var1 = dataValue(
//                 "form.TT5.Child_Information.Delivery_Information.Breastfeeding_Delivery"
//               )(state);
//               if (var1 == "---") {
//                 var1 = undefined;
//               } else if (var1 == "yes") {
//                 var1 = "Yes";
//               }
//               return var1;
//             }),
//             field(
//               "Counselled_on_Exclusive_Breastfeeding__c",
//               dataValue(
//                 "$.form.TT5.Child_Information.Exclusive_Breastfeeding.counseling"
//               )
//             ),
//             field(
//               "Exclusive_Breastfeeding__c",
//               dataValue(
//                 "form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding"
//               )
//             )
//           )
//         )(state);
//       } else {
//         //Skilled delivery: service provided, and upsert remaining information for person
//         //update: no longer providing service because of Salesforce lock row issue, person upsert here will now run parallel to person upesert for
//         //unskilled delivery
//         upsert(
//           "Person__c",
//           "CommCare_ID__c",
//           fields(
//             field("Source__c", 1),
//             field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
//             //field("Name",dataValue("$.form.final_name")),
//             field("Name", state => {
//               var name1 = dataValue("$.form.final_name")(state);
//               var name2 = name1.replace(/\w\S*/g, function (txt) {
//                 return (
//                   txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
//                 );
//               });
//               return name2;
//             }),
//             field("Place_of_Delivery__c", "Facility"),
//             field("Delivery_Facility__c", state => {
//               return dataValue(
//                 "$.form.TT5.Child_Information.Delivery_Information.Delivery_Facility"
//               )(state)
//                 .toString()
//                 .replace(/_/g, " ");
//             }),
//             field(
//               "Date_of_Birth__c",
//               dataValue(
//                 "$.form.TT5.Child_Information.Delivery_Information.DOB"
//               )
//             ),
//             field("Child_Status__c", "Born"),
//             field("Immediate_Breastfeeding__c", state => {
//               var var1 = dataValue(
//                 "form.TT5.Child_Information.Delivery_Information.Breastfeeding_Delivery"
//               )(state);
//               if (var1 == "---") {
//                 var1 = undefined;
//               } else if (var1 == "yes") {
//                 var1 = "Yes";
//               }
//               return var1;
//             }),
//             field(
//               "Counselled_on_Exclusive_Breastfeeding__c",
//               dataValue(
//                 "$.form.TT5.Child_Information.Exclusive_Breastfeeding.counseling"
//               )
//             ),
//             field(
//               "Exclusive_Breastfeeding__c",
//               dataValue(
//                 "form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding"
//               )
//             )
//           )
//         )(state);
//       }
//     }
//   }
//   //Transfer Outs
//   else if (
//     dataValue("$.form.Status.Client_Status")(state) == "Transferred_Out"
//   ) {
//     upsert(
//       "Person__c",
//       "CommCare_ID__c",
//       fields(
//         field("Source__c", 1),
//         field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
//         field("Client_Status__c", "Transferred Out"),
//         field("Active_in_Thrive_Thru_5__c", "No"),
//         field("Inactive_Date__c", dataValue("$.form.Date")),
//         field("Active_in_HAWI__c", "No"),
//         field("Active_TT5_Mother__c", "No"),
//         field(
//           "Date_of_Transfer_Out__c",
//           dataValue("$.form.Status.Date_of_Transfer_Out")
//         )
//       )
//     )(state);
//   }
//   //Lost to Follow Up
//   else if (
//     dataValue("$.form.Status.Client_Status")(state) == "Lost_to_Follow_Up"
//   ) {
//     upsert(
//       "Person__c",
//       "CommCare_ID__c",
//       fields(
//         field("Source__c", 1),
//         field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
//         field("Client_Status__c", "Lost to Follow-Up"),
//         field("Active_in_Thrive_Thru_5__c", "No"),
//         field("Active_in_HAWI__c", "No"),
//         field("Active_TT5_Mother__c", "No"),
//         field("Date_Last_Seen__c", dataValue("$.form.Status.Date_Last_Seen")),
//         field("Inactive_Date__c", dataValue("$.form.Date"))
//       )
//     )(state);
//   }
//   //Graduated from Thrive Thru 5
//   else if (
//     dataValue("$.form.Status.Client_Status")(state) == "Graduated_From_TT5"
//   ) {
//     upsert(
//       "Person__c",
//       "CommCare_ID__c",
//       fields(
//         field("Source__c", 1),
//         field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
//         field("Client_Status__c", "Graduated From TT5"),
//         field("Active_in_Thrive_Thru_5__c", "No"),
//         field("Active_in_HAWI__c", "No"),
//         field("Active_TT5_Mother__c", "No"),
//         field("Date_Last_Seen__c", dataValue("$.form.Status.Date_Last_Seen")),
//         field("Inactive_Date__c", dataValue("$.form.Date"))
//       )
//     )(state);
//   }
//   //Data entry error
//   else if (
//     dataValue("$.form.Status.Client_Status")(state) == "Data_Entry_Error"
//   ) {
//     upsert(
//       "Person__c",
//       "CommCare_ID__c",
//       fields(
//         field("Source__c", 1),
//         field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
//         field("Client_Status__c", "Data Entry Error"),
//         field("Active_in_Thrive_Thru_5__c", "No"),
//         field("Active_TT5_Mother__c", "No"),
//         field("Active_in_HAWI__c", "No"),
//         field("Inactive_Date__c", dataValue("$.form.Date"))
//       )
//     )(state);
//   }
//   //client deceased
//   else if (dataValue("$.form.Status.Client_Status")(state) == "Deceased") {
//     upsert(
//       "Person__c",
//       "CommCare_ID__c",
//       fields(
//         field("Source__c", 1),
//         field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
//         field("Client_Status__c", "Deceased"),
//         field("Active_in_Thrive_Thru_5__c", "No"),
//         field("Active_in_HAWI__c", "No"),
//         field("Active_TT5_Mother__c", "No"),
//         field("Date_of_Death__c", dataValue("$.form.Status.Date_of_Death")),
//         field("Cause_of_Death__c", state => {
//           return dataValue("$.form.Status.Cause_of_Death")(state)
//             .toString()
//             .replace(/_/g, " ");
//         }),
//         field("Inactive_Date__c", dataValue("$.form.Date"))
//       )
//     )(state);
//   }
// }),
// combine(state => {
//   //Person is added to TT5 (this can only happen to a mother, a child wouldn't be in HAWI before joining TT5)
//   if (
//     dataValue("$.form.Basic_Information.Basic_Information.Add_to_TT5")(
//       state
//     ) == "Yes"
//   ) {
//     upsert(
//       "Person__c",
//       "CommCare_ID__c",
//       fields(
//         field("Source__c", 1),
//         field("Name", state => {
//           var name1 = dataValue("$.form.final_name")(state);
//           var name2 = name1.replace(/\w\S*/g, function (txt) {
//             return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
//           });
//           return name2;
//         }),
//         field("Active_TT5_Mother__c", "Yes"),
//         field("TT5_Mother_Registrant__c", "Yes"),
//         field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
//         field(
//           "Active_in_Support_Group__c",
//           dataValue("$.form.HAWI.Support_Group")
//         ),
//         field(
//           "Preferred_Care_Facility__c",
//           dataValue("$.form.HAWI.Preferred_Care_F.Preferred_Care_Facility")
//         )
//       )
//     )(state);
//   } else {
//     //Person is added to HAWI
//     if (
//       dataValue("$.form.Basic_Information.Basic_Information.Add_to_HAWI")(
//         state
//       ) == "Yes"
//     ) {
//       upsert(
//         "Person__c",
//         "CommCare_ID__c",
//         fields(
//           field("Source__c", 1),
//           field("Name", state => {
//             var name1 = dataValue("$.form.final_name")(state);
//             var name2 = name1.replace(/\w\S*/g, function (txt) {
//               return (
//                 txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
//               );
//             });
//             return name2;
//           }),
//           field("Active_in_HAWI__c", "Yes"),
//           field("HAWI_Registrant", "Yes"),
//           field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
//           field(
//             "Active_in_Support_Group__c",
//             dataValue("$.form.HAWI.Support_Group")
//           ),
//           field(
//             "Preferred_Care_Facility__c",
//             dataValue("$.form.HAWI.Preferred_Care_F.Preferred_Care_Facility")
//           ),
//           field("Immediate_Breastfeeding__c", state => {
//             var var1 = dataValue(
//               "form.TT5.Child_Information.Delivery_Information.Breastfeeding_Delivery"
//             )(state);
//             if (var1 == "---") {
//               var1 = undefined;
//             } else if (var1 == "yes") {
//               var1 = "Yes";
//             }
//             return var1;
//           }),
//           field(
//             "Exclusive_Breastfeeding__c",
//             dataValue(
//               "form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding"
//             )
//           )
//         )
//       )(state);
//     } else {
//       if (
//         dataValue("form.@xmlns")(state) !=
//         "http://openrosa.org/formdesigner/60AF0A3E-A8A1-425B-B86B-35E0C65C8BC4"
//       ) {
//         upsert(
//           "Person__c",
//           "CommCare_ID__c",
//           fields(
//             field("Name", state => {
//               var name1 = dataValue("$.form.final_name")(state);
//               var name2 = name1.replace(/\w\S*/g, function (txt) {
//                 return (
//                   txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
//                 );
//               });
//               return name2;
//             }),
//             field("Source__c", 1),
//             field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
//             field(
//               "Active_in_Support_Group__c",
//               dataValue("$.form.HAWI.Support_Group")
//             ),
//             field(
//               "Preferred_Care_Facility__c",
//               dataValue(
//                 "$.form.HAWI.Preferred_Care_F.Preferred_Care_Facility"
//               )
//             ),
//             field("Immediate_Breastfeeding__c", state => {
//               var var1 = dataValue(
//                 "form.TT5.Child_Information.Delivery_Information.Breastfeeding_Delivery"
//               )(state);
//               if (var1 == "---") {
//                 var1 = undefined;
//               } else if (var1 == "yes") {
//                 var1 = "Yes";
//               }
//               return var1;
//             }),
//             field(
//               "Exclusive_Breastfeeding__c",
//               dataValue(
//                 "form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding"
//               )
//             )
//           )
//         )(state);
//       }
//     }
//   }
// }),
//ANC1
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.ANCs.copy-1-of-anc_1')(state) ==
    'click_to_enter_anc_1'
  ) {
    //Q: Change this criteria??
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'ANC 1'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field('Date__c', dataValue('$.form.TT5.Child_Information.ANCs.ANC_1')),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.ANCs.Facility1'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//ANC2
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.ANCs.copy-1-of-anc_2')(state) ==
    'click_to_enter_anc_2'
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field('Reason_for_Service__c', 'ANC 2'),
        field('Date__c', dataValue('$.form.TT5.Child_Information.ANCs.ANC_2')),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.ANCs.Facility2'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//ANC3
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.ANCs.copy-1-of-anc_3')(state) ==
    'click_to_enter_anc_3'
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', true),
        field('Reason_for_Service__c', 'ANC 3'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field('Date__c', dataValue('$.form.TT5.Child_Information.ANCs.ANC_3')),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.ANCs.Facility3'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//ANC4
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.ANCs.copy-2-of-anc_3')(state) ==
    'click_to_enter_anc_3'
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'ANC 4'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field('Date__c', dataValue('$.form.TT5.Child_Information.ANCs.ANC_4')),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.ANCs.Facility4'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//ANC5
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.ANCs.copy-3-of-anc_3')(state) ==
    'click_to_enter_anc_3'
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'ANC 5'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field('Date__c', dataValue('$.form.TT5.Child_Information.ANCs.ANC_5')),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.ANCs.Facility5'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//BCG REVIEWED
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Immunizations.BCG_h')(state) !==
    null
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'BCG'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field(
          'Date__c',
          dataValue('$.form.TT5.Child_Information.Immunizations.BCG_h')
        ), //WAS `BCG` - did q name change?
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.Immunizations.Facility_BCG'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//OPV0 REVIEWED
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Immunizations.OPV0_h')(state) !==
    null
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'OPV0'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field(
          'Date__c',
          dataValue('$.form.TT5.Child_Information.Immunizations.OPV0_h')
        ),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.Immunizations.Facility_OPV_0'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//OPV1 REVIEWED
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Immunizations.OPV1_h')(state) !==
    null
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'OPV1'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field(
          'Date__c',
          dataValue('$.form.TT5.Child_Information.Immunizations.OPV1_h')
        ),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.Immunizations.Facility_OPV_1'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//OPV2
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Immunizations.OPV2_h')(state) !==
    null
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'OPV2'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field(
          'Date__c',
          dataValue('$.form.TT5.Child_Information.Immunizations.OPV2_h')
        ),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.Immunizations.Facility_OPV_2'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//OPV3
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Immunizations.OPV3_h')(state) !==
    null
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'OPV3'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field(
          'Date__c',
          dataValue('$.form.TT5.Child_Information.Immunizations.OPV3_h')
        ),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.Immunizations.Facility_OPV_3'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//Measles 6
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Immunizations.Measles6_h')(
      state
    ) !== null
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'Measles 6'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field(
          'Date__c',
          dataValue('$.form.TT5.Child_Information.Immunizations.Measles6_h')
        ),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.Immunizations.Facility_Measles_6'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//Measles 9
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Immunizations.Measles9_h')(
      state
    ) !== null
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'Measles 9'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field(
          'Date__c',
          dataValue('$.form.TT5.Child_Information.Immunizations.Measles9_h')
        ),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.Immunizations.Facility_Measles_9'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//Measles 18
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Immunizations.Measles18_h')(
      state
    ) !== null
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'Measles 18'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field(
          'Date__c',
          dataValue('$.form.TT5.Child_Information.Immunizations.Measles18_h')
        ),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        relationship('Site__r', 'Label__c', state => {
          var facility = dataValue(
            '$.form.TT5.Child_Information.Immunizations.Facility_Measles_18'
          )(state);
          if (facility === '' || facility === undefined) {
            facility = 'unknown';
          }
          return facility;
        })
      )
    )(state);
  }
  return state;
});

//Deworming
alterState(state => {
  if (dataValue('$.form.TT5.Child_Information.Deworming')(state) == 'Yes') {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'Deworming'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field('Date__c', dataValue('$.form.Date')),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        )
      )
    )(state);
  }
  return state;
});

//Home Based care for HAWI clients
alterState(state => {
  if (
    dataValue('$.form.HAWI.Home_Based_Care.Home_Based_Care_Provided')(state) !==
      undefined &&
    dataValue('$.form.HAWI.Home_Based_Care.Home_Based_Care_Provided')(state) !==
      ''
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Reason_for_Service__c', 'Home-Based Care'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field('Date__c', dataValue('$.form.Date')),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('RecordTypeID', '01224000000YAuK'),
        field('Home_Based_Care_Rendered__c', state => {
          var care = '';
          var str = dataValue(
            '$.form.HAWI.Home_Based_Care.Home_Based_Care_Provided'
          )(state);
          care = str.replace(/ /g, ';');
          care = care.replace(/_/g, ' ');

          return care;
        }),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        )
      )
    )(state);
  }
  return state;
});

//Malaria cases
//Child
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.CCMM.Home_Test_Result')(state) ==
    'Positive'
  ) {
    //REVIEWED
    if (
      dataValue('$.form.TT5.Child_Information.CCMM.Malaria_Referral')(state) !==
      'Yes'
    ) {
      return create(
        'Service__c',
        fields(
          field('Source__c', 1),
          field('Date__c', dataValue('$.form.Date')),
          field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
          field('Type_of_Service__c', 'CHW Mobile Survey'),
          field('Reason_for_Service__c', 'Malaria (Home Treatment)'),
          field(
            'Home_Treatment__c',
            dataValue('$.form.TT5.Child_Information.CCMM.Home_Treatment')
          ),
          field('RecordTypeID', '01224000000kOto'),
          field('Open_Case__c', 1),
          field('Malaria_Status__c', 'Positive'),
          field(
            'AL_Tablets__c',
            dataValue('$.form.TT5.Child_Information.CCMM.AL')
          ),
          field(
            'Paracetamol_Tablets__c',
            dataValue('$.form.TT5.Child_Information.CCMM.Paracetamol')
          ),
          field('Follow_Up_By_Date__c', dataValue('$.form.Follow-Up_By_Date')),
          field(
            'Home_Treatment_Date__c',
            dataValue('$.form.TT5.Child_Information.CCMM.test_date')
          ),
          field(
            'Malaria_Home_Test_Date__c',
            dataValue('$.form.TT5.Child_Information.CCMM.test_date')
          ),
          field('CommCare_Code__c', dataValue('form.subcase_0.case.@case_id')),
          relationship(
            'Person__r',
            'CommCare_ID__c',
            dataValue('$.form.case.@case_id')
          )
        )
      )(state);
    }
  }
  return state;
});

//Malaria cases
//HAWI Client
alterState(state => {
  if (dataValue('$.form.HAWI.CCMM.Home_Test_Result')(state) == 'Positive') {
    //REVIEWED
    if (dataValue('$.form.HAWI.CCMM.Malaria_Referral')(state) !== 'Yes') {
      //Malaria home treatment case
      return create(
        'Service__c',
        fields(
          field('Source__c', 1),
          field('Date__c', dataValue('$.form.Date')),
          field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
          field('Type_of_Service__c', 'CHW Mobile Survey'),
          field('Reason_for_Service__c', 'Malaria (Home Treatment)'),
          field(
            'Home_Treatment__c',
            dataValue('$.form.HAWI.CCMM.Home_Treatment')
          ),
          field('RecordTypeID', '01224000000kOto'),
          field('Open_Case__c', 1),
          field('Malaria_Status__c', 'Positive'),
          field('AL_Tablets__c', dataValue('$.form.HAWI.CCMM.AL')),
          field(
            'Paracetamol_Tablets__c',
            dataValue('$.form.HAWI.CCMM.Paracetamol')
          ),
          field('Follow_Up_By_Date__c', dataValue('$.form.Follow-Up_By_Date')),
          field(
            'Home_Treatment_Date__c',
            dataValue('$.form.HAWI.CCMM.test_date')
          ),
          field(
            'Malaria_Home_Test_Date__c',
            dataValue('$.form.HAWI.CCMM.test_date')
          ),
          field('CommCare_Code__c', dataValue('form.subcase_0.case.@case_id')),
          relationship(
            'Person__r',
            'CommCare_ID__c',
            dataValue('$.form.case.@case_id')
          )
        )
      )(state);
    }
  }
  return state;
});

//Malnutrition case
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Nutrition2.Nutrition_Status')(
      state
    ) !== undefined
  ) {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Date__c', dataValue('$.form.Date')),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field('RecordTypeID', '01224000000YAuK'),
        field('Reason_for_Service__c', 'Nutrition Screening'),
        field(
          'Clinical_Visit_Date__c',
          dataValue('$.form.TT5.Child_Information.Nutrition2.Clinical_Date')
        ),
        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        ),
        field(
          'Height__c',
          dataValue('$.form.TT5.Child_Information.Nutrition.Height')
        ),
        field(
          'Weight__c',
          dataValue('$.form.TT5.Child_Information.Nutrition.Weight')
        ),
        field(
          'MUAC__c',
          dataValue('$.form.TT5.Child_Information.Nutrition.MUAC')
        ),
        field('Nutrition_Status__c', state => {
          var status = '';
          if (
            dataValue(
              '$.form.TT5.Child_Information.Nutrition2.Nutrition_Status'
            )(state) == 'normal'
          ) {
            status = 'Normal';
          } else if (
            dataValue(
              '$.form.TT5.Child_Information.Nutrition2.Nutrition_Status'
            )(state) == 'moderate'
          ) {
            status = 'Moderately Malnourished';
          } else if (
            dataValue(
              '$.form.TT5.Child_Information.Nutrition2.Nutrition_Status'
            )(state) == 'severe'
          ) {
            status = 'Severely Malnourished';
          }
          return status;
        })
      )
    )(state);
  }
  return state;
});

//All referrals are sent here (danger sign, malaria, malnutrition, other referral)
alterState(state => {
  if (dataValue('$.form.Referral')(state) == 'Yes') {
    return create(
      'Service__c',
      fields(
        field('Source__c', 1),
        field('Date__c', dataValue('$.form.Date')),
        field('Type_of_Service__c', 'CHW Mobile Survey'),
        field('Household_CHW__c', dataValue('$.form.CHW_ID_Final')),
        field('RecordTypeID', '01224000000kOto'),
        field('Referred__c', 1),
        field('Follow_Up_By_Date__c', dataValue('$.form.Follow-Up_By_Date')),
        field('Reason_for_Service__c', 'Referral'),
        field(
          'Clinic_Zinc__c',
          dataValue(
            '$.form.TT5.Child_Information.Clinical_Services.diarrhea_clinic_treatment_zinc'
          )
        ),
        field(
          'Clinic_ORS__c',
          dataValue(
            '$.form.TT5.Child_Information.Clinical_Services.diarrhea_clinic_treatment_ORS'
          )
        ),
        field(
          'Home_Zinc__c',
          dataValue(
            '$.form.TT5.Child_Information.Referrals.diarrhea_home_treatment_zinc'
          )
        ),
        field(
          'Home_ORS__c',
          dataValue(
            '$.form.TT5.Child_Information.Referrals.diarrhea_home_treatment_ORS'
          )
        ),
        field('Open_Case__c', 1),
        field('Malaria_Status__c', dataValue('$.form.Malaria_Status')),
        field(
          'Home_Treatment__c',
          dataValue('$.form.TT5.Child_Information.CCMM.Home_Treatment')
        ),
        field(
          'Malaria_Home_Test_Date__c',
          dataValue('$.form.TT5.Child_Information.CCMM.test_date')
        ),
        field(
          'CommCare_Code__c',
          dataValue('$.form.subcase_0.case.@case_id')(state)
        ),
        field('Purpose_of_Referral__c', state => {
          var purpose = '';
          var name = dataValue('$.form.Purpose_of_Referral')(state);
          if (name == 'Adverse_Drug_Reaction_Side_Effect') {
            purpose = 'Adverse Drug Reaction/Side Effect';
          } else if (name == 'Pregnancy_Care') {
            purpose = 'Pregnancy Care (ANC)';
          } else if (name == 'Family_Planning') {
            purpose = 'Family Planning (FP)';
          } else {
            purpose = name.replace(/_/g, ' ');
          }
          return purpose;
        }),

        relationship(
          'Person__r',
          'CommCare_ID__c',
          dataValue('$.form.case.@case_id')
        )
      )
    )(state);
  }
  return state;
});

//HAWI other clinical services received,
alterState(state => {
  if (
    dataValue('$.form.HAWI.Clinical_Services_Rendered[0]')(state) !== undefined
  ) {
    return beta.each(
      dataPath('$.form.HAWI.Clinical_Services_Rendered[*]'),
      create(
        'Service__c',
        fields(
          field('Source__c', 1),
          //field("Catchment__c","a002400000pAcOe"),
          field('Household_CHW__c', dataValue('chw')),
          field('Reason_for_Service__c', state => {
            var reason = '';
            var name = dataValue('Purpose')(state);
            if (name == 'Adverse_Drug_Reaction_Side_Effect') {
              reason = 'Adverse Drug Reaction/Side Effect';
            } else if (name == 'Pregnancy_Care') {
              reason = 'Pregnancy Care (ANC)';
            } else if (name == 'Family_Planning') {
              reason = 'Family Planning (FP)';
            } else {
              reason = name.replace(/_/g, ' ');
            }
            return reason;
          }),
          field('Date__c', dataValue('Date_of_Clinical_Service')),
          field('Type_of_Service__c', 'CHW Mobile Survey'),
          field('RecordTypeID', '01224000000YAuK'),
          relationship('Site__r', 'Label__c', state => {
            var facility = dataValue('Facility_of_Clinical_Service')(state);
            if (facility === '' || facility === undefined) {
              facility = 'unknown';
            } else if (facility == 'Other_Clinic') {
              facility = 'Other';
            } else if (facility == 'Rongo_Sub-District_Hospital') {
              facility = 'Rongo_SubDistrict_Hospital';
            }
            return facility;
          }),
          relationship('Person__r', 'CommCare_ID__c', dataValue('Case_ID'))
        )
      )
    )(state);
  }
  return state;
});

// TT5 other clinical services received
alterState(state => {
  if (
    dataValue('$.form.TT5.Child_Information.Clinical_Services[0]')(state) !==
    undefined
  ) {
    return beta.each(
      dataPath('$.form.TT5.Child_Information.Clinical_Services[*]'),
      create(
        'Service__c',
        fields(
          field('Source__c', true),
          //field("Catchment__c","a002400000pAcOe"),
          field('Household_CHW__c', dataValue('chw')),
          field('Reason_for_Service__c', state => {
            var reason = '';
            var name = dataValue('Purpose')(state);
            if (name == 'Adverse_Drug_Reaction_Side_Effect') {
              reason = 'Adverse Drug Reaction/Side Effect';
            } else if (name == 'Pregnancy_Care') {
              reason = 'Pregnancy Care (ANC)';
            } else if (name == 'Family_Planning') {
              reason = 'Family Planning (FP)';
            } else {
              reason = name.replace(/_/g, ' ');
            }
            return reason;
          }),
          field('Date__c', dataValue('Clinical_Date')),
          field('Type_of_Service__c', 'CHW Mobile Survey'),
          field('RecordTypeID', '01224000000YAuK'),
          relationship('Site__r', 'Label__c', state => {
            var facility = dataValue('Clinical_Facility')(state);
            if (facility === '' || facility === undefined) {
              facility = 'unknown';
            }
            return facility;
          }),
          relationship('Person__r', 'CommCare_ID__c', dataValue('Case_ID'))
        )
      )
    )(state);
  }
  return state;
});
