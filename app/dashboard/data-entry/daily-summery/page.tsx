"use client";

import { Formik, Form } from "formik";
import { DailySummaryForm } from "./DailySummery";
import { WeatherDataTable } from "./DailySummeryTable";

const initialValues = {
  measurements: Array(16).fill("-"),
};

export default function DailySummaryWrapper() {
  return (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      <Form>
        <div className="mb-4 font-semibold text-gray-900 text-lg">
          Weather Observations & Daily Summary
        </div>

        <div className="mb-4 min-h-[30vh] max-h-[60vh] overflow-y-auto border border-gray-200 p-3 rounded-lg">
          <WeatherDataTable />
        </div>
        <DailySummaryForm />
      </Form>
    </Formik>
  );
}
