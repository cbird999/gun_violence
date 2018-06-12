library(tigris)
library(sp)
library(sf)
library(rgdal)
library(tidyverse)
library(geojsonio)
#library(censusapi)
# options(tigris_year = 2017)
# need Census API key for data
# https://api.census.gov/data/key_signup.html
#View(listCensusApis())
#censusAPIKey <- '279cf181f2718a37171db524990e43424724b088'
#populationData <- getCensus(name = 'acs/acs5', vintage = 2016, key = censusAPIKey, vars = c('NAME', 'group(GEO.id,GEO.id2,GEO.display-label)'), region = 'state:*') 

usStatesACS2017 <- states(cb = T, resolution = '5m', year = 2017)

stateAbbrev <- read_csv('data/state_abbrev.csv')
populationData <- read_csv(file = 'data/ACS_16_5YR_S0101/ACS_16_5YR_S0101_with_ann.csv')
populationData

populationData <- populationData %>% 
  select(-(contains('MOE'))) %>% 
  filter(row_number() > 1) %>% 
  select(`GEO.id`:HC03_EST_VC01, HC01_EST_VC28)

populationData <- populationData %>% mutate(
  state = `GEO.display-label`,
  pop = as.numeric(HC01_EST_VC01), 
  pop_male = as.numeric(HC02_EST_VC01), 
  pop_female = as.numeric(HC03_EST_VC01), 
  per_pop_adult = as.numeric(HC01_EST_VC28)) 

populationData <- populationData %>%
  mutate(pop_adult = pop * per_pop_adult / 100) %>%
  select(state, pop, pop_male, pop_female, per_pop_adult, pop_adult)

# setup region data
regionS <- c('DC', 'TX', 'OK', 'AR', 'LA', 'MS', 'AL', 'TN', 'GA', 'FL', 'SC', 'NC', 'VA', 'KY', 'WV', 'MD', 'DE')
regionNE <- c('RI', 'NJ', 'PA', 'CT', 'NY', 'VT', 'NH', 'MA', 'ME')
regionMW <- c('OH', 'MI', 'IN', 'WI', 'IL', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS')
regionW <- c('AK', 'HI', 'WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'WY', 'UT', 'AZ', 'NM', 'CO')


stateAbbrev <- stateAbbrev %>% mutate(region = case_when(
  `Postal Code` %in% regionS ~ 'South',
  `Postal Code` %in% regionNE ~ 'Northeast',
  `Postal Code` %in% regionMW ~ 'Midwest',
  `Postal Code` %in% regionW ~ 'West'
  ))

populationData <- populationData %>% left_join(stateAbbrev, by = c('state' = 'State/District'))

populationData <- populationData %>% 
  mutate(tot_us = sum(pop_adult)) %>%
  group_by(region) %>% 
  mutate(
    tot_region = sum(pop_adult),
    per_region = tot_region / tot_us) %>%
  group_by(state) %>%
  mutate(per_state = pop_adult / tot_region) %>%
  ungroup()

populationData <- populationData %>% rename(PostalCode = `Postal Code`)

### total number of random points to display on map
totalMapPoints <- 8000

### calculate proportional points per region and points per state
populationData <- populationData %>%
  mutate(ptsPerRegion = totalMapPoints * per_region,
         ptsPerState = ptsPerRegion * per_state)

# populationData %>% select(state, region, contains('pts'))

### keep it in sp for using spsample
### project to 4236
prj4326 <- '+proj=longlat +ellps=WGS84'
usStatesACS2017sp4236 <- spTransform(usStatesACS2017, prj4326)
### merge states sp with population data frame on state abbreviation
usStatesACS2017sp4236mrg <- merge(usStatesACS2017sp4236, populationData, by.x = 'STUSPS', by.y = 'PostalCode', all = F)

#### find random points
spList <- list()  # list to hold all spdf's for each state
for (i in 1:nrow(usStatesACS2017sp4236mrg)) {
  currentState <- usStatesACS2017sp4236mrg[i,]
  numPoints <- floor(currentState$ptsPerState)
  name = currentState@data$NAME
  region <- currentState@data$region
  abbrev <- currentState@data$STUSPS
  groupVec <- character()
  classVec <- character()
  currPew <- genderStrictness %>% filter(F_CREGION_FINAL == region)
  totPts <- 0
  for (i in 1:nrow(currPew)) {
    currPoints <- floor(numPoints * currPew[i,'per']) %>% pull
    totPts <- totPts + currPoints
    if (i == nrow(currPew) & totPts < numPoints ) {
      currPoints <- currPoints + (numPoints - totPts)
    }
    classVec <- append(classVec, rep(as.character(currPew[i,'class']), currPoints))
    groupVec <- append(groupVec, rep(as.character(currPew[i,]$F_SEX_FINAL), currPoints))
  }
  currSample <- spsample(x = currentState, n = numPoints, geometry = 'polygon', type = 'random')
  spdf <- SpatialPointsDataFrame(coords = currSample@coords, 
                                   data = data.frame(STUSPS = rep(abbrev, numPoints),
                                                     NAME = rep(name, numPoints),
                                                     region = rep(region, numPoints),
                                                     group = groupVec,
                                                     class = classVec), proj4string = CRS(prj4326))
  spList <- append(spList, spdf)
  #randomList <- append(randomList, samp)
}
randomSPDF <- spList[[1]]
for (i in 2:length(spList)) {
  randomSPDF <- rbind(randomSPDF, spList[[i]])
}

femaleSPDF <- randomSPDF[randomSPDF$group=='Female',]
maleSPDF <- randomSPDF[randomSPDF$group=='Male',]


geojson_write(femaleSPDF, geometry = 'polygon', file = 'json/female_random_points.geojson', overwrite = T)
geojson_write(maleSPDF, geometry = 'polygon', file = 'json/male_random_points.geojson', overwrite = T)




########## may not need this #########
#usStatesACS2017sf <- st_as_sf(usStatesACS2017)
#usStatesACS2017sf4326 <- st_transform(usStatesACS2017sf, 4326)
#statesPop <- inner_join(x = usStatesACS2017sf4326, y = populationData, by = c('STUSPS' = 'PostalCode'))
#contiguous <- statesPop %>% filter(!NAME %in% c('Alaska', 'Hawaii'))
#geojson_write(contiguous, geometry = 'polygon', file = 'json/states_pop.geojson', overwrite = T)



