library(foreign)
library(tidyverse)
library(jsonlite)

w25 <- read.spss('data/W25_Mar17/ATP W25.sav', 
                 use.value.labels = T, 
                 to.data.frame = T, 
                 trim.factor.names = T, 
                 trim_values = T, 
                 duplicated.value.labels = 'condense')
head(w25)
names(w25)

# gender
nrow(w25)
grep(pattern = 'sex', x = names(w25), ignore.case = T, value = T)
grep(pattern = 'region', x = names(w25), ignore.case = T, value = T)
grep(pattern = 'gun', x = names(w25), ignore.case = T, value = T)
grep(pattern = 'weight', x = names(w25), ignore.case = T, value = T)
range(w25$WEIGHT_W25)
range(w25$WEIGHT_W25W26, na.rm = T)
sum(is.na(w25$WEIGHT_W25W26))

distinct(w25, F_CREGION_FINAL)

### produce tables for maps
w25 <- w25 %>% 
  mutate(TOT_W25 = nrow(w25) * WEIGHT_W25, TOT_W2526 = nrow(w25) * WEIGHT_W25W26) %>%
  group_by(F_CREGION_FINAL) %>%
  mutate(TOT_REGION = sum(TOT_W25)) %>%
  ungroup() %>%
  select(F_CREGION_FINAL, F_SEX_FINAL, TOT_REGION, TOT_W25, contains('GUN'), everything())

w25 <- w25 %>% mutate(region = case_when(
  F_CREGION_FINAL %in% regionS ~ 'S',
  F_CREGION_FINAL %in% regionNE ~ 'NE',
  `Postal Code` %in% regionMW ~ 'MW',
  `Postal Code` %in% regionW ~ 'W'
))

# gender/strictness
genderStrictness <- w25 %>%
  select(F_CREGION_FINAL, F_SEX_FINAL, TOT_REGION, TOT_W25, GUNSTRICT_W25) %>%
  filter(GUNSTRICT_W25 != 'Refused') %>%
  group_by(F_CREGION_FINAL) %>%
  mutate(TOT_REGION = sum(TOT_W25)) %>%
  ungroup() %>%
  group_by(F_CREGION_FINAL, F_SEX_FINAL, GUNSTRICT_W25) %>% 
  summarise(per = sum(TOT_W25) / first(TOT_REGION)) %>%
  mutate(class = case_when(
    GUNSTRICT_W25 == 'Gun laws should be MORE strict than they are today' ~ 'high',
    GUNSTRICT_W25 == 'Gun laws are about right' ~ 'neutral',
    GUNSTRICT_W25 == 'Gun laws should be LESS strict than they are today' ~ 'low'),
    answer = GUNSTRICT_W25,
    group = F_SEX_FINAL)

write_json(x = genderStrictness, 'json/gender_strictness.json', overwrite = T)

# education/who
# F_EDUCCAT_FINAL
# recode
educationWho <- w25 %>%
  mutate(education = case_when(F_EDUCCAT_FINAL == 'College graduate+' ~ 'College or more',
                               F_EDUCCAT_FINAL == 'Some college' ~ 'Less than college',
                               F_EDUCCAT_FINAL == 'H.S. graduate or less' ~ 'Less than college'),
         group = case_when(F_EDUCCAT_FINAL == 'College graduate+' ~ 'College',
                           F_EDUCCAT_FINAL == 'Some college' ~ 'BelowCollege',
                           F_EDUCCAT_FINAL == 'H.S. graduate or less' ~ 'BelowCollege')) %>%
  filter(GUNWHO_W25 != 'Refused') %>%
  group_by(F_CREGION_FINAL) %>%
  mutate(TOT_REGION = sum(TOT_W25)) %>%
  ungroup() %>%
  group_by(F_CREGION_FINAL, group, GUNWHO_W25) %>% 
  summarise(per = sum(TOT_W25) / first(TOT_REGION)) %>%
  mutate(class = case_when(GUNWHO_W25 == 'Almost everyone should' ~ 'high',
                           GUNWHO_W25 == 'Almost no one should' ~ 'low',
                           GUNWHO_W25 == 'Some people should, but most people should NOT' ~ 'neutral',
                           GUNWHO_W25 == 'Most people should, but some people should NOT' ~ 'neutral'),
                           answer = GUNWHO_W25)

write_json(x = educationWho, 'json/education_who.json', overwrite = T)

# political/typegun
# F_PARTY_FINAL/GUNTYPE_W25
# recode
politicalType <- w25 %>%
  mutate(group = case_when(F_PARTY_FINAL == 'Democrat' ~ 'Democrat',
                           F_PARTY_FINAL == 'Republican' ~ 'Republican',
                           F_PARTY_FINAL == 'Something else' ~ 'Other',
                           F_PARTY_FINAL == 'Independent' ~ 'Other')) %>%
  filter(GUNTYPE_W25 != 'Refused', F_PARTY_FINAL != 'Refused', group != 'Other') %>%
  group_by(F_CREGION_FINAL) %>%
  mutate(TOT_REGION = sum(TOT_W25)) %>%
  ungroup() %>%
  group_by(F_CREGION_FINAL, group, GUNTYPE_W25) %>% 
  summarise(per = sum(TOT_W25) / first(TOT_REGION)) %>%
  mutate(class = case_when(GUNTYPE_W25 == 'Almost all types should' ~ 'high',
                           GUNTYPE_W25 == 'Almost no types should' ~ 'low',
                           GUNTYPE_W25 == 'Some types should, but most types should NOT' ~ 'neutral',
                           GUNTYPE_W25 == 'Most types should, but some types should NOT' ~ 'neutral'),
                           answer = GUNTYPE_W25)

write_json(x = politicalType, 'json/political_type.json', overwrite = T)












#### not used ####
w25 %>%
  filter(is.na(WEIGHT_W25W26)) %>%
  group_by(F_CREGION_FINAL, F_SEX_FINAL, GUNSTRICT_W25) %>% 
  summarise(tot = sum(TOT_W25)) %>%
  print(n = Inf)

w25 %>% 
  filter(!is.na(WEIGHT_W25W26)) %>%
  group_by(F_CREGION_FINAL, F_SEX_FINAL, GUNSTRICT_W25) %>% 
  summarise(tot = sum(TOT_W2526)) %>%
  print(n = Inf)
#################

#### not used ####
sort(grep(pattern = 'gun', x = names(w26), ignore.case = T, value = T))
w26 <- w26 %>% 
  mutate(TOT_W26 = nrow(w26) * WEIGHT_W26, TOT_W2526 = nrow(w26) * WEIGHT_W25W26)

w26 %>%
  filter(is.na(WEIGHT_W25W26)) %>%
  group_by(F_CREGION_FINAL, F_SEX_FINAL, GUNSTRICT_W26) %>% 
  summarise(tot = sum(TOT_W26)) %>%
  print(n = Inf)

w25 %>% 
  filter(!is.na(WEIGHT_W25W26)) %>%
  group_by(F_CREGION_FINAL, F_SEX_FINAL, GUNSTRICT_W25) %>% 
  summarise(tot = sum(TOT_W2526)) %>%
  print(n = Inf)
################

#library(pewdata)
#library(haven)

#options('pew_name' = 'Christopher Cardinal',
#        'pew_org' = 'Institute for the Study of Human Rights',
##       'pew_phone' = '917-355-3550',
#        'pew_email' = 'cbird@hypermeganet.com')


# pew_download(area = 'socialtrends', file_id = 10345448)

# w25 <- read_sav(file = 'data/W25_Mar17/ATP W25.sav', user_na = T)

w26 <- read.spss('data/W26_Apr17/ATP W26.sav', 
                 use.value.labels = T, 
                 to.data.frame = T, 
                 trim.factor.names = T, 
                 trim_values = T, 
                 duplicated.value.labels = 'condense')
head(w26)