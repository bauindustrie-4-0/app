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

/*global define, window, document, history*/

/**
 * Init page module.
 *
 * @module views/init
 * @requires {@link core/event}
 * @requires {@link core/application}
 * @requires {@link core/systeminfo}
 * @requires {@link views/main}
 * @requires {@link views/preview}
 * @namespace views/init
 * @memberof views
 */

define({
    name: 'views/init',
    requires: [
        'core/event',
        'core/application',
        'core/systeminfo',
        'views/main',
        'views/preview'
    ],
    def: function viewsInit(req) {
        'use strict';

        /**
         * Event module object.
         *
         * @private
         * @type {Module}
         */
        var e = req.core.event,

            /**
             * Application module object.
             *
             * @private
             * @type {Module}
             */
            app = req.core.application,

            /**
             * Systeminfo module object.
             *
             * @private
             * @type {Module}
             */
            sysInfo = req.core.systeminfo,

            /**
             * An array of URL strings
             * that should be preloaded at application startup.
             *
             * @private
             * @type {string[]}
             */
            imagesToPreload = [
                'images/button_off.png',
                'images/button_on.png',
                'images/pause_icon.png',
                'images/play_icon.png',
                'images/record_icon.png',
                'images/stop_icon.png',
                'images/microphone_full.jpg',
                'images/speaker_full.jpg',
                'images/speaker_animate.png'
            ];

        /**
         * Handles tizenhwkey event.
         *
         * @private
         * @param {Event} ev
         */
        function onHardwareKeysTap(ev) {
            var keyName = ev.keyName,
                page = document.getElementsByClassName('ui-page-active')[0],
                pageid = (page && page.id) || '';

            if (keyName === 'back') {
                if (pageid === 'main') {
                    app.exit();
                } else {
                    history.back();
                }
            }
        }

        /**
         * Pre-loads images.
         *
         * @private
         */
        function preloadImages() {
            var image = null,
                i = 0,
                length = imagesToPreload.length;

            for (i = 0; i < length; i += 1) {
                image = new window.Image();
                image.src = imagesToPreload[i];
            }
        }

        /**
         * Handles core.battery.low event.
         *
         * @private
         */
        function onLowBattery() {
            app.exit();
        }

        /**
         * Handles visibilitychange event.
         *
         * @private
         * @param {Event} ev
         * @fires views.init.visibility.change
         */
        function onVisibilityChange(ev) {
            e.fire('visibility.change', ev);
        }

        /**
         * Handles window blur event.
         *
         * @private
         * @fires views.init.application.state.background
         */
        function onBlur() {
            e.fire('application.state.background');
        }

        /**
         * Registers event listeners.
         *
         * @private
         */
        function bindEvents() {
            document.addEventListener('tizenhwkey', onHardwareKeysTap);
            document.addEventListener('visibilitychange', onVisibilityChange);
            window.addEventListener('blur', onBlur);
            sysInfo.listenBatteryLowState();
        }

        /**
         * Initializes module.
         *
         * @memberof views/init
         * @public
         */
        function init() {
            preloadImages();
            sysInfo.checkBatteryLowState();
            bindEvents();
        }

        e.listeners({
            'core.systeminfo.battery.low': onLowBattery
        });

        return {
            init: init
        };
    }

});
