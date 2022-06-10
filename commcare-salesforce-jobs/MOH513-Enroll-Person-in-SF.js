// ** MOH513 Enroll Person form ** -> Upserting person record based on CommCare ID

// Provide a function which checks if dates are empty strings
fn(state => {
  const truthyValue = value => value || null;
  return { ...state, truthyValue };
});

query(
  `SELECT Id, Parent_Geographic_Area__c, Parent_Geographic_Area__r.Name, Parent_Geographic_Area__r.Parent_Geographic_Area__c FROM Location__c WHERE CommCare_User_ID__c = '${dataValue(
    'form.subcase_0.case.create.owner_id'
  )(state)}'`
);

fn(state => ({
  ...state,
  data: {
    ...state.data,
    villageNewId:
      state.references[0].records && state.references[0].records.length !== 0
        ? state.references[0].records[0].Id
        : undefined,
    areaNewId:
      state.references[0].records && state.references[0].records.length !== 0
        ? state.references[0].records[0].Parent_Geographic_Area__c
        : undefined,
    catchmentNewId:
      state.references[0].records && state.references[0].records.length !== 0
        ? (state.references[0].records[0].Parent_Geographic_Area__r 
          ? state.references[0].records[0].Parent_Geographic_Area__r.Parent_Geographic_Area__c
          : undefined)
        : undefined,
  },
}));

fn(state => {
  if (
    dataValue('form.Source')(state) == 1 &&
    dataValue('metadata.username')(state) !== 'test.2021' &&
    dataValue('metadata.username')(state) !== 'openfn.test' &&
    dataValue('form.test_user')(state)  !== 'Yes'
  ) {
    console.log('case id', state.data.form.subcase_0.case['@case_id']);
    console.log('case id', state.data.form.case['@case_id']);
    return upsert(
      'Person__c',
      'CommCare_ID__c',
      fields(
        field('CommCare_Username__c', dataValue('metadata.username')),
        field('CommCare_ID__c', state.data.form.subcase_0.case['@case_id']),
        relationship(
          'Household__r',
          'CommCare_Code__c',
          state.data.form.case['@case_id']
        ),
        field('Catchment__c', dataValue('catchmentNewId')),
        field('Area__c', dataValue('areaNewId')),
        field('Household_Village__c', dataValue('form.village')),
        //field('Household_CHW__c', dataValue('form.CHW_ID')),
        field('Name', state => {
          var status = dataValue('form.Person.Basic_Information.Child_Status')(
            state
          );
          var name1 = dataValue('form.Person.Basic_Information.Person_Name')(
            state
          );
          var name2 =
            name1 === undefined
              ? 'No Name'
              : name1.replace(/\w\S*/g, function (txt) {
                  return (
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );
                });
          //If the Child_Status is 'Unborn', we return 'Unborn Child'. Otherwise return the name.
          return status !== 'Unborn' ? name2 : 'Unborn Child';
        }),
        relationship('RecordType', 'Name', state => {
          var rt = dataValue('form.Person.Basic_Information.Record_Type')(
            state
          );
          var status = dataValue('form.Person.Basic_Information.Child_Status')(
            state
          );
          //Here we set set RT to 'Child' if unborn child
          if (rt) {
            return rt === 'Unborn' || (status && status === 'Unborn')
              ? 'Child'
              : rt.toString().replace(/_/g, ' ');
          }
          return null;
        }),
        field('Client_Status__c', 'Active'),
        field('Relation_to_the_head_of_the_household__c', state => {
          var relation = dataValue(
            'form.Person.Basic_Information.relation_to_hh'
          )(state);
          if (relation) {
            relation = relation.toString().replace(/_/g, ' ');
            var toTitleCase =
              relation.charAt(0).toUpperCase() + relation.slice(1);
            return toTitleCase;
          }

          return null;
        }),
        field('Child_Status__c', state => {
          var dob = dataValue('form.Person.Basic_Information.DOB')(state);
          var status = dataValue('form.Person.Basic_Information.Child_Status')(
            state
          );
          return dob !== undefined || status == 'Born' ? 'Born' : 'Unborn'; //what about deceased?
        }),
        field('Date_of_Birth__c', state =>
          state.truthyValue(
            dataValue('form.Person.Basic_Information.DOB')(state)
          )
        ),
        field('Gender__c', dataValue('form.Person.Basic_Information.Gender')),
        field(
          'Birth_Certificate__c',
          dataValue('form.Person.Basic_Information.birth_certificate')
        ),
        /*field(
          'Currently_enrolled_in_school__c',
          dataValue('form.Person.Basic_Information.enrolled_in_school')
        ),//Check */
        field('Education_Level__c', state => {
          var level = dataValue(
            'properties.Education_Level'
          )(state);
          return level ? level.toString().replace(/_/g, ' ') : null;
        }),
        field(
          'Telephone__c',
          dataValue(
            'form.Person.Basic_Information.Contact_Info.contact_phone_number_short'
          )
        ),
        field(
          'Family_Planning__c',
          dataValue(
            'form.Person.Basic_Information.family_planning.Currently_on_family_planning'
          )
        ),
        field(
          'Family_Planning_Method__c',
          dataValue(
            'form.Person.Basic_Information.family_planning.Family_Planning_Method'
          )
        ),
        field(
          'Use_mosquito_net__c',
          dataValue('form.Person.Basic_Information.person_info.sleep_under_net')
        ),
        field('Chronic_illness__c', state => {
          var chronic = dataValue(
            'form.Person.Basic_Information.person_info.chronic_illness'
          )(state);
          if (chronic) {
            chronic = chronic
              .toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(';');
            return chronic.toString().replace(/_/g, ' ');
          } else {
            chronic == null;
          }
          return chronic;
        }),
        field(
          'Two_weeks_or_more_cough__c',
          dataValue('form.Person.Basic_Information.person_info.cough_for_2wks')
        ),
        field(
          'Knowledge_of_HIV_Status__c',
          dataValue(
            'form.Person.Basic_Information.person_info.known_hiv_status'
          )
        ),
        field(
          'HIV_Status__c',
          dataValue('form.Person.Basic_Information.person_info.hiv_status')
        ),
        field('Disability__c', state => {
          var disability = dataValue(
            'form.Person.Basic_Information.person_info.disability'
          )(state);
          var toTitleCase =
            disability !== undefined
              ? disability
                  .toLowerCase()
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(';')
              : null;
          return toTitleCase;
        }),
        field('Other_disability__c', state => {
          var disability = dataValue(
            'form.Person.Basic_Information.person_info.other_disability'
          )(state);
          var toTitleCase =
            disability !== undefined
              ? disability
                  .toLowerCase()
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(';')
              : null;
          return toTitleCase;
        }),
        field('Active_TT5_Mother__c', state => {
          var preg = dataValue('form.Person.TT5.Mother_Information.Pregnant')(
            state
          );
          return preg == 'Yes' ? 'Yes' : null;
        }),
        field('TT5_Mother_Registrant__c', state => {
          var preg = dataValue('form.Person.TT5.Mother_Information.Pregnant')(
            state
          );
          return preg == 'Yes' ? 'Yes' : null;
        }),
        field('Active_in_Thrive_Thru_5__c', state => {
          var age = dataValue('form.Person.Basic_Information.age')(state);
          var preg = dataValue('form.Person.TT5.Mother_Information.Pregnant')(
            state
          );
          return age < 5 || preg == 'Yes' ? 'Yes' : 'No';
        }),
        field('Active_in_HAWI__c', state => {
          var status = dataValue(
            'form.Person.Basic_Information.person_info.hiv_status'
          )(state);
          return status == 'positive' ? 'Yes' : 'No';
        }),
        field('Enrollment_Date__c', state => {
          var age = dataValue('form.Person.Basic_Information.age')(state);
          var date = dataValue('metadata.timeEnd')(state);
          var preg = dataValue('form.Person.TT5.Mother_Information.Pregnant')(
            state
          );
          return age < 5 || preg == 'Yes' ? date : null;
        }),
        field('HAWI_Enrollment_Date__c', state => {
          var date = dataValue('metadata.timeEnd')(state);
          var status = dataValue(
            'form.Person.Basic_Information.person_info.hiv_status'
          )(state);
          return status == 'positive' ? date : null;
        }),
        field('Thrive_Thru_5_Registrant__c', state => {
          var age = dataValue('form.Person.Basic_Information.age')(state);
          var preg = dataValue('form.Person.TT5.Mother_Information.Pregnant')(
            state
          );
          return age < 5 || preg == 'Yes' ? 'Yes' : 'No';
        }),
        field('HAWI_Registrant__c', state => {
          var status = dataValue(
            'form.Person.Basic_Information.person_info.hiv_status'
          )(state);
          return status == 'positive' ? 'Yes' : 'No';
        }),
        field(
          'LMP__c',
          dataValue('form.Person.TT5.Child_Information.ANCs.LMP')
        ),
        field('Source__c', 1),
        field('ANC_1__c', state =>
          state.truthyValue(
            dataValue('form.Person.TT5.Child_Information.ANCs.ANC_1')(state)
          )
        ),
        field('ANC_2__c', state =>
          state.truthyValue(
            dataValue('form.Person.TT5.Child_Information.ANCs.ANC_2')(state)
          )
        ),
        field('ANC_3__c', state =>
          state.truthyValue(
            dataValue('form.Person.TT5.Child_Information.ANCs.ANC_3')(state)
          )
        ),
        field('ANC_4__c', state =>
          state.truthyValue(
            dataValue('form.Person.TT5.Child_Information.ANCs.ANC_4')(state)
          )
        ),
        field('ANC_5__c', state =>
          state.truthyValue(
            dataValue('form.Person.TT5.Child_Information.ANCs.ANC_5')(state)
          )
        ),
        field('BCG__c', state =>
          state.truthyValue(
            dataValue('form.Person.TT5.Child_Information.Immunizations.BCG')(
              state
            )
          )
        ),
        field(
          'OPV_0__c',
          dataValue('form.Person.TT5.Child_Information.Immunizations.OPV_0')
        ),
        field(
          'OPV_1__c',
          dataValue(
            'form.Person.TT5.Child_Information.Immunizations.OPV_PCV_Penta_1'
          )
        ),
        field(
          'OPV_2__c',
          dataValue(
            'form.Person.TT5.Child_Information.Immunizations.OPV_PCV_Penta_2'
          )
        ),
        field(
          'OPV_3__c',
          dataValue(
            'form.Person.TT5.Child_Information.Immunizations.OPV_PCV_Penta_3'
          )
        ),
        field(
          'Measles_6__c',
          dataValue('form.Person.TT5.Child_Information.Immunizations.Measles_6')
        ),
        field(
          'Measles_9__c',
          dataValue('form.Person.TT5.Child_Information.Immunizations.Measles_9')
        ),
        field(
          'Measles_18__c',
          dataValue(
            'form.Person.TT5.Child_Information.Immunizations.Measles_18'
          )
        ),
        field('Pregnant__c', state => {
          var preg = dataValue('form.Person.TT5.Mother_Information.Pregnant')(
            state
          );
          return preg == 'Yes' ? true : false;
        }),
        field(
          'Gravida__c',
          dataValue(
            'form.Person.TT5.Mother_Information.Pregnancy_Information.Gravida'
          )
        ),
        field(
          'Parity__c',
          dataValue(
            'form.Person.TT5.Mother_Information.Pregnancy_Information.Parity'
          )
        ),
        field(
          'Unique_Patient_Code__c',
          dataValue('form.Person.HAWI.Unique_Patient_Code')
        ),
        field(
          'Active_in_Support_Group__c',
          dataValue('form.Person.HAWI.Active_in_Support_Group')
        ),
        field('CommCare_HH_Code__c', state.data.form.case['@case_id']),
        field('Currently_on_ART_s__c', dataValue('form.Person.HAWI.ART')),
        field('ART_Regimen__c', dataValue('form.Person.HAWI.ARVs')),
        field(
          'Exclusive_Breastfeeding__c',
          dataValue(
            'form.Person.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding'
          )
        ),
        field(
          'Immediate_Breastfeeding__c',
          dataValue('form.subcase_0.case.update.Immediate_Breastfeeding')
        ),
        field(
          'Vitamin_A__c',
          dataValue('form.Person.TT5.Child_Information.nutrition.vitamin_a')
        ),
        field(
          'Food_groups_3_times_a_day__c',
          dataValue('form.Person.TT5.Child_Information.nutrition.food_groups')
        ),
        field(
          'Initial_MUAC__c',
          dataValue('form.Person.TT5.Child_Information.nutrition.MUAC')
        ),
        field(
          'MCH_booklet__c',
          dataValue('form.Person.TT5.Mother_Information.mch_booklet')
        ),
        field('Preferred_Care_Facility__c', state => {
          var facility = dataValue('form.Person.HAWI.Preferred_Care_Facility')(
            state
          );
          return facility ? facility.toString().replace(/_/g, ' ') : null;
        }),
        field('Delivery_Facility__c', state => {
          var facility = dataValue(
            'form.Person.TT5.Child_Information.Delivery_Information.Birth_Facility'
          )(state);
          return facility ? facility.toString().replace(/_/g, ' ') : null;
        }),
        field(
          'Delivery_Facility_Other__c',
          dataValue(
            'form.Person.TT5.Child_Information.Delivery_Information.Delivery_Facility_Other'
          )
        ),
        field('Place_of_Delivery__c', state => {
          var facility = dataValue(
            'form.Person.TT5.Child_Information.Delivery_Information.Skilled_Unskilled'
          )(state);
          if (facility !== undefined) {
            return facility == 'Skilled' ? 'Facility' : 'Home';
          }
          return facility;
        }),
        field(
          'Cough_14_days_referral__c',
          dataValue('form.Person.Basic_Information.person_info.refer_for_cough')
        ),
        field('Cough_14_days_referral_date__c', state =>
          state.truthyValue(
            dataValue(
              'form.Person.Basic_Information.person_info.date_refer_to_clinc'
            )(state)
          )
        ),
        field(
          'Know_HIV_status__c',
          dataValue(
            'form.Person.Basic_Information.person_info.known_hiv_status'
          )
        ),
        field(
          'HIV_counselling_and_testing_referral__c',
          dataValue(
            'form.Person.Basic_Information.person_info.hiv_counselling_testing'
          )
        ),
        field('HIV_counseling_and_testing_referral_date__c', state =>
          state.truthyValue(
            dataValue(
              'form.Person.Basic_Information.person_info.when_hiv_testing'
            )(state)
          )
        ),
        field(
          'Chronic_illness_referral__c',
          dataValue(
            'form.Person.Basic_Information.person_info.refer_chronic_illness'
          )
        ),
        field('Chronic_illness_referral_date__c', state =>
          state.truthyValue(
            dataValue(
              'form.Person.Basic_Information.person_info.datereferal_chronic_illness'
            )(state)
          )
        ),
        field(
          'Current_Height__c',
          dataValue('form.Person.TT5.Child_Information.nutrition.height')
        ),
        field('Nutrition_referral_date__c', state =>
          state.truthyValue(
            dataValue(
              'form.Person.TT5.Child_Information.nutrition.date_malnutrition'
            )(state)
          )
        ),
        field('Received_pregnancy_test__c', state => {
          var preg = dataValue(
            'form.Person.Basic_Information.family_planning.administer_preg_test'
          )(state);
          return preg && preg === 'OK' ? 'Yes' : preg;
        }),
        field(
          'Pregnancy_test_result__c',
          dataValue(
            'form.Person.Basic_Information.family_planning.pregnancy_test_result'
          )
        ),
        field(
          'Pregnancy_referral__c',
          dataValue('form.Person.Basic_Information.family_planning.refer_preg')
        ),
        field('Pregnancy_referral_date__c', state =>
          state.truthyValue(
            dataValue(
              'form.Person.Basic_Information.family_planning.referal_pregnancy'
            )(state)
          )
        ),
        field('Family_Planning__c', state => {
          var plan = dataValue(
            'form.Person.Basic_Information.family_planning.Currently_on_family_planning'
          )(state);
          return plan ? 'Yes' : plan;
        }),
        field('Family_Planning_Method__c', state => {
          var method = dataValue(
            'form.Person.Basic_Information.family_planning.Family_Planning_Method'
          )(state);
          return method ? method.toString().replace(/_/g, ' ') : method;
        }),
        field('Reasons_for_not_taking_FP_method__c', state => {
          var reason = dataValue(
            'form.Person.Basic_Information.family_planning.No_FPmethod_reason'
          )(state);
          var reasonsMap = {
            lack_of_access_to_fp_information:
              'Lack of access to FP information',
            lack_of_hospitals_or_places_where_fp_services_can_be_accessed:
              'Lack of hospitals or places where FP services can be accessed',
            myths_and_misconceptions: 'Myths and misconceptions',
            barriers_at_service_delivery_points:
              'Barriers at service delivery points',
            pregnant: 'The client is pregnant',
            intentions_of_getting_pregnant: 'Intentions of getting pregnant',
            not_sexually_active: 'The client is not sexually active',
            other_barriers_culture_male_partners_parents_etc:
              'Other barriers (culture, male partners, parents, etc)',
          };
          return reason ? reasonsMap[reason] : reason;
        }),
        field('Reason_for_not_taking_a_pregnancy_test__c', state => {
          var reason = dataValue(
            'form.Person.asic_Information.family_planning.No_Preg_Test'
          )(state);
          return reason ? reason.toString().replace(/_/g, ' ') : reason;
        }),
        field('Cause_of_Death__c', state => {
          var death = dataValue(
            'form.Person.Basic_Information.cause_of_death_dead'
          )(state);
          return death ? death.toString().replace(/_/g, ' ') : death;
        }),
        field(
          'Last_Modified_Date_CommCare__c',
          dataValue('server_modified_on')
        ),
        field('Case_Closed_Date__c', state => {
          var closed = dataValue('form.case.update.closed')(state);
          var date = dataValue('server_modified_on')(state);
          return closed && closed == true ? date : undefined;
        })
      )
    )(state);
  }
  console.log('form.Source does not equal 1, not upserting person record.');
  return state;
});

// **Update HH Members Total_Number_of_Members
fn(state => {
  if (
    dataValue('form.Person.Updated_Total_Number_of_Members')(state) !== null &&
    dataValue('form.Person.Updated_Total_Household_Members')(state) !==
      undefined
  ) {
    return upsert(
      'Household__c',
      'CommCare_Code__c',
      fields(
        field('CommCare_Code__c', state.data.form.case['@case_id']),
        field(
          'Total_household_people__c',
          dataValue('Updated_Total_Number_of_Members')
        )
      )
    )(state);
  }

  console.log('Members are null or undefined, not upserting household.');
  return state;
});

// **Upserting Supervisor Visit records; checks if Visit already exists via CommCare Visit ID which = CommCare submission ID

fn(state => {
  if (
    dataValue('form.Source')(state) == 1 &&
    dataValue('metadata.username')(state) !== 'test.2021'
  ) {
    return upsert(
      'Visit__c',
      'CommCare_Visit_ID__c',
      fields(
        field('CommCare_Visit_ID__c', dataValue('id')),
        relationship(
          'Household__r',
          'CommCare_Code__c',
          state.data.form.case['@case_id']
        ),
        field('Visit_UID__c', state => {
          var hh = state.data.form.case['@case_id'];
          var date = dataValue('form.Date')(state);
          return hh + date;
        }),
        //field('Name', 'CHW Visit'),
        field('Supervisor_Visit__c', state => {
          var visit = dataValue('form.supervisor_visit')(state);
          return visit
            ? visit.toString().replace(/ /g, ';').replace(/_/g, ' ')
            : null;
        }),
        field('Date__c', state =>
          state.truthyValue(dataValue('form.Date')(state))
        ),
        field('Household_CHW__c', state => {
          var chw = dataValue('form.CHW_ID')(state);
          return chw === 'a030800001zQrk'
            ? 'a030800001zQrk5'
            : chw === 'a031x000004oJe2' || chw === 'a031x000004oJe2AAE'
            ? 'a0308000021zm8Z'
            : chw
            ? chw
            : 'a0308000021zm8Z';
          //otherwise return 'Unknown CHW'
        }),
        //field('Household_CHW__c', 'a031x000002S9lm'), //HARDCODED FOR SANDBOX TESTING --> To replace with line above
        field('Location__latitude__s', state => {
          var lat = state.data.metadata.location;
          return lat !== null ? lat.substring(0, lat.indexOf(' ')) : null;
        }),
        field('Location__longitude__s', state => {
          var long = state.data.metadata.location;
          return long !== null
            ? long.substring(long.indexOf(' ') + 1, long.indexOf(' ') + 7)
            : null;
        })
      )
    )(state);
  }
  console.log('Data is from test user, not inserting visit');
  return state;
});
