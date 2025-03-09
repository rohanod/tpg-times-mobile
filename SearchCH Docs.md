---

# Completion

**Endpoint**  
`GET https://search.ch/timetable/api/completion.fr.json?term=lu`

**Parameters**  
| Parameter         | Required | Description                                    | Example | Default |
|-------------------|----------|------------------------------------------------|---------|---------|
| `term`           | Yes      | User input                                     | lu      |         |
| `nofavorites`    | No       | No smart favourites from timetable.search.ch   | 1       | 0       |
| `show_ids`       | No       | Show station IDs                               | 1       | 0       |
| `show_coordinates` | No     | Show coordinates of stations (x=E, y=N)        | 1       | 0       |

**Example Response**  
```json
[
   {
      "label": "Lu",
      "html": "<span class=\"sl-keyword\">Lu</span>zern",
      "iconclass": "sl-icon-type-zug"
   },
   [...]
]
```

---

# Station Coordinates

**Endpoint**  
`GET https://search.ch/timetable/api/completion.fr.json?latlon=46.948004,7.448134&accuracy=10`

**Parameters**  
| Parameter         | Required | Description                                    | Example             | Default |
|-------------------|----------|------------------------------------------------|---------------------|---------|
| `latlon`         | Yes      | Coordinates (latitude,longitude)               | 46.948004,7.448134  |         |
| `accuracy`       | No       | Accuracy in metres                             | 10                  | 0       |
| `show_ids`       | No       | Show station IDs                               | 1                   | 0       |
| `show_coordinates` | No     | Show coordinates of stations (x=E, y=N)        | 1                   | 0       |

**Example Response**  
```json
[
	{
		"label": "Zytgloggelaube, Bern",
		"dist": 15,
		"iconclass": "sl-icon-type-adr"
	},
	{
		"label": "Bern, Zytglogge",
		"dist": 51,
		"iconclass": "sl-icon-type-tram"
	},
	{
		"label": "Bern, Bundesplatz",
		"dist": 337,
		"iconclass": "sl-icon-type-bus"
	},
	[...]
]
```

---

# Route Searches

**Endpoint**  
`GET https://search.ch/timetable/api/route.fr.json?from=Einsiedeln&to=Z%C3%BCrich,+F%C3%B6rrlibuckstr.+60`

**Parameters**  
| Parameter             | Required | Description                                                                             | Example                                 | Default |
|-----------------------|----------|-----------------------------------------------------------------------------------------|-----------------------------------------|---------|
| `from`               | Yes      | Departure station, ID or address                                                        | Einsiedeln                              |         |
| `to`                 | Yes      | Arrival station, ID or address                                                          | Zürich, Förrlibuckstr. 60              |         |
| `via`                | No       | Via stations; use array notation for more than one station: `via[]=via1&via[]=via2`     | Wädenswil                               |         |
| `date`               | No       | Date                                                                                    | 02/12/2025                              | today   |
| `time`               | No       | Time                                                                                    | 11:36                                   | now     |
| `time_type`          | No       | Specifies whether the date/time applies to departure or arrival                         | arrival                                 | depart  |
| `num`                | No       | How many connections should be returned                                                 | 8                                       | 4       |
| `pre`                | No       | How many additional connections before the given time                                   | 4                                       | 0       |
| `show_delays`        | No       | Show delays                                                                             | 1                                       | 0       |
| `show_trackchanges`  | No       | Show platform changes (indicated by exclamation mark)                                   | 1                                       | 0       |
| `one_to_many`        | No       | Find routes to multiple destinations or multiple starting points simultaneously         | 1                                       | 0       |
| `interest_duration`  | No       | Find routes for this timeframe (in minutes) from the given arrival or departure time    | 1440                                    | 5760    |
| `transportation_types` | No     | Permitted means of transport, comma-separated (`train,tram,bus,ship,cableway`)          | tram,bus                                |         |
| `summary`            | No       | Summary                                                                                 | 1                                       | 0       |

**Example Response**  
```json
{
   "count": 4,
   "min_duration": 4140,
   "max_duration": 4920,
   "connections" : [
      {
         "from" : "Einsiedeln",
         "arrival" : "2016-10-27 20:12:00",
         "disruptions" : [],
         "legs" : [
            {
               "type" : "str",
               "track" : "4",
               "terminal" : "Wädenswil",
               "fgcolor" : "fff",
               "number" : "S13 19371",
               "bgcolor" : "039",
               "tripid" : "T2016_19371_000082_101_df5a79b_0",
               "exit" : {
                  "arrival" : "2016-10-27 19:25:00",
                  "sbb_name" : "Wädenswil",
                  "name" : "Wädenswil",
                  "stopid" : "8503206",
                  "waittime" : 240
               },
               "runningtime" : 1620,
               "stopid" : "8503283",
               "line" : "S13",
               "stops" : [
                  {
                     "stopid" : "8503284",
                     "name" : "Biberbrugg",
                     "departure" : "27.10.2016 19:07"
                  },
                  {
                     "name" : "Schindellegi-Feusisberg",
                     "departure" : "27.10.2016 19:11",
                     "stopid" : "8503285"
                  },
                  {
                     "name" : "Samstagern",
                     "departure" : "27.10.2016 19:17",
                     "stopid" : "8503286"
                  },
                  {
                     "stopid" : "8503293",
                     "departure" : "27.10.2016 19:18",
                     "name" : "Grüenfeld"
                  },
                  {
                     "stopid" : "8503287",
                     "name" : "Burghalden",
                     "departure" : "27.10.2016 19:21"
                  }
               ],
               "sbb_name" : "Einsiedeln",
               "name" : "Einsiedeln",
               "departure" : "2016-10-27 18:58:00"
            },
            {
               "arrival" : "2016-10-27 19:25:00",
               "departure" : "2016-10-27 19:29:00",
               "name" : "Wädenswil",
               "stops" : [
                  {
                     "departure" : "27.10.2016 19:39",
                     "name" : "Thalwil",
                     "stopid" : "8503202"
                  },
                  {
                     "stopid" : "0000176",
                     "departure" : null,
                     "name" : "Zimmerberg-Basistunnel"
                  }
               ],
               "type" : "express_train",
               "normal_time" : 180,
               "sbb_name" : "Wädenswil",
               "runningtime" : 1140,
               "exit" : {
                  "arrival" : "2016-10-27 19:48:00",
                  "name" : "Zürich HB",
                  "sbb_name" : "Zürich HB",
                  "waittime" : 0,
                  "stopid" : "8503000"
               },
               "line" : "RE",
               "stopid" : "8503206",
               "waittime" : 240,
               "tripid" : "T2016_05082_000011_101_c92bac7_0",
               "bgcolor" : "f00",
               "number" : "RE 5082",
               "terminal" : "Zürich HB",
               "track" : "2",
               "fgcolor" : "fff"
            },
            {
               "arrival" : "2016-10-27 19:48:00",
               "normal_time" : 420,
               "sbb_name" : "Zürich HB",
               "name" : "Zürich HB",
               "departure" : "2016-10-27 19:48:00",
               "exit" : {
                  "sbb_name" : "Zürich, Sihlquai/HB",
                  "name" : "Zürich, Sihlquai/HB",
                  "arrival" : "2016-10-27 19:55:00",
                  "waittime" : 360,
                  "stopid" : "8591368"
               },
               "runningtime" : 420,
               "stopid" : "8503000",
               "waittime" : 0,
               "stops" : null
            },
            {
               "name" : "Zürich, Sihlquai/HB",
               "departure" : "2016-10-27 20:01:00",
               "arrival" : "2016-10-27 19:55:00",
               "stops" : [
                  {
                     "stopid" : "8591282",
                     "departure" : "27.10.2016 20:02",
                     "name" : "Zürich, Museum für Gestaltung"
                  },
                  {
                     "stopid" : "8591257",
                     "departure" : "27.10.2016 20:03",
                     "name" : "Zürich, Limmatplatz"
                  },
                  {
                     "stopid" : "8591306",
                     "name" : "Zürich, Quellenstr.",
                     "departure" : "27.10.2016 20:04"
                  },
                  {
                     "departure" : "27.10.2016 20:05",
                     "name" : "Zürich, Dammweg",
                     "stopid" : "8591110"
                  },
                  {
                     "stopid" : "8580522",
                     "name" : "Zürich, Escher-Wyss-Platz",
                     "departure" : "27.10.2016 20:06"
                  }
               ],
               "type" : "tram",
               "sbb_name" : "Zürich, Sihlquai/HB",
               "stopid" : "8591368",
               "waittime" : 360,
               "line" : "17",
               "exit" : {
                  "stopid" : "8591135",
                  "arrival" : "2016-10-27 20:08:00",
                  "name" : "Zürich, Förrlibuckstr.",
                  "sbb_name" : "Zürich, Förrlibuckstrasse"
               },
               "runningtime" : 420,
               "number" : "T 34826",
               "bgcolor" : "9d1b6e",
               "tripid" : "T2016_34826_003849_001_494a519_0",
               "fgcolor" : "fff",
               "terminal" : "Zürich, Werdhölzli"
            },
            {
               "arrival" : "2016-10-27 20:08:00",
               "name" : "Zürich, Förrlibuckstr.",
               "normal_time" : 0,
               "sbb_name" : "Zürich, Förrlibuckstrasse",
               "departure" : "2016-10-27 20:08:00",
               "exit" : {
                  "stopid" : "681270,249530",
                  "isaddress" : true,
                  "sbb_name" : null,
                  "name" : "Zürich, Förrlibuckstr. 60",
                  "arrival" : "2016-10-27 20:12:00"
               },
               "runningtime" : 240,
               "stopid" : "8591135",
               "stops" : null,
               "type" : "walk"
            },
            {
               "isaddress" : true,
               "stopid" : "681270,249530",
               "arrival" : "2016-10-27 20:12:00",
               "sbb_name" : null,
               "name" : "Zürich, Förrlibuckstr. 60"
            }
         ],
         "duration" : 4440,
         "to" : "Zürich, Förrlibuckstr. 60",
         "departure" : "2016-10-27 18:58:00"
      }
   ]
}
```

---

# Station

**Endpoint**  
`GET https://search.ch/timetable/api/station.fr.json?stop=Einsiedeln`

**Parameters**  
| Parameter | Required | Description         | Example    | Default |
|-----------|----------|---------------------|------------|---------|
| `stop`    | Yes      | Station or ID       | Einsiedeln |         |

**Example Response**  
```json
{
	"id": "8503283",
	"name": "Einsiedeln",
	"type": "strain",
	"x": "699076",
	"y": "220557",
	"lon": 8.744481,
	"lat": 47.128578,
	"request": "station",
	"eof": 1
}
```

---

# Station Board

**Endpoint**  
`GET https://search.ch/timetable/api/stationboard.fr.json?stop=Einsiedeln`

**Parameters**  
| Parameter              | Required | Description                                                      | Example         | Default |
|------------------------|----------|------------------------------------------------------------------|-----------------|---------|
| `stop`                | Yes      | Station or ID                                                    | Einsiedeln      |         |
| `date`                | No       | Date                                                             | 02/12/2025      | today   |
| `time`                | No       | Time                                                             | 11:36           | now     |
| `mode`                | No       | Specifies whether arrival or departure table is returned         | arrival         | depart  |
| `limit`               | No       | Number of connections. 0 for unlimited (24-hour range)           | 15              | 0       |
| `show_tracks`         | No       | Show platforms                                                   | 1               | 0       |
| `show_subsequent_stops` | No     | Show subsequent stations                                         | 1               | 0       |
| `show_delays`         | No       | Show delays                                                      | 1               | 0       |
| `show_trackchanges`   | No       | Show platform changes (indicated by exclamation mark)            | 1               | 0       |
| `transportation_types` | No      | Permitted means of transport (train,tram,bus,ship,cableway)      | tram,bus        |         |

**Example Response**  
```json
{
	"stop": {
		"id": "8503283",
		"name": "Einsiedeln",
		"x": "699075",
		"y": "220557",
		"lon": 8.744468,
		"lat": 47.128579
	},
	"connections": [
		{
			"time": "2021-02-08 13:46:00",
			"*G": "S",
			"*L": "40",
			"*Z": "016951",
			"type": "strain",
			"line": "S40",
			"operator": "SOB-sob",
			"color": "039~fff~",
			"type_name": "S-Bahn",
			"terminal": {
				"id": "8503110",
				"name": "Rapperswil SG",
				"x": 704370,
				"y": 231356,
				"lon": 8.816743,
				"lat": 47.224885
			}
		},
		{
			"time": "2021-02-08 13:59:00",
			"*G": "S",
			"*L": "13",
			"*Z": "019351",
			"type": "strain",
			"line": "S13",
			"operator": "SOB-sob",
			"color": "039~fff~",
			"type_name": "S-Bahn",
			"terminal": {
				"id": "8503206",
				"name": "Wädenswil",
				"x": 693645,
				"y": 231669,
				"lon": 8.675218,
				"lat": 47.229306
			}
		},
		[...]
	],
	"request": "stationboard",
	"eof": 1
}
```

---