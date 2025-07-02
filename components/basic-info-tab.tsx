"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "@/lib/auth-client"

interface BasicInfoTabProps {
  onFieldChange?: (name: string, value: string) => void
}

export default function BasicInfoTab({ onFieldChange }: BasicInfoTabProps) {
  const dataTypeRefs = useRef<HTMLInputElement[]>([null, null].map(() => null)).current.map(() =>
    useRef<HTMLInputElement>(null),
  )
  const stationNoRefs = useRef<HTMLInputElement[]>(Array.from({ length: 5 }).map(() => null)).current.map(() =>
    useRef<HTMLInputElement>(null),
  )
  const yearRefs = useRef<HTMLInputElement[]>(Array.from({ length: 2 }).map(() => null)).current.map(() =>
    useRef<HTMLInputElement>(null),
  )
  const monthRefs = useRef<HTMLInputElement[]>(Array.from({ length: 2 }).map(() => null)).current.map(() =>
    useRef<HTMLInputElement>(null),
  )
  const dayRefs = useRef<HTMLInputElement[]>(Array.from({ length: 2 }).map(() => null)).current.map(() =>
    useRef<HTMLInputElement>(null),
  )

  const [values, setValues] = useState({
    dataType: "",
    stationNo: "",
    year: "",
    month: "",
    day: "",
  })

  const { data: session } = useSession()

  useEffect(() => {
    const today = new Date()

    // Set default values
    const updates = {} as typeof values

    if (!values.dataType) {
      updates.dataType = "SY"
    }

    if (session?.user?.station?.id && !values.stationNo) {
      updates.stationNo = session.user.station.stationId.toString().padStart(5, "0")
    }

    const currentYearLastTwo = today.getFullYear().toString().slice(-2)
    if (!values.year) {
      updates.year = currentYearLastTwo
    }

    const currentMonth = (today.getMonth() + 1).toString().padStart(2, "0")
    if (!values.month) {
      updates.month = currentMonth
    }

    const currentDay = today.getDate().toString().padStart(2, "0")
    if (!values.day) {
      updates.day = currentDay
    }

    if (Object.keys(updates).length > 0) {
      setValues((prev) => ({ ...prev, ...updates }))

      // Notify parent component of changes
      if (onFieldChange) {
        Object.entries(updates).forEach(([name, value]) => {
          onFieldChange(name, value)
        })
      }
    }
  }, [session, values.dataType, values.stationNo, values.year, values.month, values.day, onFieldChange])

  const handleChange = (name: string, value: string, index?: number, refs?: React.RefObject<HTMLInputElement>[]) => {
    setValues((prev) => ({ ...prev, [name]: value }))

    // Notify parent component
    if (onFieldChange) {
      onFieldChange(name, value)
    }

    // Auto-focus next input if applicable
    if (index !== undefined && refs && index < refs.length - 1 && value.length === 1) {
      refs[index + 1]?.current?.focus()
    }
  }

  const handleSegmentedInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    refs: React.RefObject<HTMLInputElement>[],
    fieldName: string,
  ) => {
    const val = e.target.value.slice(0, 1)
    const validationPattern = fieldName === "dataType" ? /^[A-Z]?$/ : /^\d?$/

    if (!validationPattern.test(val) && val !== "") return

    const updated = (values[fieldName as keyof typeof values] || "").split("")
    updated[index] = val
    const newValue = updated.join("")

    handleChange(fieldName, newValue, index, refs)
  }

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-lg font-semibold text-slate-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 4h6v6h-6z" />
            <path d="M4 14h6v6H4z" />
            <path d="M17 17h3v3h-3z" />
            <path d="M4 4h6v6H4z" />
          </svg>
        </span>
        Basic Information
      </h2>

      <Card className=" bg-blue-50 rounded-xl border border-blue-200 ">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-between gap-8">
            {/* Data Type */}
            <div className="flex flex-col">
              <Label htmlFor="dataType" className="text-sm font-medium text-blue-500 mb-2">
                DATA TYPE
              </Label>
              <div className="flex gap-1">
                {dataTypeRefs.map((ref, i) => (
                  <Input
                    key={`dataType-${i}`}
                    id={`dataType-${i}`}
                    maxLength={1}
                    readOnly
                    ref={ref}
                    className="w-12 bg-white text-center"
                    value={values.dataType?.[i] || ""}
                    onChange={(e) => handleSegmentedInput(e, i, dataTypeRefs, "dataType")}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <Label htmlFor="stationNo" className="text-sm font-medium text-blue-500 mb-2">
                STATION NO.
              </Label>
              <div className="flex gap-1">
                {stationNoRefs.map((ref, i) => (
                  <Input
                    key={i}
                    id={`stationNo-${i}`}
                    maxLength={1}
                    readOnly
                    ref={ref}
                    className="w-12 bg-white text-center"
                    value={values.stationNo?.[i] || ""}
                    onChange={(e) => handleSegmentedInput(e, i, stationNoRefs, "stationNo")}
                  />
                ))}
              </div>
            </div>

            {/* Station Name */}
            <div className="flex flex-col flex-1">
              <Label htmlFor="stationName" className="text-sm font-medium text-blue-500 mb-2">
                STATION NAME
              </Label>
              <Input
                id="stationName"
                name="stationName"
                value={session?.user?.station?.name || ""}
                className="bg-white"
                readOnly
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="year" className="text-sm font-medium text-blue-500 mb-2">
                YEAR
              </Label>
              <div className="flex gap-1">
                {yearRefs.map((ref, i) => (
                  <Input
                    key={i}
                    id={`year-${i}`}
                    maxLength={1}
                    readOnly
                    ref={ref}
                    className="w-12 bg-white text-center"
                    value={values.year?.[i] || ""}
                    onChange={(e) => handleSegmentedInput(e, i, yearRefs, "year")}
                  />
                ))}
              </div>
            </div>

            {/* Month */}
            <div className="flex flex-col">
              <Label htmlFor="month" className="text-sm font-medium text-blue-500 mb-2">
                MONTH
              </Label>
              <div className="flex gap-1">
                {monthRefs.map((ref, i) => (
                  <Input
                    key={i}
                    id={`month-${i}`}
                    maxLength={1}
                    readOnly
                    ref={ref}
                    className="w-12 bg-white text-center"
                    value={values.month?.[i] || ""}
                    onChange={(e) => handleSegmentedInput(e, i, monthRefs, "month")}
                  />
                ))}
              </div>
            </div>

            {/* Day */}
            <div className="flex flex-col">
              <Label htmlFor="day" className="text-sm font-medium text-blue-500 mb-2">
                DAY
              </Label>
              <div className="flex gap-1">
                {dayRefs.map((ref, i) => (
                  <Input
                    key={i}
                    id={`day-${i}`}
                    maxLength={1}
                    readOnly
                    ref={ref}
                    className="w-12 bg-white text-center"
                    value={values.day?.[i] || ""}
                    onChange={(e) => handleSegmentedInput(e, i, dayRefs, "day")}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
