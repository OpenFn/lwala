fn(state => {
  const owner_ids = state.paylods.map(data => data.properties.owner_id);
  const uniq_owner_ids = [...new Set(owner_ids)];

  return { ...state, uniq_owner_ids };
});

fn(state => {
  return query(
    `SELECT CommCare_User_ID__c, Id village, Parent_Geographic_Area__c area, Parent_Geographic_Area__r.Name name, Parent_Geographic_Area__r.Parent_Geographic_Area__c catchment FROM Location__c catchment WHERE CommCare_User_ID__c IN ('${state.uniq_owner_ids.join(
      "','"
    )}') GROUP BY Id, CommCare_User_ID__c, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Name, Parent_Geographic_Area__r.Parent_Geographic_Area__c`
  )(state);
});

fn(state => {
  console.log('Done querying ✅');

  return state;
});

fn(state => {
  console.log(
    'Filtering out unwanted users and applying mapping for households and housevisits'
  );

  const [reference] = state.references;

  const villageNewId = owner_id =>
    reference.records.filter(
      record => record.CommCare_User_ID__c === owner_id
    )[0].village;

  const areaNewId = owner_id =>
    reference.records.filter(
      record => record.CommCare_User_ID__c === owner_id
    )[0].area;

  const catchmentNewId = owner_id =>
    reference.records.filter(
      record => record.CommCare_User_ID__c === owner_id
    )[0].catchment;

  const supervisorMap = {
    community_health_nurse: 'Community Health Nurse',
    chw_supervisor: 'CHW Supervisor',
    chewschas: 'CHEWs/CHAs',
    other: 'Other',
    none: 'None',
  };

  const insuranceMap = {
    nhif: 'NHIF',
    Linda_mama: 'Linda mama',
    other_please_specify_if_active: 'Other',
    none: 'None',
  };

  const households = state.paylods
    .filter(
      h =>
        h.properties.commcare_username !== 'openfn.test' &&
        h.properties.commcare_username !== 'test.2021' &&
        h.properties.test_user !== 'Yes'
    )
    .map(h => {
      // Special calculations ==================================================
      const insuranceStatus = h.properties.health_insurance;
      const Health_insurance_type__c =
        insuranceStatus && insuranceStatus === 'other_please_specify_if_active'
          ? 'Other'
          : insuranceStatus === 'nhif'
          ? 'NHIF'
          : insuranceStatus === 'Linda_mama' || 'linda_mama'
          ? 'Linda mama'
          : insuranceStatus;

      const hhStatus = h.properties.Household_Status;
      const Active_Household__c =
        hhStatus && hhStatus === 'No'
          ? false
          : hhStatus === 'Yes'
          ? true
          : hhStatus;

      const reason = h.properties.Reason_for_Inactive;
      const Inactive_Reason__c = reason
        ? reason.toString().replace(/_/g, ' ')
        : null;

      const chw = h.properties.CHW_ID;
      const Household_CHW__c =
        chw === 'a030800001zQrk' ? 'a030800001zQrk5' : chw ? chw : undefined;
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
        Catchment__c: catchmentNewId(h.properties.owner_id),
        Area__c: areaNewId(h.properties.owner_id),
        Village__c: villageNewId(h.properties.owner_id),
        Household_Village__c: h.properties.village,
        Deaths_in_the_last_6_months__c:
          h.properties.deaths_in_past_6_months > 0 ? 'Yes' : 'No',
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
        Active_in_Nutrition_Program__c:
          h.properties.enrolled_in_a_lwala_nutrition_program,
        lwala_nutrition_program_enrollment_date__c:
          h.properties.lwala_nutrition_program_enrollment_date,
        Trained_in_gardening__c: h.properties.household_trained_on_gardening,
        household_trained_on_gardening_date__c:
          h.properties.when_was_the_household_trained_on_gardening,
        Seed_Input_Support__c:
          h.properties.household_provided_with_seed_input_support,
        household_provided_with_seed_input_suppo__c:
          h.properties.when_was_the_household_provided_with_seed_input_support,
        MIYCN_Trained__c: h.properties.household_trained_on_MIYC,
      };
    });

  const housevisits = state.paylods
    .filter(
      h =>
        h.properties.commcare_username !== 'openfn.test' &&
        h.properties.commcare_username !== 'test.2021' &&
        h.properties.test_user !== 'Yes'
    )
    .map(h => {
      // Special calculations ==================================================
      const visitIdC =
        h.case_id + '_' + h.properties.last_form_opened_date_and_time;

      const hVstatus = h.properties.Household_Status;
      const Active_Household__c =
        hVstatus === 'No' ? false : hVstatus === 'Yes' ? true : hVstatus;

      const insuranceTypeC = () => {
        let status = h.properties.health_insurance;
        let value =
          status && status !== ''
            ? status
                .replace(/ /gi, ';')
                .split(';')
                .map(value => {
                  return insuranceMap[value] || value;
                })
            : undefined;
        return value ? value.join(';') : undefined;
      };

      const openedC = () => {
        const form_opened = h.properties.last_form_opened_date_and_time;
        const value1 = form_opened.split('-').slice(0, 2).join('-');
        const value2 = form_opened.split('-').slice(2).join('-');
        const formattedValue = [value1, value2].join(' ');
        return new Date(formattedValue).toISOString();
      };

      return {
        CommCare_Username__c: h.properties.commcare_username,
        CommCare_Visit_ID__c: visitIdC,
        Catchment__c: catchmentNewId(h.properties.owner_id),
        'Household__r.CommCare_Code__c': h.case_id,
        Date__c: h.properties.Date,
        Form_Submitted__c: h.properties.last_form_opened_name,
        Active_Household__c: Active_Household__c,
        Active_in_Nutrition_Program__c:
          h.properties.enrolled_in_a_lwala_nutrition_program,
        lwala_nutrition_program_enrollment_date__c:
          h.properties.lwala_nutrition_program_enrollment_date,
        Trained_in_gardening__c: h.properties.household_trained_on_gardening,
        household_trained_on_gardening_date__c:
          h.properties.when_was_the_household_trained_on_gardening,
        Seed_Input_Support__c:
          h.properties.household_provided_with_seed_input_support,
        household_provided_with_seed_input_suppo__c:
          h.properties.when_was_the_household_provided_with_seed_input_support,
        MIYCN_Trained__c: h.properties.household_trained_on_MIYCN,
        Kitchen_Garden__c: h.properties.Kitchen_Garden,
        Access_to_safe_water__c: h.properties.Safe_Water,
        Treats_Drinking_Water__c: h.properties.Treats_Drinking_Water,
        Tippy_Tap__c: h.properties.Active_Handwashing_Station,
        Pit_Latrine__c: h.properties.Functional_Latrine,
        Rubbish_Pit__c: h.properties.Rubbish_Pit,
        Drying_Rack__c: h.properties.Drying_Rack,
        Cookstove__c: h.properties.Improved_Cooking_Method,
        Clothe__c: h.properties.Clothesline,
        WASH_Trained__c: h.properties.WASH_Trained,
        Has_muac_tape__c: h.properties.family_muac_tape_available,
        Uses_ITNs__c: h.properties.ITNs,
        Supervisor_Visit__c: h.properties.supervisor_visit
          ? supervisorMap[h.properties.supervisor_visit]
          : null,
        Health_insurance__c: h.properties.health_insurace_cover,
        Health_insurance_active_status__c: h.properties.healthinsurance_active,
        Health_insurance_type__c: insuranceTypeC(),

        Other_Health_Insurance__c: h.properties.if_other_please_specify,
        CommCare_Form_Opened__c: openedC(),
        // TODO: @Aleksa to find out if Case_Closed_Date__c still exist
        // Case_Closed_Date__c: h.date_closed && h.date_closed == true
        //     ? h.server_modified_on
        //     : undefined;,
      };
    });

  return { ...state, households, housevisits };
});

bulk(
  'Household__c',
  'upsert',
  {
    extIdField: 'CommCare_Code__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting households...');
    return state.households;
  }
);

fn(state => {
  console.log('house holds bulk upsert done');
  return state;
});

// TODO clean up in QA
// Uncomment this block to add cooldown
// fn(state => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log('4 second cooldown finished.');
//       resolve(state);
//     }, 4000);
//   });
// });

bulk(
  'Visit__c',
  'upsert',
  {
    extIdField: 'CommCare_Visit_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  state => {
    console.log('Bulk upserting housevisits...');
    return state.housevisits;
  }
);

fn(state => {
  console.log('house visits bulk upsert done');
  return state;
});

// TODO clean up in QA
// Uncomment this block to add cooldown
// fn(state => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       console.log('Final 4 second cooldown finished.');
//       resolve(state);
//     }, 4000);
//   });
// });
