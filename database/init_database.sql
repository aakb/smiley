CREATE TABLE IF NOT EXISTS `data` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `macid` text NOT NULL,
  `datetime` bigint(20) NOT NULL,
  `db_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smiley` int(11) NOT NULL,
  `what` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=28 ;

CREATE TABLE IF NOT EXISTS `machine` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `macid` text NOT NULL,
  `contact` text NOT NULL,
  `mail` text NOT NULL,
  `magafd` text NOT NULL,
  `forvalt` text NOT NULL,
  `place` text NOT NULL,
  `name` text NOT NULL,
  `date_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=31 ;
