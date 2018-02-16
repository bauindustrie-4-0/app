/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global define*/
/*jslint plusplus: true */

/**
 * Date helpers module.
 *
 * @module helpers/date
 * @requires {@link helpers/string}
 * @namespace helpers/date
 * @memberof helpers
 */

define({
    name: 'helpers/date',
    requires: [
        'helpers/string'
    ],
    def: function helpersDate(string) {
        'use strict';

        /**
         * Array of names of days of the week.
         *
         * @private
         * @type {string[]}
         */
        var dayNames = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday'
            ],

            /**
             * Array of names of months of the year.
             *
             * @private
             * @type {string[]}
             */
            monthNames = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ],

            /**
             * Date format flags regular expression.
             *
             * @private
             * @type {RegExp}
             */
            dateFormatFlags = /d{1,4}|m{1,4}|([HhMS])\1?|TT|yyyy/g;

        /**
         * Returns day name for specified date.
         *
         * @memberof helpers/date
         * @public
         * @param {Date} date
         * @param {boolean} short Short name version.
         * @returns {string}
         */
        function getDayName(date, short) {
            var dayName = dayNames[date.getDay()];

            if (short) {
                dayName = dayName.substr(0, 3);
            }
            return dayName;
        }

        /**
         * Returns month name for specified date.
         *
         * @memberof helpers/date
         * @public
         * @param {Date} date
         * @param {boolean} short
         * @returns {string}
         */
        function getMonthName(date, short) {
            var monthName = monthNames[date.getMonth()];

            if (short) {
                monthName = monthName.substr(0, 3);
            }
            return monthName;
        }

        /**
         * Formats date value using specified format string and returns it.
         *
         * Following flags can be used:
         *  dddd - full day name
         *  ddd - short day name
         *  dd - day number with leading zeros
         *  d - day number
         *  mmmm - full month name
         *  mmm - short month name
         *  mm - month number with leading zeros
         *  yyyy - full 4-digit year
         *  m - month number
         *  H - hour (24h)
         *  HH - hour with leading zeros (24h)
         *  h - hour (12h)
         *  hh - hour with leading zeros (12h)
         *  M - minutes
         *  MM - minutes with leading zeros
         *  S - seconds
         *  SS - seconds with leading zeros
         *  TT - uppercase time format string (AM/PM)
         *
         * @memberof helpers/date
         * @public
         * @param {Date} date
         * @param {string} formatString
         * @returns {string}
         */
        function format(date, formatString) {
            var day = date.getDate(),
                month = date.getMonth(),
                year = date.getFullYear(),
                hour = date.getHours(),
                minutes = date.getMinutes(),
                seconds = date.getSeconds(),
                mask = formatString,
                replacements = {
                    'yyyy': year,
                    'dddd': getDayName(date, false),
                    'ddd': getDayName(date, true),
                    'dd': string.pad(day),
                    'd': day,
                    'mmmm': getMonthName(date, false),
                    'mmm': getMonthName(date, true),
                    'mm': string.pad(month + 1),
                    'm': month + 1,
                    'H': hour,
                    'HH': string.pad(hour),
                    'h': hour % 12 || 12,
                    'hh': string.pad(hour % 12 || 12),
                    'M': minutes,
                    'MM': string.pad(minutes),
                    'S': seconds,
                    'SS': string.pad(seconds),
                    'TT': hour < 12 ? 'AM' : 'PM'
                };

            return mask.replace(dateFormatFlags, function onReplace(flag) {
                return replacements.hasOwnProperty(flag) ?
                    replacements[flag] : flag;
            });
        }

        /**
         * Formats time to full seconds and returns it.
         *
         * @memberof helpers/date
         * @public
         * @param {number} seconds
         * @returns {string}
         */
        function formatTime(seconds) {
            return Math.ceil(seconds).toFixed(0);
        }

        return {
            getDayName: getDayName,
            getMonthName: getMonthName,
            format: format,
            formatTime: formatTime
        };
    }
});
