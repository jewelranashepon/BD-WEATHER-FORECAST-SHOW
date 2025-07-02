import * as Yup from "yup"

export const weatherFormSchema = Yup.object({
 dataType: Yup.string()
  .required("Data type is required")
  .matches(/^[A-Z]{2}$/, "Must be exactly 2 uppercase letters"),

  stationNo: Yup.string()
    .required("Station number is required")
    .max(5, "Maximum 5 characters")
    .matches(/^[0-9]*$/, "Must contain only numbers"),

  year: Yup.string()
    .required("Year is required")
    .max(2, "Maximum 2 characters")
    .matches(/^[0-9]*$/, "Must contain only numbers"),

  month: Yup.string()
    .required("Month is required")
    .max(2, "Maximum 2 characters")
    .matches(/^[0-9]*$/, "Must contain only numbers")
    .test("valid-month", "Month must be between 01 and 12", (value) => {
      const month = Number.parseInt(value || "")
      return !isNaN(month) && month >= 1 && month <= 12
    }),

  day: Yup.string()
    .required("Day is required")
    .max(2, "Maximum 2 characters")
    .matches(/^[0-9]*$/, "Must contain only numbers")
    .test("valid-day", "Day must be between 01 and 31", (value) => {
      const day = Number.parseInt(value || "")
      return !isNaN(day) && day >= 1 && day <= 31
    }),

  // measurements: Yup.array()
  //   .of(
  //     Yup.string()
  //       .required("This field is required")
  //       .matches(/^[0-9]*$/, "Must contain only numbers")
  //   )
  //   .min(1, "At least one measurement is required")
  //   .required("Measurements are required"),

  measurements: Yup.array()
  .of(
    Yup.string()
      .nullable()
      .matches(/^[0-9]*$/, "Must contain only numbers")
  )
  .min(1, "At least one measurement is required")
  .required("Measurements are required"),


  // meteorCodes: Yup.array()
  //   .of(
  //     Yup.string()
  //       .required("Meteor code is required")
  //   )
  //   .min(1, "At least one meteor code is required")
  //   .required("Meteor codes are required"),

  meteorCodes: Yup.array()
  .of(
    Yup.string()
      .nullable()
      .matches(/^[A-Za-z0-9]*$/, "Invalid code")
  )
  .min(1, "At least one meteor code is required")
  .required("Meteor codes are required"),


  characterCodes: Yup.object().required("Character codes are required"),

  windDirection: Yup.string().required("Wind direction is required"),

  windTime: Yup.string()
    .required("Wind time is required")
    .matches(/^[0-9]*$/, "Must contain only numbers"),
})
