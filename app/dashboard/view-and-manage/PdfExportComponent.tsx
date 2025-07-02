"use client"

import React from "react"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from "@react-pdf/renderer"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import moment from 'moment';
import { useSession } from "@/lib/auth-client"

// Compact PDF Styles for single A3 page
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 15,
    fontSize: 7,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#3b82f6",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
  },
  subtitle: {
    fontSize: 8,
    color: "#64748b",
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1e40af",
    marginTop: 8,
    marginBottom: 4,
    paddingLeft: 3,
    borderLeftWidth: 2,
    borderLeftColor: "#3b82f6",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: "#74777B",
    marginBottom: 8,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCell: {
    margin: "auto",
    fontSize: 7,
    maxLines: 2,
    padding: 1.5,
    borderStyle: "solid",
    borderWidth: 0.3,
    borderColor: "#74777B",
    textAlign: "center",
    minHeight: 12,
    maxHeight: 12,
  },
  tableCellSynoptic: {
    margin: "auto",
    fontSize: 7,
    padding: 1.5,
    borderStyle: "solid",
    maxLines: 4,
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    borderWidth: 0.3,
    borderColor: "#74777B",
    textAlign: "center",
    minHeight: 12,
    maxHeight: 12,
  },
  tableCellHeaderSynoptic: {
    margin: "auto",
    fontSize: 8,
    padding: 1.5,
    borderStyle: "solid",
    borderWidth: 0.3,
    borderColor: "#74777B",
    textAlign: "center",
    maxLines: 2,
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: "bold",
    minHeight: 23,
    maxHeight: 23,
  },
  tableCellHeader: {
    margin: "auto",
    fontSize: 8,
    padding: 1.5,
    borderStyle: "solid",
    borderWidth: 0.3,
    borderColor: "#74777B",
    textAlign: "center",
    maxLines: 4,
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: "bold",
    minHeight: 40,
    maxHeight: 40,
  },
  stationInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8fafc",
    padding: 4,
    marginBottom: 6,
    borderRadius: 2,
  },
  stationItem: {
    alignItems: "center",
  },
  stationLabel: {
    fontSize: 6,
    fontWeight: "bold",
    color: "#64748b",
  },
  stationValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1e40af",
    marginTop: 1,
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 15,
    right: 15,
    textAlign: "center",
    fontSize: 6,
    color: "#64748b",
    borderTopWidth: 0.5,
    borderTopColor: "#74777B",
    paddingTop: 3,
  },
  compactSection: {
    marginBottom: 6,
  },
})

interface CompactWeatherPDFProps {
  firstCardData: any[]
  secondCardData: any[]
  synopticData: any[]
  dailySummeryData: any[]
  stationInfo: {
    stationId: string
    stationName: string
    date: string
  }
}

// Compact PDF Document Component
const CompactWeatherPDFDocument: React.FC<CompactWeatherPDFProps> = ({
  firstCardData,
  secondCardData,
  synopticData,
  dailySummeryData,
  stationInfo,
}) => {
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === "") return "--"
    return String(value).substring(0, 10)
  }
  const { data: session } = useSession()
  const superAdmin = session?.user?.role === "super_admin"

  const formatTime = (utcTime: string) => {
    if (!utcTime) return "--"
    return new Date(utcTime).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    })
  }

  return (
    <Document>
      <Page size="A3" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Weather Station Data Report</Text>
            <Text style={styles.subtitle}>
            {superAdmin ? formatValue(firstCardData[0].stationName) : formatValue(stationInfo.stationName)} ({superAdmin ? formatValue(firstCardData[0].stationCode) : formatValue(stationInfo.stationId)}) 
            </Text>
          </View>
          <Text style={{ fontSize: 7, color: "#64748b" }}>Generated: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Station Info */}
        <View style={styles.stationInfo}>
          <View style={styles.stationItem}>
            <Text style={styles.stationLabel}>DATA TYPE</Text>
            <Text style={styles.stationValue}>SY</Text>
          </View>
          <View style={styles.stationItem}>
            <Text style={styles.stationLabel}>STATION NO</Text>
            <Text style={styles.stationValue}>{superAdmin ? formatValue(firstCardData[0].stationCode) : formatValue(stationInfo.stationId)}</Text>
          </View>
          <View style={styles.stationItem}>
            <Text style={styles.stationLabel}>STATION NAME</Text>
            <Text style={styles.stationValue}>{superAdmin ? formatValue(firstCardData[0].stationName) : formatValue(stationInfo.stationName)}</Text>
          </View>
          <View style={styles.stationItem}>
            <Text style={styles.stationLabel}>DATE</Text>
            <Text style={styles.stationValue}>{moment(firstCardData[0].utcTime).format("ll")}</Text>
          </View>
        </View>

        {/* First Card Data - Compact */}
        <View style={styles.compactSection}>
          <Text style={styles.sectionTitle}>First Card - Meteorological Data</Text>
          <View style={styles.table}>
            {/* First Card Headers - Compact */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellHeader, { width: "4%" }]}>Time</Text>
              <Text style={[styles.tableCellHeader, { width: "5%" }]}>Date</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Indicator</Text>
              <Text style={[styles.tableCellHeader, { width: "5%" }]}>Attached Thermometer (°C)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Bar As Read (hPa)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Corrected For Index</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Height Difference (hPa)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Correction For Temp</Text>
              <Text style={[styles.tableCellHeader, { width: "4.5%" }]}>Station Level Pressure (QFE)</Text>
              <Text style={[styles.tableCellHeader, { width: "5%" }]}>Sea Level Reduction</Text>
              <Text style={[styles.tableCellHeader, { width: "4.5%" }]}>Sea Level Pressure (QNH)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Afternoon Reading</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>24-Hour Pressure Change</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Dry Bulb As Read (°C)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Wet Bulb As Read (°C)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>MAX/MIN Temp As Read (°C)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Dry Bulb Corrected (°C)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Wet Bulb Corrected (°C)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>MAX/MIN Temp Corrected (°C)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Dew Point Temperature (°C)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Relative Humidity (%)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Squall Confirmed</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Squall Force (KTS)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Squall Direction (°)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Squall Time</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Horizontal Visibility (km)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Misc Meteors (Code)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Past Weather (W₁)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Past Weather (W₂)</Text>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Present Weather (ww)</Text>
            </View>

            {firstCardData.slice(0, 8).map((record, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "4%" }]}>{formatTime(record.utcTime)}</Text>
                <Text style={[styles.tableCell, { width: "5%" }]}>{moment(record.utcTime).format("ll")}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.subIndicator)}</Text>
                <Text style={[styles.tableCell, { width: "5%" }]}>{formatValue(record.alteredThermometer)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.barAsRead)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.correctedForIndex)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.heightDifference)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.correctionForTemp)}</Text>
                <Text style={[styles.tableCell, { width: "4.5%" }]}>{formatValue(record.stationLevelPressure)}</Text>
                <Text style={[styles.tableCell, { width: "5%" }]}>{formatValue(record.seaLevelReduction)}</Text>
                <Text style={[styles.tableCell, { width: "4.5%" }]}>{formatValue(record.correctedSeaLevelPressure)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.afternoonReading)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.pressureChange24h)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.dryBulbAsRead)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.wetBulbAsRead)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.maxMinTempAsRead)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.dryBulbCorrected)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.wetBulbCorrected)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.maxMinTempCorrected)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.Td)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.relativeHumidity)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.squallConfirmed)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.squallForce)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.squallDirection)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.squallTime)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.horizontalVisibility)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.miscMeteors)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.pastWeatherW1)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.pastWeatherW2)}</Text>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatValue(record.presentWeatherWW)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Second Card Data - Compact */}
        <View style={styles.compactSection}>
          <Text style={styles.sectionTitle}>Second Card - Weather Observations</Text>
          <View style={styles.table}>
            {/* Second Card Headers - Compact */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellHeader, { width: "3%" }]}>Time</Text>
              <Text style={[styles.tableCellHeader, { width: "4%" }]}>Date</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Low Cloud Form</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Low Cloud Height</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Low Cloud Amount</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Low Cloud Direction</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Medium Cloud Form</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Medium Cloud Height</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Medium Cloud Amount</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Medium Cloud Direction</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>High Cloud Form</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>High Cloud Height</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>High Cloud Amount</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>High Cloud Direction</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Total Cloud Amount</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 1 Form</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 1 Height</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 1 Amount</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 2 Form</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 2 Height</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 2 Amount</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 3 Form</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 3 Height</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 3 Amount</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 4 Form</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 4 Height</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Layer 4 Amount</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Rain Fall Start</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Rain Fall End</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Rain Fall Since Previous</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Rain Fall During Previous</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Rain Fall Last 24h</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Wind First Anemometer</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Wind Second Anemometer</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Wind Speed</Text>
              <Text style={[styles.tableCellHeader, { width: "2.5%" }]}>Wind Direction</Text>
              <Text style={[styles.tableCellHeader, { width: "8%" }]}>Observer Initial</Text>
            </View>

            {/* Second Card Data Rows - Limited to 6 rows */}
            {secondCardData.slice(0, 8).map((record, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: "3%" }]}>{formatTime(record.utcTime)}</Text>
                <Text style={[styles.tableCell, { width: "4%" }]}>{moment(record.utcTime).format("ll")}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.lowCloudForm)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.lowCloudHeight)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.lowCloudAmount)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.lowCloudDirection)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.mediumCloudForm)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.mediumCloudHeight)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.mediumCloudAmount)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.mediumCloudDirection)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.highCloudForm)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.highCloudHeight)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.highCloudAmount)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.highCloudDirection)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.totalCloudAmount)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer1Form)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer1Height)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer1Amount)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer2Form)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer2Height)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer2Amount)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer3Form)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer3Height)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer3Amount)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer4Form)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer4Height)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.layer4Amount)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{moment(record.rainfallTimeStart).format("LT")}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{moment(record.rainfallTimeEnd).format("LT")}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.rainfallSincePrevious)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.rainfallDuringPrevious)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.rainfallLast24Hours)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.windFirstAnemometer)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.windSecondAnemometer)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.windSpeed)}</Text>
                <Text style={[styles.tableCell, { width: "2.5%" }]}>{formatValue(record.windDirection)}</Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>{formatValue(record.observerInitial)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Synoptic Code Data - Compact */}
        <View style={styles.compactSection}>
          <Text style={styles.sectionTitle}>Synoptic Code Data</Text>
          <View style={styles.table}>
            {/* Synoptic Headers - Compact */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>Time</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>Date</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>C1</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>Iliii</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>iRiXhvv</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>Nddff</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>S1nTTT</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>S2nTdTdTd</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>P3PPP/4PPPP</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>6RRRtR</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>7wwW1W2</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>8NhClCmCh</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>2SnTnTnTn</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>56DlDmDh</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>57CDaEc</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>C2</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>GG</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>58/59P24</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>6/7R24</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>8NsChshs</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>90dqqqt</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "4%" }]}>91fqfqfq</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "12%" }]}>Remark</Text>
            </View>

            {/* Synoptic Data Rows - Limited to 6 rows */}
            {synopticData.slice(0, 8).map((record, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatTime(record.date)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{moment(record.date).format("ll")}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.C1)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.Iliii)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.iRiXhvv)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.Nddff)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.S1nTTT)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.S2nTddTddTdd)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.P3PPP4PPPP)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.RRRtR6)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.wwW1W2)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.NhClCmCh)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.S2nTnTnTnInInInIn)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.D56DLDMDH)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.CD57DaEc)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.C2)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.GG)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.P24Group58_59)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.R24Group6_7)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.NsChshs)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.dqqqt90)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "4%" }]}>{formatValue(record.fqfqfq91)}</Text>
                <Document style={[styles.tableCellSynoptic, { width: "12%" }]}><Text>{record.weatherRemark.split(" - ")[1]}</Text><Image style={{width: 10, height: 10}} src={record.weatherRemark.split(" - ")[0]} /></Document>
            </View>
            ))}
          </View>
        </View>

        {/* Daily Summary Data - Compact */}
        <View style={styles.compactSection}>
          <Text style={styles.sectionTitle}>Daily Summary Data</Text>
          <View style={styles.table}>
            {/* Daily Summary Headers - Compact */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Time</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Date</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "6%" }]}>Av. Station Pressure (hPa)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "6%" }]}>Av. Sea-Level Pressure (hPa)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Av. Dry-Bulb Temp (°C)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Av. Wet Bulb Temp (°C)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Max Temperature (°C)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Min Temperature (°C)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Total Precipitation (mm)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Av. Dew Point Temp (°C)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Av. Relative Humidity (%)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Wind Speed (m/s)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Wind Direction</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Max Wind Speed (m/s)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Max Wind Direction</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Av. Total Cloud (octas)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Lowest Visibility (km)</Text>
              <Text style={[styles.tableCellHeaderSynoptic, { width: "5.5%" }]}>Total Rain Duration (H-M)</Text>
            </View>

            {/* Synoptic Data Rows - Limited to 6 rows */}
            {dailySummeryData.slice(0, 8).map((record, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatTime(record.date)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{moment(record.date).format("ll")}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "6%" }]}>{formatValue(record.avStationPressure)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "6%" }]}>{formatValue(record.avSeaLevelPressure)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.avDryBulbTemperature)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.avWetBulbTemperature)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.maxTemperature)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.minTemperature)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.totalPrecipitation)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.avDewPointTemperature)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.avRelativeHumidity)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.windSpeed)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.windDirection)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.maxWindSpeed)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.maxWindDirection)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.avTotalCloud)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.lowestVisibility)}</Text>
                <Text style={[styles.tableCellSynoptic, { width: "5.5%" }]}>{formatValue(record.totalRainDuration)}</Text>
            </View>
            ))}
          </View>
        </View>



        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Weather Station Data Report - {superAdmin ? formatValue(firstCardData[0].stationName) : formatValue(stationInfo.stationName)} ({superAdmin ? formatValue(firstCardData[0].stationCode) : formatValue(stationInfo.stationId)}) - {stationInfo.date}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Main Compact PDF Export Component
interface CompactPDFExportButtonProps {
  firstCardRef: React.RefObject<any>
  secondCardRef: React.RefObject<any>
  synopticRef: React.RefObject<any>
  dailySummeryRef: React.RefObject<any>
  stationInfo?: {
    stationId: string
    stationName: string
    date: string
  }
}

export const CompactPDFExportButton: React.FC<CompactPDFExportButtonProps> = ({
  firstCardRef,
  secondCardRef,
  synopticRef,
  dailySummeryRef,
  stationInfo = {
    stationId: "41953",
    stationName: "Weather Station",
    date: new Date().toLocaleDateString(),
  },
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false)

  const generatePDFData = React.useCallback(() => {
    const firstCardData = firstCardRef.current?.getData?.() || []
    const secondCardData = secondCardRef.current?.getData?.() || []
    const synopticData = synopticRef.current?.getData?.() || []
    const dailySummeryData = dailySummeryRef.current?.getData?.() || []

    return {
      firstCardData,
      secondCardData,
      synopticData,
      dailySummeryData,
      stationInfo,
    }
  }, [firstCardRef, secondCardRef, synopticRef, dailySummeryRef, stationInfo])

  return (
    <PDFDownloadLink
      document={<CompactWeatherPDFDocument {...generatePDFData()} />}
      fileName={`Weather_Data_Compact_${stationInfo.date.replace(/\//g, "-")}.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <Button
          disabled={loading || isGenerating}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          onClick={() => {
            setIsGenerating(true)
            setTimeout(() => setIsGenerating(false), 1000)
          }}
        >
          {loading || isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <FileText className="h-4 w-full" />
              Export All to PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  )
}

export default CompactPDFExportButton
