-- Скрипт сгенерирован Devart dbForge Studio for MySQL, Версия 3.60.351.1
-- Дата: 01.11.2011 9:54:41
-- Версия сервера: 5.1.42-community
-- Версия клиента: 4.1

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0 */;

SET NAMES 'utf8';
--
-- Описание для базы данных cubique_test
--
CREATE DATABASE cubique_test
CHARACTER SET utf8
COLLATE utf8_general_ci;

USE cubique_test;

--
-- Описание для таблицы country
--
CREATE TABLE country(
  id BIGINT (20) UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR (80) DEFAULT NULL,
  alpha_1 CHAR (2) DEFAULT NULL,
  alpha_2 CHAR (3) DEFAULT NULL,
  PRIMARY KEY (id)
)
ENGINE = INNODB
AUTO_INCREMENT = 4
AVG_ROW_LENGTH = 5461
CHARACTER SET utf8
COLLATE utf8_general_ci;

--
-- Описание для таблицы province
--
CREATE TABLE province(
  id BIGINT (20) UNSIGNED NOT NULL AUTO_INCREMENT,
  country_id BIGINT (20) UNSIGNED NOT NULL,
  name VARCHAR (80) DEFAULT NULL,
  code CHAR (3) DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX province_i1 USING BTREE (country_id),
  CONSTRAINT province_fk1 FOREIGN KEY (country_id)
  REFERENCES country (id) ON DELETE CASCADE ON UPDATE CASCADE
)
ENGINE = INNODB
AUTO_INCREMENT = 4378
AVG_ROW_LENGTH = 210
CHARACTER SET utf8
COLLATE utf8_general_ci;

-- 
-- Вывод данных для таблицы country
-- 
/*!40000 ALTER TABLE country DISABLE KEYS */;

  INSERT INTO country VALUES (1, 'Australia', 'AU', 'AUS'),
  (2, 'Canada', 'CA', 'CAN'),
  (3, 'United States of America', 'US', 'USA');
/*!40000 ALTER TABLE country ENABLE KEYS */;

-- 
-- Вывод данных для таблицы province
-- 
/*!40000 ALTER TABLE province DISABLE KEYS */;

  INSERT INTO province VALUES (1, 1, 'Australian Capital Territory', 'ACT'),
  (2, 1, 'New South Wales', 'NSW'),
  (3, 1, 'Northern Territory', 'NT'),
  (4, 1, 'Queensland', 'QLD'),
  (5, 1, 'South Australia', 'SA'),
  (6, 1, 'Tasmania', 'TAS'),
  (7, 1, 'Victoria', 'VIC'),
  (8, 1, 'Western Australia', 'WA'),
  (9, 2, 'Alberta', 'AB'),
  (10, 2, 'British Columbia', 'BC'),
  (11, 2, 'Manitoba', 'MB'),
  (12, 2, 'New Brunswick', 'NB'),
  (13, 2, 'Newfoundland and Labrador', 'NL'),
  (14, 2, 'Northwest Territories', 'NT'),
  (15, 2, 'Nova Scotia', 'NS'),
  (16, 2, 'Nunavut', 'NU'),
  (17, 2, 'Ontario', 'ON'),
  (18, 2, 'Prince Edward Island', 'PE'),
  (19, 2, 'Quebec', 'QC'),
  (20, 2, 'Saskatchewan', 'SK'),
  (21, 2, 'Yukon Territory', 'YT'),
  (22, 3, 'Alabama', 'AL'),
  (23, 3, 'Alaska', 'AK'),
  (24, 3, 'American Samoa', 'AS'),
  (25, 3, 'Arizona', 'AZ'),
  (26, 3, 'Arkansas', 'AR'),
  (27, 3, 'California', 'CA'),
  (28, 3, 'Colorado', 'CO'),
  (29, 3, 'Connecticut', 'CT'),
  (30, 3, 'Delaware', 'DE'),
  (31, 3, 'District of Columbia', 'DC'),
  (32, 3, 'Florida', 'FL'),
  (33, 3, 'Georgia', 'GA'),
  (34, 3, 'Guam', 'GU'),
  (35, 3, 'Hawaii', 'HI'),
  (36, 3, 'Idaho', 'ID'),
  (37, 3, 'Illinois', 'IL'),
  (38, 3, 'Indiana', 'IN'),
  (39, 3, 'Iowa', 'IA'),
  (40, 3, 'Kansas', 'KS'),
  (41, 3, 'Kentucky', 'KY'),
  (42, 3, 'Louisiana', 'LA'),
  (43, 3, 'Maine', 'ME'),
  (44, 3, 'Maryland', 'MD'),
  (45, 3, 'Massachusetts', 'MA'),
  (46, 3, 'Michigan', 'MI'),
  (47, 3, 'Minnesota', 'MN'),
  (48, 3, 'Mississippi', 'MS'),
  (49, 3, 'Missouri', 'MO'),
  (50, 3, 'Montana', 'MT'),
  (51, 3, 'Nebraska', 'NE'),
  (52, 3, 'Nevada', 'NV'),
  (53, 3, 'New Hampshire', 'NH'),
  (54, 3, 'New Jersey', 'NJ'),
  (55, 3, 'New Mexico', 'NM'),
  (56, 3, 'New York', 'NY'),
  (57, 3, 'North Carolina', 'NC'),
  (58, 3, 'North Dakota', 'ND'),
  (59, 3, 'Northern Mariana Islands', 'MP'),
  (60, 3, 'Ohio', 'OH'),
  (61, 3, 'Oklahoma', 'OK'),
  (62, 3, 'Oregon', 'OR'),
  (63, 3, 'Pennsylvania', 'PA'),
  (64, 3, 'Puerto Rico', 'PR'),
  (65, 3, 'Rhode Island', 'RI'),
  (66, 3, 'South Carolina', 'SC'),
  (67, 3, 'South Dakota', 'SD'),
  (68, 3, 'Tennessee', 'TN'),
  (69, 3, 'Texas', 'TX'),
  (70, 3, 'United States Minor Outlying Islands', 'UM'),
  (71, 3, 'Utah', 'UT'),
  (72, 3, 'Vermont', 'VT'),
  (73, 3, 'Virgin Islands, U.S.', 'VI'),
  (74, 3, 'Virginia', 'VA'),
  (75, 3, 'Washington', 'WA'),
  (76, 3, 'West Virginia', 'WV'),
  (77, 3, 'Wisconsin', 'WI'),
  (78, 3, 'Wyoming', 'WY');
/*!40000 ALTER TABLE province ENABLE KEYS */;

/*!40014 SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS */;

