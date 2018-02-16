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

/*global define, console, document, tau, setInterval, clearInterval*/
/*jslint plusplus: true*/

/**
 * Main page module,
 *
 * @module views/main
 * @requires {@link core/event}
 * @requires {@link core/application}
 * @requires {@link models/stream}
 * @requires {@link models/audio}
 * @namespace views/main
 * @memberof views
 */

define({
    name: 'views/main',
    requires: [
        'core/event',
        'core/application',
        'models/stream',
        'models/audio'
    ],
    def: function viewsMain(req) {
        'use strict';

        /**
         * File write error constant string.
         *
         * @private
         * @const {string}
         */
        var ERROR_FILE_WRITE = 'FILE_WRITE_ERR',

            /**
             * No free space constant message string.
             *
             * @private
             * @const {string}
             */
            NO_FREE_SPACE_MSG = 'No free space.',

            /**
             * Cannot access audio stream constant message string.
             *
             * @private
             * @const {string}
             */
            CANNOT_ACCESS_AUDIO_MSG = 'Cannot access audio stream. ' +
                'Please close all applications that use the audio stream and ' +
                'open the application again.',

            /**
             * Recording interval step constant number.
             *
             * 2private
             * @const {number}
             */
            RECORDING_INTERVAL_STEP = 100,

            /**
             * Event module object.
             *
             * @private
             * @type {Module}
             */
            e = req.core.event,

            /**
             * Application module object.
             *
             * @private
             * @type {Module}
             */
            app = req.core.application,

            /**
             * Stream module object.
             *
             * @private
             * @type {Module}
             */
            s = req.models.stream,

            /**
             * Audio module object.
             *
             * @private
             * @type {Module}
             */
            a = req.models.audio,

            /**
             * Page element.
             *
             * @private
             * @type {HTMLElement}
             */
            page = null,

            /**
             * Record button element.
             *
             * @private
             * @type {HTMLElement}
             */
            recordBtn = null,

            /**
             * Record button icon element.
             *
             * @private
             * @type {HTMLElement}
             */
            recordBtnIcon = null,

            /**
             * Record button map element.
             *
             * @private
             * @type {HTMLElement}
             */
            recordBtnMap = null,

            /**
             * Record progress element.
             *
             * @private
             * @type {HTMLElement}
             */
            recordProgress = null,

            /**
             * Record progress value element.
             *
             * @private
             * @type {HTMLElement}
             */
            recordProgressVal = null,

            /**
             * Exit alert message element.
             *
             * @private
             * @type {HTMLElement}
             */
            exitAlertMessage = null,

            /**
             * Exit alert OK button element.
             *
             * @private
             * @type {HTMLElement}
             */
            exitAlertOk = null,

            /**
             * Recording interval id.
             *
             * @private
             * @type {number}
             */
            recordingInterval = null,

            /**
             * Boolean flag indicating that record button has been clicked
             * and recording process should start.
             *
             * @private
             * @type {boolean}
             */
            recording = false,

            /**
             * Recording time in milliseconds.
             *
             * @private
             * @type {number}
             */
            recordingTime = 0,

            /**
             * Boolean flag that prevents record button action
             * on multiple clicks.
             *
             * @private
             * @type {boolean}
             */
            recordingLock = false,

            /**
             * Touch counter that prevents record button action
             * on multiple touch.
             *
             * @private
             * @type {number}
             */
            recordBtnTouchCounter = 0;

        /**
         * Toggles between recording/no recording state.
         *
         * @private
         * @param {boolean} forceValue
         */
        function toggleRecording(forceValue) {
            if (forceValue !== undefined) {
                recording = !!forceValue;
            } else {
                recording = !recording;
            }
        }

        /**
         * Shows stop button.
         *
         * @private
         */
        function showStopButton() {
            recordBtnIcon.classList.add('recording');
        }

        /**
         * Hides stop button.
         *
         * @private
         */
        function hideStopButton() {
            recordBtnIcon.classList.remove('recording');
        }

        /**
         * Shows recording view.
         *
         * @private
         */
        function showRecordingView() {
            showStopButton();
        }

        /**
         * Renders recording progress bar value.
         *
         * @private
         * @param {number} value
         */
        function renderRecordingProgressBarValue(value) {
            recordProgressVal.style.width = value + 'px';
        }

        /**
         * Renders recording progress bar.
         *
         * @private
         */
        function renderRecordingProgressBar() {
            var parentWidth = recordProgress.clientWidth,
                width = recordingTime / a.MAX_RECORDING_TIME * parentWidth;

            renderRecordingProgressBarValue(width);
        }

        /**
         * Resets recording progress.
         *
         * @private
         */
        function resetRecordingProgress() {
            recordingTime = 0;
            renderRecordingProgressBar();
        }

        /**
         * Removes recording interval.
         *
         * @private
         */
        function removeRecordingInterval() {
            clearInterval(recordingInterval);
        }

        /**
         * Updates recording progress.
         *
         * @private
         */
        function updateRecordingProgress() {
            recordingTime = a.getRecordingTime();
            renderRecordingProgressBar();
        }

        /**
         * Sets recording interval.
         *
         * @private
         */
        function setRecordingInterval() {
            recordingInterval = setInterval(
                updateRecordingProgress,
                RECORDING_INTERVAL_STEP
            );
        }

        /**
         * Starts audio recording.
         *
         * @private
         */
        function startRecording() {
            recordingLock = true;
            a.startRecording();
            resetRecordingProgress();
            showRecordingView();
        }

        /**
         * Stops audio recording.
         *
         * @private
         */
        function stopRecording() {
            recordingLock = true;
            a.stopRecording();
        }

        /**
         * Starts or stops audio recording.
         *
         * @private
         */
        function setRecording() {
            if (recording) {
                startRecording();
            } else {
                stopRecording();
            }
        }

        /**
         * Handles click event on record button.
         *
         * @private
         */
        function onRecordBtnClick() {
            if (recordingLock || document.hidden) {
                return;
            }
            toggleRecording();
            setRecording();
        }

        /**
         * Sets pressed class for button.
         *
         * @private
         */
        function setPressButtonState() {
            recordBtn.classList.add('pressed');
            recordBtnIcon.classList.add('pressed');
        }

        /**
         * Removes pressed class for button.
         *
         * @private
         */
        function removePressButtonState() {
            recordBtn.classList.remove('pressed');
            recordBtnIcon.classList.remove('pressed');
        }

        /**
         * Handles touchstart event on record button.
         *
         * @private
         * @param {Event} ev
         */
        function onRecordBtnTouchStart(ev) {
            recordBtnTouchCounter = recordBtnTouchCounter + 1;
            if (ev.touches.length === 1) {
                setPressButtonState();
            }
        }

        /**
         * Handles touchend event on record button.
         *
         * @private
         */
        function onRecordBtnTouchEnd() {
            recordBtnTouchCounter = recordBtnTouchCounter - 1;
            if (recordBtnTouchCounter === 0) {
                removePressButtonState();
            }
        }

        /**
         * Handles page before show event.
         *
         * @private
         */
        function onPageBeforeShow() {
            recordingLock = false;
            toggleRecording(false);
            hideStopButton();
            resetRecordingProgress();
        }

        /**
         * Handles click event on exit alert OK button.
         *
         * @private
         */
        function onExitAlertOkClick() {
            app.exit();
        }

        /**
         * Registers event listeners.
         *
         * @private
         */
        function bindEvents() {
            page.addEventListener('pagebeforeshow', onPageBeforeShow);
            recordBtnMap.addEventListener('click', onRecordBtnClick);
            recordBtnMap.addEventListener('touchstart', onRecordBtnTouchStart);
            recordBtnMap.addEventListener('touchend', onRecordBtnTouchEnd);
            exitAlertOk.addEventListener('click', onExitAlertOkClick);
        }

        /**
         * Shows exit alert popup.
         *
         * @private
         * @param {string} message
         */
        function showExitAlert(message) {
            exitAlertMessage.innerHTML = message;
            tau.openPopup('#exit-alert');
        }

        /**
         * Handles models.stream.ready event.
         *
         * @private
         * @param {Event} ev
         */
        function onStreamReady(ev) {
            a.registerStream(ev.detail.stream);
        }

        /**
         * Handles models.stream.cannot.access.audio event.
         *
         * @private
         */
        function onStreamCannotAccessAudio() {
            if (document.visibilityState === 'visible') {
                showExitAlert(CANNOT_ACCESS_AUDIO_MSG);
            }
        }

        /**
         * Initiates stream.
         *
         * @private
         */
        function initStream() {
            s.getStream();
        }

        /**
         * Handles models.audio.ready event.
         *
         * @private
         */
        function onAudioReady() {
            console.log('onAudioReady()');
        }

        /**
         * Handles models.audio.error event.
         *
         * @private
         */
        function onAudioError() {
            console.error('onAudioError()');
        }

        /**
         * Handles models.audio.recording.start event.
         *
         * @private
         */
        function onRecordingStart() {
            setRecordingInterval();
            toggleRecording(true);
            recordingLock = false;
        }

        /**
         * Handles models.audio.recording.done event.
         *
         * @private
         * @param {Event} ev
         * @fires views.main.show.preview
         */
        function onRecordingDone(ev) {
            var path = ev.detail.path;

            removeRecordingInterval();
            toggleRecording(false);
            updateRecordingProgress();
            e.fire('show.preview', {audio: path});
        }

        /**
         * Handles models.audio.recording.cancel event.
         *
         * @private
         */
        function onRecordingCancel() {
            toggleRecording(false);
            removePressButtonState();
            hideStopButton();
        }

        /**
         * Handles models.audio.recording.error event.
         *
         * @private
         * @param {CustomEvent} ev
         */
        function onRecordingError(ev) {
            var error = ev.detail.error;

            if (error === ERROR_FILE_WRITE) {
                console.error(NO_FREE_SPACE_MSG);
            } else {
                console.error('Error: ' + error);
            }

            removeRecordingInterval();
            toggleRecording(false);
        }

        /**
         * Handles views.init.visibility.change event.
         * (document.visibilityState can be set to 'visible' or 'hidden').
         *
         * @private
         */
        function visibilityChange() {
            if (document.visibilityState !== 'visible') {
                if (a.isReady()) {
                    a.stopRecording();
                    a.release();
                }
            } else {
                if (!a.isReady()) {
                    initStream();
                }
            }
        }

        /**
         * Handles views.init.application.state.background event.
         *
         * @private
         */
        function onApplicationStateBackground() {
            removePressButtonState();
            recordBtnTouchCounter = 0;
        }

        /**
         * Initializes module.
         *
         * @memberof views/main
         * @public
         */
        function init() {
            page = document.getElementById('main');
            recordBtn = document.getElementById(
                'main-navigation-bar-button'
            );
            recordBtnIcon = document.getElementById(
                'main-navigation-bar-button-icon'
            );
            recordBtnMap = document.getElementById(
                'main-navigation-bar-button-map'
            );
            recordProgress = document.getElementById('record-progress');
            recordProgressVal = document.getElementById('record-progress-val');
            exitAlertMessage = document.getElementById('exit-alert-message');
            exitAlertOk = document.getElementById('exit-alert-ok');
            bindEvents();
            initStream();
        }

        e.listeners({
            'models.stream.ready': onStreamReady,
            'models.stream.cannot.access.audio': onStreamCannotAccessAudio,

            'models.audio.ready': onAudioReady,
            'models.audio.error': onAudioError,

            'models.audio.recording.start': onRecordingStart,
            'models.audio.recording.done': onRecordingDone,
            'models.audio.recording.error': onRecordingError,
            'models.audio.recording.cancel': onRecordingCancel,

            'views.init.visibility.change': visibilityChange,
            'views.init.application.state.background':
                onApplicationStateBackground
        });

        return {
            init: init
        };
    }

});
