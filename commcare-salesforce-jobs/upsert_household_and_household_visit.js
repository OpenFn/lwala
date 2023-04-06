fn(state => {
  const owner_ids = state.data.objects.map(data => data.properties.owner_id);
  const uniq_owner_ids = [...new Set(owner_ids)];

  return query(`SELECT CommCare_User_ID__c, Id village, Parent_Geographic_Area__c area, Parent_Geographic_Area__r.Parent_Geographic_Area__c catchment
  FROM Location__c
  WHERE CommCare_User_ID__c IN ('${uniq_owner_ids.join("','")}') GROUP BY Id, CommCare_User_ID__c, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Parent_Geographic_Area__c`)(state);

  // return query(`SELECT CommCare_User_ID__c, Id, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Name, Parent_Geographic_Area__r.Parent_Geographic_Area__c
  // FROM Location__c
  // WHERE CommCare_User_ID__c IN ('${uniq_owner_ids.join("','")}')
  // GROUP BY Id, CommCare_User_ID__c, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Parent_Geographic_Area__c
  // `)(state);
  // return { ...state, uniq_owner_ids };
});

fn(state => {
  console.log('query1 done');

  return state;
});

fn(state => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('4 second cooldown finished.');
      resolve(state);
    }, 4000);
  });
});

fn(state => ({
  ...state,
  data: {
    ...state.data,
    villageNewId: state.references[0].records && state.references[0].records.length !== 0 ? state.references[0].records[0].Id : undefined,
    areaNewId: state.references[0].records && state.references[0].records.length !== 0 ? state.references[0].records[0].Parent_Geographic_Area__c : undefined,
    catchmentNewId: state.references[0].records && state.references[0].records.length !== 0 ? (state.references[0].records[0].Parent_Geographic_Area__r ? state.references[0].records[0].Parent_Geographic_Area__r.Parent_Geographic_Area__c : undefined) : undefined,
  },
}));

fn(state => {
  console.log('Filtering out unwanted households and applying mapping');

  const households = state.data.objects
    .filter(h => h.properties.commcare_username !== 'openfn.test' && h.properties.commcare_username !== 'test.2021' && h.properties.test_user !== 'Yes')
    .map(h => {
      // Special calculations ==================================================
      const insuranceStatus = h.properties.health_insurance;
      const Health_insurance_type__c = insuranceStatus && insuranceStatus === 'other_please_specify_if_active' ? 'Other' : insuranceStatus === 'nhif' ? 'NHIF' : insuranceStatus === 'Linda_mama' || 'linda_mama' ? 'Linda mama' : insuranceStatus;

      const hhStatus = h.properties.Household_Status;
      const Active_Household__c = hhStatus && hhStatus === 'No' ? false : hhStatus === 'Yes' ? true : hhStatus;

      const reason = h.properties.Reason_for_Inactive;
      const Inactive_Reason__c = reason ? reason.toString().replace(/_/g, ' ') : null;

      const chw = h.properties.CHW_ID;
      const Household_CHW__c = chw === 'a030800001zQrk' ? 'a030800001zQrk5' : chw ? chw : undefined;
      // =======================================================================

      return {
        CommCare_Username__c: h.properties.commcare_username,
        MOH_household_code__c: h.properties.moh_code,
        CommCare_Code__c: h.case_id,
        Source__c: true,
        // TODO: Prod mapping to add back before go-live =======================
        // Household_CHW__c, // Uncomment me to go live!
        Household_CHW__c: 'a03G5000003bGIbIAM', // Comment me OUT to go live!
        // =====================================================================
        Catchment__c: h.catchmentNewId,
        Area__c: h.areaNewId,
        Village__c: h.villageNewId,
        Household_Village__c: h.properties.village,
        Deaths_in_the_last_6_months__c: h.properties.deaths_in_past_6_months > 0 ? 'Yes' : 'No',
        Access_to_safe_water__c: h.properties.Safe_Water,
        Treats_Drinking_Water__c: h.properties.Treats_Drinking_Water,
        Tippy_Tap__c: h.properties.Active_Handwashing_Station,
        Pit_Latrine__c: h.properties.Functional_Latrine,
        Rubbish_Pit__c: h.properties.Rubbish_Pit,
        Drying_Rack__c: h.properties.Drying_Rack,
        Kitchen_Garden__c: h.properties.Kitchen_Garden,
        Cookstove__c: h.properties.Improved_Cooking_Method,
        Clothe__c: h.properties.Clothesline,
        WASH_Trained__c: h.properties.WASH_Trained,
        Uses_ITNs__c: h.properties.ITNs,
        Has_muac_tape__c: h.properties.family_muac_tape_available,
        Health_insurance__c: h.properties.health_insurace_cover,
        Health_insurance_active_status__c: h.properties.healthinsurance_active,
        Health_insurance_type__c,
        Other_Health_Insurance__c: h.properties.if_other_please_specify,
        Work_with_TBA__c: h.properties.tba,
        TBA_name__c: h.properties.which_tba,
        Last_Modified_Date_CommCare__c: h.server_date_modified, //Need a case property,
        Active_Household__c,
        Inactive_Reason__c,
        Active_in_Nutrition_Program__c: h.properties.enrolled_in_a_lwala_nutrition_program,
        lwala_nutrition_program_enrollment_date__c: h.properties.lwala_nutrition_program_enrollment_date,
        Trained_in_gardening__c: h.properties.household_trained_on_gardening,
        household_trained_on_gardening_date__c: h.properties.when_was_the_household_trained_on_gardening,
        Seed_Input_Support__c: h.properties.household_provided_with_seed_input_support,
        household_provided_with_seed_input_suppo__c: h.properties.when_was_the_household_provided_with_seed_input_support,
        MIYCN_Trained__c: h.properties.household_trained_on_MIYC,
      };
    });

  console.log('Bulk upserting households...');
  return { ...state, households };
});

bulk(
  'Household__c',
  'upsert',
  {
    extIdField: 'CommCare_Code__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => state.households
);

// TODO: Mtuchi
// The remaining transformation
// https://docs.google.com/spreadsheets/d/1Zy7boC8o_F8eqlPwTEpYkIHA9CifZzasWDuzdMRHvdw/edit#gid=1007251733

// //Household Visit
// //QUESTION: Do we need to query SF again? Or can we do 1 query at the start of the job? It looks redundant
// query(
//   `SELECT Id, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Name, Parent_Geographic_Area__r.Parent_Geographic_Area__c FROM Location__c WHERE CommCare_User_ID__c = '${dataValue(
//     'properties.owner_id'
//   )(state)}'`
// );

// fn(state => {
//   console.log('query2 done');
//   return state;
// });
// fn(state => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log('4 second cooldown finished.');
//       resolve(state);
//     }, 4000);
//   });
// });

// fn(state => ({
//   ...state,
//   data: {
//     ...state.data,
//     catchmentNewId:
//       state.references[0].records && state.references[0].records.length !== 0
//         ? state.references[0].records[0].Parent_Geographic_Area__r
//           ? state.references[0].records[0].Parent_Geographic_Area__r
//               .Parent_Geographic_Area__c
//           : undefined
//         : undefined,
//   },
// }));

// fn(state => {
//   const supervisorMap = {
//     community_health_nurse: 'Community Health Nurse',
//     chw_supervisor: 'CHW Supervisor',
//     chewschas: 'CHEWs/CHAs',
//     other: 'Other',
//     none: 'None',
//   };

//   const insuranceMap = {
//     nhif: 'NHIF',
//     Linda_mama: 'Linda mama',
//     other_please_specify_if_active: 'Other',
//     none: 'None',
//   };

//   return { ...state, supervisorMap, insuranceMap };
// });

// upsertIf(
//   state.data.properties.username !== 'openfn.test' &&
//     state.data.properties.username !== 'test.2021' &&
//     state.data.properties.test_user !== 'Yes',
//   'Visit__c',
//   'CommCare_Visit_ID__c',
//   fields(
//     field('CommCare_Username__c', dataValue('properties.commcare_username')), //
//     field('CommCare_Visit_ID__c', state => {
//       var case_id = dataValue('case_id')(state);
//       var submitted = dataValue('properties.last_form_opened_date_and_time')(
//         state
//       );
//       return case_id + '_' + submitted;
//     }),

//     field('Catchment__c', dataValue('catchmentNewId')),
//     relationship('Household__r', 'CommCare_Code__c', dataValue('case_id')),
//     field('Date__c', dataValue('properties.Date')),
//     field('Form_Submitted__c', dataValue('properties.last_form_opened_name')),
//     field('Active_Household__c', state => {
//       var status = dataValue('properties.Household_Status')(state);
//       return status && status === 'No'
//         ? false
//         : status === 'Yes'
//         ? true
//         : status;
//     }),
//     field(
//       'Active_in_Nutrition_Program__c',
//       dataValue('properties.enrolled_in_a_lwala_nutrition_program')
//     ),
//     field(
//       'lwala_nutrition_program_enrollment_date__c',
//       dataValue('properties.lwala_nutrition_program_enrollment_date')
//     ),
//     field(
//       'Trained_in_gardening__c',
//       dataValue('properties.household_trained_on_gardening')
//     ),
//     field(
//       'household_trained_on_gardening_date__c',
//       dataValue('properties.when_was_the_household_trained_on_gardening')
//     ),
//     field(
//       'Seed_Input_Support__c',
//       dataValue('properties.household_provided_with_seed_input_support')
//     ),
//     field(
//       'household_provided_with_seed_input_suppo__c',
//       dataValue(
//         'properties.when_was_the_household_provided_with_seed_input_support'
//       )
//     ),
//     field(
//       'MIYCN_Trained__c',
//       dataValue('properties.household_trained_on_MIYCN')
//     ),
//     field('Kitchen_Garden__c', dataValue('properties.Kitchen_Garden')),

//     field('Access_to_safe_water__c', dataValue('properties.Safe_Water')),
//     field(
//       'Treats_Drinking_Water__c',
//       dataValue('properties.Treats_Drinking_Water')
//     ),
//     field('Tippy_Tap__c', dataValue('properties.Active_Handwashing_Station')),
//     field('Pit_Latrine__c', dataValue('properties.Functional_Latrine')),
//     field('Rubbish_Pit__c', dataValue('properties.Rubbish_Pit')),
//     field('Drying_Rack__c', dataValue('properties.Drying_Rack')),
//     field('Kitchen_Garden__c', dataValue('properties.Kitchen_Garden')),
//     field('Cookstove__c', dataValue('properties.Improved_Cooking_Method')),
//     field('Clothe__c', dataValue('properties.Clothesline')),
//     field('WASH_Trained__c', dataValue('properties.WASH_Trained')),
//     field(
//       'Has_muac_tape__c',
//       dataValue('properties.family_muac_tape_available')
//     ),
//     field('Uses_ITNs__c', dataValue('properties.ITNs')),
//     field('Supervisor_Visit__c', state =>
//       state.data.properties.supervisor_visit
//         ? state.supervisorMap[state.data.properties.supervisor_visit]
//         : null
//     ),
//     field('Health_insurance__c', dataValue('properties.health_insurace_cover')),
//     field(
//       'Health_insurance_active_status__c',
//       dataValue('properties.healthinsurance_active')
//     ),
//     field('Health_insurance_type__c', state => {
//       var status = dataValue('properties.health_insurance')(state);
//       var value =
//         status && status !== ''
//           ? status
//               .replace(/ /gi, ';')
//               .split(';')
//               .map(value => {
//                 return state.insuranceMap[value] || value;
//               })
//           : undefined;
//       return value ? value.join(';') : undefined;
//     }),
//     field(
//       'Other_Health_Insurance__c',
//       dataValue('properties.if_other_please_specify')
//     ),
//     field('CommCare_Form_Opened__c', state => {
//       var form_opened = dataValue('properties.last_form_opened_date_and_time')(
//         state
//       );
//       var value1 = form_opened.split('-').slice(0, 2).join('-');
//       var value2 = form_opened.split('-').slice(2).join('-');
//       var formattedValue = [value1, value2].join(' ');
//       return new Date(formattedValue).toISOString();
//     }),
//     field('Case_Closed_Date__c', state => {
//       var closed = dataValue('date_closed')(state);
//       var date = dataValue('server_modified_on')(state);
//       return closed && closed == true ? date : undefined;
//     })
//   )
// );

// fn(state => {
//   console.log('upsertIf2 done');
//   return state;
// });
// fn(state => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log('Final 4 second cooldown finished.');
//       resolve(state);
//     }, 4000);
//   });
// });
