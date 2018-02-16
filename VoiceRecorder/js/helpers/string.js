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
 * String helper module.
 *
 * @module helpers/string
 * @namespace helpers/string
 * @memberof helpers
 */

define({
    name: 'helpers/string',
    def: function helpersString() {
        'use strict';

        /**
         * Returns the input as a string padded on the left to the specified
         * length. By default input is padded with zeros and length
         * is set to 2.
         *
         * @memberof helpers/string
         * @public
         * @param {mixed} input
         * @param {number} length Pad length (default: 2).
         * @param {string} padString Pad string (default: '0').
         * @returns {string}
         */
        function pad(input, length, padString) {
            input = String(input);
            length = length || 2;
            padString = padString || '0';

            while (input.length < length) {
                input = padString + input;
            }

            return input;
        }

        return {
            pad: pad
        };
    }
});
