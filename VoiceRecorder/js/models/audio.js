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

/*global define, console, navigator, window, tizen*/
/*jslint regexp: true*/

/**
 * Audio model module.
 *
 * @module models/audio
 * @requires {@link core/event}
 * @requires {@link helpers/date}
 * @namespace models/audio
 * @memberof models
 */

define({
    name: 'models/audio',
    requires: [
        'core/event',
        'helpers/date'
    ],
    def: function modelsAudio(req) {
        /*jshint maxstatements:42*/
        'use strict';

        /**
         * Max recording time constant number.
         *
         * @private
         * @const {number}
         */
        var MAX_RECORDING_TIME = 10000,

            /**
             * Audio length check interval constant number.
             *
             * @private
             * @const {number}
             */
            AUDIO_LENGTH_CHECK_INTERVAL = 10,

            /**
             * Event module object.
             *
             * @private
             * @type {Module}
             */
            e = req.core.event,

            /**
             * Date helper module.
             *
             * @private
             * @type {Module}
             */
            dateHelper = req.helpers.date,

            /**
             * Destination directory for audio files.
             *
             * @private
             * @type {string}
             */
            audioDestinationDirectory = '',

            /**
             * Object that defines attributes and methods
             * to configure audio options and record audio.
             *
             * @private
             * @type {CameraControl}
             */
            audioControl = null,

            /**
             * Destination file for audio file.
             *
             * @private
             * @type {string}
             */
            audioPath = '',

            /**
             * Audio length check interval id.
             *
             * @private
             * @type {number}
             */
            audioLengthCheckInterval = null,

            /**
             * Audio recording start time object.
             *
             * @private
             * @type {Date}
             */
            audioRecordingStartTime = null,

            /**
             * Audio recording time.
             *
             * @private
             * @type {number}
             */
            audioRecordingTime = 0,

            /**
             * Boolean flag indicating whether recording process is in progress.
             *
             * @private
             * @type {boolean}
             */
            busy = false,

            /**
             * Boolean flag indicating whether stop recording is requested.
             *
             * @private
             * @type {boolean}
             */
            stopRequested = false;

        /**
         * Executes when audio control is created from stream.
         *
         * @private
         * @param {CameraControl} control
         * @fires audio.ready
         */
        function onAudioControlCreated(control) {
            audioControl = control;
            e.fire('ready');
        }

        /**
         * Executes on audio control creation error.
         *
         * @private
         * @param {CameraError} error
         * @fires audio.error
         */
        function onAudioControlError(error) {
            console.error(error);
            e.fire('error', {error: error});
        }

        /**
         * Uses LocalMediaStream object to obtain CameraControl object.
         *
         * @memberof models/audio
         * @public
         * @param {LocalMediaStream} mediaStream
         */
        function registerStream(mediaStream) {
            navigator.tizCamera.createCameraControl(
                mediaStream,
                onAudioControlCreated,
                onAudioControlError
            );
        }

        /**
         * Stops tracing audio length.
         *
         * @private
         */
        function stopTracingAudioLength() {
            window.clearInterval(audioLengthCheckInterval);
            audioLengthCheckInterval = null;
        }

        /**
         * Executes when error occurs during applying audio settings.
         *
         * @private
         * @param {CameraSettingErrors} error
         * @fires audio.recording.error
         */
        function onAudioSettingsError(error) {
            console.error('settings.error');
            busy = false;
            e.fire('recording.error', {error: error});
        }

        /**
         * Returns recording format.
         *
         * @private
         * @returns {string}
         */
        function getRecordingFormat() {
            return 'amr';
        }

        /**
         * Creates filename for new audio and returns it.
         *
         * @private
         * @returns {string}
         */
        function createAudioFileName() {
            var currentDate = new Date(),
                extension = getRecordingFormat(),
                fileName = '';

            fileName = dateHelper.format(currentDate, 'yyyymmdd_HHMMSS') +
                '.' + extension;

            return fileName;
        }

        /**
         * Executes when audio recording stops successfully.
         *
         * @private
         * @fires audio.recording.done
         */
        function onAudioRecordingStopSuccess() {
            busy = false;
            e.fire('recording.done', {path: audioPath});
            audioRecordingTime = 0;
        }

        /**
         * Executes when audio recording stops with failure
         *
         * @private
         * @param {CameraError} error
         * @fires audio.recording.error
         */
        function onAudioRecordingStopError(error) {
            busy = false;
            e.fire('recording.error', {error: error});
            audioRecordingTime = 0;
        }

        /**
         * Returns true if audio is recording,
         * false otherwise.
         *
         * @memberof models/audio
         * @public
         * @returns {boolean}
         */
        function isRecording() {
            return !!audioLengthCheckInterval;
        }

        /**
         * Stops audio recording.
         *
         * When recording is stopped, audio.recording.done event is fired
         * with file path as a data.
         * If error occurs audio.recording.error is fired.
         *
         * Recording also stops when MAX_RECORDING_TIME is reached.
         *
         * @memberof models/audio
         * @public
         */
        function stopRecording() {
            stopRequested = true;

            if (isRecording()) {
                stopTracingAudioLength();
                audioControl.recorder.stop(
                    onAudioRecordingStopSuccess,
                    onAudioRecordingStopError
                );
            }

        }

        /**
         * Checks if audio length is greater then MAX_RECORDING_TIME.
         * If it is, recording is stopped.
         *
         * @private
         */
        function checkAudioLength() {
            audioRecordingTime = new Date() - audioRecordingStartTime;
            if (audioRecordingTime > MAX_RECORDING_TIME) {
                stopRecording();
            }
        }

        /**
         * Starts tracing audio length.
         *
         * When audio length reaches MAX_RECORDING_TIME, recording
         * is stopped automatically.
         *
         * @private
         */
        function startTracingAudioLength() {
            audioRecordingStartTime = new Date();
            audioLengthCheckInterval = window.setInterval(
                checkAudioLength,
                AUDIO_LENGTH_CHECK_INTERVAL
            );
        }

        /**
         * Executes when recording starts successfully.
         *
         * @private
         * @fires audio.recording.start
         */
        function onRecordingStartSuccess() {
            startTracingAudioLength();
            e.fire('recording.start');
        }

        /**
         * Executes when error occurs during recording start.
         *
         * @private
         * @param {CameraError} error
         * @fires audio.recording.error
         */
        function onRecordingStartError(error) {
            busy = false;
            e.fire('recording.error', {error: error});
        }

        /**
         * Executes when audio settings are applied.
         *
         * @private
         * @fires audio.recording.cancel
         */
        function onAudioSettingsApplied() {
            if (!stopRequested) {
                audioControl.recorder.start(
                    onRecordingStartSuccess,
                    onRecordingStartError
                );
            } else {
                e.fire('recording.cancel');
            }

        }
        /**
         * Returns current recording time in milliseconds.
         *
         * @memberof models/audio
         * @public
         * @returns {number}
         */
        function getRecordingTime() {
            return audioRecordingTime;
        }

        /**
         * Releases audio.
         *
         * @memberof models/audio
         * @public
         * @fires audio.release
         */
        function release() {
            if (busy) {
                stopRecording();
            }
            busy = false;
            if (audioControl) {
                audioControl.release();
                audioControl = null;
                e.fire('release');
            }
        }

        /**
         * Returns true if audio is ready to work,
         * false otherwise.
         *
         * @memberof models/audio
         * @public
         * @returns {boolean}
         */
        function isReady() {
            return audioControl !== null;
        }

        /**
         * Starts audio recording.
         *
         * When recording is started successfully, audio.recording.start event
         * is fired. If error occurs, audio.recording.error event is fired.
         *
         * Returns true if recording process starts,
         * false otherwise (audio other operation is in progress).
         *
         * @memberof models/audio
         * @public
         * @returns {boolean}
         */
        function startRecording() {
            var settings = {},
                fileName = '';

            if (busy) {
                return false;
            }

            stopRequested = false;
            busy = true;
            fileName = createAudioFileName();
            audioPath = audioDestinationDirectory + '/' + fileName;

            settings.fileName = fileName;
            settings.recordingFormat = getRecordingFormat();

            audioControl.recorder.applySettings(
                settings,
                onAudioSettingsApplied,
                onAudioSettingsError
            );

            return true;
        }

        /**
         * Resolves audio destination path.
         *
         * @private
         */
        function resolveAudioDestination() {
            try {
                tizen.filesystem.resolve(
                    'music',
                    function onMusicResolved(file) {
                        audioDestinationDirectory = file.toURI()
                            .replace('file://', '')
                            .replace('Music', 'Sounds');
                    },
                    function onMusicResolveError(error) {
                        console.error('audio resolve error', error);
                    },
                    'r'
                );
            } catch (error) {
                console.error('audio resolve error', error);
            }
        }

        /**
         * Initializes module.
         *
         * @memberof models/audio
         * @public
         */
        function init() {
            resolveAudioDestination();
        }

        return {
            MAX_RECORDING_TIME: MAX_RECORDING_TIME,

            registerStream: registerStream,
            release: release,
            isReady: isReady,
            isRecording: isRecording,

            startRecording: startRecording,
            stopRecording: stopRecording,
            getRecordingTime: getRecordingTime,

            init: init
        };
    }
});
