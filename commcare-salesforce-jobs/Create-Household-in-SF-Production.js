//Alters CommCare arrays so that they are formatted as arrays instead of just single values.
alterState((state) =>{
  const person=state.data.form.Person;
  if(!Array.isArray(person)){
    state.data.form.Person=[person];
  }
  return state;
});

upsert("Household__c", "CommCare_Code__c", fields(
  field("Name","0000"),
  field("Catchment__c",function(state){
    if(dataValue("form.catchment")(state)=="East Kamagambo"){
      return("a002400000pAcQt");
    }
    else{
      return("a002400000pAcOe");
    }
  }),
  field("CommCare_Code__c",dataValue("$.form.case.@case_id")),
  field("Household_CHW__c",dataValue("$.form.CHW_ID")),
  field("Area__c",dataValue("$.form.area")),
  field("Household_Head_No_Program__c",dataValue("form.No_Program_Head")),
  field("Treats_Drinking_Water__c",dataValue("$.form.Household_Information.Treats_Drinking_Water")),
  field("WASH_Trained__c",dataValue("$.form.Household_Information.WASH_Trained")),
  field("Rubbish_Pit__c",dataValue("$.form.Household_Information.Rubbish_Pit")),
  field("Kitchen_Garden__c",dataValue("$.form.Household_Information.Kitchen_Garden")),
  field("Cookstove__c",dataValue("$.form.Household_Information.Improved_Cooking_Method")),
  field("Uses_ITNs__c",dataValue("$.form.Household_Information.ITNs")),
  field("Pit_Latrine__c",dataValue("$.form.Household_Information.Functional_Latrine")),
  field("Clothe__c",dataValue("$.form.Household_Information.Clothesline")),
  field("Drying_Rack__c",dataValue("$.form.Household_Information.Drying_Rack")),
  field("Tippy_Tap__c",dataValue("$.form.Household_Information.Active_Handwashing_Station")),
  field("Number_of_Over_5_Females__c",dataValue("$.form.Household_Information.Number_of_over_5_Females")),
  field("Number_of_Under_5_Males__c",dataValue("$.form.Household_Information.Number_of_Under_5_Males")),
  field("Number_of_Under_5_Females__c",dataValue("$.form.Household_Information.Number_of_Under_5_Females")),
  field("Number_of_Over_5_Males__c",dataValue("$.form.Household_Information.Number_of_Over_5_Males")),
  field("Source__c",true)
)),
combine(function(state){
  if(dataValue("$.form.Person[0].Source")(state)==1){
    each(dataPath("$.form.Person[*]"),
      upsert("Person__c", "CommCare_ID__c", fields(
        field("Name",function(state){
          var name1=dataValue("Basic_Information.Person_Name")(state);
          var name2=name1.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
          return name2;
        }),
        relationship("RecordType","Name",function(state){
            return(dataValue("Basic_Information.Record_Type")(state).toString().replace(/_/g," "));
        }),
        field("Catchment__c",function(state){
          if(dataValue("catchment")(state)=="East Kamagambo"){
            return("a002400000pAcQt");
          }
          else{
            return("a002400000pAcOe");
          }
        }),
        field("HAWI_Registrant__c",function(state){
          if(dataValue("Basic_Information.HAWI_Status")(state)=="Yes"){
            return("Yes");
          }
        }),
        field("Active_in_HAWI__c",function(state){
          if(dataValue("Basic_Information.HAWI_Status")(state)=="Yes"){
            return("Yes");
          }
        }),
        field("Active_in_Thrive_Thru_5__c",function(state){
          if(dataValue("Basic_Information.Record_Type")(state).toString().replace(/_/g," ")=="Child" && dataValue("Basic_Information.TT5_Status")(state)=="Yes"){
            return("Yes");
          }
        }),
        field("Thrive_Thru_5_Registrant__c",function(state){
          if(dataValue("Basic_Information.Record_Type")(state).toString().replace(/_/g," ")=="Child" && dataValue("Basic_Information.TT5_Status")(state)=="Yes"){
            return("Yes");
          }
        }),
        field("Active_TT5_Mother__c",function(state){
          if(dataValue("Basic_Information.Record_Type")(state).toString().replace(/_/g," ")=="Female Adult" && dataValue("Basic_Information.TT5_Status")(state)=="Yes"){
            return("Yes");
          }
        }),
        field("TT5_Mother_Registrant__c",function(state){
          if(dataValue("Basic_Information.Record_Type")(state).toString().replace(/_/g," ")=="Female Adult" && dataValue("Basic_Information.TT5_Status")(state)=="Yes"){
            return("Yes");
          }
        }),
        field("Enrollment_Date__c",function(state){
          if(dataValue("Basic_Information.TT5_Status")(state)=="Yes"){
            return(dataValue("case.@date_modified")(state));
          }
        }),
        field("HAWI_Enrollment_Date__c",function(state){
          if(dataValue("Basic_Information.HAWI_Status")(state)=="Yes"){
            return(dataValue("case.@date_modified")(state));
          }
        }),
        field("LMP__c",dataValue("TT5.Child_Information.ANCs.LMP")),
        field("Source__c",true),
        field("CommCare_ID__c",dataValue("case.@case_id")),
        field("Date_of_Birth__c",dataValue("Basic_Information.DOB")),
        field("Exclusive_Breastfeeding__c",dataValue("TT5.Child_Information.Exclusive_Breastfeeding.Exclusive_Breastfeeding")),
        field("Gender__c",dataValue("Basic_Information.Final_Gender")),
        field("Marital_Status__c",dataValue("Basic_Information.Marital_Status")),
        field("Telephone__c",dataValue("Basic_Information.Contact_Info.contact_phone_number")),
        field("Next_of_Kin__c",dataValue("Basic_Information.Contact_Info.Next_of_Kin")),
        field("Next_of_Kin_Phone__c",dataValue("Basic_Information.Contact_Info.next_of_kin_phone")),
        field("Client_Status__c","Active"),
        field("Ever_on_Family_Planning__c",dataValue("Basic_Information.Ever_on_Family_Planning")),
        field("Family_Planning__c",dataValue("Basic_Information.Currently_on_family_planning")),
        field("Family_Planning_Method__c",dataValue("Basic_Information.Family_Planning_Method")),
        field("ANC_1__c",dataValue("TT5.Child_Information.ANCs.ANC_1")),
        field("ANC_2__c",dataValue("TT5.Child_Information.ANCs.ANC_2")),
        field("ANC_3__c",dataValue("TT5.Child_Information.ANCs.ANC_3")),
        field("ANC_4__c",dataValue("TT5.Child_Information.ANCs.ANC_4")),
        field("ANC_5__c",dataValue("TT5.Child_Information.ANCs.ANC_5")),
        field("BCG__c",dataValue("TT5.Child_Information.Immunizations.BCG")),
        field("OPV_0__c",dataValue("TT5.Child_Information.Immunizations.OPV_0")),
        field("OPV_1__c",dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_1")),
        field("OPV_2__c",dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_2")),
        field("OPV_3__c",dataValue("TT5.Child_Information.Immunizations.OPV_PCV_Penta_3")),
        field("Measles_6__c",dataValue("TT5.Child_Information.Immunizations.Measles_6")),
        field("Measles_9__c",dataValue("TT5.Child_Information.Immunizations.Measles_9")),
        field("Measles_18__c",dataValue("TT5.Child_Information.Immunizations.Measles_18")),
        field("Pregnant__c",function(state){
          if(dataValue("TT5.Mother_Information.Pregnant")(state)=="Yes") return 1;
        }),
        field("Education_Level__c",function(state){
          if(dataValue("Basic_Information.Record_Type")(state)!=="Child"&&dataValue("Basic_Information.Record_Type")(state)!=="Youth"){
            return(dataValue("Basic_Information.Education_Level")(state).toString().replace(/_/g," "));
          }
        }),
        field("Gravida__c",dataValue("TT5.Mother_Information.Pregnancy_Information.Gravida")),
        field("Parity__c",dataValue("TT5.Mother_Information.Pregnancy_Information.Parity")),
        field("Unique_Patient_Code__c",dataValue("HAWI.Unique_Patient_Code")),
        field("Active_in_Support_Group__c",dataValue("HAWI.Active_in_Support_Group")),

        field("Currently_on_ART_s__c",dataValue("HAWI.ART")),
        field("ART_Regimen__c",function(state){
              var art='';
              var str=dataValue("HAWI.ARVs")(state);
              if(str!==undefined){
                art=str.replace(/ /g,"; ");
              }
              return art;
            }),
        field("Preferred_Care_Facility__c",function(state){
          var val='';
          if(dataValue("HAWI.Preferred_Care_Facility")(state)!==undefined){
            val=dataValue("HAWI.Preferred_Care_Facility")(state).toString().replace(/_/g," ");
          }
          return val;
        }),
        field("CommCare_HH_Code__c",dataValue("case.index.parent.#text")),
        field("Child_Status__c",dataValue("Basic_Information.Child_Status")),
        field("Place_of_Delivery__c",function(state){
          var val='';
          var placeholder=''
          if(dataValue("TT5.Child_Information.Delivery_Information.Skilled_Unskilled")(state)!==undefined){
            placeholder=dataValue("TT5.Child_Information.Delivery_Information.Skilled_Unskilled")(state);
            if(placeholder=='Skilled'){
              val='Facility';
            }
            else if(placeholder=='Unskilled'){
              val='Home';
            }
          }
          return val;
        }),
        field("Delivery_Facility__c",function(state){
          var val='';
          var placeholder=''
          if(dataValue("TT5.Child_Information.Delivery_Information.Birth_Facility")(state)!==undefined){
            placeholder=dataValue("TT5.Child_Information.Delivery_Information.Birth_Facility")(state);
            val=placeholder.toString().replace(/_/g," ");
          }
          return val;
        })
      ))
    )(state);
  }
})
