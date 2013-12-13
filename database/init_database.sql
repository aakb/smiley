-- phpMyAdmin SQL Dump
-- version 4.0.4
-- http://www.phpmyadmin.net
--
-- Vært: localhost
-- Genereringstid: 13. 12 2013 kl. 07:47:13
-- Serverversion: 5.6.12-log
-- PHP-version: 5.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `data`
--

CREATE TABLE IF NOT EXISTS `data` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `macid` text NOT NULL,
  `datetime` bigint(20) NOT NULL,
  `db_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `smiley` int(11) NOT NULL,
  `what` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=23 ;

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `machine`
--

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=30 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
