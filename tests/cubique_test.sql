/*!40014 SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0 */;

SET NAMES 'utf8';
CREATE DATABASE cubique_test
CHARACTER SET utf8
COLLATE utf8_general_ci;

USE cubique_test;

CREATE TABLE country(
  id BIGINT (20) UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR (80) DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX country_i1 USING BTREE (name)
)
ENGINE = INNODB
AUTO_INCREMENT = 4
AVG_ROW_LENGTH = 5461
CHARACTER SET utf8
COLLATE utf8_general_ci;

CREATE TABLE province(
  id BIGINT (20) UNSIGNED NOT NULL AUTO_INCREMENT,
  country_id BIGINT (20) UNSIGNED NOT NULL,
  name VARCHAR (80) DEFAULT NULL,
  code CHAR (3) DEFAULT NULL,
  rating INT(11) DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX province_i1 USING BTREE (country_id),
  INDEX province_i2 USING BTREE (name),
  INDEX province_i3 USING BTREE (code),
  INDEX province_i4 USING BTREE (rating),
  CONSTRAINT province_fk1 FOREIGN KEY (country_id)
  REFERENCES country (id) ON DELETE CASCADE ON UPDATE CASCADE
)
ENGINE = INNODB
AUTO_INCREMENT = 79
AVG_ROW_LENGTH = 210
CHARACTER SET utf8
COLLATE utf8_general_ci;

/*!40000 ALTER TABLE country DISABLE KEYS */;

  INSERT INTO country VALUES (1, 'Australia'),
  (2, 'Canada'),
  (3, 'United States of America');
/*!40000 ALTER TABLE country ENABLE KEYS */;

/*!40000 ALTER TABLE province DISABLE KEYS */;

INSERT INTO `province` (`id`, `country_id`, `name`, `code`, `rating`) VALUES
(1, 1, 'Australian Capital Territory', 'ACT', 88),
(2, 1, 'New South Wales', 'NSW', 7),
(3, 1, 'Northern Territory', 'NT', 72),
(4, 1, 'Queensland', 'QLD', 37),
(5, 1, 'South Australia', 'SA', 69),
(6, 1, 'Tasmania', 'TAS', 32),
(7, 1, 'Victoria', 'VIC', 55),
(8, 1, 'Western Australia', 'WA', 78),
(9, 2, 'Alberta', 'AB', 23),
(10, 2, 'British Columbia', 'BC', 80),
(11, 2, 'Manitoba', 'MB', 32),
(12, 2, 'New Brunswick', 'NB', 20),
(13, 2, 'Newfoundland and Labrador', 'NL', 2),
(14, 2, 'Northwest Territories', 'NT', 49),
(15, 2, 'Nova Scotia', 'NS', 40),
(16, 2, 'Nunavut', 'NU', 53),
(17, 2, 'Ontario', 'ON', 43),
(18, 2, 'Prince Edward Island', 'PE', 55),
(19, 2, 'Quebec', 'QC', 46),
(20, 2, 'Saskatchewan', 'SK', 65),
(21, 2, 'Yukon Territory', 'YT', 87),
(22, 3, 'Alabama', 'AL', 38),
(23, 3, 'Alaska', 'AK', 29),
(24, 3, 'American Samoa', 'AS', 30),
(25, 3, 'Arizona', 'AZ', 64),
(26, 3, 'Arkansas', 'AR', 27),
(27, 3, 'California', 'CA', 44),
(28, 3, 'Colorado', 'CO', 36),
(29, 3, 'Connecticut', 'CT', 50),
(30, 3, 'Delaware', 'DE', 43),
(31, 3, 'District of Columbia', 'DC', 62),
(32, 3, 'Florida', 'FL', 80),
(33, 3, 'Georgia', 'GA', 15),
(34, 3, 'Guam', 'GU', 32),
(35, 3, 'Hawaii', 'HI', 17),
(36, 3, 'Idaho', 'ID', 88),
(37, 3, 'Illinois', 'IL', 90),
(38, 3, 'Indiana', 'IN', 85),
(39, 3, 'Iowa', 'IA', 55),
(40, 3, 'Kansas', 'KS', 17),
(41, 3, 'Kentucky', 'KY', 21),
(42, 3, 'Louisiana', 'LA', 54),
(43, 3, 'Maine', 'ME', 8),
(44, 3, 'Maryland', 'MD', 76),
(45, 3, 'Massachusetts', 'MA', 55),
(46, 3, 'Michigan', 'MI', 46),
(47, 3, 'Minnesota', 'MN', 66),
(48, 3, 'Mississippi', 'MS', 89),
(49, 3, 'Missouri', 'MO', 47),
(50, 3, 'Montana', 'MT', 68),
(51, 3, 'Nebraska', 'NE', 99),
(52, 3, 'Nevada', 'NV', 91),
(53, 3, 'New Hampshire', 'NH', 57),
(54, 3, 'New Jersey', 'NJ', 13),
(55, 3, 'New Mexico', 'NM', 94),
(56, 3, 'New York', 'NY', 28),
(57, 3, 'North Carolina', 'NC', 58),
(58, 3, 'North Dakota', 'ND', 4),
(59, 3, 'Northern Mariana Islands', 'MP', 47),
(60, 3, 'Ohio', 'OH', 22),
(61, 3, 'Oklahoma', 'OK', 67),
(62, 3, 'Oregon', 'OR', 71),
(63, 3, 'Pennsylvania', 'PA', 52),
(64, 3, 'Puerto Rico', 'PR', 47),
(65, 3, 'Rhode Island', 'RI', 79),
(66, 3, 'South Carolina', 'SC', 51),
(67, 3, 'South Dakota', 'SD', 19),
(68, 3, 'Tennessee', 'TN', 43),
(69, 3, 'Texas', 'TX', 57),
(70, 3, 'United States Minor Outlying Islands', 'UM', 55),
(71, 3, 'Utah', 'UT', 5),
(72, 3, 'Vermont', 'VT', 59),
(73, 3, 'Virgin Islands, U.S.', 'VI', 77),
(74, 3, 'Virginia', 'VA', 9),
(75, 3, 'Washington', 'WA', 14),
(76, 3, 'West Virginia', 'WV', 44),
(77, 3, 'Wisconsin', 'WI', 76),
(78, 3, 'Wyoming', 'WY', 47);
/*!40000 ALTER TABLE province ENABLE KEYS */;

/*!40014 SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS */;

