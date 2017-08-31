create("Service__c", fields(
      field("Source__c",1),
      field("Date__c",dataValue("$.form.Date")),
      field("Type_of_Service__c","CHW Mobile Survey"),
      field("Household_CHW__c",dataValue("$.form.Household_CHW")),
      field("RecordTypeID","01224000000YAuK"),
      field("Reason_for_Service__c","Nutrition Screening"),
      relationship("Person__r","CommCare_ID__c",dataValue("$.form.case.@case_id")),
      field("Height__c",dataValue("$.form.Child_Information.body_specs.Height")),
      field("Weight__c",dataValue("$.form.Child_Information.body_specs.Weight")),
      field("MUAC__c",dataValue("$.form.Child_Information.body_specs.MUAC")),
      field("Nutrition_Status__c",function(state){
        var status='';
        if(dataValue("$.form.TT5.Child_Information.Nutrition2.Nutrition_Status")(state)=='normal'){
          status='Normal';
        }
        else if(dataValue("$.form.TT5.Child_Information.Nutrition2.Nutrition_Status")(state)=='moderate'){
          status='Moderately Malnourished';
        }
        else if(dataValue("$.form.TT5.Child_Information.Nutrition2.Nutrition_Status")(state)=='severe'){
          status='Severely Malnourished';
        }
        return status;
      }),
      field("Ever_been_breastfed__c",dataValue("$.form.Child_Information.infant_diet.ever_been_breastfed")),
      field("Age_at_which_breastfed__c",dataValue("$.form.Child_Information.infant_diet.age_at_which_breastfed")),
      field("X24_Hours_Breastfed__c",dataValue("$.form.Child_Information.infant_diet.how_many_times_24_hours")),
      field("Formula_Milk__c",dataValue("$.form.Child_Information.infant_diet.has_had_formula")),
      field("Water__c",dataValue("$.form.Child_Information.infant_diet.has_had_water")),
      field("Glucose__c",dataValue("$.form.Child_Information.infant_diet.has_had_glucose")),
      field("Animal_Milk__c",dataValue("$.form.Child_Information.infant_diet.has_had_animal_milk")),
      field("Juice__c",dataValue("$.form.Child_Information.infant_diet.has_had_juice")),
      field("Sweetened_Drinks__c",dataValue("$.form.Child_Information.infant_diet.has_had_sweetened_drinks")),
      field("Honey__c",dataValue("$.form.Child_Information.infant_diet.has_had_honey")),
      field("Sugar__c",dataValue("$.form.Child_Information.infant_diet.has_had_sugar")),
      field("Clear_Soup__c",dataValue("$.form.Child_Information.infant_diet.has_had_clear_soup")),
      field("Grains__c",dataValue("$.form.Child_Information.infant_diet.has_had_grains")),
      field("Yellow_Flesh__c",dataValue("$.form.Child_Information.infant_diet.has_had_yellow_flesh")),
      field("Roots__c",dataValue("$.form.Child_Information.infant_diet.has_had_roots")),
      field("Leafy_Vegetables__c",dataValue("$.form.Child_Information.infant_diet.has_had_leafy_veg")),
      field("Mango_Paw_Paw__c",dataValue("$.form.Child_Information.infant_diet.has_had_ripe_mango_paw_paw")),
      field("Fruits_or_Vegetables__c",dataValue("$.form.Child_Information.infant_diet.has_had_other_fruit_veg")),
      field("Meat__c",dataValue("$.form.Child_Information.infant_diet.has_had_meat")),
      field("Organ_Meat__c",dataValue("$.form.Child_Information.infant_diet.has_had_organ_meat")),
      field("Eggs__c",dataValue("$.form.Child_Information.infant_diet.has_had_eggs")),
      field("Dried_Silver_Fish__c",dataValue("$.form.Child_Information.infant_diet.has_had_silver_fish")),
      field("Seafood__c",dataValue("$.form.Child_Information.infant_diet.has_had_other_seafood")),
      field("Dairy__c",dataValue("$.form.Child_Information.infant_diet.has_had_milk_products")),
      field("Fats__c",dataValue("$.form.Child_Information.infant_diet.has_had_fats")),
      field("Sugary_Foods__c",dataValue("$.form.Child_Information.infant_diet.has_had_sugary_foods")),
      field("Insects__c",dataValue("$.form.Child_Information.infant_diet.has_had_insects"))
      )
    )// Testing Github Connection
