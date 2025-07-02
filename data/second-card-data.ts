export interface CloudData {
  direction: string;
  height: string;
  form: string;
  amount: string;
}

export interface SignificantCloudLayer {
  height: string;
  form: string;
  amount: string;
}

export interface RainfallData {
  "time-start": string;
  "time-end": string;
  "since-previous": string;
  "during-previous": string;
  "last-24-hours": string;
}

export interface WindData {
  "first-anemometer": string;
  "second-anemometer": string;
  speed: string;
  "wind-direction": string;
  direction: string;
}

export interface ObserverData {
  "observer-initial": string;
  "observation-time": string;
  "station-id": string;
  id?: string;
  "total-cloud-amount"?: string;
}

export interface MetadataData {
  submittedAt: string;
  stationId: string;
  tabActiveAtSubmission: string;
  createdAt: string;
  id: string;
}

export interface SecondCardData {
  clouds: {
    low: CloudData;
    medium: CloudData;
    high: CloudData;
  };
  significantClouds: {
    layer1: SignificantCloudLayer;
    layer2: SignificantCloudLayer;
    layer3: SignificantCloudLayer;
    layer4: SignificantCloudLayer;
  };
  totalCloud?: {
    "total-cloud-amount": string;
  };
  rainfall: RainfallData;
  wind: WindData;
  observer: ObserverData;
  metadata: MetadataData;
}

// The actual data from the provided JSON
export const secondCardData: SecondCardData[] = [
  {
    clouds: {
      low: {
        direction: "1",
        height: "1",
        form: "1",
        amount: "1",
      },
      medium: {
        direction: "1",
        height: "1",
        form: "1",
        amount: "1",
      },
      high: {
        direction: "1",
        height: "1",
        form: "1",
        amount: "1",
      },
    },
    significantClouds: {
      layer1: {
        height: "1",
        form: "1",
        amount: "1",
      },
      layer2: {
        height: "1",
        form: "1",
        amount: "1",
      },
      layer3: {
        height: "1",
        form: "1",
        amount: "1",
      },
      layer4: {
        height: "1",
        form: "1",
        amount: "1",
      },
    },
    rainfall: {
      "time-start": "1",
      "time-end": "1",
      "since-previous": "1",
      "during-previous": "1",
      "last-24-hours": "1",
    },
    wind: {
      "first-anemometer": "1",
      "second-anemometer": "1",
      speed: "1",
      "wind-direction": "1",
      direction: "1",
    },
    observer: {
      "observer-initial": "1",
      "observation-time": "2025-05-06T11:01",
      "station-id": "1",
      "total-cloud-amount": "1",
    },
    metadata: {
      submittedAt: "2025-05-06T05:01:16.371Z",
      stationId: "1",
      tabActiveAtSubmission: "observer",
      createdAt: "2025-05-06T05:01:16.576Z",
      id: "1746507676576",
    },
  },
  {
    clouds: {
      low: {
        direction: "10",
        height: "10",
        form: "10",
        amount: "10",
      },
      medium: {
        direction: "10",
        height: "10",
        form: "10",
        amount: "10",
      },
      high: {
        direction: "10",
        height: "10",
        form: "10",
        amount: "10",
      },
    },
    significantClouds: {
      layer1: {
        height: "10",
        form: "10",
        amount: "10",
      },
      layer2: {
        height: "10",
        form: "10",
        amount: "10",
      },
      layer3: {
        height: "10",
        form: "10",
        amount: "10",
      },
      layer4: {
        height: "10",
        form: "10",
        amount: "10",
      },
    },
    rainfall: {
      "time-start": "10",
      "time-end": "10",
      "since-previous": "10",
      "during-previous": "10",
      "last-24-hours": "10",
    },
    wind: {
      "first-anemometer": "10",
      "second-anemometer": "10",
      speed: "10",
      "wind-direction": "10",
      direction: "10",
    },
    observer: {
      "observer-initial": "10",
      "observation-time": "2025-05-06T11:03",
      "station-id": "100",
      "total-cloud-amount": "10",
    },
    metadata: {
      submittedAt: "2025-05-06T05:03:50.354Z",
      stationId: "100",
      tabActiveAtSubmission: "observer",
      createdAt: "2025-05-06T05:03:50.457Z",
      id: "1746507830457",
    },
  },
  {
    clouds: {
      low: {
        direction: "100",
        height: "100",
        form: "100",
        amount: "100",
      },
      medium: {
        direction: "100",
        height: "100",
        form: "100",
        amount: "100",
      },
      high: {
        direction: "100",
        height: "100",
        form: "100",
        amount: "100",
      },
    },
    significantClouds: {
      layer1: {
        height: "100",
        form: "100",
        amount: "100",
      },
      layer2: {
        height: "100",
        form: "100",
        amount: "100",
      },
      layer3: {
        height: "100",
        form: "100",
        amount: "100",
      },
      layer4: {
        height: "100",
        form: "100",
        amount: "100",
      },
    },
    totalCloud: {
      "total-cloud-amount": "100",
    },
    rainfall: {
      "time-start": "100",
      "time-end": "100",
      "since-previous": "100",
      "during-previous": "100",
      "last-24-hours": "100",
    },
    wind: {
      "first-anemometer": "100",
      "second-anemometer": "100",
      speed: "100",
      "wind-direction": "100",
      direction: "100",
    },
    observer: {
      "observer-initial": "100",
      "observation-time": "2025-05-06T11:15",
      "station-id": "100",
      "total-cloud-amount": "100",
    },
    metadata: {
      submittedAt: "2025-05-06T05:15:48.042Z",
      stationId: "100",
      tabActiveAtSubmission: "observer",
      createdAt: "2025-05-06T05:15:48.116Z",
      id: "1746508548116",
    },
  },
  {
    clouds: {
      low: {
        direction: "1",
        height: "1",
        form: "1",
        amount: "1",
      },
      medium: {
        direction: "1",
        height: "1",
        form: "1",
        amount: "1",
      },
      high: {
        direction: "1",
        height: "1",
        form: "1",
        amount: "1",
      },
    },
    totalCloud: {
      "total-cloud-amount": "1",
    },
    significantClouds: {
      layer1: {
        height: "1",
        form: "1",
        amount: "1",
      },
      layer2: {
        height: "1",
        form: "1",
        amount: "1",
      },
      layer3: {
        height: "1",
        form: "1",
        amount: "1",
      },
      layer4: {
        height: "1",
        form: "1",
        amount: "1",
      },
    },
    rainfall: {
      "time-start": "1",
      "time-end": "1",
      "since-previous": "1",
      "during-previous": "1",
      "last-24-hours": "1",
    },
    wind: {
      "first-anemometer": "1",
      "second-anemometer": "1",
      speed: "1",
      "wind-direction": "1",
      direction: "1",
    },
    observer: {
      "observer-initial": "1",
      "observation-time": "2025-05-06T11:21",
      "station-id": "1",
    },
    metadata: {
      submittedAt: "2025-05-06T05:21:54.362Z",
      stationId: "1",
      tabActiveAtSubmission: "observer",
      createdAt: "2025-05-06T05:21:54.471Z",
      id: "1746508914471",
    },
  },
  {
    clouds: {
      low: {
        direction: "9",
        height: "4",
        form: "6",
        amount: "4",
      },
      medium: {
        direction: "4",
        height: "5",
        form: "5",
        amount: "4",
      },
      high: {
        direction: "3",
        form: "5",
        height: "6",
        amount: "5",
      },
    },
    totalCloud: {
      "total-cloud-amount": "3",
    },
    significantClouds: {
      layer1: {
        height: "36",
        form: "4",
        amount: "3",
      },
      layer2: {
        height: "33",
        form: "/",
        amount: "7",
      },
      layer3: {
        height: "4",
        amount: "3",
        form: "6",
      },
      layer4: {
        height: "6",
        amount: "3",
        form: "6",
      },
    },
    rainfall: {
      "time-start": "10",
      "since-previous": "10",
      "time-end": "10",
      "last-24-hours": "10",
      "during-previous": "06",
    },
    wind: {
      "first-anemometer": "10",
      "second-anemometer": "20",
      speed: "30",
      "wind-direction": "North",
      direction: "North",
    },
    observer: {
      "observer-initial": "Jewel",
      "station-id": "12345",
      "observation-time": "2025-05-08T17:37",
    },
    metadata: {
      submittedAt: "2025-05-08T11:38:01.484Z",
      stationId: "12345",
      tabActiveAtSubmission: "observer",
      createdAt: "2025-05-08T11:38:02.378Z",
      id: "1746704282378",
    },
  },
  {
    clouds: {
      low: {
        direction: "3",
        height: "3",
        form: "3",
        amount: "3",
      },
      medium: {
        direction: "4",
        height: "4",
        form: "4",
        amount: "4",
      },
      high: {
        direction: "5",
        height: "5",
        form: "5",
        amount: "5",
      },
    },
    totalCloud: {
      "total-cloud-amount": "6",
    },
    significantClouds: {
      layer1: {
        height: "1",
        form: "1",
        amount: "1",
      },
      layer2: {
        height: "2",
        form: "2",
        amount: "2",
      },
      layer3: {
        height: "3",
        form: "3",
        amount: "3",
      },
      layer4: {
        height: "4",
        form: "4",
        amount: "4",
      },
    },
    rainfall: {
      "time-start": "12.00",
      "time-end": "13.00",
      "since-previous": "1",
      "during-previous": "06",
      "last-24-hours": "000",
    },
    wind: {
      "first-anemometer": "50",
      "second-anemometer": "60",
      speed: "120",
      "wind-direction": "N",
      direction: "N",
    },
    observer: {
      "observer-initial": "Jewel",
      "observation-time": "2025-05-10T14:54",
      "station-id": "41222",
    },
    metadata: {
      submittedAt: "2025-05-10T08:54:46.045Z",
      stationId: "41222",
      tabActiveAtSubmission: "observer",
      createdAt: "2025-05-10T08:54:46.788Z",
      id: "1746867286788",
    },
  },
  {
    clouds: {
      low: {
        direction: "1",
        height: "1",
        form: "1",
        amount: "1",
      },
      medium: {
        direction: "2",
        height: "2",
        form: "2",
        amount: "2",
      },
      high: {
        direction: "3",
        height: "3",
        form: "3",
        amount: "3",
      },
    },
    totalCloud: {
      "total-cloud-amount": "6",
    },
    significantClouds: {
      layer1: {
        height: "1",
        form: "1",
        amount: "1",
      },
      layer2: {
        height: "2",
        form: "2",
        amount: "2",
      },
      layer3: {
        height: "3",
        form: "3",
        amount: "3",
      },
      layer4: {
        height: "4",
        form: "4",
        amount: "4",
      },
    },
    rainfall: {
      "time-start": "12.00",
      "time-end": "13.00",
      "since-previous": "10",
      "during-previous": "50",
      "last-24-hours": "100",
    },
    wind: {
      "first-anemometer": "15",
      "second-anemometer": "20",
      speed: "50",
      "wind-direction": "N",
      direction: "N",
    },
    observer: {
      "observer-initial": "Jewel",
      "observation-time": "2025-05-11T10:29",
      "station-id": "41222",
    },
    metadata: {
      submittedAt: "2025-05-11T04:29:26.831Z",
      stationId: "41222",
      tabActiveAtSubmission: "observer",
      createdAt: "2025-05-11T04:29:28.019Z",
      id: "1746937768019",
    },
  },
  {
    clouds: {
      low: {
        direction: "2",
        height: "2",
        form: "2",
        amount: "2",
      },
      medium: {
        direction: "4",
        height: "4",
        form: "4",
        amount: "4",
      },
      high: {
        direction: "6",
        height: "6",
        form: "6",
        amount: "6",
      },
    },
    totalCloud: {
      "total-cloud-amount": "6",
    },
    significantClouds: {
      layer1: {
        height: "2",
        form: "2",
        amount: "2",
      },
      layer2: {
        height: "4",
        form: "4",
        amount: "4",
      },
      layer3: {
        height: "6",
        form: "6",
        amount: "6",
      },
      layer4: {
        height: "8",
        form: "8",
        amount: "8",
      },
    },
    rainfall: {
      "time-start": "10.00",
      "time-end": "12.00",
      "since-previous": "10",
      "during-previous": "10",
      "last-24-hours": "50",
    },
    wind: {
      "first-anemometer": "30",
      "second-anemometer": "35",
      speed: "107",
      "wind-direction": "185",
      direction: "185",
    },
    observer: {
      "observer-initial": "Jewel",
      "observation-time": "2025-05-11T12:17",
      "station-id": "41222",
    },
    metadata: {
      submittedAt: "2025-05-11T06:17:25.238Z",
      stationId: "41222",
      tabActiveAtSubmission: "observer",
      createdAt: "2025-05-11T06:17:25.341Z",
      id: "1746944245341",
    },
  },
];

// Function to get the data
export const getSecondCardData = (): SecondCardData[] => {
  return secondCardData;
};
