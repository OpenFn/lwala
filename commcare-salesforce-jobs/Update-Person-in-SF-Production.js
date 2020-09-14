alterState((state) => {
  //Alters CommCare arrays so that they are formatted as arrays instead of just single values.
  if (
    dataValue("$.form.TT5.Child_Information.Clinical_Services")(state) !==
    undefined
  ) {
    const clinical = state.data.form.TT5.Child_Information.Clinical_Services;
    if (!Array.isArray(clinical)) {
      state.data.form.TT5.Child_Information.Clinical_Services = [clinical];
    }
  }

  if (
    dataValue("$.form.HAWI.Clinical_Services_Rendered")(state) !== undefined
  ) {
    const clinical1 = state.data.form.HAWI.Clinical_Services_Rendered;
    if (!Array.isArray(clinical1)) {
      state.data.form.HAWI.Clinical_Services_Rendered = [clinical1];
    }
  }

  const supervisorMap = {
    community_health_nurse: "Community Health Nurse",
    chw_supervisor: "CHW Supervisor",
    chewschas: "CHEWs/CHAs",
    other: "Other",
    none: "None",
  };

  return { ...state, supervisorMap };
});

//Deliveries
steps(
  combine(function (state) {
    if (dataValue("$.form.Status.Client_Status")(state) == "Active") {
      //Deliveries
      if (
        dataValue("$.form.TT5.Child_Information.Delivery_Information.Delivery")(
          state
        ) == "Yes"
      ) {
        //Unskilled delivery: upsert person with delivery information, but no service provided
        if (
          dataValue(
            "$.form.TT5.Child_Information.Delivery_Information.Delivery_Type"
          )(state) == "Unskilled"
        ) {
          upsert(
            "Person__c",
            "CommCare_ID__c",
            fields(
              field("Source__c", 1),
              field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
              field("Name", function (state) {
                var name1 = dataValue("$.form.final_name")(state);
                var name2 = name1.replace(/\w\S*/g, function (txt) {
                  return (
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );
                });
                return name2;
              }),
              field("Place_of_Delivery__c", "Home"),
              field(
                "Date_of_Birth__c",
                dataValue(
                  "$.form.TT5.Child_Information.Delivery_Information.DOB"
                )
              ),
              field(
                "Child_Status__c",
                dataValue("form.case.update.Child_Status")
              ),
              field("Immediate_Breastfeeding__c", function (state) {
                var var1 = dataValue(
                  "form.TT5.Child_Information.Delivery_Information.Breastfeeding_Delivery"
                )(state);
                if (var1 == "---") {
                  var1 = undefined;
                } else if (var1 == "yes") {
                  var1 = "Yes";
                }
                return var1;
              }),
              field(
                "Counselled_on_Exclusive_Breastfeeding__c",
                dataValue(
                  "$.form.TT5.Child_Information.Exclusive_Breastfeeding.counseling"
                )
              ),
              field(
                "Exclusive_Breastfeeding__c",
                dataValue(
                  "form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding"
                )
              )
            )
          )(state);
        } else {
          //Skilled delivery: service provided, and upsert remaining information for person
          //update: no longer providing service because of Salesforce lock row issue, person upsert here will now run parallel to person upesert for
          //unskilled delivery
          upsert(
            "Person__c",
            "CommCare_ID__c",
            fields(
              field("Source__c", 1),
              field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
              field("Name", function (state) {
                var name1 = dataValue("$.form.final_name")(state);
                var name2 = name1.replace(/\w\S*/g, function (txt) {
                  return (
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );
                });
                return name2;
              }),
              field("Place_of_Delivery__c", "Facility"),
              field("Delivery_Facility__c", function (state) {
                return dataValue(
                  "$.form.TT5.Child_Information.Delivery_Information.Delivery_Facility"
                )(state)
                  .toString()
                  .replace(/_/g, " ");
              }),
              field(
                "Date_of_Birth__c",
                dataValue(
                  "$.form.TT5.Child_Information.Delivery_Information.DOB"
                )
              ),
              field(
                "Child_Status__c",
                dataValue("form.case.update.Child_Status")
              ),
              field("Immediate_Breastfeeding__c", function (state) {
                var var1 = dataValue(
                  "form.TT5.Child_Information.Delivery_Information.Breastfeeding_Delivery"
                )(state);
                if (var1 == "---") {
                  var1 = undefined;
                } else if (var1 == "yes") {
                  var1 = "Yes";
                }
                return var1;
              }),
              field(
                "Counselled_on_Exclusive_Breastfeeding__c",
                dataValue(
                  "$.form.TT5.Child_Information.Exclusive_Breastfeeding.counseling"
                )
              ),
              field(
                "Exclusive_Breastfeeding__c",
                dataValue(
                  "form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding"
                )
              )
            )
          )(state);
        }
      }
    }
    //Transfer Outs
    else if (
      dataValue("$.form.Status.Client_Status")(state) == "Transferred_Out"
    ) {
      upsert(
        "Person__c",
        "CommCare_ID__c",
        fields(
          field("Source__c", 1),
          field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
          field("Client_Status__c", "Transferred Out"),
          field("Active_in_Thrive_Thru_5__c", "No"),
          field("Inactive_Date__c", dataValue("$.form.Date")),
          field("Active_in_HAWI__c", "No"),
          field("Active_TT5_Mother__c", "No"),
          field(
            "Date_of_Transfer_Out__c",
            dataValue("$.form.Status.Date_of_Transfer_Out")
          )
        )
      )(state);
    }
    //Lost to Follow Up
    else if (
      dataValue("$.form.Status.Client_Status")(state) == "Lost_to_Follow_Up"
    ) {
      upsert(
        "Person__c",
        "CommCare_ID__c",
        fields(
          field("Source__c", 1),
          field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
          field("Client_Status__c", "Lost to Follow-Up"),
          field("Active_in_Thrive_Thru_5__c", "No"),
          field("Active_in_HAWI__c", "No"),
          field("Active_TT5_Mother__c", "No"),
          field("Date_Last_Seen__c", dataValue("$.form.Status.Date_Last_Seen")),
          field("Inactive_Date__c", dataValue("$.form.Date"))
        )
      )(state);
    }
    //Graduated from Thrive Thru 5
    else if (
      dataValue("$.form.Status.Client_Status")(state) == "Graduated_From_TT5"
    ) {
      upsert(
        "Person__c",
        "CommCare_ID__c",
        fields(
          field("Source__c", 1),
          field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
          field("Client_Status__c", "Graduated From TT5"),
          field("Active_in_Thrive_Thru_5__c", "No"),
          field("Active_in_HAWI__c", "No"),
          field("Active_TT5_Mother__c", "No"),
          field("Date_Last_Seen__c", dataValue("$.form.Status.Date_Last_Seen")),
          field("Inactive_Date__c", dataValue("$.form.Date"))
        )
      )(state);
    }
    //Data entry error
    else if (
      dataValue("$.form.Status.Client_Status")(state) == "Data_Entry_Error"
    ) {
      upsert(
        "Person__c",
        "CommCare_ID__c",
        fields(
          field("Source__c", 1),
          field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
          field("Client_Status__c", "Data Entry Error"),
          field("Active_in_Thrive_Thru_5__c", "No"),
          field("Active_TT5_Mother__c", "No"),
          field("Active_in_HAWI__c", "No"),
          field("Inactive_Date__c", dataValue("$.form.Date"))
        )
      )(state);
    }
    //client deceased
    else if (dataValue("$.form.Status.Client_Status")(state) == "Deceased") {
      upsert(
        "Person__c",
        "CommCare_ID__c",
        fields(
          field("Source__c", 1),
          field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
          field("Client_Status__c", "Deceased"),
          field("Active_in_Thrive_Thru_5__c", "No"),
          field("Active_in_HAWI__c", "No"),
          field("Active_TT5_Mother__c", "No"),
          field("Date_of_Death__c", dataValue("$.form.Status.Date_of_Death")),
          field("Cause_of_Death__c", function (state) {
            return dataValue("$.form.Status.Cause_of_Death")(state)
              .toString()
              .replace(/_/g, " ");
          }),
          field("Inactive_Date__c", dataValue("$.form.Date"))
        )
      )(state);
    }
  }),
  //Need to update CHWs
  combine(function (state) {
    //Person is added to TT5 (this can only happen to a mother, a child wouldn't be in HAWI before joining TT5)
    if (
      dataValue("$.form.Basic_Information.Basic_Information.Add_to_TT5")(
        state
      ) == "Yes"
    ) {
      upsert(
        "Person__c",
        "CommCare_ID__c",
        fields(
          field("Source__c", 1),
          field("Name", function (state) {
            var name1 = dataValue("$.form.final_name")(state);
            var name2 = name1.replace(/\w\S*/g, function (txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
            return name2;
          }),
          field("Active_TT5_Mother__c", "Yes"),
          field("TT5_Mother_Registrant__c", "Yes"),
          field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
          field(
            "Active_in_Support_Group__c",
            dataValue("$.form.HAWI.Support_Group")
          ),
          field(
            "Preferred_Care_Facility__c",
            dataValue("$.form.HAWI.Preferred_Care_F.Preferred_Care_Facility")
          )
        )
      )(state);
    } else {
      //Person is added to HAWI
      if (
        dataValue("$.form.Basic_Information.Basic_Information.Add_to_HAWI")(
          state
        ) == "Yes"
      ) {
        upsert(
          "Person__c",
          "CommCare_ID__c",
          fields(
            field("Source__c", 1),
            field("Name", function (state) {
              var name1 = dataValue("$.form.final_name")(state);
              var name2 = name1.replace(/\w\S*/g, function (txt) {
                return (
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
              });
              return name2;
            }),
            field("Active_in_HAWI__c", "Yes"),
            field("HAWI_Registrant", "Yes"),
            field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
            field(
              "Active_in_Support_Group__c",
              dataValue("$.form.HAWI.Support_Group")
            ),
            field(
              "Preferred_Care_Facility__c",
              dataValue("$.form.HAWI.Preferred_Care_F.Preferred_Care_Facility")
            ),
            field("Immediate_Breastfeeding__c", function (state) {
              var var1 = dataValue(
                "form.TT5.Child_Information.Delivery_Information.Breastfeeding_Delivery"
              )(state);
              if (var1 == "---") {
                var1 = undefined;
              } else if (var1 == "yes") {
                var1 = "Yes";
              }
              return var1;
            }),
            field(
              "Exclusive_Breastfeeding__c",
              dataValue(
                "form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding"
              )
            )
          )
        )(state);
      } else {
        if (
          dataValue("form.@xmlns")(state) !=
          "http://openrosa.org/formdesigner/60AF0A3E-A8A1-425B-B86B-35E0C65C8BC4"
        ) {
          upsert(
            "Person__c",
            "CommCare_ID__c",
            fields(
              field("Name", function (state) {
                var name1 = dataValue("$.form.final_name")(state);
                var name2 = name1.replace(/\w\S*/g, function (txt) {
                  return (
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  );
                });
                return name2;
              }),
              field("Source__c", 1),
              field("CommCare_ID__c", dataValue("$.form.case.@case_id")),
              field(
                "Active_in_Support_Group__c",
                dataValue("$.form.HAWI.Support_Group")
              ),
              field(
                "Preferred_Care_Facility__c",
                dataValue(
                  "$.form.HAWI.Preferred_Care_F.Preferred_Care_Facility"
                )
              ),
              field("Immediate_Breastfeeding__c", function (state) {
                var var1 = dataValue(
                  "form.TT5.Child_Information.Delivery_Information.Breastfeeding_Delivery"
                )(state);
                if (var1 == "---") {
                  var1 = undefined;
                } else if (var1 == "yes") {
                  var1 = "Yes";
                }
                return var1;
              }),
              field(
                "Exclusive_Breastfeeding__c",
                dataValue(
                  "form.TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding"
                )
              )
            )
          )(state);
        }
      }
    }
  }),
  //** ANC Services ************************************************//
  //ANC1
  combine(function (state) {
    const { ANCs } = state.data.form.TT5.Child_Information;
    if (ANCs && ANCs.ANC_1) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue("$.form.TT5.Child_Information.ANCs.ANC_1")(
              state
            );
            return id + date + "ANC1";
          }),
          field("Source__c", 1),
          field("Reason_for_Service__c", "ANC 1"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue("$.form.TT5.Child_Information.ANCs.ANC_1")
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.ANCs.Facility1"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //ANC2
  combine(function (state) {
    const { ANCs } = state.data.form.TT5.Child_Information;
    if (ANCs && ANCs.ANC_2) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue("$.form.TT5.Child_Information.ANCs.ANC_2")(
              state
            );
            return id + date + "ANC2";
          }),
          field("Source__c", 1),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field("Reason_for_Service__c", "ANC 2"),
          field(
            "Date__c",
            dataValue("$.form.TT5.Child_Information.ANCs.ANC_2")
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.ANCs.Facility2"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //ANC3
  combine(function (state) {
    const { ANCs } = state.data.form.TT5.Child_Information;
    if (ANCs && ANCs.ANC_3) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue("$.form.TT5.Child_Information.ANCs.ANC_3")(
              state
            );
            return id + date + "ANC3";
          }),
          field("Source__c", true),
          field("Reason_for_Service__c", "ANC 3"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue("$.form.TT5.Child_Information.ANCs.ANC_3")
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.ANCs.Facility3"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //ANC4
  combine(function (state) {
    const { ANCs } = state.data.form.TT5.Child_Information;
    if (ANCs && ANCs.ANC_4) {
      console.log("Inserting ANC4");
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue("$.form.TT5.Child_Information.ANCs.ANC_4")(
              state
            );
            return id + date + "ANC4";
          }),
          field("Source__c", 1),
          field("Reason_for_Service__c", "ANC 4"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue("$.form.TT5.Child_Information.ANCs.ANC_4")
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.ANCs.Facility4"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //ANC5
  combine(function (state) {
    const { ANCs } = state.data.form.TT5.Child_Information;
    if (ANCs && ANCs.ANC_5) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue("$.form.TT5.Child_Information.ANCs.ANC_5")(
              state
            );
            return id + date + "ANC5";
          }),
          field("Source__c", 1),
          field("Reason_for_Service__c", "ANC 5"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue("$.form.TT5.Child_Information.ANCs.ANC_5")
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.ANCs.Facility5"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //** END ANC ************************************************//
  //** Immunization Services ************************************************//
  //BCG REVIEWED
  combine(function (state) {
    const { Immunizations } = state.data.form.TT5.Child_Information;
    if (Immunizations && Immunizations.BCG_h) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue(
              "$.form.TT5.Child_Information.Immunizations.BCG"
            )(state);
            return id + date + "BCG";
          }),
          field("Source__c", 1),
          field("Reason_for_Service__c", "BCG"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue("$.form.TT5.Child_Information.Immunizations.BCG")
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Facility_BCG"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //OPV0 REVIEWED
  combine(function (state) {
    const { Immunizations } = state.data.form.TT5.Child_Information;
    if (Immunizations && Immunizations.OPV0_h) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue(
              "$.form.TT5.Child_Information.Immunizations.OPV0_h"
            )(state);
            return id + date + "OPV0";
          }),
          field("Source__c", 1),
          field("Reason_for_Service__c", "OPV0"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue("$.form.TT5.Child_Information.Immunizations.OPV_0")
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Facility_OPV_0"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //OPV1 REVIEWED
  combine(function (state) {
    const { Immunizations } = state.data.form.TT5.Child_Information;
    if (Immunizations && Immunizations.OPV1_h) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue(
              "$.form.TT5.Child_Information.Immunizations.OPV1_h"
            )(state);
            return id + date + "OPV1";
          }),
          field("Source__c", 1),
          field("Reason_for_Service__c", "OPV1"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue(
              "$.form.TT5.Child_Information.Immunizations.OPV_PCV_Penta_1"
            )
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Facility_OPV_1"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //OPV2
  combine(function (state) {
    const { Immunizations } = state.data.form.TT5.Child_Information;
    if (Immunizations && Immunizations.OPV2_h) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Source__c", 1),
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue(
              "$.form.TT5.Child_Information.Immunizations.OPV2_h"
            )(state);
            return id + date + "OPV2";
          }),
          field("Reason_for_Service__c", "OPV2"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue(
              "$.form.TT5.Child_Information.Immunizations.OPV_PCV_Penta_2"
            )
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Facility_OPV_2"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //OPV3
  combine(function (state) {
    const { Immunizations } = state.data.form.TT5.Child_Information;
    if (Immunizations && Immunizations.OPV3_h) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Source__c", 1),
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue(
              "$.form.TT5.Child_Information.Immunizations.OPV3_h"
            )(state);
            return id + date + "OPV3";
          }),
          field("Reason_for_Service__c", "OPV3"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue(
              "$.form.TT5.Child_Information.Immunizations.OPV_PCV_Penta_3"
            )
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Facility_OPV_3"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //Measles 6
  combine(function (state) {
    const { Immunizations } = state.data.form.TT5.Child_Information;
    if (Immunizations && Immunizations.Measles6_h) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Measles6_h"
            )(state);
            return id + date + "Measles6";
          }),
          field("Source__c", 1),
          field("Reason_for_Service__c", "Measles 6"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue("$.form.TT5.Child_Information.Immunizations.Measles_6")
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Facility_Measles_6"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //Measles 9
  combine(function (state) {
    const { Immunizations } = state.data.form.TT5.Child_Information;
    if (Immunizations && Immunizations.Measles9_h) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Measles9_h"
            )(state);
            return id + date + "Measles9";
          }),
          field("Source__c", 1),
          field("Reason_for_Service__c", "Measles 9"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue("$.form.TT5.Child_Information.Immunizations.Measles_9")
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Facility_Measles_9"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),

  //Measles 18
  combine(function (state) {
    const { Immunizations } = state.data.form.TT5.Child_Information;
    if (Immunizations && Immunizations.Measles18_h) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Measles18_h"
            )(state);
            return id + date + "Measles18";
          }),
          field("Source__c", 1),
          field("Reason_for_Service__c", "Measles 18"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field(
            "Date__c",
            dataValue("$.form.TT5.Child_Information.Immunizations.Measles_18")
          ),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          relationship("Site__r", "Label__c", function (state) {
            var facility = dataValue(
              "$.form.TT5.Child_Information.Immunizations.Facility_Measles_18"
            )(state);
            if (facility === "" || facility === undefined) {
              facility = "unknown";
            }
            return facility;
          })
        )
      )(state);
    }
  }),
  //** END IMMUNIZATIONS ************************************************//
  //Deworming
  combine(function (state) {
    if (dataValue("$.form.TT5.Child_Information.Deworming")(state) == "Yes") {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue("$.form.Date")(state);
            return id + date + "Deworming";
          }),
          field("Source__c", 1),
          field("Reason_for_Service__c", "Deworming"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field("Date__c", dataValue("$.form.Date")),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("RecordTypeID", "01224000000YAuK"),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          )
        )
      )(state);
    }
  }),
  //Home Based care for HAWI clients
  combine(function (state) {
    if (
      dataValue("$.form.HAWI.Home_Based_Care.Home_Based_Care_Provided")(
        state
      ) !== undefined &&
      dataValue("$.form.HAWI.Home_Based_Care.Home_Based_Care_Provided")(
        state
      ) !== ""
    ) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          fields(
            field("Service_UID__c", (state) => {
              const id = dataValue("$.form.case.@case_id")(state);
              const date = dataValue("$.form.Date")(state);
              return id + date + "Home-Based-Care";
            }),
            field("Source__c", 1),
            field("Reason_for_Service__c", "Home-Based Care"),
            field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
            field("Date__c", dataValue("$.form.Date")),
            field("Type_of_Service__c", "CHW Mobile Survey"),
            field("RecordTypeID", "01224000000YAuK"),
            field("Home_Based_Care_Rendered__c", function (state) {
              var care = "";
              var str = dataValue(
                "$.form.HAWI.Home_Based_Care.Home_Based_Care_Provided"
              )(state);
              care = str.replace(/ /g, ";");
              care = care.replace(/_/g, " ");

              return care;
            }),
            relationship(
              "Person__r",
              "CommCare_ID__c",
              dataValue("$.form.case.@case_id")
            )
          )
        )
      )(state);
    }
  }),
  //Malaria cases
  //Child
  combine(function (state) {
    if (
      dataValue("$.form.TT5.Child_Information.CCMM.Home_Test_Result")(state) ==
      "Positive"
    ) {
      //REVIEWED
      if (
        dataValue("$.form.TT5.Child_Information.CCMM.Malaria_Referral")(
          state
        ) == "Yes"
      ) {
        //This block got moved to the referral section, malaria referral case
      } else {
        //Malaria home treatment case
        upsert(
          "Service__c",
          "Service_UID__c",
          fields(
            field("Service_UID__c", (state) => {
              const id = dataValue("$.form.case.@case_id")(state);
              const date = dataValue("$.form.Date")(state);
              return id + date + "Malaria-Home-Treatment";
            }),
            field("Source__c", 1),
            field("Date__c", dataValue("$.form.Date")),
            field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
            field("Type_of_Service__c", "CHW Mobile Survey"),
            field("Reason_for_Service__c", "Malaria (Home Treatment)"),
            field(
              "Home_Treatment__c",
              dataValue("$.form.TT5.Child_Information.CCMM.Home_Treatment")
            ),
            field("RecordTypeID", "01224000000kOto"),
            field("Open_Case__c", 1),
            field("Malaria_Status__c", "Positive"),
            field(
              "AL_Tablets__c",
              dataValue("$.form.TT5.Child_Information.CCMM.AL")
            ),
            field(
              "Paracetamol_Tablets__c",
              dataValue("$.form.TT5.Child_Information.CCMM.Paracetamol")
            ),
            field(
              "Follow_Up_By_Date__c",
              dataValue("$.form.Follow-Up_By_Date")
            ),
            field(
              "Home_Treatment_Date__c",
              dataValue("$.form.TT5.Child_Information.CCMM.test_date")
            ),
            field(
              "Malaria_Home_Test_Date__c",
              dataValue("$.form.TT5.Child_Information.CCMM.test_date")
            ),
            field(
              "CommCare_Code__c",
              dataValue("form.subcase_0.case.@case_id")
            ),
            relationship(
              "Person__r",
              "CommCare_ID__c",
              dataValue("$.form.case.@case_id")
            )
          )
        )(state);
      }
    }
  }),
  //Malaria cases
  //HAWI Client
  combine(function (state) {
    if (dataValue("$.form.HAWI.CCMM.Home_Test_Result")(state) == "Positive") {
      //REVIEWED
      if (dataValue("$.form.HAWI.CCMM.Malaria_Referral")(state) == "Yes") {
      } else {
        //Malaria home treatment case
        upsert(
          "Service__c",
          "Service_UID__c",
          fields(
            field("Source__c", 1),
            field("Service_UID__c", (state) => {
              const id = dataValue("$.form.case.@case_id")(state);
              const date = dataValue("$.form.Date")(state);
              return id + date + "Malaria-Home-Treatment";
            }),
            field("Date__c", dataValue("$.form.Date")),
            field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
            field("Type_of_Service__c", "CHW Mobile Survey"),
            field("Reason_for_Service__c", "Malaria (Home Treatment)"),
            field(
              "Home_Treatment__c",
              dataValue("$.form.HAWI.CCMM.Home_Treatment")
            ),
            field("RecordTypeID", "01224000000kOto"),
            field("Open_Case__c", 1),
            field("Malaria_Status__c", "Positive"),
            field("AL_Tablets__c", dataValue("$.form.HAWI.CCMM.AL")),
            field(
              "Paracetamol_Tablets__c",
              dataValue("$.form.HAWI.CCMM.Paracetamol")
            ),
            field(
              "Follow_Up_By_Date__c",
              dataValue("$.form.Follow-Up_By_Date")
            ),
            field(
              "Home_Treatment_Date__c",
              dataValue("$.form.HAWI.CCMM.test_date")
            ),
            field(
              "Malaria_Home_Test_Date__c",
              dataValue("$.form.HAWI.CCMM.test_date")
            ),
            field(
              "CommCare_Code__c",
              dataValue("form.subcase_0.case.@case_id")
            ),
            relationship(
              "Person__r",
              "CommCare_ID__c",
              dataValue("$.form.case.@case_id")
            )
          )
        )(state);
      }
    }
  }),

  //Malnutrition case
  combine(function (state) {
    if (
      dataValue("$.form.TT5.Child_Information.Nutrition2.Nutrition_Status")(
        state
      ) !== undefined
    ) {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Source__c", 1),
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue("$.form.Date")(state);
            return id + date + "Nutrition-Screening";
          }),
          field("Date__c", dataValue("$.form.Date")),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field("RecordTypeID", "01224000000YAuK"),
          field("Reason_for_Service__c", "Nutrition Screening"),
          field(
            "Clinical_Visit_Date__c",
            dataValue("$.form.TT5.Child_Information.Nutrition2.Clinical_Date")
          ),
          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          ),
          field(
            "Height__c",
            dataValue("$.form.TT5.Child_Information.Nutrition.Height")
          ),
          field(
            "Weight__c",
            dataValue("$.form.TT5.Child_Information.Nutrition.Weight")
          ),
          field(
            "MUAC__c",
            dataValue("$.form.TT5.Child_Information.Nutrition.MUAC")
          ),
          field("Nutrition_Status__c", function (state) {
            var status = "";
            if (
              dataValue(
                "$.form.TT5.Child_Information.Nutrition2.Nutrition_Status"
              )(state) == "normal"
            ) {
              status = "Normal";
            } else if (
              dataValue(
                "$.form.TT5.Child_Information.Nutrition2.Nutrition_Status"
              )(state) == "moderate"
            ) {
              status = "Moderately Malnourished";
            } else if (
              dataValue(
                "$.form.TT5.Child_Information.Nutrition2.Nutrition_Status"
              )(state) == "severe"
            ) {
              status = "Severely Malnourished";
            }
            return status;
          })
        )
      )(state);
    }
  }),

  //All referrals are sent here (danger sign, malaria, malnutrition, other referral)
  combine(function (state) {
    if (dataValue("$.form.Referral")(state) == "Yes") {
      upsert(
        "Service__c",
        "Service_UID__c",
        fields(
          field("Source__c", 1),
          field("Service_UID__c", (state) => {
            const id = dataValue("$.form.case.@case_id")(state);
            const date = dataValue("$.form.Date")(state);
            return id + date + "Referral";
          }),
          field("Date__c", dataValue("$.form.Date")),
          field("Type_of_Service__c", "CHW Mobile Survey"),
          field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
          field("RecordTypeID", "01224000000kOto"),
          field("Referred__c", 1),
          field("Follow_Up_By_Date__c", dataValue("$.form.Follow-Up_By_Date")),
          field("Reason_for_Service__c", "Referral"),
          field(
            "Clinic_Zinc__c",
            dataValue(
              "$.form.TT5.Child_Information.Clinical_Services.diarrhea_clinic_treatment_zinc"
            )
          ),
          field(
            "Clinic_ORS__c",
            dataValue(
              "$.form.TT5.Child_Information.Clinical_Services.diarrhea_clinic_treatment_ORS"
            )
          ),
          field(
            "Home_Zinc__c",
            dataValue(
              "$.form.TT5.Child_Information.Referrals.diarrhea_home_treatment_zinc"
            )
          ),
          field(
            "Home_ORS__c",
            dataValue(
              "$.form.TT5.Child_Information.Referrals.diarrhea_home_treatment_ORS"
            )
          ),
          field("Open_Case__c", 1),
          field("Malaria_Status__c", dataValue("$.form.Malaria_Status")),
          field(
            "Home_Treatment__c",
            dataValue("$.form.TT5.Child_Information.CCMM.Home_Treatment")
          ),
          field(
            "Malaria_Home_Test_Date__c",
            dataValue("$.form.TT5.Child_Information.CCMM.test_date")
          ),
          field(
            "CommCare_Code__c",
            dataValue("$.form.subcase_0.case.@case_id")(state)
          ),
          field("Purpose_of_Referral__c", function (state) {
            var purpose = "";
            var name = dataValue("$.form.Purpose_of_Referral")(state);
            if (name == "Adverse_Drug_Reaction_Side_Effect") {
              purpose = "Adverse Drug Reaction/Side Effect";
            } else if (name == "Pregnancy_Care") {
              purpose = "Pregnancy Care (ANC)";
            } else if (name == "Family_Planning") {
              purpose = "Family Planning (FP)";
            } else {
              purpose = name.replace(/_/g, " ");
            }
            return purpose;
          }),

          relationship(
            "Person__r",
            "CommCare_ID__c",
            dataValue("$.form.case.@case_id")
          )
        )
      )(state);
    }
  }),
  //TO-DO fix array problem
  //HAWI other clinical services received,
  combine(function (state) {
    if (
      dataValue("$.form.HAWI.Clinical_Services_Rendered[0]")(state) !==
      undefined
    ) {
      each(
        dataPath("$.form.HAWI.Clinical_Services_Rendered[*]"),
        upsert(
          "Service__c",
          "Service_UID__c",
          fields(
            field("Service_UID__c", (state) => {
              const id = dataValue("$.form.case.@case_id")(state);
              const date = dataValue("$.form.Date")(state);
              return id + date + "HAWI-Other-Services";
            }),
            field("Source__c", 1),
            field("Household_CHW__c", dataValue("chw")),
            field("Reason_for_Service__c", function (state) {
              var reason = "";
              var name = dataValue("Purpose")(state);
              if (name == "Adverse_Drug_Reaction_Side_Effect") {
                reason = "Adverse Drug Reaction/Side Effect";
              } else if (name == "Pregnancy_Care") {
                reason = "Pregnancy Care (ANC)";
              } else if (name == "Family_Planning") {
                reason = "Family Planning (FP)";
              } else {
                reason = name.replace(/_/g, " ");
              }
              return reason;
            }),
            field("Date__c", dataValue("Date_of_Clinical_Service")),
            field("Type_of_Service__c", "CHW Mobile Survey"),
            field("RecordTypeID", "01224000000YAuK"),
            relationship("Site__r", "Label__c", function (state) {
              var facility = dataValue("Facility_of_Clinical_Service")(state);
              if (facility === "" || facility === undefined) {
                facility = "unknown";
              } else if (facility == "Other_Clinic") {
                facility = "Other";
              } else if (facility == "Rongo_Sub-District_Hospital") {
                facility = "Rongo_SubDistrict_Hospital";
              }
              return facility;
            }),
            relationship("Person__r", "CommCare_ID__c", dataValue("Case_ID"))
          )
        )
      )(state);
    }
  }),
  //TO-DO: fix array problem
  // TT5 other clinical services received
  combine(function (state) {
    if (
      dataValue("$.form.TT5.Child_Information.Clinical_Services[0]")(state) !==
      undefined
    ) {
      each(
        dataPath("$.form.TT5.Child_Information.Clinical_Services[*]"),
        upsert(
          "Service__c",
          "Service_UID__c",
          fields(
            field("Source__c", true),
            field("Service_UID__c", (state) => {
              const id = dataValue("$.form.case.@case_id")(state);
              const date = dataValue("$.form.Date")(state);
              return id + date + "TT5-Other-Services";
            }),
            field("Household_CHW__c", dataValue("chw")),
            field("Reason_for_Service__c", function (state) {
              var reason = "";
              var name = dataValue("Purpose")(state);
              if (name == "Adverse_Drug_Reaction_Side_Effect") {
                reason = "Adverse Drug Reaction/Side Effect";
              } else if (name == "Pregnancy_Care") {
                reason = "Pregnancy Care (ANC)";
              } else if (name == "Family_Planning") {
                reason = "Family Planning (FP)";
              } else {
                reason = name.replace(/_/g, " ");
              }
              return reason;
            }),
            field("Date__c", dataValue("Clinical_Date")),
            field("Type_of_Service__c", "CHW Mobile Survey"),
            field("RecordTypeID", "01224000000YAuK"),
            relationship("Site__r", "Label__c", function (state) {
              var facility = dataValue("Clinical_Facility")(state);
              if (facility === "" || facility === undefined) {
                facility = "unknown";
              }
              return facility;
            }),
            relationship("Person__r", "CommCare_ID__c", dataValue("Case_ID"))
          )
        )
      )(state);
    }
  }),
  upsert(
    "Visit__c",
    "CommCare_Visit_ID__c",
    fields(
      field("CommCare_Visit_ID__c", dataValue("id")),
      relationship(
        "Household__r",
        "CommCare_Code__c",
        dataValue("$.form.HH_ID")
      ),
      field("Name", "CHW Visit"),
      field("CommCare_Visit_ID__c", dataValue("id")),
      field("Household_CHW__c", dataValue("$.form.CHW_ID_Final")),
      field("Supervisor_Visit__c", (state) =>
        state.supervisorMap[state.data.form.supervisor_visit]
          ? state.supervisorMap[state.data.form.supervisor_visit]
          : null
      ),
      field("Date__c", dataValue("$.metadata.timeEnd"))
    )
  )
);
