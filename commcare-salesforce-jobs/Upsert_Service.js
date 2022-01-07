fn((state) => {
  const facilityMap = {
    Lwala_Hospital: "Lwala Hospital",
    Minyenya_Dispensary: "Minyenya Dispensary",
    Ndege_Oriedo_Dispensary: "Ndege Oriedo Dispensary",
    "Rongo_Sub-District_Hospital": "Rongo Sub-District Hospital",
    Kangeso_Dispensary: "Kangeso Dispensary",
    Ngodhe_Dispensary: "Ngodhe Dispensary",
    Ngere_Dispensary: "Ngere Dispensary",
    Verna_Health_Center: "Verna Health Center",
    Kochola_Dispensary: "Kochola Dispensary",
    Ongo_Health_Center: "Ongo Health Center",
    Other: "Other",
  };

  let serviceMapping = {};

  // {
  //   Service_UID__c: state.data.case_id,
  //   CommCare_Code__c: state.data.case_id,
  //   RecordTypeID: "01224000000YAuK",
  //   Household_CHW__c: "a030Q000008XyXV",
  //   Open_Case__c: state.data.closed,
  //   Source__c: state.data.properties.Source === "1",
  //   Clinical_facility__c: (facilityMap) => {
  //     const facility =
  //       state.data.properties.referred_facility ||
  //       state.data.properties.CHW.Facility_Services.Facility;
  //     return facilityMap[facility];
  //   },
  //   Client_Received_Services_at_Facility__c:
  //     state.data.properties.CHW.Facility_Services.Facility_Visit,
  //   Clinical_Visit_Date__c:
  //     state.data.properties.CHW.Facility_Services.Facility_Date,
  //   CHW_Followed_Up_with_the_Client__c:
  //     state.data.properties.CHW.Follow - Up.Follow - Up,
  //   Follow_Up_Date__c: state.data.properties.CHW.Follow - Up.Follow - Up_Date,
  //   Person_Complied_w_Referral_in_24_hrs__c:
  //     state.data.properties.CHW["Follow-Up"].referral_compliance,
  //   Skillled_Delivery__c:
  //     state.data.properties.CHW["Follow-Up"].skilled_delivery,
  //   Child_received_immunizations:
  //     state.data.properties.CHW["Follow-Up"].immunization,
  //   Received_a_diagnosis_for_PSBI__c:
  //     state.data.properties.CHW["Follow-Up"].PSBI.psbi_diagnosis,
  //   Received_antibiotics_per_protocol__c:
  //     state.data.properties.CHW["Follow-Up"].PSBI.antibiotic_8days,
  //   Distributed_Treatment_on_Last_Visit__c:
  //     state.data.properties.CHW["Follow-Up"].distribute_treatment,
  //   Person_had_an_adverse_drug_reaction__c:
  //     state.data.properties.CHW["Follow-Up"].adverse_drug_reaction,
  //   Defaulted__c:
  //     state.data.properties.CHW["Follow-Up"].default_on_treatment === "yes",
  //   Date_of_Default__c: state.data.properties.CHW["Follow-Up"].date_of_default,
  //   Client_s_Symptoms_Improved__c:
  //     state.data.properties.CHW["Follow-Up"].Client_Improved,
  //   Case_Type__c: state.data.properties.Case_Type,
  //   Follow_Up_By_Date__c: (state) => {
  //     var date = state.data.properties["Follow-Up_By_Date"];
  //     return date && date !== "" ? date : undefined;
  //   },
  //   Date__c: new Date(state.data.properties.date_opened).toISOString(),
  //   Reason_for_Service__c: state.data.properties.Reason_for_Service,
  //   Type_of_Service__c: state.data.properties.Type_of_Service,
  //   Malaria_Status__c: state.data.properties.Malaria_Status,
  //   Home_Treatment_Date__c: state.data.properties.home_treatment_date,
  //   Malaria_Home_Test_Date__c: state.data.properties.malaria_test_date,
  //   Home_Based_Care_Rendered__c: (state) => {
  //     const hbc = state.data.properties.Home_Based_Care_Provided;
  //     return hbc && hbc.split(" ").join(";");
  //   },
  //   Home_ORS__c: state.data.properties.clinic_ors,
  //   Home_Zinc__c: state.data.properties.clinic_zinc,
  //   Height__c: state.data.properties.height,
  //   Weight__c: state.data.properties.weight,
  //   MUAC__c: state.data.properties.muac,
  //   Nutrition_Status__c: state.data.properties.Nutrition_Status,
  // };

  const personRelationship = (state) =>
    relationship(
      "Person__r",
      "CommCare_ID__c",
      state.data.indices.parent.case_id
    );

  const caseRelationship = (state) => [
    relationship(
      "Parent_Service__r",
      "Service_UID__c",
      state.data.indices.parent.case_id
    ),
    relationship(
      "Person__r",
      "CommCare_ID__c",
      query(
        `SELECT Person__r.CommCare_ID__c FROM Service__c WHERE Service_UID__c = ${state.data.indices.parent.case_id}`
      )(state)
    ),
  ];

  if (state.data.indices.parent.case_type === "Person") {
    const Person__r = personRelationship(state);
    serviceMapping = { ...serviceMapping, [Person__r[0]]: Person__r[1] };
  }

  if (state.data.indices.parent.case_type === "Case") {
    const casesRelationships = caseRelationship(state);
    const Parent_Service__r = casesRelationships[0];
    const Person__r = casesRelationships[0];
    serviceMapping = {
      ...serviceMapping,
      [Parent_Service__r[0]]: Parent_Service__r[1],
      [Person__r[0]]: Person__r[1],
    };
  }

  console.log("SERVICE MAPPING", serviceMapping);

  return { ...state, serviceMapping };
});

// upsert("Service__c", "Service_UID__c", (state) => state.serviceMapping);
