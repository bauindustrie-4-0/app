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

/*global define, console, document, tau, setTimeout*/
/*jslint plusplus: true*/

/**
 * Preview page module.
 *
 * @module views/preview
 * @requires {@link core/event}
 * @requires {@link helpers/page}
 * @namespace views/preview
 * @memberof views
 */

define({
    name: 'views/preview',
    requires: [
        'core/event',
        'helpers/page'
    ],
    def: function viewsPreview(req) {
        'use strict';

        /**
         * Clear progress bar timeout constant number.
         *
         * @private
         * @const {number}
         */
        var CLEAR_PROGRESS_BAR_TIMEOUT = 100,

            /**
             * Scrolling audio step constant number.
             *
             * @private
             * @const {number}
             */
            SCROLLING_AUDIO_STEP = 0.3,

            /**
             * Event module object.
             *
             * @private
             * @type {Module}
             */
            e = req.core.event,

            /**
             * Page helper module object.
             *
             * @private
             * @type {Module}
             */
            pageHelper = req.helpers.page,

            /**
             * Page element.
             *
             * @private
             * @type {HTMLElement}
             */
            page = null,

            /**
             * Audio element.
             *
             * @private
             * @type {HTMLElement}
             */
            audio = null,

            /**
             * Preview button element.
             *
             * @private
             * @type {HTMLElement}
             */
            prevBtn = null,

            /**
             * Preview button icon element.
             *
             * @private
             * @type {HTMLElement}
             */
            prevBtnIcon = null,

            /**
             * Preview button map element.
             *
             * @private
             * @type {HTMLElement}
             */
            prevBtnMap = null,

            /**
             * Preview progress element.
             *
             * @private
             * @type {HTMLElement}
             */
            prevProgress = null,

            /**
             * Preview progress value element.
             *
             * @private
             * @type {HTMLElement}
             */
            prevProgressVal = null,

            /**
             * Voice animation element.
             *
             * @private
             * @type {HTMLElement}
             */
            voiceAnimation = null,

            /**
             * Boolean flag indicating that preview button has been clicked
             * and preview process should start.
             *
             * @private
             * @type {boolean}
             */
            audioPlayState = false,

            /**
             * Boolean flag that allows to prevent the progress tap action.
             *
             * @private
             * @type {boolean}
             */
            blockProgressTapAction = false,

            /**
             * Touch counter that prevents preview button action
             * on multiple touch.
             *
             * @private
             * @type {number}
             */
            prevBtnTouchCounter = 0;

        /**
         * Shows preview page.
         *
         * @private
         * @param {Event} ev
         */
        function showPreviewPage(ev) {
            tau.changePage('#preview');
            ev.target.removeEventListener(ev.type, showPreviewPage);
        }

        /**
         * Handles views.settings.show event.
         *
         * @private
         * @param {Event} ev
         */
        function show(ev) {
            var detail = ev.detail;

            prevProgressVal.style.width = '0';
            audioPlayState = false;
            audio.src = detail.audio;
            audio.addEventListener('loadeddata', showPreviewPage);
        }

        /**
         * Toggles audio preview play state.
         *
         * @private
         */
        function toggleAudioPlayState() {
            audioPlayState = !audioPlayState;
        }

        /**
         * Resets audio.
         *
         * @private
         */
        function setPausedButton() {
            prevBtnIcon.classList.add('paused');
            voiceAnimation.classList.add('paused');
            audioPlayState = false;
        }

        /**
         * Pauses preview playing.
         *
         * @private
         */
        function pausePreview() {
            setPausedButton();
            audio.pause();
        }

        /**
         * Handles views.init.visibility.change event.
         *
         * @private
         */
        function onVisibilityChange() {
            if (pageHelper.isPageActive(page)) {
                audioPlayState = false;
                pausePreview();
                blockProgressTapAction = false;
            }
        }

        /**
         * Starts preview playing.
         *
         * @private
         */
        function playPreview() {
            prevBtnIcon.classList.remove('paused');
            voiceAnimation.classList.remove('paused');
            audio.play();
        }

        /**
         * Handles ended event on audio element.
         *
         * @private
         */
        function onAudioEnded() {
            setPausedButton();
        }

        /**
         * Handles timeupdate event on audio element.
         *
         * @private
         * @param {Event} ev
         */
        function onTimeUpdate(ev) {
            var target = ev.target,
                val = target.currentTime,
                duration = target.duration;

            if (val === duration) {
                prevProgressVal.style.width = '100%';
                setTimeout(
                    function clearProgressBar() {
                        prevProgressVal.style.width = '0';
                    },
                    CLEAR_PROGRESS_BAR_TIMEOUT
                );
            } else {
                prevProgressVal.style.width =
                    (duration === 0 ? 0 : val / duration * 100) + '%';
            }
        }

        /**
         * Handles audio error event.
         *
         * @private
         */
        function onAudioError() {
            console.error('Recording cannot be loaded into preview.');
        }

        /**
         * Handles hide event on page.
         *
         * @private
         */
        function onPageHide() {
            pausePreview();
        }

        /**
         * Handles click event on preview button.
         *
         * @private
         */
        function onPreviewBtnClick() {
            toggleAudioPlayState();
            if (audioPlayState) {
                playPreview();
            } else {
                pausePreview();
            }
        }

        /**
         * Sets pressed class for button.
         *
         * @private
         */
        function setPressButtonState() {
            prevBtn.classList.add('pressed');
            prevBtnIcon.classList.add('pressed');
        }

        /**
         * Removes pressed class for button.
         *
         * @private
         */
        function removePressButtonState() {
            prevBtn.classList.remove('pressed');
            prevBtnIcon.classList.remove('pressed');
        }

        /**
         * Move forward audio element.
         *
         * @private
         */
        function forwardAudio() {
            if (audio.duration !== audio.currentTime) {
                audio.currentTime += SCROLLING_AUDIO_STEP;
            }
        }

        /**
         * Move backward audio element.
         *
         * @private
         */
        function backwardAudio() {
            if (audio.duration !== 0) {
                audio.currentTime -= SCROLLING_AUDIO_STEP;
            }
        }

        /**
         * Handles touchstart event on preview button.
         *
         * @private
         * @param {Event} ev
         */
        function onPreviewBtnTouchStart(ev) {
            prevBtnTouchCounter = prevBtnTouchCounter + 1;
            if (ev.touches.length === 1) {
                setPressButtonState();
            }
        }

        /**
         * Handles touchend event on preview button.
         *
         * @private
         */
        function onPreviewBtnTouchEnd() {
            prevBtnTouchCounter = prevBtnTouchCounter - 1;
            if (prevBtnTouchCounter === 0) {
                removePressButtonState();
            }
        }

        /**
         * Handles tap on audio progress bar.
         *
         * @private
         * @param {Event} ev
         */
        function onAudioProgressTap(ev) {
            var width = prevProgress.offsetWidth,
                left = prevProgress.offsetLeft,
                offsetPosition = ev.targetTouches[0].pageX - left,
                progressValue = 0;

            if (ev.touches.length > 1 || blockProgressTapAction) {
                blockProgressTapAction = true;
                return;
            }

            ev.preventDefault();
            ev.stopPropagation();

            if (width && audio.duration && offsetPosition < width) {
                progressValue = offsetPosition / width;
                audio.currentTime = progressValue * audio.duration;
            }
        }

        /**
         * Handles tap end on audio progress bar.
         *
         * @private
         * @param {Event} ev
         */
        function onAudioProgressTapEnd(ev) {
            ev.stopPropagation();

            blockProgressTapAction = ev.touches.length > 0;
        }

        /**
         * Handles views.init.application.state.background event.
         *
         * @private
         */
        function onApplicationStateBackground() {
            removePressButtonState();
            prevBtnTouchCounter = 0;
        }

        /**
         * Handles touchend event on page element.
         *
         * @private
         * @param {Event} ev
         */
        function onPageTouchEnd(ev) {
            blockProgressTapAction = ev.touches.length > 0;
        }

        /**
         * Handles rotarydetent event on page element.
         *
         * @private
         * @param {Event} ev
         */
        function onRotarydetent(ev) {
            var direction = ev.detail.direction;

            if (tau.activePage.id !== 'preview') {
                return;
            }

            if (direction === 'CW') {
                forwardAudio();
            } else if (direction === 'CCW') {
                backwardAudio();
            }
        }

        /**
         * Registers view event listeners.
         *
         * @private
         */
        function bindEvents() {
            page.addEventListener('pagehide', onPageHide);
            page.addEventListener('touchend', onPageTouchEnd);
            prevBtnMap.addEventListener('click', onPreviewBtnClick);
            prevBtnMap.addEventListener('touchstart', onPreviewBtnTouchStart);
            prevBtnMap.addEventListener('touchend', onPreviewBtnTouchEnd);
            audio.addEventListener('ended', onAudioEnded);
            audio.addEventListener('timeupdate', onTimeUpdate);
            audio.addEventListener('error', onAudioError);
            prevProgress.addEventListener('touchstart', onAudioProgressTap);
            prevProgress.addEventListener('touchmove', onAudioProgressTap);
            prevProgress.addEventListener('touchend', onAudioProgressTapEnd);
            document.addEventListener('rotarydetent', onRotarydetent);
        }

        /**
         * Initializes module.
         *
         * @memberof views/preview
         * @public
         */
        function init() {
            page = document.getElementById('preview');
            audio = document.getElementById('audio');
            prevBtn = document.getElementById(
                'preview-navigation-bar-button'
            );
            prevBtnIcon = document.getElementById(
                'preview-navigation-bar-button-icon'
            );
            prevBtnMap = document.getElementById(
                'preview-navigation-bar-button-map'
            );
            prevProgress = document.getElementById('preview-progress');
            prevProgressVal = document.getElementById(
                'preview-progress-val'
            );
            voiceAnimation = document.getElementById('voice-animation');
            bindEvents();
        }

        e.listeners({
            'views.main.show.preview': show,
            'views.init.visibility.change': onVisibilityChange,
            'views.init.application.state.background':
                onApplicationStateBackground
        });

        return {
            init: init
        };
    }

});
