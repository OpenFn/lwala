submit(
  fields(
    field('@', state => {
      return {
        'xmlns:jrm': 'http://dev.commcarehq.org/jr/xforms',
        xmlns: () => {
          return dataValue('new[0].Catchment__c')(state) == 'a001p000017gpfZAAQ'
            ? 'http://openrosa.org/formdesigner/7ba853f2918145b18fc83404e08f0726'
            : 'http://openrosa.org/formdesigner/7BDB73FA-AEF1-46A2-929A-AA92813C5D38';
        },
        uiVersion: '1',
        version: '967',
        name: () => {
          return dataValue('new[0].Catchment__c')(state) == 'a001p000017gpfZAAQ'
            ? 'Enroll Person'
            : 'Enroll a Person';
        },
      };
    }),
    field('Source', 0),
    field('sfid', dataValue('new[0].Id')),
    field('Basic_Information', state => {
      return {
        Record_Type: () => {
          return dataValue('new[0].Record_Type_Name__c')(state)
            .toString()
            .replace(/ /g, '_');
        },
        //field("CHW_Name",dataValue("new[0].")),
        Child_Status: dataValue('new[0].Child_Status__c')(state),
        Person_Name: dataValue('new[0].Name')(state),
        DOB: dataValue('new[0].Date_of_Birth__c')(state),
        Final_Gender: dataValue('new[0].Gender__c')(state),
        Marital_Status: dataValue('new[0].Marital_Status__c')(state),
        Contact_Info: {
          Phone_Number: dataValue('new[0].Telephone__c')(state),
          Next_of_Kin: dataValue('new[0].Next_of_Kin__c')(state),
          Next_of_Kin_Phone: dataValue('new[0].Next_of_Kin_Phone__c')(state),
        },
        Education_Level: dataValue('new[0].Education_Level__c')(state),
        Final_Program: () => {
          var program = '';
          if (
            dataValue('new[0].Active_in_Thrive_Thru_5__c')(state) == 'Yes' ||
            dataValue('new[0].Active_TT5_Mother__c')(state) == 'Yes'
          ) {
            if (dataValue('new[0].Active_in_HAWI__c')(state) == 'Yes') {
              program = 'Both';
            } else {
              program = 'Thrive_Through_5';
            }
          } else {
            if (dataValue('new[0].Active_in_HAWI__c')(state) == 'Yes') {
              program = 'HAWI';
            } else {
              program = 'something else';
            }
          }
          return program;
        },
        Active_in_HAWI: dataValue('new[0].Active_in_HAWI__c')(state),
        Active_in_TT5: dataValue('new[0].Active_in_Thrive_Thru_5__c')(state),
        Ever_on_Family_Planning: dataValue('new[0].Ever_on_Family_Planning__c')(
          state
        ),
        Currently_on_family_planning: dataValue('new[0].Family_Planning__c')(
          state
        ),
        Family_Planning_Method: dataValue('new[0].Family_Planning_Method__c')(
          state
        ),
      };
    }),
    field('TT5', state => {
      return {
        Mother_Information: {
          Pregnant: () => {
            if (dataValue('new[0].Pregnant__c')(state) === true) {
              return 'Yes';
            }
          },
          Pregnancy_Information: {
            Gravida: dataValue('new[0].Gravida__c')(state),
            Parity: dataValue('new[0].Parity__c')(state),
          },
        },
        Child_Information: {
          LMP: dataValue('new[0].LMP__c')(state),
          EDD: dataValue('new[0].EDD__c')(state),
          ANC_1: dataValue('new[0].ANC_1__c')(state),
          ANC_2: dataValue('new[0].ANC_2__c')(state),
          ANC_3: dataValue('new[0].ANC_3__c')(state),
          ANC_4: dataValue('new[0].ANC_4__c')(state),
          ANC_5: dataValue('new[0].ANC_5__c')(state),
          Delivery_Information: {
            Skilled_Unskilled: () => {
              var val = '';
              if (dataValue('new[0].Place_of_Delivery__c')(state) == 'Home') {
                val = 'Unskilled';
              } else if (
                dataValue('new[0].Place_of_Delivery__c')(state) == 'Facility'
              ) {
                val = 'Skilled';
              }
              return val;
            },
            Birth_Facility: dataValue('new[0].Delivery_Facility__c')(state),
          },
          Immunizations: {
            BCG: dataValue('new[0].BCG__c')(state),
            OPV_0: dataValue('new[0].OPV_0__c')(state),
            OPV_PCV_Penta_1: dataValue('new[0].OPV_1__c')(state),
            OPV_PCV_Penta_2: dataValue('new[0].OPV_2__c')(state),
            OPV_PCV_Penta_3: dataValue('new[0].OPV_3__c')(state),
            Measles_6: dataValue('new[0].Measles_6__c')(state),
            Measles_9: dataValue('new[0].Measles_9__c')(state),
            Measles_18: dataValue('new[0].Measles_18__c')(state),
          },
        },
      };
    }),
    field('HAWI', state => {
      return {
        Unique_Patient_Code: dataValue('new[0].Unique_Patient_Code__c')(state),
        Active_in_Support_Group: dataValue('new[0].Active_in_Support_Group__c')(
          state
        ),
        ART: dataValue('new[0].Currently_on_ART_s__c	')(state),
        ARVs: dataValue('new[0].ART_Regimen__c')(state),
        Preferred_Care_Facility: dataValue('new[0].Preferred_Care_Facility__c')(
          state
        ),
        //Need ANC's, etc.
      };
    }),
    field('subcase_0', state => {
      return {
        'n0:case': {
          '@': {
            case_id: dataValue('new[0].Id')(state),
            date_modified: new Date().toISOString(),
            user_id: 'e298884bfb6ee2d2b38591a6e8ae0228',
            'xmlns:n0': 'http://commcarehq.org/case/transaction/v2',
          },
          'n0:create': {
            'n0:case_name': dataValue('new[0].Name')(state),
            'n0:owner_id': () => {
              var id = '';
              if (
                (dataValue('new[0].chw_owner_id__c')(state) === undefined &&
                  dataValue('chw')(state) === undefined) ||
                dataValue('chw')(state) == 'null'
              ) {
                id = 'acf8595692c76095eb5afd809c628091';
              } else if (
                dataValue('new[0].chw_owner_id__c')(state) === undefined
              ) {
                id = dataValue('chw')(state);
              } else {
                id = dataValue('new[0].chw_owner_id__c')(state);
              }
              return id;
            },
            'n0:case_type': 'Person',
          },
          'n0:update': {
            'n0:ANC_1': dataValue('new[0].ANC_1__c')(state),
            'n0:ANC_2': dataValue('new[0].ANC_2__c')(state),
            'n0:ANC_3': dataValue('new[0].ANC_3__c')(state),
            'n0:ANC_4': dataValue('new[0].ANC_4__c')(state),
            'n0:ANC_5': dataValue('new[0].ANC_5__c')(state),
            'n0:Active_in_OSG_Mentoring': dataValue('new[0].Active_in_OSG__c')(
              state
            ),
            'n0:OSG_Mentoring_Group': dataValue('new[0].OSG_Group__c')(state),
            'n0:sfid': dataValue('new[0].Id')(state),
            'n0:BCG': dataValue('new[0].BCG__c')(state),
            'n0:Delivery_Type': () => {
              var val = '';
              if (dataValue('new[0].Place_of_Delivery__c')(state) == 'Home') {
                val = 'Unskilled';
              } else if (
                dataValue('new[0].Place_of_Delivery__c')(state) == 'Facility'
              ) {
                val = 'Skilled';
              }
              return val;
            },
            'n0:Delivery_Facility': dataValue('new[0].Delivery_Facility__c')(
              state
            ),
            'n0:Family_Planning_Method': dataValue(
              'new[0].Family_Planning_Method__c'
            )(state),
            'n0:Child_Status': dataValue('new[0].Child_Status__c')(state),
            'n0:OPV_0': dataValue('new[0].OPV_0__c')(state),
            'n0:OPV_PCV_Penta_1': dataValue('new[0].OPV_1__c')(state),
            'n0:OPV_PCV_Penta_2': dataValue('new[0].OPV_2__c')(state),
            'n0:OPV_PCV_Penta_3': dataValue('new[0].OPV_3__c')(state),
            'n0:Measles_6': dataValue('new[0].Measles_6__c')(state),
            'n0:Exclusive_Breastfeeding': dataValue(
              'new[0].Exclusive_Breastfeeding__c'
            )(state),
            'n0:LMP': dataValue('new[0].LMP__c')(state),
            'n0:EDD': dataValue('new[0].EDD__c')(state),
            'n0:Measles_9': dataValue('new[0].Measles_9__c')(state),
            'n0:Measles_18': dataValue('new[0].Measles_18__c')(state),
            'n0:Pregnant': () => {
              if (dataValue('new[0].Pregnant__c')(state) === true) {
                return 'Yes';
              }
            },
            'n0:ART': dataValue('new[0].Currently_on_ART_s__c')(state),
            'n0:ARVs': dataValue('new[0].ART_Regimen__c')(state),
            'n0:Active_in_Support_Group': dataValue(
              'new[0].Active_in_Support_Group__c'
            )(state),
            'n0:Client_Program': () => {
              var program = '';
              if (
                dataValue(
                  'new[0].Active_in_Thrive_Thru_5__c' ||
                    dataValue('new[0].Active_TT5_Mother__c')(state) == 'Yes'
                )(state) == 'Yes'
              ) {
                if (dataValue('new[0].Active_in_HAWI__c')(state) == 'Yes') {
                  program = 'Both';
                } else {
                  program = 'Thrive_Through_5';
                }
              } else {
                if (dataValue('new[0].Active_in_HAWI__c')(state) == 'Yes') {
                  program = 'HAWI';
                }
              }
              return program;
            },
            'n0:Currently_on_family_planning': dataValue(
              'new[0].Family_Planning__c'
            )(state),
            'n0:DOB': dataValue('new[0].Date_of_Birth__c')(state),
            'n0:Education_Level': () => {
              if (dataValue('new[0].Education_Level__c')(state) !== undefined) {
                return dataValue('new[0].Education_Level__c')(state)
                  .toString()
                  .replace(/ /g, '_');
              }
            },
            'n0:Ever_on_Family_Planning': dataValue(
              'new[0].Ever_on_Family_Planning__c'
            )(state),
            'n0:Gender': dataValue('new[0].Gender__c')(state),
            'n0:Gravida': dataValue('new[0].Gravida__c')(state),
            'n0:Active_in_TT5': dataValue('new[0].Active_in_Thrive_Thru_5__c')(
              state
            ),
            'n0:Active_in_HAWI__c': dataValue('new[0].Active_in_HAWI__c')(
              state
            ),
            'n0:Marital_Status': dataValue('new[0].Marital_Status__c')(state),
            'n0:Next_of_Kin': dataValue('new[0].Next_of_Kin__c')(state),
            'n0:Next_of_Kin_Phone': dataValue('new[0].Next_of_Kin_Phone__c')(
              state
            ),
            'n0:Parity': dataValue('new[0].Parity__c')(state),
            'n0:Phone_Number': dataValue('new[0].Telephone__c')(state),
            'n0:Preferred_Care_Facility': dataValue(
              'new[0].Preferred_Care_Facility__c'
            )(state),
            'n0:Record_Type': () => {
              return dataValue('new[0].Record_Type_Name__c')(state)
                .toString()
                .replace(/ /g, '_');
            },
            'n0:Unique_Patient_Code': dataValue(
              'new[0].Unique_Patient_Code__c'
            )(state),
          },
          'n0:index': {
            'n0:parent': {
              '@': { case_type: 'Household' },
              '#': () => {
                var id = '';
                if (
                  dataValue('new[0].CommCare_HH_Code__c')(state) === undefined
                ) {
                  id = dataValue('Code')(state);
                } else {
                  id = dataValue('new[0].CommCare_HH_Code__c')(state);
                }
                return id;
              },
            },
          },
        },
      };
    }),
    field('n1:case', state => {
      return {
        '@': {
          case_id: () => {
            var id = '';
            if (dataValue('new[0].CommCare_HH_Code__c')(state) === undefined) {
              id = dataValue('Code')(state);
            } else {
              id = dataValue('new[0].CommCare_HH_Code__c')(state);
            }
            return id;
          },
          date_modified: new Date().toISOString(),
          user_id: 'e298884bfb6ee2d2b38591a6e8ae0228',
          'xmlns:n1': 'http://commcarehq.org/case/transaction/v2',
        },
        'n1:update': {
          'n1:Female_Head_Name': dataValue('female')(state),
          'n1:Male_Head_Name': dataValue('male')(state),
        },
      };
    }),
    field('n2:meta', state => {
      return {
        '@': { 'xmlns:n2': 'http://openrosa.org/jr/xforms' },
        'n2:deviceID': 'Formplayer',
        'n2:timeStart': new Date().toISOString(),
        'n2:timeEnd': new Date().toISOString(),
        'n2:userID': 'e298884bfb6ee2d2b38591a6e8ae0228',
      };
    })
  )
);
